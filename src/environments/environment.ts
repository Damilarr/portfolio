// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
