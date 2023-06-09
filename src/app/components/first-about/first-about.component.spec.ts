import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstAboutComponent } from './first-about.component';

describe('FirstAboutComponent', () => {
  let component: FirstAboutComponent;
  let fixture: ComponentFixture<FirstAboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirstAboutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
