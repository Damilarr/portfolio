import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('lays out the sections in order, with anchors for in-page links', () => {
    const main: HTMLElement = fixture.nativeElement.querySelector('main#top');
    expect(
      Array.from(main.children).map((c) => c.tagName.toLowerCase())
    ).toEqual(['app-about', 'app-projects', 'app-contact']);
    expect(main.querySelector('#works')).not.toBeNull();
    expect(main.querySelector('#contact')).not.toBeNull();
  });

  it('puts the page on a sheet that lifts off the footer', () => {
    const [sheet, footer] = Array.from(
      (fixture.nativeElement as HTMLElement).children
    );
    expect(sheet.classList).toContain('sheet');
    expect(sheet.querySelector('main')).not.toBeNull();
    expect(footer.tagName.toLowerCase()).toBe('app-footer');
  });
});
