const UPLOAD_MARKER = '/image/upload/';

export function isCloudinaryUrl(url: string): boolean {
  return (
    !!url && url.includes('res.cloudinary.com') && url.includes(UPLOAD_MARKER)
  );
}

export function withCloudinaryTransform(
  url: string,
  transform: string
): string {
  if (!isCloudinaryUrl(url)) return url;
  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transform}/`);
}
