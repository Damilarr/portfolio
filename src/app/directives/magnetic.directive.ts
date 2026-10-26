import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
} from '@angular/core';
import {
  BOUNCY,
  SNAPPY,
  Spring,
  hasFinePointer,
  prefersReducedMotion,
} from '../motion/spring';

@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective implements AfterViewInit, OnDestroy {
  @Input() appMagnetic: number | string = 0.3;
  @Input() magneticMax = 8;

  private x?: Spring;
  private y?: Spring;
  private scale?: Spring;
  private listeners: [string, EventListener][] = [];

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;
    const node = this.el.nativeElement;
    const render = () => {
      node.style.setProperty(
        'translate',
        `${this.x!.value}px ${this.y!.value}px`
      );
    };
    this.x = new Spring(0, SNAPPY, render);
    this.y = new Spring(0, SNAPPY, render);
    this.scale = new Spring(1, BOUNCY, (s) =>
      node.style.setProperty('scale', String(s))
    );

    const pull = Number(this.appMagnetic) || 0.3;
    const clamp = (v: number) =>
      Math.max(-this.magneticMax, Math.min(this.magneticMax, v));

    if (hasFinePointer()) {
      this.on('pointermove', (e) => {
        const event = e as PointerEvent;
        const rect = node.getBoundingClientRect();
        this.x!.set(clamp((event.clientX - rect.left - rect.width / 2) * pull));
        this.y!.set(clamp((event.clientY - rect.top - rect.height / 2) * pull));
      });
      this.on('pointerleave', () => {
        this.x!.set(0);
        this.y!.set(0);
        this.scale!.set(1, BOUNCY);
      });
    }
    this.on('pointerdown', () => this.scale!.set(0.93, SNAPPY));
    this.on('pointerup', () => this.scale!.set(1, BOUNCY));
    this.on('pointercancel', () => this.scale!.set(1, BOUNCY));
  }

  ngOnDestroy(): void {
    const node = this.el.nativeElement;
    this.listeners.forEach(([type, fn]) => node.removeEventListener(type, fn));
    [this.x, this.y, this.scale].forEach((spring) => spring?.stop());
  }

  private on(type: string, fn: EventListener): void {
    this.zone.runOutsideAngular(() =>
      this.el.nativeElement.addEventListener(type, fn, { passive: true })
    );
    this.listeners.push([type, fn]);
  }
}
