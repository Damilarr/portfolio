import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  @Input() appReveal: number | string = 0;
  @Input() revealImmediately = false;

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    node.style.setProperty(
      '--reveal-step',
      String(Number(this.appReveal) || 0)
    );

    if (this.revealImmediately || !('IntersectionObserver' in window)) {
      node.classList.add('is-revealed');
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          node.classList.add('is-revealed');
          this.observer?.disconnect();
        },
        { rootMargin: '0px 0px -6% 0px' }
      );
      this.observer.observe(node);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
