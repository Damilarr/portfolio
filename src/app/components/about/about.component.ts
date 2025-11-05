import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as Aos from 'aos';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TechItem {
  name: string;
  icon?: string;
  iconClass?: string;
  imgSrc?: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  private scrollTriggers: ScrollTrigger[] = [];
  private marqueeAnimation: gsap.core.Tween | null = null;
  private marqueeContent: HTMLElement | null = null;

  techStack: TechItem[] = [
    { name: 'HTML', iconClass: 'fa-brands fa-html5' },
    { name: 'CSS', iconClass: 'fa-brands fa-css3-alt' },
    { name: 'JavaScript', iconClass: 'fa-brands fa-js' },
    { name: 'BootStrap', iconClass: 'fa-brands fa-bootstrap' },
    { name: 'Angular', iconClass: 'fa-brands fa-angular' },
    {
      name: 'Express.js',
      imgSrc: '../../../assets/Images/express-svgrepo-com.svg',
    },
    {
      name: 'MongoDB',
      imgSrc: '../../../assets/Images/mongodb-svgrepo-com.svg',
    },
    {
      name: 'TailwindCSS',
      imgSrc: '../../../assets/Images/tailwindcss-svgrepo-com.svg',
    },
    {
      name: 'TypeScript',
      imgSrc: '../../../assets/Images/typescript-svgrepo-com.svg',
    },
    { name: 'Github', iconClass: 'fa-brands fa-github' },
    { name: 'Git', iconClass: 'fa-brands fa-git-alt' },
  ];

  constructor() {}

  ngOnInit(): void {
    Aos.init();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setupScrollAnimations();
      this.setupMarquee();
    }, 300);
  }

  private setupScrollAnimations(): void {
    const section = document.getElementById('about-section');
    const aboutTitle = document.getElementById('about-title');
    const aboutDescription = document.getElementById('about-description');

    if (!section || !aboutTitle || !aboutDescription) return;

    // Set initial states
    gsap.set([aboutTitle, aboutDescription], {
      opacity: 0,
      y: 50,
    });

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: false,
      },
    });

    // Animate about title
    tl.to(aboutTitle, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }).to(
      aboutDescription,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
      },
      '-=0.5'
    );

    // Parallax effect for  text
    const parallaxTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.to(aboutTitle, {
          y: progress * 50,
          opacity: 1 - progress * 0.3,
          duration: 0.3,
        });
        gsap.to(aboutDescription, {
          y: progress * 30,
          opacity: 1 - progress * 0.2,
          duration: 0.3,
        });
      },
    });
    this.scrollTriggers.push(parallaxTrigger);
  }

  private setupMarquee(): void {
    const marqueeContent = document.getElementById('marquee-content');
    const marqueeWrapper = document.getElementById('marquee-wrapper');

    if (!marqueeContent || !marqueeWrapper) return;

    this.marqueeContent = marqueeContent;

    const contentWidth = marqueeContent.scrollWidth;
    const firstHalf = contentWidth / 2;

    // Set initial position
    gsap.set(marqueeContent, { x: 0 });

    //infinite scrolling animation
    this.marqueeAnimation = gsap.to(marqueeContent, {
      x: -firstHalf,
      duration: 20,
      ease: 'none',
      repeat: -1,
    });

    // Pause on hover
    marqueeWrapper.addEventListener('mouseenter', () => {
      if (this.marqueeAnimation) {
        this.marqueeAnimation.pause();
      }
    });

    marqueeWrapper.addEventListener('mouseleave', () => {
      if (this.marqueeAnimation) {
        this.marqueeAnimation.play();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up marquee animation
    if (this.marqueeAnimation) {
      this.marqueeAnimation.kill();
    }

    this.scrollTriggers.forEach((trigger) => trigger.kill());
    ScrollTrigger.getAll().forEach((trigger) => {
      const triggerElement = trigger.vars.trigger as HTMLElement | undefined;
      if (triggerElement?.id === 'about-section') {
        trigger.kill();
      }
    });
  }
}
