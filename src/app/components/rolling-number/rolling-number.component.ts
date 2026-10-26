import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

@Component({
  selector: 'app-rolling-number',
  template: `<span class="sr-only">{{ text }}</span
    ><span class="digits" aria-hidden="true"
      ><span
        *ngFor="let digit of digits; let i = index"
        class="digit"
        [style.--i]="i"
        ><span class="strip" [style.--value]="digit"
          ><span *ngFor="let d of strip">{{ d }}</span></span
        ></span
      ></span
    >`,
  styleUrls: ['./rolling-number.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RollingNumberComponent {
  @Input() value = 0;
  @Input() minDigits = 1;

  readonly strip = DIGITS;

  get text(): string {
    return String(Math.max(0, Math.floor(this.value))).padStart(
      this.minDigits,
      '0'
    );
  }

  get digits(): number[] {
    return this.text.split('').map(Number);
  }
}
