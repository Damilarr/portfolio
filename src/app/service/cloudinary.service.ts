import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface UploadState {
  /** 0 to 100 */
  progress: number;
  /** Set once the upload has finished */
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private zone: NgZone) {}

  /** Uploads a file with the unsigned preset and reports progress until the URL is known. */
  upload(file: File, folder: string): Observable<UploadState> {
    return new Observable<UploadState>((subscriber) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      const emit = (fn: () => void) => this.zone.run(fn);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          emit(() => subscriber.next({ progress }));
        }
      });

      xhr.addEventListener('load', () => {
        emit(() => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            subscriber.next({ progress: 100, url: response.secure_url });
            subscriber.complete();
          } else {
            subscriber.error(new Error(this.describeFailure(xhr)));
          }
        });
      });

      xhr.addEventListener('error', () => {
        emit(() => subscriber.error(new Error('Network error while uploading.')));
      });

      xhr.open(
        'POST',
        `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`
      );
      xhr.send(formData);

      return () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) xhr.abort();
      };
    });
  }

  private describeFailure(xhr: XMLHttpRequest): string {
    try {
      return JSON.parse(xhr.responseText)?.error?.message || `Upload failed (${xhr.status}).`;
    } catch {
      return `Upload failed (${xhr.status}).`;
    }
  }
}
