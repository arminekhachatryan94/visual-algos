import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';

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
      this.mergeSort(this.int_array, 0).then(console.log);
    }
  }

  async mergeSort (arr, index) {
    if (arr.length < 2) {
      return await arr;
    }

    var mid = Math.floor(arr.length / 2);
  
    var subLeft = arr.slice(0, mid);
    var subRight = arr.slice(mid);

    document.getElementById((index + subLeft.length).toString()).style.marginLeft = '10px';
    document.getElementById((index + subLeft.length + 1).toString()).style.marginRight = '10px';
    
    await this.sleep(1000);

    await this.mergeSort(subLeft, index).then((res) => {
      subLeft = res;
      console.log(res)
    }).catch(console.log);

    await this.sleep(1000);

    await this.mergeSort(subRight, index + subLeft.length).then((res) => {
      subRight = res;
      console.log(res)
    }).catch(console.log);

    await this.sleep(1000);
    return await this.merge(subLeft, subRight);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
