import {
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  Certificate,
  certificateImage,
  formatIssuedOn,
} from 'src/app/models/certificate';
import { CertificateService } from 'src/app/service/certificate.service';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
})
export class CertificatesComponent implements OnInit, OnDestroy {
  certificates: Certificate[] = [];
  status: 'loading' | 'ready' | 'error' = 'loading';
  /** Slug of the certificate the visitor was linked to */
  targetSlug: string | null = null;
  copiedSlug: string | null = null;
  lightbox: Certificate | null = null;

  readonly formatIssuedOn = formatIssuedOn;

  private fragmentSub?: Subscription;
  private copiedTimer: any;

  constructor(
    private certificateService: CertificateService,
    private route: ActivatedRoute,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.load();
    this.fragmentSub = this.route.fragment.subscribe((fragment) => {
      this.targetSlug = fragment || null;
      if (this.status === 'ready') this.scrollToTarget();
    });
  }

  ngOnDestroy(): void {
    this.fragmentSub?.unsubscribe();
    clearTimeout(this.copiedTimer);
    document.body.style.overflow = '';
  }

  async load(): Promise<void> {
    this.status = 'loading';
    try {
      const all = await this.certificateService.list();
      this.certificates = all.filter((c) => c.isActive);
      this.status = 'ready';
      this.scrollToTarget();
    } catch (err) {
      console.error('Could not load certificates', err);
      this.status = 'error';
    }
  }

  image(certificate: Certificate, width: number): string {
    return certificateImage(certificate.fileUrl, width);
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  /** "coursera.org" from a full URL, so visitors know where a link goes */
  host(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  permalink(certificate: Certificate): string {
    return `${window.location.origin}/certificates#${certificate.slug}`;
  }

  async copyLink(certificate: Certificate): Promise<void> {
    const link = this.permalink(certificate);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt('Copy this link', link);
    }
    this.copiedSlug = certificate.slug;
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => (this.copiedSlug = null), 2200);
  }

  openLightbox(certificate: Certificate): void {
    this.lightbox = certificate;
    document.body.style.overflow = 'hidden';
  }

  @HostListener('document:keydown.escape')
  closeLightbox(): void {
    if (!this.lightbox) return;
    this.lightbox = null;
    document.body.style.overflow = '';
  }

  trackBySlug(_: number, certificate: Certificate): string {
    return certificate.slug;
  }

  /**
   * Data arrives after the router has already tried to resolve the fragment, so scroll ourselves.
   * Images keep their natural size, so wait for them first or the target moves after we scroll.
   */
  private scrollToTarget(): void {
    if (!this.targetSlug) return;
    const slug = this.targetSlug;
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(async () => {
        const images = Array.from(
          document.querySelectorAll<HTMLImageElement>('.cert-frame img')
        );
        const loaded = Promise.all(
          images.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener('load', () => resolve(), { once: true });
                  img.addEventListener('error', () => resolve(), { once: true });
                })
          )
        );
        // Don't keep the visitor waiting forever on a slow image.
        await Promise.race([loaded, new Promise((r) => setTimeout(r, 4000))]);

        // The visitor may have navigated to another anchor while we waited.
        if (this.targetSlug !== slug) return;
        const el = document.getElementById(slug);
        if (!el) return;
        const reduceMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        el.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      });
    });
  }
}
