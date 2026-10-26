import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { projectImage } from 'src/app/models/project';
import { CloudinaryService } from 'src/app/service/cloudinary.service';

@Component({
  selector: 'app-image-field',
  templateUrl: './image-field.component.html',
  styleUrls: ['./image-field.component.css'],
})
export class ImageFieldComponent implements OnChanges, OnDestroy {
  @Input() src = '';
  @Output() srcChange = new EventEmitter<string>();
  @Input() folder = 'portfolio';
  @Input() shape: 'wide' | 'tall' = 'wide';
  @Input() label = 'Image';
  @Output() busy = new EventEmitter<boolean>();

  progress: number | null = null;
  error = '';
  broken = false;

  private upload?: Subscription;

  constructor(private cloudinary: CloudinaryService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) this.broken = false;
  }

  ngOnDestroy(): void {
    if (this.upload && !this.upload.closed) this.busy.emit(false);
    this.upload?.unsubscribe();
  }

  get preview(): string {
    return projectImage(this.src, 480);
  }

  pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.upload?.unsubscribe();
    this.error = '';
    this.progress = 0;
    this.busy.emit(true);
    this.upload = this.cloudinary.upload(file, this.folder).subscribe({
      next: (state) => {
        this.progress = state.progress;
        if (!state.url) return;
        this.progress = null;
        this.broken = false;
        this.src = state.url;
        this.srcChange.emit(state.url);
        this.busy.emit(false);
      },
      error: (err) => {
        this.progress = null;
        this.error = err?.message || 'Upload failed. Try again.';
        this.busy.emit(false);
      },
    });
  }

  remove(): void {
    this.broken = false;
    this.src = '';
    this.srcChange.emit('');
  }
}
