import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

import { ProjectUploadComponent } from './project-upload.component';

describe('ProjectUploadComponent', () => {
  let component: ProjectUploadComponent;
  let fixture: ComponentFixture<ProjectUploadComponent>;

  beforeEach(async () => {
    spyOn(ProjectUploadComponent.prototype, 'loadProjects');

    await TestBed.configureTestingModule({
      declarations: [ProjectUploadComponent],
      imports: [FormsModule],
      providers: [{ provide: Firestore, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.loadProjects).toHaveBeenCalled();
  });
});
