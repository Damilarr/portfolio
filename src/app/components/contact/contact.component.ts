import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnDestroy {
  contactInfo: any;
  submitting = false;
  status: 'idle' | 'success' | 'error' = 'idle';
  statusMessage = '';

  private statusTimer: any;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.contactInfo = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email, Validators.required]],
      message: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.statusTimer);
  }

  onSubmit() {
    if (this.contactInfo.valid) {
      this.submitting = true;
      this.setStatus('idle', '');

      const recipientEmail = environment.contactEmail || 'mmmm@example.com';

      const formData = new FormData();
      formData.append('name', this.contactInfo.value.name);
      formData.append('email', this.contactInfo.value.email);
      formData.append('message', this.contactInfo.value.message);
      formData.append('_subject', 'New Portfolio Contact Request');
      formData.append('_captcha', 'false');
      formData.append('_template', 'box');

      const returnUrl = `${window.location.origin}${window.location.pathname}#contact`;
      formData.append('_next', returnUrl);

      this.http
        .post(`https://formsubmit.co/ajax/${recipientEmail}`, formData, {
          headers: { Accept: 'application/json' },
        })
        .subscribe({
          next: () => {
            this.submitting = false;
            this.contactInfo.reset();
            this.setStatus('success', "Thanks! I'll get back to you soon.");
          },
          error: (error) => {
            console.error('AJAX submission failed, trying fallback:', error);
            this.submitFormFallback(recipientEmail, formData);
          },
        });

      return false;
    } else {
      Object.keys(this.contactInfo.controls).forEach((key) => {
        this.contactInfo.get(key)?.markAsTouched();
      });

      this.setStatus('error', 'Please fill in all fields with a valid email.');

      return false;
    }
  }

  submitFormFallback(email: string, formData: FormData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${email}`;
    form.style.display = 'none';
    form.setAttribute('enctype', 'multipart/form-data');

    formData.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      this.submitting = false;
      this.contactInfo.reset();
      this.setStatus('success', "Thanks! I'll get back to you soon.");
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 2000);
    }, 500);
  }

  private setStatus(status: 'idle' | 'success' | 'error', message: string) {
    clearTimeout(this.statusTimer);
    this.status = status;
    this.statusMessage = message;
    if (status !== 'idle') {
      this.statusTimer = setTimeout(() => this.setStatus('idle', ''), 4000);
    }
  }
}
