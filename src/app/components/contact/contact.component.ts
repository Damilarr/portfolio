import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import * as Aos from 'aos';
import '../../../assets/smtp.js';
declare let Email: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  contactInfo: any;
  submitting = false;
  submitted = false;
  showToast = false;
  toastType: 'success' | 'error' = 'success';
  toastMessage = '';

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.contactInfo = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.email, Validators.required]],
      message: ['', [Validators.required, Validators.min(10)]],
    });
  }
  get name() {
    return this.contactInfo.get('name');
  }
  get email() {
    return this.contactInfo.get('email');
  }
  get message() {
    return this.contactInfo.get('message');
  }
  ngOnInit(): void {
    Aos.init();

    const formSubmitted = localStorage.getItem('formSubmitted');
    if (formSubmitted === 'true') {
      // Clear the form
      this.contactInfo.reset();
      this.submitted = true;
      setTimeout(() => (this.submitted = false), 5000);
      localStorage.removeItem('formSubmitted');
    }
  }

  onSubmit() {
    console.log('Form submitted', this.contactInfo.value);

    if (this.contactInfo.valid) {
      this.submitting = true;
      this.submitted = false;

      const recipientEmail = environment.contactEmail || 'mmmm@example.com';

      const formData = new FormData();
      formData.append('name', this.contactInfo.value.name);
      formData.append('email', this.contactInfo.value.email);
      formData.append('message', this.contactInfo.value.message);
      formData.append('_subject', 'New Portfolio Contact Request');
      formData.append('_captcha', 'false');
      formData.append('_template', 'box');

      const returnUrl = `${window.location.origin}${window.location.pathname}#chat`;
      formData.append('_next', returnUrl);

      this.http
        .post(`https://formsubmit.co/ajax/${recipientEmail}`, formData, {
          headers: { Accept: 'application/json' },
        })
        .subscribe({
          next: (response: any) => {
            console.log('Form submitted successfully', response);
            this.submitting = false;
            this.contactInfo.reset();
            this.showToastNotification(
              'success',
              'Message sent successfully! 🎉'
            );
          },
          error: (error) => {
            console.error('AJAX submission failed, trying fallback:', error);
            this.submitFormFallback(recipientEmail, formData);
          },
        });

      return false;
    } else {
      console.log('Form is invalid');
      Object.keys(this.contactInfo.controls).forEach((key) => {
        this.contactInfo.get(key)?.markAsTouched();
      });

      this.showToastNotification(
        'error',
        'Please fill in all required fields correctly.'
      );

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
      this.showToastNotification('success', 'Message sent successfully! 🎉');
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 2000);
    }, 500);
  }

  showToastNotification(type: 'success' | 'error', message: string) {
    this.toastType = type;
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
