import { Component, OnInit } from '@angular/core';
import * as Aos from 'aos';

@Component({
  selector: 'app-first-about',
  templateUrl: './first-about.component.html',
  styleUrls: ['./first-about.component.css'],
})
export class FirstAboutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    Aos.init();
  }
}
