import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { RevealDirective } from 'src/app/directives/reveal.directive';
import { arrangeProjects, toProject } from 'src/app/models/project';
import { NavigationHistory } from 'src/app/service/navigation-history.service';
import { ProjectService } from 'src/app/service/project.service';

import { ProjectDetailComponent } from './project-detail.component';

describe('ProjectDetailComponent', () => {
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let el: HTMLElement;
  let params: BehaviorSubject<any>;
  let cameFromHome: boolean;

  const projects = arrangeProjects([
    toProject('8wztWf0Rhdsdnt3a3scj', {
      projectName: 'Heartnote',
      projectLink: 'https://sendheartnote.com',
      githubLink: 'https://github.com/Damilarr/heartnote',
      techs: ['Nextjs', 'Prisma'],
    })!,
    toProject('1jReCD1XgLSu4eroQVdS', {
      projectName: 'plex ',
      projectDesc: 'A movie website.',
      projectLink: 'https://plex-clone.vercel.app',
    })!,
    toProject('new', {
      projectName: 'Side Project',
      projectDesc: 'Something new.',
      category: 'mobile',
      techs: ['Flutter'],
    })!,
  ]);

  beforeEach(async () => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'heartnote' }));
    cameFromHome = false;

    await TestBed.configureTestingModule({
      declarations: [ProjectDetailComponent, RevealDirective],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: ProjectService, useValue: { snapshot: projects } },
        {
          provide: NavigationHistory,
          useValue: { cameFromHome: () => cameFromHome },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('tells the project’s story', () => {
    expect(el.querySelector('h1')!.textContent).toBe('Heartnote');
    expect(el.querySelector('.detail-sub')!.textContent).toContain(
      'Handcrafted digital letters'
    );
    expect(el.querySelector('.lede')!.textContent).toContain(
      'a text message feels too small'
    );
    const headings = Array.from(el.querySelectorAll('.section h2')).map(
      (h) => h.textContent
    );
    expect(headings).toEqual(['Making it yours', 'Going Pro']);
    expect(TestBed.inject(Title).getTitle()).toBe(
      'Heartnote | Emmanuel Adeyemo'
    );
  });

  it('links to the live product and its source', () => {
    const links = Array.from(
      el.querySelectorAll<HTMLAnchorElement>('.detail-actions a')
    );
    expect(links.map((a) => [a.textContent!.trim(), a.href])).toEqual([
      ['Visit site', 'https://sendheartnote.com/'],
      ['Source', 'https://github.com/Damilarr/heartnote'],
    ]);
  });

  it('names the hero after the card it morphs from', () => {
    const hero = el.querySelector<HTMLElement>('.hero app-project-media')!;
    expect(hero.style.getPropertyValue('view-transition-name')).toBe(
      'work-media-heartnote'
    );
  });

  it('leads on to the next project, wrapping around at the end', () => {
    expect(el.querySelector('.nav-count')!.textContent!.trim()).toBe('02 / 03');
    expect(el.querySelector('.next-name')!.textContent).toBe('plex');

    params.next(convertToParamMap({ slug: 'plex' }));
    fixture.detectChanges();
    expect(el.querySelector('h1')!.textContent).toBe('plex');
    expect(el.querySelector('.next-name')!.textContent).toBe('Side Project');
  });

  it('still makes a page from the Firestore fields alone', () => {
    params.next(convertToParamMap({ slug: 'side-project' }));
    fixture.detectChanges();
    expect(el.querySelector('h1')!.textContent).toBe('Side Project');
    expect(el.querySelector('.detail-sub')!.textContent!.trim()).toBe(
      'Mobile app'
    );
    expect(el.querySelector('.lede')!.textContent).toBe('Something new.');
    expect(el.querySelector('.facts')!.textContent).toContain('Flutter');
    expect(el.querySelectorAll('.section').length).toBe(0);
  });

  it('says so when the project does not exist', () => {
    params.next(convertToParamMap({ slug: 'nope' }));
    fixture.detectChanges();
    expect(el.querySelector('.detail-state h1')!.textContent).toBe(
      'Nothing here'
    );
  });

  it('goes back through history when the visitor came from the home page', () => {
    const location = TestBed.inject(Location);
    const router = TestBed.inject(Router);
    spyOn(location, 'back');
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    const back = el.querySelector<HTMLAnchorElement>(
      '[aria-label="Back to works"]'
    )!;

    cameFromHome = true;
    back.click();
    expect(location.back).toHaveBeenCalled();

    cameFromHome = false;
    back.click();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/#works');
  });
});
