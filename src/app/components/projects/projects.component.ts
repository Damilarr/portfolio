import { Component, OnInit } from '@angular/core';
import * as Aos from 'aos';
import { Firestore, getDocs, collection } from '@angular/fire/firestore';
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  data: any = [];
  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    Aos.init();
    this.getData();
  }
  getData() {
    const dbInstance = collection(this.firestore, 'projects');
    getDocs(dbInstance)
      .then((response: any) => {
        this.data = response.docs.map((item: any) => {
          return { ...item.data(), id: item.id };
        });
        console.log(this.data);
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}
