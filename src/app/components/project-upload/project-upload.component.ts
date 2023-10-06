import { Component, OnInit } from '@angular/core';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from 'firebase/storage';
import {
  AngularFireStorageReference,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-project-upload',
  templateUrl: './project-upload.component.html',
  styleUrls: ['./project-upload.component.css'],
})
export class ProjectUploadComponent implements OnInit {
  downloadUrl: string = '';
  img: any;
  uploadProgress: any = 0;
  ref!: AngularFireStorageReference;
  task!: AngularFireUploadTask;
  storage = getStorage();

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {}
  uploadProject(value: any) {
    console.log(value);
    const projectArray = {
      ...value,
      techs: value.techs.split(','),
      img: this.downloadUrl,
    };
    this.addData(projectArray);
  }
  getImage = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const randomId = Math.random().toString(36).substring(2);
    if (target.files && target.files.length > 0) {
      try {
        const storageRef = ref(this.storage, `${target.name + randomId}`);
        const uploadTask = uploadBytesResumable(storageRef, target.files[0]);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            this.uploadProgress = `${progress}%`;
          },
          (error) => {
            console.log(error.message);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL);
              this.downloadUrl = downloadURL;
            });
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };
  addData(value: any) {
    const dbInstance = collection(this.firestore, 'projects');
    addDoc(dbInstance, value)
      .then(() => {
        alert('Project added succesfully');
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}
