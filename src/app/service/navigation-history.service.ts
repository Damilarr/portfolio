import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationHistory {
  private previous: string | null = null;
  private current: string | null = null;

  constructor(router: Router) {
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.previous = this.current;
        this.current = e.urlAfterRedirects;
      });
  }

  cameFromHome(): boolean {
    return this.previous !== null && /^\/(#.*)?$/.test(this.previous);
  }
}
