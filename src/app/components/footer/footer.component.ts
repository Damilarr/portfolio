import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GENTLE, Spring, prefersReducedMotion } from 'src/app/motion/spring';

const LAGOS_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Lagos',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, AfterViewInit, OnDestroy {
  year = new Date().getFullYear();
  hours = 0;
  minutes = 0;

  socials = [
    { label: 'Twitter', href: 'https://twitter.com/Emmdam4' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/adeyemo-emmanuel' },
    { label: 'GitHub', href: 'https://github.com/Damilarr' },
  ];

  private timer: any;
  private reveal?: Spring;
  private frame = 0;

  constructor(
    private zone: NgZone,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.tick();
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        const [hours, minutes] = this.now();
        if (hours !== this.hours || minutes !== this.minutes) {
          this.zone.run(() => this.tick());
        }
      }, 30_000);
    });
  }

  ngAfterViewInit(): void {
    const node = this.host.nativeElement;
    this.reveal = new Spring(0, GENTLE, (v) =>
      node.style.setProperty('--reveal', v.toFixed(4))
    );
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.measure, { passive: true });
      window.addEventListener('resize', this.measure, { passive: true });
    });
    this.measure();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    cancelAnimationFrame(this.frame);
    window.removeEventListener('scroll', this.measure);
    window.removeEventListener('resize', this.measure);
    this.reveal?.stop();
  }

  private measure = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const sheet = this.host.nativeElement.previousElementSibling;
      if (!sheet || !this.reveal) return;
      if (prefersReducedMotion()) return this.reveal.jump(1);
      const bottom = sheet.getBoundingClientRect().bottom;
      const uncovered = Math.min(
        1,
        Math.max(0, 1 - bottom / window.innerHeight)
      );
      this.reveal.set(uncovered);
    });
  };

  private tick(): void {
    [this.hours, this.minutes] = this.now();
  }

  private now(): [number, number] {
    const [hours, minutes] = LAGOS_TIME.format(new Date()).split(':');
    return [Number(hours), Number(minutes)];
  }
}
