import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  Project,
  projectImage,
  projectPlaceholder,
} from 'src/app/models/project';

const shown = new Set<string>();

@Component({
  selector: 'app-project-media',
  templateUrl: './project-media.component.html',
  styleUrls: ['./project-media.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProjectMediaComponent {
  @Input() project!: Project;
  @Input() width = 720;
  @Input() previewWidth?: number;

  failed = new Set<string>();

  get cover(): string | null {
    const cover = this.project.cover;
    return cover && !this.failed.has(cover) ? cover : null;
  }

  get phoneScreens(): string[] {
    const screens = [this.project.cover, ...this.project.screenshots].filter(
      Boolean
    );
    return Array.from(new Set(screens))
      .filter((screen) => !this.failed.has(screen))
      .slice(0, 3);
  }

  get phoneWidth(): number {
    return this.width / 2;
  }

  get phonePreview(): number | undefined {
    return this.previewWidth && this.previewWidth / 2;
  }

  image(url: string, width: number): string {
    return projectImage(url, width);
  }

  isShown(src: string): boolean {
    return shown.has(src);
  }

  markShown(src: string): void {
    shown.add(src);
  }

  placeholder(url: string): string | null {
    return projectPlaceholder(url);
  }
}
