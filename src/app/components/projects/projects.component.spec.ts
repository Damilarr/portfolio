import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MagneticDirective } from 'src/app/directives/magnetic.directive';
import { RevealDirective } from 'src/app/directives/reveal.directive';
import { TiltDirective } from 'src/app/directives/tilt.directive';
import { Project, toProject } from 'src/app/models/project';
import { ProjectService } from 'src/app/service/project.service';
import { ProjectMediaComponent } from '../project-media/project-media.component';
import { RollingNumberComponent } from '../rolling-number/rolling-number.component';

import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;
  let component: ProjectsComponent;
  let el: HTMLElement;
  let service: { snapshot: Project[] | null; list: jasmine.Spy };

  const PIXEL =
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';

  const web = toProject('yZM4lspmg1aM4EHFAOlO', {
    projectName: 'MoodAI',
    category: 'web',
    img: PIXEL,
    projectLink: 'https://mooddai.vercel.app',
    githubLink: 'https://github.com/Damilarr/moodAI',
    techs: ['Nextjs', 'prisma', 'GeminiAi', 'Langchain'],
  })!;
  const mobile = toProject('mobile', {
    projectName: 'XSplit',
    projectDesc: 'Split expenses.',
    category: 'mobile',
    platforms: ['ios'],
    img: PIXEL + '#phone',
  })!;

  function create(snapshot: Project[] | null = null) {
    service.snapshot = snapshot;
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.removeItem('works-view');
    service = { snapshot: null, list: jasmine.createSpy('list') };
    service.list.and.returnValue(new Promise(() => {}));

    await TestBed.configureTestingModule({
      declarations: [
        ProjectsComponent,
        ProjectMediaComponent,
        RollingNumberComponent,
        RevealDirective,
        TiltDirective,
        MagneticDirective,
      ],
      imports: [RouterTestingModule],
      providers: [{ provide: ProjectService, useValue: service }],
    }).compileComponents();
  });

  afterEach(() => localStorage.removeItem('works-view'));

  it('shows placeholders while loading', () => {
    create();
    expect(el.querySelectorAll('.card.is-skeleton').length).toBe(2);
  });

  it('renders straight from the cache when coming back, without the entrance', () => {
    create([web, mobile]);
    expect(service.list).not.toHaveBeenCalled();
    const articles = el.querySelectorAll('.grid-view article');
    expect(articles.length).toBe(2);
    expect(articles[0].classList).toContain('is-revealed');
  });

  it('links each card to its project page and summarises it in a line', () => {
    create([web, mobile]);
    const cards = el.querySelectorAll('.grid-view .card');
    const link = cards[0].querySelector<HTMLAnchorElement>('.card-link')!;
    expect(link.textContent!.trim()).toBe('MoodAI');
    expect(link.getAttribute('href')).toBe('/work/moodai');
    expect(cards[0].querySelector('.card-desc')!.textContent).toBe(
      'A journal that reads the mood of every entry'
    );
    expect(cards[1].querySelector('.card-desc')!.textContent).toBe(
      'Split expenses.'
    );
    expect(cards[0].querySelector('.card-tech')!.textContent).toBe(
      'Next.js · Prisma · Gemini'
    );
  });

  it('keeps the live site and source as buttons on the card', () => {
    create([web]);
    const buttons = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.card .icon-button')
    );
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'MoodAI: mooddai.vercel.app',
      'MoodAI: Source code',
    ]);
    buttons.forEach((b) => expect(b.target).toBe('_blank'));
  });

  it('names each cover so it can morph into its project page', () => {
    create([web]);
    const media = el.querySelector<HTMLElement>('app-project-media')!;
    expect(media.style.getPropertyValue('view-transition-name')).toBe(
      'work-media-moodai'
    );
  });

  it('frames web projects as a window and mobile projects as phones', () => {
    create([web, mobile]);
    const [webCard, mobileCard] = Array.from(el.querySelectorAll('.card'));
    expect(webCard.querySelector('.shot')).not.toBeNull();
    expect(mobileCard.querySelectorAll('.phone').length).toBe(1);
    expect(mobileCard.querySelector('.kind')!.textContent!.trim()).toBe('iOS');
  });

  it('falls back to the local cover, then to the name, when images fail', () => {
    create([web]);
    const fail = () => {
      el.querySelector<HTMLImageElement>('.img-full')!.dispatchEvent(
        new Event('error')
      );
      fixture.detectChanges();
    };
    fail();
    expect(el.querySelector<HTMLImageElement>('.img-full')!.src).toContain(
      'assets/work/moodai/cover.webp'
    );
    fail();
    expect(el.querySelector('.shot')).toBeNull();
    expect(el.querySelector('.fallback')!.textContent!.trim()).toBe('MoodAI');
  });

  it('switches to a list and remembers the choice', async () => {
    create([web, mobile]);
    const toggle = el.querySelector<HTMLButtonElement>('.view-toggle')!;
    expect(toggle.getAttribute('aria-label')).toBe('Switch to list view');

    toggle.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    fixture.detectChanges();

    expect(el.querySelector('.grid-view')).toBeNull();
    expect(el.querySelectorAll('.list-view .row').length).toBe(2);
    expect(toggle.getAttribute('aria-label')).toBe('Switch to grid view');
    expect(localStorage.getItem('works-view')).toBe('list');
  });

  it('offers a retry when the projects could not be loaded', async () => {
    service.list.and.returnValue(Promise.reject(new Error('offline')));
    spyOn(console, 'error');
    create();
    await fixture.whenStable();
    fixture.detectChanges();

    const retry = el.querySelector<HTMLButtonElement>('.works-state button')!;
    service.list.calls.reset();
    retry.click();
    expect(service.list).toHaveBeenCalled();
  });
});
