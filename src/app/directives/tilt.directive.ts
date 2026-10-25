import {
  AfterViewInit,
  Directive,
  ElementRef,
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

@Directive({ selector: '[appTilt]' })
export class TiltDirective implements AfterViewInit, OnDestroy {
  private springs: Spring[] = [];
  private listeners: [string, EventListener][] = [];

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (prefersReducedMotion()) return;
    const node = this.el.nativeElement;
    const variable = (name: string, initial: number, unit = '') => {
      const spring = new Spring(initial, SNAPPY, (v) =>
        node.style.setProperty(name, v.toFixed(4) + unit)
      );
      this.springs.push(spring);
      return spring;
    };
    const press = variable('--press', 1);

    this.on('pointerdown', () => press.set(0.975, SNAPPY));
    this.on('pointerup', () => press.set(1, BOUNCY));
    this.on('pointercancel', () => press.set(1, BOUNCY));

    if (!hasFinePointer()) return;
    const tiltX = variable('--tilt-x', 0);
    const tiltY = variable('--tilt-y', 0);
    const glareX = variable('--glare-x', 50, '%');
    const glareY = variable('--glare-y', 0, '%');
    const lift = variable('--lift', 0);

    this.on('pointermove', (e) => {
      const event = e as PointerEvent;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      tiltX.set(px * 2 - 1, SNAPPY);
      tiltY.set(py * 2 - 1, SNAPPY);
      glareX.set(px * 100, SNAPPY);
      glareY.set(py * 100, SNAPPY);
      lift.set(1, SNAPPY);
    });
    this.on('pointerleave', () => {
      tiltX.set(0, BOUNCY);
      tiltY.set(0, BOUNCY);
      lift.set(0, BOUNCY);
      press.set(1, BOUNCY);
    });
  }

  ngOnDestroy(): void {
    const node = this.el.nativeElement;
    this.listeners.forEach(([type, fn]) => node.removeEventListener(type, fn));
    this.springs.forEach((spring) => spring.stop());
  }

  private on(type: string, fn: EventListener): void {
    this.zone.runOutsideAngular(() =>
      this.el.nativeElement.addEventListener(type, fn, { passive: true })
    );
    this.listeners.push([type, fn]);
  }
}
