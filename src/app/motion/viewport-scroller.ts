import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { prefersReducedMotion } from './spring';

@Injectable()
export class AppViewportScroller extends ViewportScroller {
  constructor(@Inject(DOCUMENT) private document: Document) {
    super();
  }

  setOffset(): void {}

  getScrollPosition(): [number, number] {
    return [window.scrollX, window.scrollY];
  }

  scrollToPosition([left, top]: [number, number]): void {
    try {
      window.scrollTo({ left, top, behavior: 'instant' as ScrollBehavior });
      return;
    } catch {}
    const root = this.document.documentElement;
    root.style.scrollBehavior = 'auto';
    getComputedStyle(root).scrollBehavior;
    window.scrollTo(left, top);
    requestAnimationFrame(() => root.style.removeProperty('scroll-behavior'));
  }

  scrollToAnchor(anchor: string): void {
    const target =
      this.document.getElementById(anchor) ||
      this.document.getElementsByName(anchor)[0];
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    try {
      window.history.scrollRestoration = scrollRestoration;
    } catch {}
  }
}
