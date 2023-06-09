import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  currentImgSrc: string;
  imageTimer: any;
  navClosed: boolean = true;
  constructor() {
    this.currentImgSrc = '../../../assets/Memoji/Memoji1.png';
  }
  startChangingImage() {
    this.imageTimer = setInterval(() => {
      this.changeImage();
    }, 250);
  }
  stopChangingImage() {
    clearInterval(this.imageTimer);
  }
  changeImage() {
    const images = [
      '../../../assets/Memoji/Memoji1.png',
      '../../../assets/Memoji/Memoji2.png',
      '../../../assets/Memoji/Memoji3.png',
      '../../../assets/Memoji/Memoji4.png',
      '../../../assets/Memoji/Memoji5.png',
      '../../../assets/Memoji/Memoji6.png',
      '../../../assets/Memoji/Memoji7.png',
    ];
    const currentIndex = images.indexOf(this.currentImgSrc);
    const nextIndex = (currentIndex + 1) % images.length;
    this.currentImgSrc = images[nextIndex];
  }
  showMobileNav() {
    if (this.navClosed) {
      this.navClosed = false;
      document.getElementById('mobileNav')?.classList.replace('hidden', 'flex');
      document.getElementById('mobileNav')?.classList.remove('-translate-y-7');
    } else {
      this.navClosed = true;
      document.getElementById('mobileNav')?.classList.replace('flex', 'hidden');
      document.getElementById('mobileNav')?.classList.add('-translate-y-7');
    }
  }

  ngOnInit(): void {}
}
