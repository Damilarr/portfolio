import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { AboutComponent } from './components/about/about.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContactComponent } from './components/contact/contact.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from './components/admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { ProjectUploadComponent } from './components/project-upload/project-upload.component';
import { CertificatesComponent } from './components/certificates/certificates.component';
import { CertificateAdminComponent } from './components/certificate-admin/certificate-admin.component';
import { PixelAvatarComponent } from './components/pixel-avatar/pixel-avatar.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { ProjectMediaComponent } from './components/project-media/project-media.component';
import { RollingNumberComponent } from './components/rolling-number/rolling-number.component';
import { MagneticDirective } from './directives/magnetic.directive';
import { RevealDirective } from './directives/reveal.directive';
import { TiltDirective } from './directives/tilt.directive';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment.prod';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AngularFireModule } from '@angular/fire/compat';
import { HttpClientModule } from '@angular/common/http';
import { ViewportScroller } from '@angular/common';
import { AppViewportScroller } from './motion/viewport-scroller';

@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    AboutComponent,
    FooterComponent,
    ContactComponent,
    AdminComponent,
    HomeComponent,
    ProjectUploadComponent,
    CertificatesComponent,
    CertificateAdminComponent,
    PixelAvatarComponent,
    ProjectDetailComponent,
    ProjectMediaComponent,
    RollingNumberComponent,
    MagneticDirective,
    RevealDirective,
    TiltDirective,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    { provide: ViewportScroller, useClass: AppViewportScroller },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
