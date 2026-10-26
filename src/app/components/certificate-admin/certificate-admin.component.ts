import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  Certificate,
  certificateImage,
  formatIssuedOn,
  isValidSlug,
  slugify,
} from 'src/app/models/certificate';
import { CertificateService } from 'src/app/service/certificate.service';
import { CloudinaryService } from 'src/app/service/cloudinary.service';

interface CertificateForm {
  title: string;
  issuer: string;
  issuedOn: string;
  credentialUrl: string;
  credentialId: string;
  description: string;
  skills: string;
  slug: string;
  fileUrl: string;
  isActive: boolean;
}

function emptyForm(): CertificateForm {
  return {
    title: '',
    issuer: '',
    issuedOn: '',
    credentialUrl: '',
    credentialId: '',
    description: '',
    skills: '',
    slug: '',
    fileUrl: '',
    isActive: true,
  };
}

@Component({
  selector: 'app-certificate-admin',
  templateUrl: './certificate-admin.component.html',
  styleUrls: ['./certificate-admin.component.css'],
})
export class CertificateAdminComponent implements OnInit, OnDestroy {
  certificates: Certificate[] = [];
  loading = false;

  form: CertificateForm = emptyForm();
  editing: Certificate | null = null;
  slugTouched = false;

  uploadProgress = 0;
  uploading = false;
  previewFailed = false;
  saving = false;
  error = '';

  readonly formatIssuedOn = formatIssuedOn;

  private uploadSub?: Subscription;

  constructor(
    private certificateService: CertificateService,
    private cloudinary: CloudinaryService
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
  }

  async loadCertificates(): Promise<void> {
    this.loading = true;
    try {
      this.certificates = await this.certificateService.list();
    } catch (err: any) {
      alert('Error loading certificates: ' + err.message);
    } finally {
      this.loading = false;
    }
  }

  get previewUrl(): string {
    return certificateImage(this.form.fileUrl, 900);
  }

  thumb(certificate: Certificate): string {
    return certificateImage(certificate.fileUrl, 240);
  }

  permalink(slug: string): string {
    return `${window.location.origin}/certificates#${slug}`;
  }

  onTitleChange(title: string): void {
    this.form.title = title;
    if (!this.slugTouched) this.form.slug = slugify(title);
  }

  onSlugChange(slug: string): void {
    this.slugTouched = true;
    this.form.slug = slug;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadSub?.unsubscribe();
    this.uploading = true;
    this.uploadProgress = 0;
    this.previewFailed = false;
    this.error = '';

    this.uploadSub = this.cloudinary
      .upload(file, 'portfolio/certificates')
      .subscribe({
        next: (state) => {
          this.uploadProgress = state.progress;
          if (state.url) this.form.fileUrl = state.url;
        },
        error: (err) => {
          this.uploading = false;
          this.uploadProgress = 0;
          this.error = err.message;
          input.value = '';
        },
        complete: () => (this.uploading = false),
      });
  }

  validate(): string {
    const f = this.form;
    if (!f.title.trim()) return 'Add a title.';
    if (!f.issuer.trim()) return 'Add the issuing platform or organisation.';
    if (!f.fileUrl) return 'Upload the certificate image or PDF.';
    if (!isValidSlug(f.slug)) {
      return 'The link anchor can only use lowercase letters, numbers and single hyphens.';
    }
    const clash = this.certificates.find(
      (c) => c.slug === f.slug && c.id !== this.editing?.id
    );
    if (clash) return `"${clash.title}" already uses #${f.slug}.`;
    if (f.issuedOn && !/^\d{4}(-(0[1-9]|1[0-2]))?$/.test(f.issuedOn)) {
      return 'Use YYYY-MM or YYYY for the issue date.';
    }
    if (f.credentialUrl && !/^https?:\/\//i.test(f.credentialUrl.trim())) {
      return 'The verification link should start with https://';
    }
    return '';
  }

  async save(): Promise<void> {
    if (this.uploading || this.saving) return;
    this.error = this.validate();
    if (this.error) return;

    const f = this.form;
    const data = {
      slug: f.slug,
      title: f.title.trim(),
      issuer: f.issuer.trim(),
      issuedOn: f.issuedOn,
      credentialUrl: f.credentialUrl.trim(),
      credentialId: f.credentialId.trim(),
      description: f.description.trim(),
      skills: f.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      fileUrl: f.fileUrl,
      isActive: f.isActive,
    };

    this.saving = true;
    try {
      if (this.editing?.id) {
        await this.certificateService.update(this.editing.id, data);
      } else {
        await this.certificateService.create({ ...data, createdAt: Date.now() });
      }
      this.resetForm();
      await this.loadCertificates();
    } catch (err: any) {
      this.error = 'Could not save: ' + err.message;
    } finally {
      this.saving = false;
    }
  }

  startEdit(certificate: Certificate): void {
    this.uploadSub?.unsubscribe();
    this.editing = certificate;
    this.slugTouched = true;
    this.previewFailed = false;
    this.uploading = false;
    this.uploadProgress = 0;
    this.error = '';
    this.form = {
      title: certificate.title,
      issuer: certificate.issuer,
      issuedOn: certificate.issuedOn,
      credentialUrl: certificate.credentialUrl,
      credentialId: certificate.credentialId,
      description: certificate.description,
      skills: certificate.skills.join(', '),
      slug: certificate.slug,
      fileUrl: certificate.fileUrl,
      isActive: certificate.isActive,
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.uploadSub?.unsubscribe();
    this.editing = null;
    this.form = emptyForm();
    this.slugTouched = false;
    this.uploading = false;
    this.uploadProgress = 0;
    this.previewFailed = false;
    this.error = '';
    const input = document.getElementById('certFile') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  async toggleActive(certificate: Certificate): Promise<void> {
    const isActive = !certificate.isActive;
    try {
      await this.certificateService.update(certificate.id!, { isActive });
      certificate.isActive = isActive;
    } catch (err: any) {
      alert('Error updating certificate: ' + err.message);
    }
  }

  async remove(certificate: Certificate): Promise<void> {
    if (
      !confirm(
        `Delete "${certificate.title}"? Links to #${certificate.slug} will stop working.`
      )
    ) {
      return;
    }
    try {
      await this.certificateService.remove(certificate.id!);
      if (this.editing?.id === certificate.id) this.resetForm();
      await this.loadCertificates();
    } catch (err: any) {
      alert('Error deleting certificate: ' + err.message);
    }
  }

  async copyLink(slug: string): Promise<void> {
    const link = this.permalink(slug);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt('Copy this link', link);
    }
  }
}
