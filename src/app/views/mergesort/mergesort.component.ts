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
  ordering: String;

  constructor() {
    this.userText = "";
    this.input_error = "";
  }

  ngOnInit() {
    this.ordering = 'ASC';
    this.int_array = [];
  }

  convertStringToArray() {
    let valid = this.validateInput();
    if(valid) {
      if(this.userText.trim() == "") {
        this.int_array = [];
      } else {
        this.int_array = this.userText.trim().split(" ")
          .filter(function(el) {
            return el !== "";
        })
      }
    } else {
      this.input_error = "Error in input."
      this.int_array = [];
    }
  }

  isNumeric(value) {
    return /^-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/.test(value);
  }

  validateInput() {
    this.userText.replace(/\s+/g,' ').trim().split(" ").forEach(value => {
      if(!this.isNumeric(value)) {
        console.log(value + " : invalid");
        this.input_error = "Error in input.";
        return false;
      } else {
        console.log(value);
      }
    });
    return true;
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
    if(!this.input_error.length && this.int_array.length) {
      this.int_array = this.mergeSort(this.int_array);
    }
  }

  mergeSort (arr) {
    if (arr.length === 1) {
      // return once we hit an array with a single item
      return arr;
    }
  
    const middle = Math.floor(arr.length / 2); // get the middle item of the array rounded down
    const left = arr.slice(0, middle); // items on the left side
    const right = arr.slice(middle); // items on the right side
  
    return this.merge(
      // this.mergeSort(left),
      // this.mergeSort(right)
      this.delay(1000).then(any=>{
        console.log(left)
        this.mergeSort(left)
      }),
      this.delay(1000).then(any=>{
        console.log(right)
        this.mergeSort(right)
      })
    )
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("fired"));
  }
  
  // compare the arrays item by item and return the concatenated result
  merge (left, right) {
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;
  
    while (indexLeft < left.length && indexRight < right.length) {
      if(this.ordering == 'ASC') {
        if (parseFloat(left[indexLeft]) < parseFloat(right[indexRight])) {
          result.push(left[indexLeft]);
          indexLeft++;
        } else {
          result.push(right[indexRight]);
          indexRight++;
        }
      } else {
        if (parseFloat(left[indexLeft]) > parseFloat(right[indexRight])) {
          result.push(left[indexLeft]);
          indexLeft++;
        } else {
          result.push(right[indexRight]);
          indexRight++;
        }
      }
    }
  
    return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
  }

  clearInputError() {
    this.input_error = "";
  }
}
