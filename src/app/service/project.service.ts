import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Project, arrangeProjects, toProject } from '../models/project';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  snapshot: Project[] | null = null;

  private request?: Promise<Project[]>;

  constructor(private firestore: Firestore) {}

  list(): Promise<Project[]> {
    if (!this.request) {
      this.request = getDocs(collection(this.firestore, 'projects'))
        .then((response) => {
          const projects = response.docs
            .map((doc) => toProject(doc.id, doc.data()))
            .filter((project): project is Project => !!project);
          return (this.snapshot = arrangeProjects(projects));
        })
        .catch((err) => {
          this.request = undefined;
          throw err;
        });
    }
    return this.request;
  }
}
