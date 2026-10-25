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
  fallbackCover?: string;
}

const work = (slug: string, file: string) => `assets/work/${slug}/${file}.webp`;

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  '8wztWf0Rhdsdnt3a3scj': {
    tagline: 'Handcrafted digital letters',
    year: '2026',
    intro:
      'Heartnote is for the moments when a text message feels too small. You write a letter or a note, make it look the way you want, and send it to someone you care about, or save it for your future self to open years from now.',
    sections: [
      {
        heading: 'Making it yours',
        body: [
          'You pick the paper, drop in a photo with a Polaroid or vintage frame, and finish it off with stamps and pressed flowers. It’s meant to feel like writing on real stationery, not filling out a form.',
        ],
        phones: [
          {
            src: work('heartnote', 'mobile'),
            alt: 'Heartnote landing page on a phone',
          },
        ],
        phonesCaption: 'On a phone',
      },
      {
        heading: 'Going Pro',
        body: [
          'Pro lets you download your letters as an image, or as a PDF you can print. You can pay monthly with a dollar card, or pay once in naira by bank transfer for a 30-day pass.',
        ],
      },
    ],
  },

  MOHa7otAES7j7GNpEwaf: {
    tagline: 'Hostel management for student housing',
    year: '2026',
    intro:
      'Hosteloom is a hostel management platform for student housing in Nigeria. It takes everything that used to live on paper, like applications, room allocation, payments and complaints, and puts it all in one place.',
    sections: [
      {
        heading: 'For students',
        body: [
          'You sign up, apply to a hostel, and once you’re approved you pick a room from what’s still available. Your invoice is generated for you, you pay online, and you get your receipt straight away.',
        ],
        figure: {
          src: work('hosteloom', 'home'),
          alt: 'Hosteloom landing page reading Smart Hostel Management. Simplified.',
          caption: 'The landing page today',
        },
        phones: [
          {
            src: work('hosteloom', 'mobile'),
            alt: 'Hosteloom hero on a phone',
          },
          {
            src: work('hosteloom', 'mobile-portal'),
            alt: 'Hosteloom feature cards for the student portal and admin command centre on a phone',
          },
        ],
        phonesCaption: 'On a phone',
      },
      {
        heading: 'For the people running it',
        body: [
          'Hostel admins get a dashboard for reviewing applications, managing rooms, sorting out complaints and keeping track of payments. Owners can see all their hostels in one view, and there’s a platform admin side for managing owners and sending announcements to everyone.',
        ],
        figure: {
          src: work('hosteloom', 'roles'),
          alt: 'Built for every role section listing features for students, hostel admins and property owners',
          caption: 'Who it’s for',
        },
      },
    ],
  },

  WM3Agwj19cJnGCQexeQt: {
    tagline: 'An AI agent for job applications, on Telegram',
    year: '2026',
    intro:
      'Applying for jobs gets repetitive fast, so I built a Telegram bot to handle the boring parts. You paste in a job description, and it tells you how well you match and writes the email and cover letter for you. Once you’re happy with them, it sends them from your Gmail.',
    sections: [
      {
        heading: 'Google Forms too',
        body: [
          'A lot of roles ask you to apply through a Google Form, so the bot can fill those in from your profile. It shows you every answer before it submits, and nothing goes out without your say-so.',
        ],
      },
      {
        heading: 'Keeping track',
        body: [
          'It also keeps a list of everywhere you’ve applied, so you can mark each one as you hear back, all the way from interview to offer.',
        ],
      },
    ],
  },

  orMzf99XXvz2asWvYN8g: {
    tagline: 'Split group expenses without the maths',
    year: '2025',
    intro:
      'XSplit is a Flutter app for sharing costs with friends. You start a group, invite people with a link, add what everyone spent, and it works out who owes whom.',
    sections: [
      {
        heading: 'Groups',
        body: [
          'Each group gets a cover photo and an invite link that opens straight into the app. Everyone sees new expenses and balances as soon as they’re added.',
        ],
        phones: [
          { src: work('xsplit', 'sign-in'), alt: 'XSplit sign-in screen' },
          { src: work('xsplit', 'groups'), alt: 'XSplit groups list' },
          { src: work('xsplit', 'group'), alt: 'Expenses inside a group' },
        ],
        phonesCaption: 'Signing in, your groups, and what’s been spent in one',
      },
      {
        heading: 'Adding expenses',
        body: [
          'You can type an expense in, or snap a photo of the receipt and let the app fill in the details for you. Then split it evenly, by amount or by percentage, and pick who paid.',
        ],
        phones: [
          { src: work('xsplit', 'add-expense'), alt: 'Add a new expense form' },
          { src: work('xsplit', 'scan'), alt: 'Scan a receipt screen' },
          {
            src: work('xsplit', 'home'),
            alt: 'Home screen with recent activity',
          },
        ],
        phonesCaption: 'Adding an expense, scanning a receipt, and home',
      },
    ],
  },

  yZM4lspmg1aM4EHFAOlO: {
    tagline: 'A journal that reads the mood of every entry',
    year: '2024',
    fallbackCover: work('moodai', 'cover'),
    intro:
      'MoodAI is a journal that reads your entries back to you. Write about your day and it picks up your mood, sums the entry up in a line, and gives it a colour that matches how you felt.',
    sections: [
      {
        heading: 'Looking back',
        body: [
          'Every entry gets a score for how positive or negative it was, and those scores are charted over time, so you can see how your weeks have actually been going. You can also ask it questions about everything you’ve written, and it answers from your own entries.',
        ],
        phones: [{ src: work('moodai', 'mobile'), alt: 'MoodAI on a phone' }],
        phonesCaption: 'On a phone',
      },
    ],
  },

  aeT44AUaWT5HtTmFUTCC: {
    tagline: 'Anonymous messages, with pictures',
    year: '2023',
    intro:
      'Whisper lets people send you anonymous messages. Share your link, and anyone who has it can leave you a note without you knowing who it’s from. They can add a picture too.',
    sections: [
      {
        body: [],
        phones: [{ src: work('whisper', 'mobile'), alt: 'Whisper on a phone' }],
        phonesCaption: 'On a phone',
      },
    ],
  },

  '4XKxQKTcCGa8fKkZvfC6': {
    tagline: 'A full-stack food ordering store',
    year: '2023',
    intro:
      'Food-tuck is an online store for a restaurant. You browse the menu, add dishes to your cart or save them to a wishlist, and pay by card when you’re ready.',
    sections: [
      {
        heading: 'Browsing',
        body: [
          'There’s a full menu, a shop you can page through, and a few pages about the restaurant itself.',
        ],
        figure: {
          src: work('food-tuck', 'products'),
          alt: 'We Create the best food products section with photos of dishes',
          caption: 'The home page',
        },
      },
      {
        heading: 'Ordering',
        body: [
          'Sign in with your email or a social account, and your cart and wishlist stay with you. When you check out, your card payment goes through Stripe.',
        ],
        figure: {
          src: work('food-tuck', 'menu'),
          alt: 'Food categories section with dishes to choose from',
          caption: 'Choosing from the menu',
        },
        phones: [
          { src: work('food-tuck', 'mobile'), alt: 'Food-tuck on a phone' },
        ],
        phonesCaption: 'On a phone',
      },
    ],
  },

  '1jReCD1XgLSu4eroQVdS': {
    tagline: 'A streaming site clone powered by TMDB',
    year: '2022',
    intro:
      'A Plex-style site for browsing popular movies and TV shows. Everything comes from TMDB, so the lists stay current.',
    sections: [
      {
        heading: 'Browsing',
        body: [
          'Popular movies and series sit in rows of posters, the way you’d expect from a streaming site.',
        ],
        figure: {
          src: work('plex', 'browse'),
          alt: 'Grid of popular TV series posters',
          caption: 'Popular TV series',
        },
      },
      {
        heading: 'Watching',
        body: [
          'Pick a title to see what it’s about, who made it and what language it’s in, then watch its trailers, bloopers and behind-the-scenes clips right on the page.',
        ],
        figure: {
          src: work('plex', 'title'),
          alt: 'Title page for a TV series with a play button',
          caption: 'A title page',
        },
        phones: [{ src: work('plex', 'mobile'), alt: 'Plex on a phone' }],
        phonesCaption: 'On a phone',
      },
    ],
  },
};
