import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
  constructor(private formBuilder: FormBuilder) {
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
  }
}
