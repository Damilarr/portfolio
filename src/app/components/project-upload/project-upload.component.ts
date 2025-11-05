import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

@Component({
  selector: 'app-project-upload',
  templateUrl: './project-upload.component.html',
  styleUrls: ['./project-upload.component.css'],
})
export class ProjectUploadComponent implements OnInit {
  downloadUrl: string = '';
  img: any;
  uploadProgress: any = 0;

  // Tab management
  activeTab: 'upload' | 'manage' = 'upload';

  // Project management
  projects: any[] = [];
  editingProject: any = null;
  editForm: any = {};

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  setActiveTab(tab: 'upload' | 'manage') {
    this.activeTab = tab;
    if (tab === 'manage') {
      this.loadProjects();
    }
  }

  loadProjects() {
    const dbInstance = collection(this.firestore, 'projects');
    getDocs(dbInstance)
      .then((response: any) => {
        this.projects = response.docs.map((item: any) => {
          return { ...item.data(), id: item.id };
        });
      })
      .catch((err) => {
        alert('Error loading projects: ' + err.message);
      });
  }

  toggleActive(project: any) {
    const projectRef = doc(this.firestore, 'projects', project.id);
    const newActiveStatus = !project.isActive;
    updateDoc(projectRef, { isActive: newActiveStatus })
      .then(() => {
        project.isActive = newActiveStatus;
        alert(
          `Project ${
            newActiveStatus ? 'activated' : 'deactivated'
          } successfully`
        );
      })
      .catch((err) => {
        alert('Error updating project: ' + err.message);
      });
  }

  deleteProject(project: any) {
    if (
      confirm(
        `Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`
      )
    ) {
      const projectRef = doc(this.firestore, 'projects', project.id);
      deleteDoc(projectRef)
        .then(() => {
          alert('Project deleted successfully');
          this.loadProjects();
        })
        .catch((err) => {
          alert('Error deleting project: ' + err.message);
        });
    }
  }

  startEdit(project: any) {
    this.editingProject = { ...project };
    this.editForm = {
      projectName: project.projectName || '',
      projectDesc: project.projectDesc || '',
      githubLink: project.githubLink || '',
      projectLink: project.projectLink || '',
      techs: project.techs
        ? Array.isArray(project.techs)
          ? project.techs.join(', ')
          : project.techs
        : '',
      category: project.category || 'web',
      isActive: project.isActive !== undefined ? project.isActive : true,
      demoVideo: project.demoVideo || '',
      screenshots:
        project.screenshots && Array.isArray(project.screenshots)
          ? project.screenshots.join(', ')
          : project.screenshots || '',
      // platform checkboxes derived from array
      platformsIOS: Array.isArray(project.platforms)
        ? project.platforms.includes('ios')
        : false,
      platformsAndroid: Array.isArray(project.platforms)
        ? project.platforms.includes('android')
        : false,
      // store links
      appStore: project.storeLinks?.appStore || '',
      playStore: project.storeLinks?.playStore || '',
      apk: project.storeLinks?.apk || '',
      testflight: project.storeLinks?.testflight || '',
    };
  }

  cancelEdit() {
    this.editingProject = null;
    this.editForm = {};
  }

  updateProject() {
    if (!this.editingProject) return;

    const projectRef = doc(this.firestore, 'projects', this.editingProject.id);
    // Build platforms from checkboxes
    const platforms: string[] = [];
    if (this.editForm.platformsIOS) platforms.push('ios');
    if (this.editForm.platformsAndroid) platforms.push('android');
    // Build storeLinks, only include provided ones
    const storeLinks: any = {};
    if (this.editForm.appStore) storeLinks.appStore = this.editForm.appStore;
    if (this.editForm.playStore) storeLinks.playStore = this.editForm.playStore;
    if (this.editForm.apk) storeLinks.apk = this.editForm.apk;
    if (this.editForm.testflight)
      storeLinks.testflight = this.editForm.testflight;

    const updatedData: any = {
      projectName: this.editForm.projectName,
      projectDesc: this.editForm.projectDesc,
      githubLink: this.editForm.githubLink,
      projectLink: this.editForm.projectLink,
      category: this.editForm.category,
      techs: this.editForm.techs
        ? this.editForm.techs
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t)
        : [],
      isActive:
        this.editForm.isActive === true || this.editForm.isActive === 'true',
      demoVideo: this.editForm.demoVideo || null,
      screenshots: this.editForm.screenshots
        ? this.editForm.screenshots
            .split(',')
            .map((u: string) => u.trim())
            .filter((u: string) => u)
        : [],
      platforms,
      storeLinks,
    };

    updateDoc(projectRef, updatedData)
      .then(() => {
        alert('Project updated successfully');
        this.editingProject = null;
        this.editForm = {};
        this.loadProjects();
      })
      .catch((err) => {
        alert('Error updating project: ' + err.message);
      });
  }
  uploadProject(value: any) {
    console.log(value);
    // Platforms from checkboxes or inferred from links
    const platforms: string[] = [];
    if (value.platformsIOS) platforms.push('ios');
    if (value.platformsAndroid) platforms.push('android');
    // Store links
    const storeLinks: any = {};
    if (value.appStore) storeLinks.appStore = value.appStore;
    if (value.playStore) storeLinks.playStore = value.playStore;
    if (value.apk) storeLinks.apk = value.apk;
    if (value.testflight) storeLinks.testflight = value.testflight;
    // Infer platforms if not explicitly checked
    if (platforms.length === 0) {
      if (storeLinks.appStore || storeLinks.testflight) platforms.push('ios');
      if (storeLinks.playStore || storeLinks.apk) platforms.push('android');
    }

    const projectArray: any = {
      projectName: value.projectName,
      projectDesc: value.projectDesc,
      githubLink: value.githubLink,
      projectLink: value.projectLink,
      techs: value.techs
        ? value.techs
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t)
        : [],
      img: this.downloadUrl,
      category: value.category || 'web',
      isActive:
        value.isActive === true ||
        value.isActive === 'true' ||
        value.isActive === undefined
          ? true
          : false,
      demoVideo: value.demoVideo || null,
      screenshots: value.screenshots
        ? value.screenshots
            .split(',')
            .map((u: string) => u.trim())
            .filter((u: string) => u)
        : [],
      platforms,
      storeLinks,
    };
    this.addData(projectArray);
  }
  getImage = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.uploadProgress = '0%';

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', environment.cloudinary.uploadPreset);
        formData.append('folder', 'portfolio');

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            this.uploadProgress = `${percentComplete}%`;
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            this.downloadUrl = response.secure_url;
            this.uploadProgress = '100%';
            console.log('File uploaded to Cloudinary:', this.downloadUrl);
          } else {
            console.error('Upload failed:', xhr.responseText);
            alert('Image upload failed. Please try again.');
            this.uploadProgress = '0%';
          }
        });

        xhr.addEventListener('error', () => {
          console.error('Upload error');
          alert('Image upload failed. Please try again.');
          this.uploadProgress = '0%';
        });

        xhr.open(
          'POST',
          `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`
        );
        xhr.send(formData);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Image upload failed. Please try again.');
        this.uploadProgress = '0%';
      }
    }
  };
  addData(value: any) {
    const dbInstance = collection(this.firestore, 'projects');
    addDoc(dbInstance, value)
      .then(() => {
        alert('Project added successfully');
        this.downloadUrl = '';
        this.uploadProgress = 0;
        const form = document.querySelector('form');
        if (form) (form as HTMLFormElement).reset();
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}
