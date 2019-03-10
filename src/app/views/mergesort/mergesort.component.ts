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
    let valid = this.validateInput();
    if(valid) {
      if(this.userText.trim() == "") {
        this.int_array = [];
      } else {
        this.int_array = this.userText.trim().split(" ");
      }
    } else {
      this.input_error = "Error in input."
      this.int_array = [];
    }
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

  separateNumbers(arr, i) {
    if(arr.length != 1) {
      let left = arr.splice(0, arr.length/2);
      let right = arr.splice(arr.length/2 - 1, arr.length);

      console.log("left: " + left);
      console.log("right: " + right);

      console.log("left.length: " + left.length);
      console.log("i: " + i);

      setTimeout(function () {
        console.log("left recursion: " + (i+left.length-1));
        document.getElementById((i+left.length-1) + "").style.paddingLeft = '5px';
        this.separateNumbers(left, i);
      }, 2000);

      setTimeout(function () {
        console.log("right recursion: " + (i+left.length));
        document.getElementById((i+left.length) + "").style.paddingRight = '5px';
        this.separateNumbers(right, i+left.length);
      }, 2000);
    }
  }

  sortArray() {
    if(this.input_error.length == 0) {
      this.convertStringToArray();
      setTimeout(function () {
        this.separateNumbers(this.int_array, 0);
      }, 2000);
    }
  }

  clearInputError() {
    this.input_error = "";
  }
}
