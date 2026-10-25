import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  BOUNCY,
  SNAPPY,
  Spring,
  hasFinePointer,
  prefersReducedMotion,
} from 'src/app/motion/spring';

type Level = 'art' | number | null;

@Component({
  selector: 'app-pixel-avatar',
  templateUrl: './pixel-avatar.component.html',
  styleUrls: ['./pixel-avatar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelAvatarComponent implements AfterViewInit, OnDestroy {
  @Input() art = '';
  @Input() photo = '';
  @Input() name = '';
  @Input() caption = '';
  @Input() size = 48;

  @ViewChild('trigger', { static: true })
  trigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('card') card?: ElementRef<HTMLElement>;
  @ViewChild('bigCanvas') bigCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('closeButton') closeButton?: ElementRef<HTMLButtonElement>;

  expanded = false;

  private hovering = false;
  private artImage?: HTMLImageElement;
  private photoImage?: HTMLImageElement;
  private photoRequest?: Promise<HTMLImageElement>;
  private buffer = document.createElement('canvas');
  private runs = new WeakMap<HTMLCanvasElement, number>();
  private timers: any[] = [];
  private pop?: Spring;
  private openness?: Spring;
  private reduceMotion = prefersReducedMotion();

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    const canvas = this.canvas.nativeElement;
    canvas.width = canvas.height = this.size * this.pixelRatio();

    const trigger = this.trigger.nativeElement;
    this.pop = new Spring(0, BOUNCY, (p) => {
      trigger.style.setProperty('scale', String(1 + p * 0.12));
      trigger.style.setProperty('rotate', `${p * -4}deg`);
    });

    loadImage(this.art).then((image) => {
      this.artImage = image;
      const n = image.naturalWidth;
      this.sequence(canvas, [n / 8, n / 4, n / 2, 'art'], 110);
      this.later(() => this.loadPhoto(), 1500);
    });
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    this.pop?.stop();
    this.openness?.stop();
    window.removeEventListener('scroll', this.onScroll);
  }

  onEnter(): void {
    if (!hasFinePointer() || this.expanded) return;
    this.hovering = true;
    if (!this.reduceMotion) this.pop?.set(1, BOUNCY);
    this.loadPhoto().then(() => {
      if (this.hovering) {
        this.sequence(this.canvas.nativeElement, [24, 48, 96, null], 70);
      }
    });
  }

  onLeave(): void {
    if (!hasFinePointer() || this.expanded) return;
    this.hovering = false;
    this.pop?.set(0, BOUNCY);
    if (this.artImage)
      this.sequence(this.canvas.nativeElement, [64, 32, 'art'], 70);
  }

  open(): void {
    if (this.expanded) return;
    this.expanded = true;
    this.cdr.detectChanges();
    this.pop?.set(0, SNAPPY);
    this.zone.runOutsideAngular(() =>
      window.addEventListener('scroll', this.onScroll, { passive: true })
    );

    const card = this.card!.nativeElement;
    const big = this.bigCanvas!.nativeElement;
    const cardSize = card.offsetWidth;
    big.width = big.height = cardSize * this.pixelRatio();

    const from = this.trigger.nativeElement.getBoundingClientRect();
    const to = card.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const s0 = from.width / to.width;
    const lightbox =
      this.host.nativeElement.querySelector<HTMLElement>('.lightbox')!;

    this.zone.runOutsideAngular(() => {
      this.openness = new Spring(0, BOUNCY, (p) => {
        const rest = 1 - p;
        const scale = s0 + (1 - s0) * p;
        card.style.transform = `translate(${dx * rest}px, ${dy * rest}px) scale(${scale})`;
        card.style.borderRadius = `${(10 + 10 * p) / scale}px`;
        lightbox.style.setProperty(
          '--open',
          String(Math.max(0, Math.min(1, p)))
        );
      });
      if (this.reduceMotion) this.openness.jump(1);
      else this.openness.set(1, BOUNCY);
    });

    this.drawLevel(big, 'art');
    this.loadPhoto().then(() => this.sequence(big, [12, 24, 48, 96, null], 90));
    this.later(
      () => this.closeButton?.nativeElement.focus({ preventScroll: true }),
      0
    );
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (!this.expanded || !this.openness) return;
    window.removeEventListener('scroll', this.onScroll);
    const spring = this.openness;
    const big = this.bigCanvas?.nativeElement;
    if (big) this.sequence(big, [48, 16, 'art'], 60);

    const finish = () => {
      this.zone.run(() => {
        this.expanded = false;
        this.cdr.detectChanges();
      });
      this.trigger.nativeElement.focus({ preventScroll: true });
      this.hovering = false;
      this.sequence(this.canvas.nativeElement, [32, 'art'], 70);
    };
    if (this.reduceMotion) return finish();

    spring.set(0, SNAPPY);
    const wait = () => (spring.settled ? finish() : this.later(wait, 50));
    this.later(wait, 50);
  }

  private onScroll = () => this.close();

  private loadPhoto(): Promise<HTMLImageElement> {
    if (!this.photoRequest) {
      this.photoRequest = loadImage(this.photo).then(
        (image) => (this.photoImage = image)
      );
    }
    return this.photoRequest;
  }

  private sequence(
    canvas: HTMLCanvasElement,
    levels: Level[],
    interval: number
  ): void {
    const run = (this.runs.get(canvas) || 0) + 1;
    this.runs.set(canvas, run);
    const steps = this.reduceMotion ? levels.slice(-1) : levels;
    const next = (i: number) => {
      if (this.runs.get(canvas) !== run) return;
      this.drawLevel(canvas, steps[i]);
      if (i + 1 < steps.length) this.later(() => next(i + 1), interval);
    };
    this.zone.runOutsideAngular(() => next(0));
  }

  private drawLevel(canvas: HTMLCanvasElement, level: Level): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;

    if (level === 'art') {
      if (!this.artImage) return;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.artImage, 0, 0, width, height);
      return;
    }

    const photo = this.photoImage;
    if (!photo) return;
    if (level === null) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(photo, 0, 0, width, height);
      return;
    }
    const blocks = Math.max(1, Math.round(level));
    this.buffer.width = this.buffer.height = blocks;
    const bufferCtx = this.buffer.getContext('2d')!;
    bufferCtx.imageSmoothingEnabled = true;
    bufferCtx.imageSmoothingQuality = 'high';
    bufferCtx.drawImage(photo, 0, 0, blocks, blocks);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.buffer, 0, 0, width, height);
  }

  private pixelRatio(): number {
    return Math.max(1, Math.round(window.devicePixelRatio || 1));
  }

  private later(fn: () => void, ms: number): void {
    this.zone.runOutsideAngular(() => this.timers.push(setTimeout(fn, ms)));
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
