import { Component } from '@angular/core';
import { signInWithEmailAndPassword, Auth } from '@angular/fire/auth';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  signingIn = false;
  error = '';

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router
  ) {}

  async submit(value: { email: string; password: string }): Promise<void> {
    this.error = '';
    this.signingIn = true;
    try {
      const response = await signInWithEmailAndPassword(
        this.auth,
        value.email,
        value.password
      );
      if (response.user) {
        this.authService.login();
        await this.router.navigate(['upload']);
      }
    } catch (err: any) {
      this.error =
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found'
          ? 'That email and password don’t match.'
          : err?.message || 'Couldn’t sign in. Try again.';
    } finally {
      this.signingIn = false;
    }
  }
}
