import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mergesort',
  templateUrl: './mergesort.component.html',
  styleUrls: ['./mergesort.component.css']
})
export class MergesortComponent implements OnInit {
  sortArray;

  constructor() {
    this.sortArray = [5, 3, 10, 12, 7, 1, 18];
  }

  ngOnInit() {
  }

}
