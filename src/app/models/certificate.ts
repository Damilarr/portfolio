export interface Certificate {
  id?: string;
  /** Stable anchor used in public links, e.g. /certificates#intro-to-modern-ai */
  slug: string;
  title: string;
  /** The platform or organisation that issued it, e.g. Coursera */
  issuer: string;
  /** When it was issued, formatted YYYY-MM, or YYYY when only the year is known */
  issuedOn: string;
  /** Verification page, or the platform it was earned on */
  credentialUrl: string;
  credentialId: string;
  description: string;
  skills: string[];
  /** Uploaded image or PDF on Cloudinary */
  fileUrl: string;
  isActive: boolean;
  createdAt: number;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/** Formats YYYY-MM as "Mar 2025". Parsed by hand so time zones can't shift the month. */
export function formatIssuedOn(value: string): string {
  if (/^\d{4}$/.test(value || '')) return value;
  const match = /^(\d{4})-(\d{2})$/.exec(value || '');
  if (!match) return value || '';
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

/** Newest first; undated certificates go last. */
export function compareCertificates(a: Certificate, b: Certificate): number {
  const byDate = (b.issuedOn || '').localeCompare(a.issuedOn || '');
  return byDate !== 0 ? byDate : (b.createdAt || 0) - (a.createdAt || 0);
}

/**
 * Builds a display image URL for an uploaded certificate.
 * Cloudinary can rasterise the first page of a PDF, so PDFs and images render the same way.
 */
export function certificateImage(fileUrl: string, width: number): string {
  const marker = '/image/upload/';
  if (!fileUrl || !fileUrl.includes('res.cloudinary.com') || !fileUrl.includes(marker)) {
    return fileUrl;
  }
  const isPdf = /\.pdf$/i.test(fileUrl);
  const transform = isPdf
    ? `pg_1,q_auto,w_${width}`
    : `f_auto,q_auto,w_${width},c_limit`;
  const url = fileUrl.replace(marker, `${marker}${transform}/`);
  return isPdf ? url.replace(/\.pdf$/i, '.jpg') : url;
}
