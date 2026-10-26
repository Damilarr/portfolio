import { toProject } from './project';
import {
  docFromForm,
  emptyProjectForm,
  emptySection,
  formFromDoc,
  paragraphs,
} from './project-form';

describe('project form', () => {
  const doc = {
    projectName: 'XSplit ',
    category: 'mobile',
    tagline: 'Split group expenses',
    year: '2025',
    projectDesc: 'Expense splitting.',
    img: 'https://example.com/cover.png',
    screenshots: ['https://example.com/2.png'],
    projectLink: 'https://xsplit.app',
    githubLink: 'https://github.com/Damilarr/xsplit',
    platforms: ['ios'],
    storeLinks: { appStore: 'https://apps.apple.com/x' },
    techs: ['Flutter', 'Riverpod'],
    intro: 'XSplit is a Flutter app.',
    sections: [
      {
        heading: 'Groups',
        body: ['First paragraph.', 'Second paragraph.'],
        figure: {
          src: 'https://example.com/fig.png',
          alt: 'Fig',
          caption: 'Cap',
        },
        phones: [{ src: 'https://example.com/p.png', alt: 'Phone' }],
        phonesCaption: 'On a phone',
      },
    ],
    demoVideo: null,
  };

  it('round-trips a document through the editor without losing anything', () => {
    const back = docFromForm(formFromDoc(doc));
    expect(back).toEqual({
      projectName: 'XSplit',
      category: 'mobile',
      tagline: 'Split group expenses',
      year: '2025',
      projectDesc: 'Expense splitting.',
      isActive: true,
      img: 'https://example.com/cover.png',
      screenshots: ['https://example.com/2.png'],
      projectLink: 'https://xsplit.app',
      githubLink: 'https://github.com/Damilarr/xsplit',
      platforms: ['ios'],
      storeLinks: { appStore: 'https://apps.apple.com/x' },
      techs: ['Flutter', 'Riverpod'],
      intro: 'XSplit is a Flutter app.',
      sections: [
        {
          heading: 'Groups',
          body: ['First paragraph.', 'Second paragraph.'],
          figure: {
            src: 'https://example.com/fig.png',
            alt: 'Fig',
            caption: 'Cap',
          },
          phones: [{ src: 'https://example.com/p.png', alt: 'Phone' }],
          phonesCaption: 'On a phone',
        },
      ],
    });
  });

  it('writes what the site reads back as the same write-up', () => {
    const project = toProject('id', docFromForm(formFromDoc(doc)))!;
    expect(project.detail?.sections[0].body).toEqual([
      'First paragraph.',
      'Second paragraph.',
    ]);
    expect(project.detail?.tagline).toBe('Split group expenses');
  });

  it('never writes undefined, which Firestore rejects', () => {
    const written = JSON.stringify(docFromForm(emptyProjectForm()), (_, v) =>
      v === undefined ? '__undefined__' : v
    );
    expect(written).not.toContain('__undefined__');
  });

  it('splits text into paragraphs on blank lines and joins wrapped lines', () => {
    expect(paragraphs('One line\nwrapped.\n\n  \nTwo.\n')).toEqual([
      'One line wrapped.',
      'Two.',
    ]);
  });

  it('drops empty sections, empty images and blank phone slots', () => {
    const form = emptyProjectForm();
    form.projectName = 'X';
    const empty = emptySection();
    const withBlankPhone = emptySection();
    withBlankPhone.heading = 'Kept';
    withBlankPhone.phones.push({ src: '', alt: 'blank', caption: '' });
    form.sections = [empty, withBlankPhone];

    expect(docFromForm(form)['sections']).toEqual([
      { heading: 'Kept', body: [], phones: [], phonesCaption: '' },
    ]);
  });

  it('only keeps store links and platforms for mobile apps, inferring platforms from links', () => {
    const form = formFromDoc(doc);
    form.platformsIOS = false;
    form.playStore = 'https://play.google.com/x';
    expect(docFromForm(form)['platforms']).toEqual(['ios', 'android']);

    form.category = 'web';
    const web = docFromForm(form);
    expect(web['platforms']).toEqual([]);
    expect(web['storeLinks']).toEqual({});
    expect(web['screenshots']).toEqual([]);
  });

  it('starts new projects visible, in this year, with nothing filled in', () => {
    const form = emptyProjectForm();
    expect(form.isActive).toBeTrue();
    expect(form.year).toBe(String(new Date().getFullYear()));
    expect(form.sections).toEqual([]);
  });
});
