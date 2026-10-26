import { isCloudinaryUrl, withCloudinaryTransform } from '../utils/cloudinary-url';

export interface Certificate {
  id?: string;
  slug: string;
  title: string;
  issuer: string;
  issuedOn: string;
  credentialUrl: string;
  credentialId: string;
  description: string;
  skills: string[];
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

export function formatIssuedOn(value: string): string {
  if (/^\d{4}$/.test(value || '')) return value;
  const match = /^(\d{4})-(\d{2})$/.exec(value || '');
  if (!match) return value || '';
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

export function compareCertificates(a: Certificate, b: Certificate): number {
  const byDate = (b.issuedOn || '').localeCompare(a.issuedOn || '');
  return byDate !== 0 ? byDate : (b.createdAt || 0) - (a.createdAt || 0);
}

export function certificateImage(fileUrl: string, width: number): string {
  if (!isCloudinaryUrl(fileUrl)) return fileUrl;
  const isPdf = /\.pdf$/i.test(fileUrl);
  const transform = isPdf
    ? `pg_1,q_auto,w_${width}`
    : `f_auto,q_auto,w_${width},c_limit`;
  const url = withCloudinaryTransform(fileUrl, transform);
  return isPdf ? url.replace(/\.pdf$/i, '.jpg') : url;
}
