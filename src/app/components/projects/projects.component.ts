import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Project } from 'src/app/models/project';
import { withViewTransition } from 'src/app/motion/view-transition';
import { ProjectService } from 'src/app/service/project.service';

type View = 'grid' | 'list';

const VIEW_KEY = 'works-view';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit, AfterViewInit {
  projects: Project[] = [];
  status: 'loading' | 'ready' | 'error' = 'loading';
  view: View = 'grid';
  count = 0;
  instant = false;
  morphCards = false;

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.view = this.storedView();
    const cached = this.projectService.snapshot;
    if (cached) {
      this.projects = cached;
      this.status = 'ready';
      this.instant = true;
    } else {
      this.load();
    }
  }

  ngAfterViewInit(): void {
    if (this.status === 'ready') this.rollCount();
  }

  async load(): Promise<void> {
    this.status = 'loading';
    try {
      this.projects = await this.projectService.list();
      this.status = 'ready';
      this.rollCount();
    } catch (err) {
      console.error('Failed to load projects', err);
      this.status = 'error';
    }
  }

  toggleView(): void {
    const next: View = this.view === 'grid' ? 'list' : 'grid';
    this.morphCards = true;
    this.cdr.detectChanges();
    withViewTransition(() => {
      this.instant = true;
      this.view = next;
      this.cdr.detectChanges();
    }).then(() => {
      this.morphCards = false;
      this.cdr.detectChanges();
    });
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {}
  }

  private storedView(): View {
    try {
      return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  }

  private rollCount(): void {
    setTimeout(() => (this.count = this.projects.length), 120);
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  kindLabel(project: Project): string {
    if (project.category === 'web') return 'Web';
    const platforms = project.platforms.map((p) =>
      p.toLowerCase() === 'ios' ? 'iOS' : 'Android'
    );
    return platforms.length ? platforms.join(' · ') : 'Mobile';
  }

  summary(project: Project): string {
    return project.detail?.tagline || project.description;
  }

  trackById(_: number, project: Project): string {
    return project.id;
  }
}
