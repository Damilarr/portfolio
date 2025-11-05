import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import gsap from 'gsap';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('webMobileText', { static: true })
  webMobileText!: ElementRef<HTMLHeadingElement>;

  @ViewChild('developerText', { static: true })
  developerText!: ElementRef<HTMLHeadingElement>;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const webMobileElement = this.webMobileText.nativeElement;
    const developerElement = this.developerText.nativeElement;

    gsap.set([webMobileElement, developerElement], {
      y: 100,
      opacity: 0,
    });

    const tl = gsap.timeline();

    tl.to(webMobileElement, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
    }).to(
      developerElement,
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
      },
      '-=0.2'
    );
  }
}
