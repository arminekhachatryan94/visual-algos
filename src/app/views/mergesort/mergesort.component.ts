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
  disable_solve: Boolean;

  constructor() {
    this.userText = "";
    this.input_error = "";
    this.disable_solve = false;
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

  clearMargins() {
    for(let i = 0; i < this.int_array.length; i++) {
      let el_style = document.getElementById('' + i).style
      el_style.removeProperty('leftMargin');
      // console.log(el_style);
    }
  }

  validateInput() {
    this.clearMargins();
    this.userText.replace(/\s+/g,' ').trim().split(" ").forEach(value => {
      if(!this.isNumeric(value)) {
        // console.log(value + " : invalid");
        this.input_error = "Error in input.";
        return false;
      } else {
        // console.log(value);
      }
    });
    return true;
  }

  async sortArray() {
    this.disable_solve = true;
    if(!this.input_error.length && this.int_array.length) {
      await this.mergeSort(this.int_array, 0).then();
      this.clearMargins();
    }
    this.disable_solve = false;
  }

  async mergeSort (arr, index) {
    if (arr.length < 2) {
      return await arr;
    }

    var mid = Math.floor(arr.length / 2);
  
    var subLeft = arr.slice(0, mid);
    var subRight = arr.slice(mid);
    
    console.log(subLeft, subRight);

    // document.getElementById((index + subLeft.length).toString()).style.marginRight += '10px';
    let style = document.getElementById((index + subLeft.length).toString()).style;
    style.marginLeft = (parseInt(style.marginLeft) ? parseInt(style.marginLeft) : 0) + 20 + "px";

    for(let i = 0; i < subRight.length + subRight.length; i++) {
      let style_el = document.getElementById((index + i).toString()).style;
      style_el.marginTop = (parseInt(style_el.marginTop) ? parseInt(style_el.marginTop) : 0)  + 20 + "px";
    }

    await this.sleep(1000);

    await this.mergeSort(subLeft, index).then((res) => {
      subLeft = res;
      // console.log(res)
    }).catch();

    await this.sleep(1000);

    // console.log(index, subLeft, subRight);

    await this.mergeSort(subRight, index + subLeft.length).then((res) => {
      subRight = res;
      // console.log(res)
    }).catch();

    await this.sleep(1000);
    return await this.merge(subLeft, subRight, index);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  merge (left, right, index) {
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
      // console.log(left, right)
      if(this.ordering == 'ASC') {
        if (parseFloat(left[indexLeft]) < parseFloat(right[indexRight])) {
          // document.getElementById((index + indexLeft).toString()).innerHTML = right[indexRight];
          // document.getElementById((index + indexLeft + indexRight).toString()).innerHTML = left[indexLeft];
          result.push(left[indexLeft]);
          indexLeft++;
        } else {
          // document.getElementById((index + indexLeft).toString()).innerHTML = right[indexRight];
          // document.getElementById((index + indexLeft + indexRight).toString()).innerHTML = left[indexLeft];
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
