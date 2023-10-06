import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { AdminGuard } from './guards/admin.guard';
import { ProjectUploadComponent } from './components/project-upload/project-upload.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  {
    path: 'upload',
    component: ProjectUploadComponent,
  },
  // {
  //   path: 'upload',
  //   component: ProjectUploadComponent,
  //   canActivate: [AdminGuard],
  // },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, { useHash: false }), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
