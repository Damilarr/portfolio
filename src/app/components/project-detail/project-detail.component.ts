import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project, ProjectLink } from 'src/app/models/project';
import { NavigationHistory } from 'src/app/service/navigation-history.service';
import { ProjectService } from 'src/app/service/project.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  status: 'loading' | 'ready' | 'missing' | 'error' = 'loading';
  project?: Project;
  index = 0;
  total = 0;
  next?: Project;

  private paramsSub?: Subscription;
  private slug = '';
  private siteDescription = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private history: NavigationHistory,
    private projectService: ProjectService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.siteDescription =
      this.meta.getTag('name="description"')?.content || '';
    this.paramsSub = this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug') || '';
      this.show();
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
    if (this.siteDescription) {
      this.meta.updateTag({
        name: 'description',
        content: this.siteDescription,
      });
    }
  }

  async show(): Promise<void> {
    const cached = this.projectService.snapshot;
    if (cached) return this.present(cached);

    this.status = 'loading';
    try {
      this.present(await this.projectService.list());
    } catch (err) {
      console.error('Failed to load project', err);
      this.status = 'error';
    }
  }

  back(event: MouseEvent): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;
    event.preventDefault();
    if (this.history.cameFromHome()) this.location.back();
    else this.router.navigateByUrl('/#works');
  }

  get liveLink(): ProjectLink | undefined {
    return this.project?.links.find((link) => link.kind !== 'source');
  }

  get sourceLink(): ProjectLink | undefined {
    return this.project?.links.find((link) => link.kind === 'source');
  }

  get liveLabel(): string {
    const link = this.liveLink;
    return !link || link.kind === 'live' ? 'Visit site' : link.label;
  }

  get kind(): string {
    if (!this.project || this.project.category === 'web') return 'Web app';
    const platforms = this.project.platforms.map((p) =>
      p.toLowerCase() === 'ios' ? 'iOS' : 'Android'
    );
    return platforms.length
      ? `Mobile app · ${platforms.join(' & ')}`
      : 'Mobile app';
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private present(projects: Project[]): void {
    const index = projects.findIndex((p) => p.slug === this.slug);
    if (index === -1) {
      this.project = undefined;
      this.status = 'missing';
      this.title.setTitle('Project not found | Emmanuel Adeyemo');
      return;
    }
    const project = projects[index];
    this.project = project;
    this.index = index;
    this.total = projects.length;
    this.next =
      projects.length > 1 ? projects[(index + 1) % projects.length] : undefined;
    this.status = 'ready';

    this.title.setTitle(`${project.name} | Emmanuel Adeyemo`);
    this.meta.updateTag({
      name: 'description',
      content: project.detail?.intro || project.description,
    });
  }
}
