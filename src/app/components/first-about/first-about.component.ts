import { Component, OnInit } from '@angular/core';
import * as Aos from 'aos';

@Component({
  selector: 'app-first-about',
  templateUrl: './first-about.component.html',
  styleUrls: ['./first-about.component.css'],
})
export class FirstAboutComponent implements OnInit {
  constructor() {}
  downloadResume() {
    const link = document.createElement('a');
    link.href = '="../../../assets/CV - Dev Emmanuel Adeyemo.pdf';
    link.download = "Adeyemo Emmanuel's CV.pdf";
    link.click();
  }
  ngOnInit(): void {
    Aos.init();
  }
}
