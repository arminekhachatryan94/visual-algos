import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  algo: string;
  constructor() { }

  ngOnInit() {
    this.algo = 'counting-inversions';
  }

  changeAlgo(name: string) {
    this.algo = name;
    console.log(this.algo);
  }
}
