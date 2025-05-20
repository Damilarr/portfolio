import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  error = false;

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

    // Check if we just returned from a form submission
    const formSubmitted = localStorage.getItem('formSubmitted');
    if (formSubmitted === 'true') {
      // Clear the form
      this.contactInfo.reset();
      this.submitted = true;
      setTimeout(() => (this.submitted = false), 5000);
      // Clear the storage flag
      localStorage.removeItem('formSubmitted');
    }
  }

  onSubmit() {
    console.log('Form submitted', this.contactInfo.value);

    if (this.contactInfo.valid) {
      this.submitting = true;
      console.log('Valid form submitted', this.contactInfo.value);

      localStorage.setItem('formSubmitted', 'true');

      const formData = new FormData();
      formData.append('name', this.contactInfo.value.name);
      formData.append('email', this.contactInfo.value.email);
      formData.append('message', this.contactInfo.value.message);
      formData.append('_subject', 'New portfolio contact request');
      formData.append('_captcha', 'true');
      formData.append('_next', window.location.href);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://formsubmit.co/0602ea8cd04997f663159d716de0a739';
      form.style.display = 'none';

      formData.forEach((value, key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      return false;
    } else {
      console.log('Form is invalid');
      Object.keys(this.contactInfo.controls).forEach((key) => {
        this.contactInfo.get(key).markAsTouched();
      });
      return false;
    }
  }
}
