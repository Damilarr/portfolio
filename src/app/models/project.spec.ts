import {
  arrangeProjects,
  displayUrl,
  projectImage,
  projectPlaceholder,
  techLabel,
  toProject,
} from './project';

const CLOUDINARY =
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/cover.png';

describe('toProject', () => {
  it('hides projects that were switched off, but keeps legacy ones without the flag', () => {
    expect(toProject('a', { projectName: 'Off', isActive: false })).toBeNull();
    expect(toProject('b', { projectName: 'Legacy' })).not.toBeNull();
  });

  it('trims names and descriptions typed with stray whitespace', () => {
    const project = toProject('a', {
      projectName: 'plex ',
      projectDesc: ' A movie site. ',
    })!;
    expect(project.name).toBe('plex');
    expect(project.description).toBe('A movie site.');
  });

  it('opens the live site and offers the repository as a secondary link', () => {
    const project = toProject('a', {
      projectLink: 'https://plex-clone.vercel.app/',
      githubLink: 'https://github.com/Damilarr/Plex-clone',
    })!;
    expect(project.links.map((l) => [l.kind, l.href])).toEqual([
      ['live', 'https://plex-clone.vercel.app/'],
      ['source', 'https://github.com/Damilarr/Plex-clone'],
    ]);
    expect(project.links[0].label).toBe('plex-clone.vercel.app');
  });

  it('treats a repository in the live field as source code, not a live site', () => {
    const project = toProject('a', {
      projectLink: 'https://github.com/Damilarr/job-agent-bot',
      githubLink: 'https://github.com/Damilarr/job-agent-bot',
    })!;
    expect(project.links.length).toBe(1);
    expect(project.links[0].kind).toBe('source');
  });

  it('drops a link repeated in another field, ignoring protocol, www and trailing slash', () => {
    const project = toProject('a', {
      projectLink: 'https://hosteloom.com.ng',
      githubLink: 'http://www.hosteloom.com.ng/',
    })!;
    expect(project.links.length).toBe(1);
    expect(project.links[0].kind).toBe('live');
  });

  it('puts store links ahead of source code for mobile apps without a website', () => {
    const project = toProject('a', {
      category: 'mobile',
      githubLink: 'https://github.com/Damilarr/xsplit',
      storeLinks: {
        playStore: 'https://play.google.com/store/apps/details?id=x',
        appStore: 'https://apps.apple.com/app/id1',
      },
    })!;
    expect(project.links.map((l) => l.label)).toEqual([
      'App Store',
      'Google Play',
      'Source code',
    ]);
  });

  it('falls back to the first screenshot when there is no cover', () => {
    const project = toProject('a', {
      category: 'mobile',
      screenshots: [
        '',
        'https://example.com/1.png',
        'https://example.com/2.png',
      ],
    })!;
    expect(project.cover).toBe('https://example.com/1.png');
    expect(project.screenshots).toEqual([
      'https://example.com/1.png',
      'https://example.com/2.png',
    ]);
  });

  it('defaults unknown categories to web', () => {
    expect(toProject('a', { category: 'desktop' })!.category).toBe('web');
  });
});

describe('techLabel', () => {
  it('normalises the freehand spellings used in the admin', () => {
    expect(['Nextjs', 'next.js', 'NEXT JS'].map(techLabel)).toEqual([
      'Next.js',
      'Next.js',
      'Next.js',
    ]);
    expect(techLabel('postgreSQL')).toBe('PostgreSQL');
    expect(techLabel('Tailwindcss')).toBe('Tailwind');
  });

  it('leaves unknown names as typed', () => {
    expect(techLabel(' Supabase ')).toBe('Supabase');
  });
});

describe('project images', () => {
  it('asks Cloudinary for a resized copy', () => {
    expect(projectImage(CLOUDINARY, 720)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_720,c_limit/v1/portfolio/cover.png'
    );
  });

  it('serves other hosts untouched and gives them no pixel placeholder', () => {
    const url = 'https://firebasestorage.googleapis.com/v0/b/x/o/img?alt=media';
    expect(projectImage(url, 720)).toBe(url);
    expect(projectPlaceholder(url)).toBeNull();
  });

  it('builds a tiny placeholder for Cloudinary images', () => {
    expect(projectPlaceholder(CLOUDINARY)).toContain(
      '/upload/f_auto,q_30,w_40/'
    );
  });
});

describe('displayUrl', () => {
  it('shortens a URL to host and path', () => {
    expect(displayUrl('https://www.example.com/app/')).toBe('example.com/app');
  });

  it('returns input that is not a URL as is', () => {
    expect(displayUrl('not a url')).toBe('not a url');
  });
});

describe('arrangeProjects', () => {
  it('puts the newest first, with projects that have no year ahead of everything', () => {
    const projects = arrangeProjects([
      toProject('a', { projectName: 'plex', year: '2022' })!,
      toProject('b', { projectName: 'Heartnote', year: '2026' })!,
      toProject('c', { projectName: 'Fresh' })!,
      toProject('d', { projectName: 'XSplit', year: '2025' })!,
    ]);
    expect(projects.map((p) => p.name)).toEqual([
      'Fresh',
      'Heartnote',
      'XSplit',
      'plex',
    ]);
  });

  it('keeps slugs unique when names collide', () => {
    const projects = arrangeProjects([
      toProject('a', { projectName: 'Portfolio' })!,
      toProject('b', { projectName: 'portfolio' })!,
    ]);
    expect(projects.map((p) => p.slug).sort()).toEqual([
      'portfolio',
      'portfolio-2',
    ]);
  });
});

describe('project write-ups', () => {
  it('reads the write-up from the document and slugs the name', () => {
    const project = toProject('id', {
      projectName: 'JOB-AGENT BOT',
      tagline: ' An AI agent for job applications ',
      year: '2026',
      intro: 'Applying for jobs gets repetitive fast.',
      sections: [
        {
          heading: 'Google Forms too',
          body: ['It fills those in.', '  '],
          figure: {
            src: 'https://example.com/a.png',
            alt: 'A form',
            caption: '',
          },
          phones: [
            { src: '', alt: 'empty' },
            { src: 'https://example.com/b.png', alt: 'B' },
          ],
          phonesCaption: 'On a phone',
        },
      ],
    })!;
    expect(project.slug).toBe('job-agent-bot');
    expect(project.detail).toEqual({
      tagline: 'An AI agent for job applications',
      year: '2026',
      intro: 'Applying for jobs gets repetitive fast.',
      sections: [
        {
          heading: 'Google Forms too',
          body: ['It fills those in.'],
          figure: {
            src: 'https://example.com/a.png',
            alt: 'A form',
            caption: '',
          },
          phones: [{ src: 'https://example.com/b.png', alt: 'B', caption: '' }],
          phonesCaption: 'On a phone',
        },
      ],
    });
  });

  it('drops sections with nothing in them', () => {
    const project = toProject('id', {
      projectName: 'X',
      intro: 'Hi',
      sections: [{ heading: ' ', body: [], phones: [] }, null],
    })!;
    expect(project.detail?.sections).toEqual([]);
  });

  it('has no write-up when none of the fields are filled in', () => {
    expect(
      toProject('id', { projectName: 'X', sections: [] })!.detail
    ).toBeUndefined();
  });
});
