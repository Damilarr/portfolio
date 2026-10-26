import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MagneticDirective } from 'src/app/directives/magnetic.directive';
import { RollingNumberComponent } from '../rolling-number/rolling-number.component';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(Date.UTC(2026, 9, 25, 12, 5)));

    await TestBed.configureTestingModule({
      declarations: [
        FooterComponent,
        RollingNumberComponent,
        MagneticDirective,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    jasmine.clock().uninstall();
  });

  function clock(): string {
    const parts = fixture.nativeElement.querySelectorAll('.clock .sr-only');
    return Array.from(parts as NodeListOf<HTMLElement>)
      .map((part) => part.textContent)
      .join(':');
  }

  it('shows the time in Lagos', () => {
    expect(clock()).toBe('13:05');
    expect(fixture.nativeElement.textContent).toContain('© 2026');
    expect(fixture.nativeElement.textContent).toContain('WAT');
  });

  it('keeps the time current', () => {
    jasmine.clock().tick(60_000);
    fixture.detectChanges();
    expect(clock()).toBe('13:06');
  });

  it('invites people to get in touch, with links that open in a new tab', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')!.textContent).toContain('Connect and collab');
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.social'));
    expect(
      links.map((a) => a.querySelector('.social-label')!.textContent)
    ).toEqual(['Twitter', 'LinkedIn', 'GitHub']);
    links.forEach((a) => expect(a.rel).toBe('noopener noreferrer'));
  });
});
