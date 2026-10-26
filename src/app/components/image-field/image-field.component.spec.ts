import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  CloudinaryService,
  UploadState,
} from 'src/app/service/cloudinary.service';

import { ImageFieldComponent } from './image-field.component';

describe('ImageFieldComponent', () => {
  let fixture: ComponentFixture<ImageFieldComponent>;
  let component: ImageFieldComponent;
  let el: HTMLElement;
  let upload$: Subject<UploadState>;
  let cloudinary: jasmine.SpyObj<CloudinaryService>;

  beforeEach(async () => {
    upload$ = new Subject<UploadState>();
    cloudinary = jasmine.createSpyObj('CloudinaryService', ['upload']);
    cloudinary.upload.and.returnValue(upload$);

    await TestBed.configureTestingModule({
      declarations: [ImageFieldComponent],
      providers: [{ provide: CloudinaryService, useValue: cloudinary }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageFieldComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  function choose(file: File) {
    const input = el.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('uploads the chosen file, shows progress, then hands back the URL', () => {
    component.folder = 'portfolio/work';
    const changes: string[] = [];
    const busy: boolean[] = [];
    component.srcChange.subscribe((src) => changes.push(src));
    component.busy.subscribe((b) => busy.push(b));

    choose(new File(['x'], 'shot.png', { type: 'image/png' }));
    expect(cloudinary.upload).toHaveBeenCalledWith(
      jasmine.any(File),
      'portfolio/work'
    );

    upload$.next({ progress: 40 });
    fixture.detectChanges();
    expect(el.textContent).toContain('Uploading 40%');

    upload$.next({
      progress: 100,
      url: 'https://res.cloudinary.com/x/image/upload/v1/a.png',
    });
    fixture.detectChanges();
    expect(changes).toEqual([
      'https://res.cloudinary.com/x/image/upload/v1/a.png',
    ]);
    expect(busy).toEqual([true, false]);
    expect(el.querySelector('img')!.getAttribute('src')).toContain('w_480');
    expect(el.textContent).toContain('Replace');
  });

  it('says so when the upload fails, and stops counting it as busy', () => {
    const busy: boolean[] = [];
    component.busy.subscribe((b) => busy.push(b));
    choose(new File(['x'], 'shot.png'));
    upload$.error(new Error('Upload failed (413).'));
    fixture.detectChanges();
    expect(el.querySelector('[role="alert"]')!.textContent).toContain('413');
    expect(busy).toEqual([true, false]);
  });

  it('clears the image when removed', () => {
    component.src = 'https://example.com/a.png';
    fixture.detectChanges();
    const changes: string[] = [];
    component.srcChange.subscribe((src) => changes.push(src));
    el.querySelector<HTMLButtonElement>('.a-btn-danger')!.click();
    fixture.detectChanges();
    expect(changes).toEqual(['']);
    expect(el.querySelector('img')).toBeNull();
  });
});
