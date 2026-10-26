import { Component } from '@angular/core';

interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  stackGroups = [
    {
      label: 'Frontend',
      items: ['React', 'Next.js', 'Angular', 'TypeScript', 'Tailwind'],
    },
    {
      label: 'Backend',
      items: ['Django', 'FastAPI', 'Node.js', 'PostgreSQL', 'Prisma'],
    },
    {
      label: 'AI',
      items: [
        'Voice agents',
        'Computer vision',
        'LiveKit',
        'OpenAI Realtime',
        'Gemini',
        'Tool calling',
      ],
    },
    {
      label: 'Infra',
      items: ['Docker', 'GitHub Actions', 'ArgoCD', 'GCP', 'Cloudflare'],
    },
  ];

  socials: SocialLink[] = [
    {
      label: 'GitHub',
      href: 'https://github.com/Damilarr',
      icon: 'fa-brands fa-github',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/adeyemo-emmanuel',
      icon: 'fa-brands fa-linkedin',
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com/Emmdam4',
      icon: 'fa-brands fa-twitter',
    },
  ];
}
