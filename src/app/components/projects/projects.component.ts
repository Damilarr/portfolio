import { Component, OnInit } from '@angular/core';
import * as Aos from 'aos';
import {
  Firestore,
  getDocs,
  collection,
  query,
  where,
} from '@angular/fire/firestore';
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  data: any = [];
  filteredData: any = [];
  activeTab: 'web' | 'mobile' = 'web';
  screenshotIndices: { [key: string]: number } = {};

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    Aos.init();
    this.getData();
  }

  getCurrentScreenshot(project: any): string {
    if (!project.screenshots || project.screenshots.length === 0) {
      return project.img || '';
    }
    const index = this.screenshotIndices[project.id] || 0;
    return project.screenshots[index] || project.img || '';
  }

  nextScreenshot(project: any, event: Event) {
    event.stopPropagation();
    if (project.screenshots && project.screenshots.length > 1) {
      const currentIndex = this.screenshotIndices[project.id] || 0;
      const nextIndex = (currentIndex + 1) % project.screenshots.length;
      this.screenshotIndices[project.id] = nextIndex;
    }
  }

  previousScreenshot(project: any, event: Event) {
    event.stopPropagation();
    if (project.screenshots && project.screenshots.length > 1) {
      const currentIndex = this.screenshotIndices[project.id] || 0;
      const prevIndex =
        currentIndex === 0 ? project.screenshots.length - 1 : currentIndex - 1;
      this.screenshotIndices[project.id] = prevIndex;
    }
  }

  goToScreenshot(project: any, index: number, event: Event) {
    event.stopPropagation();
    this.screenshotIndices[project.id] = index;
  }

  getData() {
    const dbInstance = collection(this.firestore, 'projects');
    // Fetch all projects first, then filter client-side to handle legacy projects
    getDocs(dbInstance)
      .then((response: any) => {
        this.data = response.docs.map((item: any) => {
          const projectData = item.data();
          // Set defaults for legacy projects that don't have these fields
          return {
            ...projectData,
            id: item.id,
            category: projectData.category || 'web',
            isActive:
              projectData.isActive !== undefined ? projectData.isActive : true, // Default to true for legacy projects
          };
        });
        // Filter out inactive projects
        this.data = this.data.filter(
          (project: any) => project.isActive === true
        );
        this.filterProjects();
        console.log(this.data);
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  setActiveTab(tab: 'web' | 'mobile') {
    this.activeTab = tab;
    this.filterProjects();
  }

  filterProjects() {
    this.filteredData = this.data.filter((project: any) => {
      return project.category === this.activeTab;
    });
  }
}
