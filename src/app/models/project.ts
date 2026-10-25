import {
  isCloudinaryUrl,
  withCloudinaryTransform,
} from '../utils/cloudinary-url';
import { slugify } from './certificate';

export interface ProjectLink {
  kind: 'live' | 'store' | 'source';
  label: string;
  href: string;
  icon: string;
}

export interface Figure {
  src: string;
  alt: string;
  caption?: string;
}

export interface DetailSection {
  heading?: string;
  body: string[];
  figure?: Figure;
  phones?: Figure[];
  phonesCaption?: string;
}

export interface ProjectDetail {
  tagline: string;
  year: string;
  intro: string;
  sections: DetailSection[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'web' | 'mobile';
  cover: string;
  screenshots: string[];
  techs: string[];
  platforms: string[];
  links: ProjectLink[];
  detail?: ProjectDetail;
}

export function toProject(id: string, doc: any): Project | null {
  if (doc.isActive === false) return null;

  const screenshots: string[] = (doc.screenshots || []).filter(Boolean);
  const name = (doc.projectName || '').trim();
  return {
    id,
    slug: slugify(name) || id,
    name,
    description: (doc.projectDesc || '').trim(),
    category: doc.category === 'mobile' ? 'mobile' : 'web',
    cover: doc.img || screenshots[0] || '',
    screenshots,
    techs: (doc.techs || []).filter(Boolean).map(techLabel),
    platforms: doc.platforms || [],
    links: buildLinks(doc),
    detail: readDetail(doc),
  };
}

function readDetail(doc: any): ProjectDetail | undefined {
  const text = (value: any) => (typeof value === 'string' ? value.trim() : '');
  const figure = (value: any): Figure | undefined =>
    value && text(value.src)
      ? {
          src: text(value.src),
          alt: text(value.alt),
          caption: text(value.caption),
        }
      : undefined;
  const sections: DetailSection[] = (
    Array.isArray(doc.sections) ? doc.sections : []
  )
    .map((section: any) => ({
      heading: text(section?.heading),
      body: (Array.isArray(section?.body) ? section.body : [])
        .map(text)
        .filter(Boolean),
      figure: figure(section?.figure),
      phones: (Array.isArray(section?.phones) ? section.phones : [])
        .map(figure)
        .filter((phone: Figure | undefined): phone is Figure => !!phone),
      phonesCaption: text(section?.phonesCaption),
    }))
    .filter(
      (section: DetailSection) =>
        section.heading ||
        section.body.length ||
        section.figure ||
        section.phones?.length
    );

  const detail: ProjectDetail = {
    tagline: text(doc.tagline),
    year: text(doc.year),
    intro: text(doc.intro),
    sections,
  };
  const hasContent =
    detail.tagline || detail.year || detail.intro || sections.length;
  return hasContent ? detail : undefined;
}

export function arrangeProjects(projects: Project[]): Project[] {
  const year = (p: Project) => Number(p.detail?.year) || Infinity;
  const sorted = [...projects].sort(
    (a, b) => year(b) - year(a) || a.name.localeCompare(b.name)
  );
  const taken = new Set<string>();
  return sorted.map((project) => {
    let slug = project.slug;
    for (let n = 2; taken.has(slug); n++) slug = `${project.slug}-${n}`;
    taken.add(slug);
    return slug === project.slug ? project : { ...project, slug };
  });
}

function buildLinks(doc: any): ProjectLink[] {
  const store = doc.storeLinks || {};
  const candidates: (string | undefined)[] = [
    doc.projectLink,
    store.appStore,
    store.playStore,
    store.testflight,
    store.apk,
    doc.githubLink,
  ];

  const links: ProjectLink[] = [];
  const seen = new Set<string>();
  for (const href of candidates) {
    if (!href || seen.has(normaliseUrl(href))) continue;
    seen.add(normaliseUrl(href));
    links.push(describeLink(href, doc));
  }

  return [
    ...links.filter((link) => link.kind !== 'source'),
    ...links.filter((link) => link.kind === 'source'),
  ];
}

function describeLink(href: string, doc: any): ProjectLink {
  const store = doc.storeLinks || {};
  if (href === store.appStore) {
    return {
      kind: 'store',
      label: 'App Store',
      href,
      icon: 'fa-brands fa-apple',
    };
  }
  if (href === store.playStore) {
    return {
      kind: 'store',
      label: 'Google Play',
      href,
      icon: 'fa-brands fa-google-play',
    };
  }
  if (href === store.testflight) {
    return {
      kind: 'store',
      label: 'TestFlight',
      href,
      icon: 'fa-solid fa-plane',
    };
  }
  if (href === store.apk) {
    return {
      kind: 'store',
      label: 'Download APK',
      href,
      icon: 'fa-solid fa-download',
    };
  }
  if (hostOf(href) === 'github.com') {
    return {
      kind: 'source',
      label: 'Source code',
      href,
      icon: 'fa-brands fa-github',
    };
  }
  return {
    kind: 'live',
    label: displayUrl(href),
    href,
    icon: 'fa-solid fa-arrow-up-right-from-square',
  };
}

function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normaliseUrl(href: string): string {
  return href
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/+$/, '');
}

export function displayUrl(href: string): string {
  try {
    const url = new URL(href);
    return url.host.replace(/^www\./, '') + url.pathname.replace(/\/+$/, '');
  } catch {
    return href;
  }
}

const TECH_LABELS: Record<string, string> = {
  angular: 'Angular',
  django: 'Django',
  express: 'Express',
  expressjs: 'Express',
  fastapi: 'FastAPI',
  firebase: 'Firebase',
  flutter: 'Flutter',
  gemini: 'Gemini',
  geminiai: 'Gemini',
  javascript: 'JavaScript',
  langchain: 'LangChain',
  livekit: 'LiveKit',
  mongodb: 'MongoDB',
  neon: 'Neon',
  neondb: 'Neon',
  next: 'Next.js',
  nextjs: 'Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  openai: 'OpenAI',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  prisma: 'Prisma',
  python: 'Python',
  react: 'React',
  reactjs: 'React',
  riverpod: 'Riverpod',
  stripe: 'Stripe',
  tailwind: 'Tailwind',
  tailwindcss: 'Tailwind',
  telegram: 'Telegram',
  tmdbapi: 'TMDB API',
  typescript: 'TypeScript',
};

export function techLabel(raw: string): string {
  const key = raw.toLowerCase().replace(/[\s._-]/g, '');
  return TECH_LABELS[key] || raw.trim();
}

export function projectImage(url: string, width: number): string {
  return withCloudinaryTransform(url, `f_auto,q_auto,w_${width},c_limit`);
}

export function projectPlaceholder(url: string): string | null {
  return isCloudinaryUrl(url)
    ? withCloudinaryTransform(url, 'f_auto,q_30,w_40')
    : null;
}
