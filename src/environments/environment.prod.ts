export const environment = {
  production: true,
  firebase: {
    projectId: (process.env['FIREBASE_PROJECT_ID'] as string) || '',
    appId: (process.env['FIREBASE_APP_ID'] as string) || '',
    storageBucket: (process.env['FIREBASE_STORAGE_BUCKET'] as string) || '',
    locationId: (process.env['FIREBASE_LOCATION_ID'] as string) || '',
    apiKey: (process.env['FIREBASE_API_KEY'] as string) || '',
    authDomain: (process.env['FIREBASE_AUTH_DOMAIN'] as string) || '',
    messagingSenderId:
      (process.env['FIREBASE_MESSAGING_SENDER_ID'] as string) || '',
    measurementId: (process.env['FIREBASE_MEASUREMENT_ID'] as string) || '',
  },
  cloudinary: {
    cloudName: (process.env['CLOUDINARY_CLOUD_NAME'] as string) || '',
    uploadPreset: (process.env['CLOUDINARY_UPLOAD_PRESET'] as string) || '',
  },
  contactEmail: (process.env['CONTACT_EMAIL'] as string) || '',
};
