import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mergesort',
  templateUrl: './mergesort.component.html',
  styleUrls: ['./mergesort.component.css']
})
export class MergesortComponent implements OnInit {
  int_array = [];
  userText;
  input_error: String;

  constructor() {
    this.userText = "";
    this.input_error = "";
  }

  ngOnInit() {
  }

  convertStringToArray() {
    this.int_array = this.userText.trim().split(" ");
  }

  validateInput() {
    let count = 0;
    this.userText.split("").forEach(ch => {
      if(!(isNaN(ch) && ch != " ")) {
        count++;
      }
    });
    if(count == this.userText.length){
      return true;
    } else {
      return false;
    }
  }

  sortArray() {
    let valid = this.validateInput();
    console.log("end: " + valid);
    if(valid) {
      this.convertStringToArray();
    } else {
      this.input_error = "Error in input."
    }
  }

  clearInputError() {
    this.input_error = "";
  }

}
