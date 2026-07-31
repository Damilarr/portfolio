import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Firestore, getDocs, collection } from '@angular/fire/firestore';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  data: any = [];
  filteredData: any = [];
  activeTab: 'web' | 'mobile' = 'web';
  screenshotIndices: { [key: string]: number } = {};

  @ViewChild('indexList') indexList!: ElementRef<HTMLElement>;
  @ViewChild('preview') preview!: ElementRef<HTMLElement>;
  @ViewChild('previewImg') previewImg!: ElementRef<HTMLImageElement>;
  @ViewChildren('workRow') workRows!: QueryList<ElementRef<HTMLElement>>;

  private rowsSub?: Subscription;
  private pointerFine = false;
  private hasRevealed = false;
  private lastPointerX = 0;
  private tiltReset: any = null;
  private xTo?: (value: number) => void;
  private yTo?: (value: number) => void;
  private tiltTo?: (value: number) => void;

  constructor(private firestore: Firestore, private zone: NgZone) {}

  ngOnInit(): void {
    this.pointerFine = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;
    this.getData();
  }

  ngAfterViewInit(): void {
    this.setupPreview();
    this.revealHead();

    // Rows arrive after the Firestore fetch and again on every tab switch.
    this.rowsSub = this.workRows.changes.subscribe(() => this.revealRows());
    this.revealRows();
  }

  ngOnDestroy(): void {
    this.rowsSub?.unsubscribe();
    clearTimeout(this.tiltReset);
    if (this.pointerFine && this.indexList) {
      this.indexList.nativeElement.removeEventListener(
        'mousemove',
        this.onPointerMove
      );
    }
    ScrollTrigger.getAll().forEach((trigger) => {
      const el = trigger.vars.trigger as HTMLElement | undefined;
      if (el && el.closest('#works-section')) trigger.kill();
    });
  }

  /* ---------------------------------------------------------------- data */

  getData() {
    const dbInstance = collection(this.firestore, 'projects');
    // Fetch all projects first, then filter client-side to handle legacy projects
    getDocs(dbInstance)
      .then((response: any) => {
        this.data = response.docs.map((item: any) => {
          const projectData = item.data();
          // Set defaults for legacy projects that don't have these fields
          return {
            ...projectData,
            id: item.id,
            category: projectData.category || 'web',
            isActive:
              projectData.isActive !== undefined ? projectData.isActive : true, // Default to true for legacy projects
          };
        });
        // Filter out inactive projects
        this.data = this.data.filter(
          (project: any) => project.isActive === true
        );
        this.filterProjects();
        this.preloadCovers();
      })
      .catch((err) => {
        console.error('Failed to load projects', err);
      });
  }

  setActiveTab(tab: 'web' | 'mobile') {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.onRowLeave();
    this.filterProjects();
  }

  filterProjects() {
    this.filteredData = this.data.filter((project: any) => {
      return project.category === this.activeTab;
    });
  }

  /** The cursor preview swaps images on hover — warm them so it never flashes empty. */
  private preloadCovers(): void {
    if (!this.pointerFine) return;
    this.zone.runOutsideAngular(() => {
      this.data.forEach((project: any) => {
        const src = this.cover(project);
        if (src) new Image().src = src;
      });
    });
  }

  countFor(tab: 'web' | 'mobile'): number {
    return this.data.filter((project: any) => project.category === tab).length;
  }

  /* --------------------------------------------------------------- view */

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  cover(project: any): string {
    if (project.img) return project.img;
    return project.screenshots?.length ? project.screenshots[0] : '';
  }

  primaryLink(project: any): string {
    return (
      project.projectLink ||
      project.storeLinks?.appStore ||
      project.storeLinks?.playStore ||
      project.storeLinks?.testflight ||
      project.storeLinks?.apk ||
      project.githubLink ||
      ''
    );
  }

  platformIcon(platform: string): string {
    return platform?.toLowerCase() === 'ios'
      ? 'fa-brands fa-apple'
      : 'fa-brands fa-android';
  }

  getCurrentScreenshot(project: any): string {
    if (!project.screenshots || project.screenshots.length === 0) {
      return project.img || '';
    }
    const index = this.screenshotIndices[project.id] || 0;
    return project.screenshots[index] || project.img || '';
  }

  /* ---------------------------------------------------------- animation */

  onRowEnter(project: any): void {
    if (!this.pointerFine || !this.preview) return;
    const src = this.cover(project);
    if (src) this.previewImg.nativeElement.src = src;
    gsap.to(this.preview.nativeElement, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.45,
      ease: 'power3.out',
    });
  }

  onRowLeave(): void {
    if (!this.pointerFine || !this.preview) return;
    gsap.to(this.preview.nativeElement, {
      autoAlpha: 0,
      scale: 0.82,
      duration: 0.35,
      ease: 'power3.out',
    });
  }

  private setupPreview(): void {
    if (!this.pointerFine || !this.preview) return;

    const el = this.preview.nativeElement;
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.82, autoAlpha: 0 });

    this.xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    this.yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    this.tiltTo = gsap.quickTo(el, 'rotation', {
      duration: 0.9,
      ease: 'power3',
    });

    // Pointer tracking must not spin change detection on every mouse move.
    this.zone.runOutsideAngular(() => {
      this.indexList.nativeElement.addEventListener(
        'mousemove',
        this.onPointerMove
      );
    });
  }

  private onPointerMove = (event: MouseEvent): void => {
    if (!this.xTo || !this.yTo || !this.tiltTo) return;

    this.xTo(event.clientX);
    this.yTo(event.clientY);

    // Tilt with the horizontal velocity, then settle back to level.
    const tilt = gsap.utils.clamp(
      -12,
      12,
      (event.clientX - this.lastPointerX) * 0.6
    );
    this.tiltTo(tilt);
    this.lastPointerX = event.clientX;

    clearTimeout(this.tiltReset);
    this.tiltReset = setTimeout(() => this.tiltTo && this.tiltTo(0), 120);
  };

  private revealRows(): void {
    const rows = this.workRows?.map((row) => row.nativeElement) ?? [];
    if (!rows.length) return;

    gsap.killTweensOf(rows);
    gsap.fromTo(
      rows,
      { yPercent: 18, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.07,
        overwrite: true,
        scrollTrigger: this.hasRevealed
          ? undefined
          : {
              trigger: this.indexList.nativeElement,
              start: 'top 88%',
              once: true,
            },
      }
    );
    this.hasRevealed = true;
  }

  private revealHead(): void {
    const head = document.getElementById('works-head');
    if (!head) return;

    gsap.from(head.children, {
      yPercent: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: head,
        start: 'top 88%',
        once: true,
      },
    });
  }
}
