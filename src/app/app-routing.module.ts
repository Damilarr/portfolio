import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { AdminGuard } from './guards/admin.guard';
import { ProjectUploadComponent } from './components/project-upload/project-upload.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: 'works', component: ProjectsComponent },
      { path: 'chat', component: ContactComponent },
      { path: 'about', component: AboutComponent },
    ],
  },
  { path: 'admin', component: AdminComponent },
  {
    path: 'upload',
    component: ProjectUploadComponent,
    canActivate: [AdminGuard],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, { useHash: false }), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
