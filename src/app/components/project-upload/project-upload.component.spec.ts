import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

import { ProjectUploadComponent } from './project-upload.component';

describe('ProjectUploadComponent', () => {
  let component: ProjectUploadComponent;
  let fixture: ComponentFixture<ProjectUploadComponent>;
  let el: HTMLElement;

  const projects = [
    {
      id: 'live',
      data: {
        projectName: 'Heartnote',
        tagline: 'Handcrafted digital letters',
        year: '2026',
        intro: 'Hi',
        sections: [{ heading: 'One', body: ['A'] }],
      },
    },
    {
      id: 'hidden',
      data: { projectName: 'Old thing', isActive: false, projectDesc: 'Old.' },
    },
  ];

  beforeEach(async () => {
    spyOn(ProjectUploadComponent.prototype, 'loadProjects').and.resolveTo();

    await TestBed.configureTestingModule({
      declarations: [ProjectUploadComponent],
      imports: [FormsModule],
      providers: [{ provide: Firestore, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectUploadComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    component.projects = projects.map((p) => ({ ...p, data: { ...p.data } }));
    fixture.detectChanges();
  });

  it('lists every project, marking hidden ones and those without a write-up', () => {
    const rows = Array.from(el.querySelectorAll('.project-row'));
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Handcrafted digital letters');
    expect(rows[1].classList).toContain('is-hidden');
    expect(rows[1].textContent).toContain('No write-up');
    expect(el.querySelector('.count')!.textContent).toContain(
      '1 live · 2 total'
    );
  });

  it('opens a project in the editor with its write-up filled in', async () => {
    el.querySelector<HTMLButtonElement>('.row-main')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.project-row')).toBeNull();
    expect(el.querySelector('h2')!.textContent).toContain('Edit Heartnote');
    expect(el.querySelector<HTMLInputElement>('#tagline')!.value).toBe(
      'Handcrafted digital letters'
    );
    expect(el.querySelectorAll('.section-card').length).toBe(1);
  });

  it('adds, reorders and removes sections', () => {
    component.newProject();
    component.addSection();
    component.addSection();
    component.form.sections[0].heading = 'First';
    component.form.sections[1].heading = 'Second';

    component.moveSection(1, -1);
    expect(component.form.sections.map((s) => s.heading)).toEqual([
      'Second',
      'First',
    ]);
    component.moveSection(0, -1);
    expect(component.form.sections[0].heading).toBe('Second');

    spyOn(window, 'confirm').and.returnValue(true);
    component.removeSection(0);
    expect(component.form.sections.map((s) => s.heading)).toEqual(['First']);
  });

  it('caps phone screens at three per section', () => {
    component.newProject();
    component.addSection();
    [1, 2, 3, 4].forEach(() => component.addPhone(0));
    expect(component.form.sections[0].phones.length).toBe(3);
  });

  it('holds off saving while images are still uploading', async () => {
    component.newProject();
    component.form.projectName = 'New';
    component.onBusy(true);
    fixture.detectChanges();
    const submit = el.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    )!;
    expect(submit.disabled).toBeTrue();

    component.onBusy(false);
    fixture.detectChanges();
    expect(submit.disabled).toBeFalse();
  });

  it('asks for a name before saving', async () => {
    component.newProject();
    await component.save();
    fixture.detectChanges();
    expect(el.querySelector('.notice')!.textContent).toContain('name');
    expect(component.view).toBe('edit');
  });
});
