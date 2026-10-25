import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MagneticDirective } from 'src/app/directives/magnetic.directive';
import { RevealDirective } from 'src/app/directives/reveal.directive';
import { PixelAvatarComponent } from '../pixel-avatar/pixel-avatar.component';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AboutComponent,
        PixelAvatarComponent,
        RevealDirective,
        MagneticDirective,
      ],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('introduces Emmanuel next to his portrait', () => {
    expect(el.querySelector('h1')!.textContent).toBe('Emmanuel Adeyemo');
    const avatar = el.querySelector('app-pixel-avatar button')!;
    expect(avatar.getAttribute('aria-label')).toBe(
      'Open a larger photo of Emmanuel Adeyemo'
    );
  });

  it('opens the portrait as a dialog and closes it again', async () => {
    el.querySelector<HTMLButtonElement>('app-pixel-avatar button')!.click();
    fixture.detectChanges();

    const dialog = el.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Photo of Emmanuel Adeyemo');
    expect(dialog.textContent).toContain('Software Engineer');

    dialog.querySelector<HTMLButtonElement>('.close')!.click();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  });

  it('links out to every profile in a new tab, and to the certificates page in place', () => {
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.links a')
    );
    expect(links.map((a) => a.textContent!.trim())).toEqual([
      'Contact',
      'GitHub',
      'LinkedIn',
      'Twitter',
      'Certificates',
    ]);
    links
      .filter((a) => a.href.startsWith('https://'))
      .forEach((a) => expect(a.rel).toBe('noopener noreferrer'));
    expect(links[4].getAttribute('href')).toBe('/certificates');
  });
});
