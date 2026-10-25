import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RevealDirective } from 'src/app/directives/reveal.directive';

import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactComponent, RevealDirective],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function fill(name: string, email: string, message: string) {
    component.contactInfo.setValue({ name, email, message });
  }

  function status(): string {
    return el.querySelector('.form-status')!.textContent!.trim();
  }

  it('explains what is missing instead of sending an incomplete form', () => {
    fill('Joe', 'not-an-email', 'Hello');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(status()).toBe('Please fill in all fields with a valid email.');
    http.expectNone(() => true);
  });

  it('sends the message and confirms on the button', fakeAsync(() => {
    fill('Joe', 'joe@example.com', 'Hi');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.querySelector('.send')!.textContent).toContain('Sending...');

    const request = http.expectOne((r) =>
      r.url.startsWith('https://formsubmit.co/ajax/')
    );
    const body = request.request.body as FormData;
    expect(body.get('message')).toBe('Hi');
    expect(String(body.get('_next'))).toMatch(/#contact$/);
    request.flush({ success: 'true' });
    fixture.detectChanges();

    const [sendLabel, sentLabel] = Array.from(
      el.querySelectorAll('.send-label')
    );
    expect(sentLabel.classList).toContain('is-shown');
    expect(sendLabel.classList).not.toContain('is-shown');
    expect(status()).toBe("Thanks! I'll get back to you soon.");
    expect(component.contactInfo.value.message).toBeNull();

    tick(4000);
    fixture.detectChanges();
    expect(status()).toBe('');
  }));
});
