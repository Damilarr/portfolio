import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { slugify } from 'src/app/models/certificate';
import { projectImage } from 'src/app/models/project';
import {
  MAX_PHONES,
  ProjectForm,
  docFromForm,
  emptyFigure,
  emptyProjectForm,
  emptySection,
  formFromDoc,
} from 'src/app/models/project-form';

interface AdminProject {
  id: string;
  data: any;
}

type Notice = { kind: 'ok' | 'error'; text: string } | null;

@Component({
  selector: 'app-project-upload',
  templateUrl: './project-upload.component.html',
  styleUrls: ['./project-upload.component.css'],
})
export class ProjectUploadComponent implements OnInit, OnDestroy {
  tab: 'projects' | 'certificates' = 'projects';
  view: 'list' | 'edit' = 'list';

  projects: AdminProject[] = [];
  loading = false;

  editingId: string | null = null;
  form: ProjectForm = emptyProjectForm();
  saving = false;
  uploads = 0;
  notice: Notice = null;

  readonly maxPhones = MAX_PHONES;

  private noticeTimer: any;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    clearTimeout(this.noticeTimer);
  }

  async loadProjects(): Promise<void> {
    this.loading = true;
    try {
      const response = await getDocs(collection(this.firestore, 'projects'));
      this.projects = response.docs
        .map((item): AdminProject => ({
          id: item.id,
          data: item.data() as any,
        }))
        .sort(
          (a, b) =>
            Number(a.data.isActive === false) -
              Number(b.data.isActive === false) ||
            (Number(b.data.year) || Infinity) -
              (Number(a.data.year) || Infinity) ||
            String(a.data.projectName).localeCompare(String(b.data.projectName))
        );
    } catch (err: any) {
      this.notify('error', `Couldn't load projects: ${err.message}`);
    } finally {
      this.loading = false;
    }
  }

  newProject(): void {
    this.editingId = null;
    this.form = emptyProjectForm();
    this.view = 'edit';
    window.scrollTo({ top: 0 });
  }

  edit(project: AdminProject): void {
    this.editingId = project.id;
    this.form = formFromDoc(project.data);
    this.view = 'edit';
    window.scrollTo({ top: 0 });
  }

  closeEditor(): void {
    this.view = 'list';
    this.editingId = null;
  }

  async save(): Promise<void> {
    if (!this.form.projectName.trim()) {
      this.notify('error', 'Give the project a name first.');
      return;
    }
    if (this.uploads > 0) return;

    this.saving = true;
    const data = docFromForm(this.form);
    try {
      if (this.editingId) {
        await updateDoc(doc(this.firestore, 'projects', this.editingId), data);
      } else {
        await addDoc(collection(this.firestore, 'projects'), data);
      }
      this.notify('ok', `Saved ${data['projectName']}.`);
      this.closeEditor();
      await this.loadProjects();
    } catch (err: any) {
      this.notify('error', `Couldn't save: ${err.message}`);
    } finally {
      this.saving = false;
    }
  }

  async toggleActive(project: AdminProject): Promise<void> {
    const isActive = project.data.isActive === false;
    try {
      await updateDoc(doc(this.firestore, 'projects', project.id), {
        isActive,
      });
      project.data = { ...project.data, isActive };
      this.notify(
        'ok',
        `${project.data.projectName} is now ${isActive ? 'visible' : 'hidden'}.`
      );
    } catch (err: any) {
      this.notify('error', `Couldn't update: ${err.message}`);
    }
  }

  async remove(project: AdminProject): Promise<void> {
    const name = String(project.data.projectName || 'this project').trim();
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    try {
      await deleteDoc(doc(this.firestore, 'projects', project.id));
      this.projects = this.projects.filter((p) => p.id !== project.id);
      this.notify('ok', `Deleted ${name}.`);
    } catch (err: any) {
      this.notify('error', `Couldn't delete: ${err.message}`);
    }
  }

  addSection(): void {
    this.form.sections.push(emptySection());
  }

  removeSection(index: number): void {
    const section = this.form.sections[index];
    const hasContent =
      section.heading ||
      section.body ||
      section.figure.src ||
      section.phones.length;
    if (hasContent && !confirm('Remove this section?')) return;
    this.form.sections.splice(index, 1);
  }

  moveSection(index: number, by: number): void {
    const target = index + by;
    if (target < 0 || target >= this.form.sections.length) return;
    const [section] = this.form.sections.splice(index, 1);
    this.form.sections.splice(target, 0, section);
  }

  addPhone(sectionIndex: number): void {
    const phones = this.form.sections[sectionIndex].phones;
    if (phones.length < MAX_PHONES) phones.push(emptyFigure());
  }

  removePhone(sectionIndex: number, phoneIndex: number): void {
    this.form.sections[sectionIndex].phones.splice(phoneIndex, 1);
  }

  addScreenshot(): void {
    this.form.screenshots.push('');
  }

  setScreenshot(index: number, src: string): void {
    if (src) this.form.screenshots[index] = src;
    else this.form.screenshots.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onBusy(busy: boolean): void {
    this.uploads = Math.max(0, this.uploads + (busy ? 1 : -1));
  }

  thumb(project: AdminProject): string {
    return projectImage(project.data.img || '', 240);
  }

  slug(project: AdminProject): string {
    return slugify(String(project.data.projectName || '')) || project.id;
  }

  summary(project: AdminProject): string {
    return project.data.tagline || project.data.projectDesc || '';
  }

  hasWriteUp(project: AdminProject): boolean {
    return !!(project.data.intro || project.data.sections?.length);
  }

  get activeCount(): number {
    return this.projects.filter((p) => p.data.isActive !== false).length;
  }

  private notify(kind: 'ok' | 'error', text: string): void {
    this.notice = { kind, text };
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => (this.notice = null), 5000);
  }
}
