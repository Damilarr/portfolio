import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { signInWithEmailAndPassword, Auth } from '@angular/fire/auth';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  constructor(
    private auth: Auth,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}
  submit(value: any) {
    console.log(value);
    signInWithEmailAndPassword(this.auth, value.email, value.password)
      .then((response: any) => {
        if (response.user.accessToken) {
          this.authService.login();
          setTimeout(() => {
            this.router.navigate(['upload']);
          }, 2000);
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}
