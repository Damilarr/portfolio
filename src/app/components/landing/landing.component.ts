import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  constructor() {}
  frontend: any = 'FRONTEND';
  dev: string = 'DEVELOPER';
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
    console.log(this.frontend);
    this.randomEffect(this.frontend, 'front');
    this.randomEffect(this.dev, 'dev');
  }
  randomEffect(textToRandomize: string, setTo: any) {
    const original = textToRandomize.split('');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    let iterations = 0;
    const interval = setInterval(() => {
      setTo == 'front'
        ? (this.frontend = textToRandomize
            .split('')
            .map((letter: string, index: number) => {
              if (index < iterations) {
                return original[index];
              } else {
                return letters[Math.floor(Math.random() * 36)];
              }
            })
            .join(''))
        : (this.dev = textToRandomize
            .split('')
            .map((letter: string, index: number) => {
              if (index < iterations) {
                return original[index];
              } else {
                return letters[Math.floor(Math.random() * 36)];
              }
            })
            .join(''));
      if (iterations >= textToRandomize.length) clearInterval(interval);
      iterations += 1 / textToRandomize.length;
    }, 70);
  }
}
