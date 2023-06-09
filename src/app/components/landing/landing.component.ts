import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      document?.getElementById('front')?.classList.remove('text-transparent');
      document?.getElementById('dev')?.classList.remove('text-transparent');
      document?.getElementById('dev')?.classList.add('text-whitish');
      document?.getElementById('front')?.classList.add('text-whitish');
    }, 1000);
    setInterval(() => {
      if (window.innerWidth > 640) {
        document?.getElementById('dev')?.classList.add('translate-y-40');
        document?.getElementById('front')?.classList.remove('translate-y-10');
      } else {
        document?.getElementById('dev')?.classList.add('translate-y-20');
        document?.getElementById('front')?.classList.remove('translate-y-10');
      }
    }, 1000);
  }
}
