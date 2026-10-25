import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevealDirective } from './reveal.directive';

@Component({
  template: `<p appReveal="2">Hello</p>`,
})
class HostComponent {}

describe('RevealDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let p: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HostComponent, RevealDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    p = fixture.nativeElement.querySelector('p');
  });

  afterEach(() => fixture.nativeElement.remove());

  it('staggers by its position in the group', () => {
    expect(p.classList).toContain('reveal');
    expect(p.style.getPropertyValue('--reveal-step')).toBe('2');
  });

  it('reveals the element once it is on screen', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(p.classList).toContain('is-revealed');
  });
});
