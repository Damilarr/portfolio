export interface FigureForm {
  src: string;
  alt: string;
  caption: string;
}

export interface SectionForm {
  heading: string;
  body: string;
  figure: FigureForm;
  phones: FigureForm[];
  phonesCaption: string;
}

export interface ProjectForm {
  projectName: string;
  category: 'web' | 'mobile';
  tagline: string;
  year: string;
  projectDesc: string;
  isActive: boolean;
  img: string;
  screenshots: string[];
  projectLink: string;
  githubLink: string;
  platformsIOS: boolean;
  platformsAndroid: boolean;
  appStore: string;
  playStore: string;
  apk: string;
  testflight: string;
  techs: string;
  intro: string;
  sections: SectionForm[];
}

export const MAX_PHONES = 3;

export function emptyFigure(): FigureForm {
  return { src: '', alt: '', caption: '' };
}

export function emptySection(): SectionForm {
  return {
    heading: '',
    body: '',
    figure: emptyFigure(),
    phones: [],
    phonesCaption: '',
  };
}

export function emptyProjectForm(): ProjectForm {
  return {
    projectName: '',
    category: 'web',
    tagline: '',
    year: String(new Date().getFullYear()),
    projectDesc: '',
    isActive: true,
    img: '',
    screenshots: [],
    projectLink: '',
    githubLink: '',
    platformsIOS: false,
    platformsAndroid: false,
    appStore: '',
    playStore: '',
    apk: '',
    testflight: '',
    techs: '',
    intro: '',
    sections: [],
  };
}

const text = (value: any): string =>
  typeof value === 'string' ? value : value == null ? '' : String(value);

function figureForm(value: any): FigureForm {
  return {
    src: text(value?.src),
    alt: text(value?.alt),
    caption: text(value?.caption),
  };
}

export function formFromDoc(doc: any): ProjectForm {
  const platforms: string[] = Array.isArray(doc.platforms) ? doc.platforms : [];
  const store = doc.storeLinks || {};
  return {
    projectName: text(doc.projectName).trim(),
    category: doc.category === 'mobile' ? 'mobile' : 'web',
    tagline: text(doc.tagline),
    year: text(doc.year),
    projectDesc: text(doc.projectDesc),
    isActive: doc.isActive !== false,
    img: text(doc.img),
    screenshots: (Array.isArray(doc.screenshots) ? doc.screenshots : [])
      .map(text)
      .filter(Boolean),
    projectLink: text(doc.projectLink),
    githubLink: text(doc.githubLink),
    platformsIOS: platforms.includes('ios'),
    platformsAndroid: platforms.includes('android'),
    appStore: text(store.appStore),
    playStore: text(store.playStore),
    apk: text(store.apk),
    testflight: text(store.testflight),
    techs: (Array.isArray(doc.techs) ? doc.techs : []).join(', '),
    intro: text(doc.intro),
    sections: (Array.isArray(doc.sections) ? doc.sections : []).map(
      (section: any) => ({
        heading: text(section?.heading),
        body: (Array.isArray(section?.body) ? section.body : [])
          .map(text)
          .join('\n\n'),
        figure: figureForm(section?.figure),
        phones: (Array.isArray(section?.phones) ? section.phones : []).map(
          figureForm
        ),
        phonesCaption: text(section?.phonesCaption),
      })
    ),
  };
}

export function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

export function docFromForm(form: ProjectForm): Record<string, any> {
  const trim = (value: string) => value.trim();
  const mobile = form.category === 'mobile';

  const storeLinks: Record<string, string> = {};
  if (mobile) {
    (['appStore', 'playStore', 'apk', 'testflight'] as const).forEach((key) => {
      if (trim(form[key])) storeLinks[key] = trim(form[key]);
    });
  }

  const platforms: string[] = [];
  if (mobile) {
    if (
      form.platformsIOS ||
      storeLinks['appStore'] ||
      storeLinks['testflight']
    ) {
      platforms.push('ios');
    }
    if (form.platformsAndroid || storeLinks['playStore'] || storeLinks['apk']) {
      platforms.push('android');
    }
  }

  const sections = form.sections
    .map((section) => {
      const out: Record<string, any> = {
        heading: trim(section.heading),
        body: paragraphs(section.body),
        phones: section.phones
          .filter((phone) => trim(phone.src))
          .slice(0, MAX_PHONES)
          .map((phone) => ({ src: trim(phone.src), alt: trim(phone.alt) })),
        phonesCaption: trim(section.phonesCaption),
      };
      if (trim(section.figure.src)) {
        out['figure'] = {
          src: trim(section.figure.src),
          alt: trim(section.figure.alt),
          caption: trim(section.figure.caption),
        };
      }
      return out;
    })
    .filter(
      (section) =>
        section['heading'] ||
        section['body'].length ||
        section['figure'] ||
        section['phones'].length
    );

  return {
    projectName: trim(form.projectName),
    category: form.category,
    tagline: trim(form.tagline),
    year: trim(form.year),
    projectDesc: trim(form.projectDesc),
    isActive: form.isActive,
    img: trim(form.img),
    screenshots: mobile ? form.screenshots.map(trim).filter(Boolean) : [],
    projectLink: trim(form.projectLink),
    githubLink: trim(form.githubLink),
    platforms,
    storeLinks,
    techs: form.techs.split(',').map(trim).filter(Boolean),
    intro: trim(form.intro),
    sections,
  };
}
