import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollingNumberComponent } from './rolling-number.component';

describe('RollingNumberComponent', () => {
  let fixture: ComponentFixture<RollingNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RollingNumberComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RollingNumberComponent);
  });

  function render(value: number, minDigits = 1) {
    fixture.componentInstance.value = value;
    fixture.componentInstance.minDigits = minDigits;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return {
      text: el.querySelector('.sr-only')!.textContent,
      strips: Array.from(el.querySelectorAll<HTMLElement>('.strip')).map((s) =>
        s.style.getPropertyValue('--value')
      ),
    };
  }

  it('pads to the minimum number of digits and points each strip at its digit', () => {
    expect(render(8, 2)).toEqual({ text: '08', strips: ['0', '8'] });
  });

  it('grows when the number needs more digits', () => {
    expect(render(123, 2)).toEqual({ text: '123', strips: ['1', '2', '3'] });
  });

  it('hides the strips from screen readers', () => {
    render(5);
    const digits = fixture.nativeElement.querySelector('.digits');
    expect(digits.getAttribute('aria-hidden')).toBe('true');
  });
});
