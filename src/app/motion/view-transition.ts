import { Injectable } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Resolve,
  Router,
} from '@angular/router';
import { filter, first } from 'rxjs/operators';
import { prefersReducedMotion } from './spring';

interface ViewTransition {
  finished: Promise<void>;
}

type StartViewTransition = (
  update: () => Promise<void> | void
) => ViewTransition;

function startViewTransitionFn(): StartViewTransition | null {
  const start = (document as any).startViewTransition;
  return typeof start === 'function' && !prefersReducedMotion()
    ? start.bind(document)
    : null;
}

export function withViewTransition(update: () => void): Promise<void> {
  const start = startViewTransitionFn();
  if (!start) {
    update();
    return Promise.resolve();
  }
  return start(update).finished.catch(() => undefined);
}

@Injectable({ providedIn: 'root' })
export class ViewTransitionResolver implements Resolve<void> {
  constructor(private router: Router) {}

  resolve(): Promise<void> | void {
    const start = startViewTransitionFn();
    if (!start || !this.router.navigated) return;

    return new Promise<void>((proceed) => {
      start(() => {
        const done = this.navigationSettled();
        proceed();
        return done;
      });
    });
  }

  private navigationSettled(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.router.events
        .pipe(
          filter(
            (e) =>
              e instanceof NavigationEnd ||
              e instanceof NavigationCancel ||
              e instanceof NavigationError
          ),
          first()
        )
        .subscribe(() => {
          setTimeout(() => resolve(), 20);
        });
    });
  }
}
