import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent } from './components/home/home.component';
import { AdminGuard } from './guards/admin.guard';
import { ProjectUploadComponent } from './components/project-upload/project-upload.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { ViewTransitionResolver } from './motion/view-transition';

const transition = { transition: ViewTransitionResolver };

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    title: 'Emmanuel Adeyemo | Software Engineer',
    resolve: transition,
  },
  {
    path: 'work/:slug',
    component: ProjectDetailComponent,
    resolve: transition,
  },
  { path: 'home', pathMatch: 'full', redirectTo: '' },
  { path: 'home/:section', redirectTo: '' },
  {
    path: 'certificates',
    component: CertificatesComponent,
    title: 'Certificates | Emmanuel Adeyemo',
    resolve: transition,
  },
  { path: 'admin', component: AdminComponent },
  {
    path: 'upload',
    component: ProjectUploadComponent,
    canActivate: [AdminGuard],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
    CommonModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
