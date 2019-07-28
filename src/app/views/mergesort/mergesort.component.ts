import { 
  Component, 
  OnInit, 
  ViewChildren, 
  QueryList, 
  ChangeDetectionStrategy, 
  ElementRef 
} from '@angular/core';

import { Node } from '../../interfaces/Node.interface';
import { HierarchyPointNode } from 'd3';
import { D3Service } from 'src/app/services/d3.service';

@Component({
  selector: 'app-mergesort',
  templateUrl: './mergesort.component.html',
  styleUrls: ['./mergesort.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class MergesortComponent implements OnInit {
  int_array = [];
  height_array = [];
  userText;
  input_error: String;
  ordering: String;
  disable_solve: Boolean;

  mergedArray: number[];

  treeData : Node;
  private root: HierarchyPointNode<Node>;

  @ViewChildren("treeBreak") treeBreakRef : QueryList<ElementRef>;
  @ViewChildren("treeMerge") treeMergeRef : QueryList<ElementRef>;

  treeBreakArr = [];
  treeMergeArr = [];

  mergeSleepTime = 1000;

  constructor(private d3Service: D3Service) {
    this.userText = "";
    this.input_error = "";
    this.disable_solve = false;
    this.mergedArray = [];
  }

  ngOnInit() {
    this.ordering = 'ASC';
    this.int_array = [];
  }

  ngAfterContentInit(){
    this.d3Service.initialize();
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
    this.d3Service.removeAll();

    let arr = this.userText.replace(/\s+/g,' ').trim().split(" ");
    arr.forEach(value => {
      if(!this.isNumeric(value)) {
        this.input_error = "Error in input.";
        this.treeData = {
          depth: 0,
          parent: -1,
          value: undefined
        };
        this.d3Service.setRoot(this.treeData);
        this.d3Service.draw();
        return false;
      }
    });
    this.treeData = {
      depth: 0,
      parent: -1,
      value: arr
    };
    this.d3Service.setRoot(this.treeData);
    this.d3Service.draw();
    return true;
  }

  ngAfterViewInit() {
    this.treeBreakRef.changes.subscribe(() => {
      this.treeBreakArr = [];
      this.treeBreakRef.toArray().forEach(el => {
        this.treeBreakArr.push(el);
      });
    });
    this.treeMergeRef.changes.subscribe(() => {
      this.treeMergeArr = [];
      this.treeMergeRef.toArray().forEach(el => {
        this.treeMergeArr.push(el);
      });
    });
  }

  async sortArray() {
    this.disable_solve = true;
    if(!this.input_error.length && this.int_array.length) {
      // this.height_array = [];
    
      // var height = (Math.log2(this.int_array.length)+2);

      // console.log("height of merge tree:", height);

      // for (let index = 0; index < height; index++) {
      //   this.height_array.push(index);
      // }

      // while(this.treeBreakArr.length < height && this.treeMergeArr.length < height)
      // {
      //   await this.sleep(10);
      // }

      // this.treeData.data = JSON.stringify(this.int_array);

      // this.tree = tree<Node>();
      // this.tree.size([this.height, this.width]);
      // this.root = this.tree(hierarchy<Node>(this.treeData));
      // this.d3Service.draw(this.root);


      //console.log(this.treeBreakArr);
      // this.treeBreakArr.forEach(el=>{
      //   el.nativeElement.innerHTML = "";
      // })
      // this.treeMergeArr.forEach(el=>{
      //   el.nativeElement.innerHTML = "";
      // })

      // this.treeBreakArr[0].nativeElement.innerHTML = "start: "+JSON.stringify(this.int_array);
    
      await this.mergeSort(this.int_array, 0,1, this.treeData).then((res) => {
        // this.treeMergeArr[0].nativeElement.innerHTML += "end: "+JSON.stringify(res);
      });
    }
    this.disable_solve = false;
  }

  async traverse(tree, depth) {

    if(tree.children && depth > 0)
    {
      var left = this.treeData.children[0];
      var right = this.treeData.children[1];

      this.traverse(left,depth-1);
      this.traverse(right,depth-1);
    
    }else{
      return await tree.children;
    }
  }

  async mergeSort (arr, index, depth, parent) {
    if (arr.length < 2) {
      await this.sleep(this.mergeSleepTime);
      // this.treeBreakArr[depth].nativeElement.innerHTML += "node: "+JSON.stringify(arr) + " ";
      return await arr;
    }
    
    var mid = Math.floor(arr.length / 2);
    
    var subLeft = arr.slice(0, mid);

    var subRight = arr.slice(mid);

    await this.sleep(this.mergeSleepTime);

    // this.treeBreakArr[depth].nativeElement.innerHTML += "left: "+JSON.stringify(subLeft)+"right: "+JSON.stringify(subRight)+" ";
    parent.children = [
      {
        depth: depth,
        parent: depth-1,
        value: subLeft
      },
      {
        depth: depth,
        parent: depth-1,
        value: subRight
      }
    ];
    
    this.d3Service.removeAll();
    this.d3Service.setRoot(this.treeData);
    this.d3Service.draw();
    
    await this.mergeSort(subLeft, index, depth+1, parent.children[0]).then((res) => {
      subLeft = res;
    }).catch(console.log);

    await this.sleep(this.mergeSleepTime);
    
    await this.mergeSort(subRight, index + subLeft.length,depth+1, parent.children[1]).then((res) => {
      subRight = res;
    }).catch(console.log);

    await this.sleep(this.mergeSleepTime);
    
    var merged = await this.merge(subLeft, subRight, parent);
    
    parent.value = merged;
    parent.children = null;
    
    this.d3Service.removeAll();
    this.d3Service.setRoot(this.treeData);
    this.d3Service.draw();
    
    // this.treeMergeArr[depth].nativeElement.innerHTML += "merged: "+JSON.stringify(merged);

    await this.sleep(this.mergeSleepTime);

    return merged; 
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  merge (left, right, parent) {
    this.mergedArray = [];
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (left.length && right.length) {
      console.log(left, right)
      if(this.ordering == 'ASC') {
        if (parseFloat(left[0]) < parseFloat(right[0])) {
          let node = left.shift();
          result.push(node);
          this.mergedArray.push(node);
        } else {
          let node = right.shift();
          result.push(node);
          this.mergedArray.push(node);
        }
      } else {
        if (parseFloat(left[0]) > parseFloat(right[0])) {
          let node = left.shift();
          result.push(node);
          this.mergedArray.push(node);
        } else {
          let node = right.shift();
          result.push(node);
          this.mergedArray.push(node);
        }
      }
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
      this.sleep(this.mergeSleepTime);
    }
    while(left.length) {
      let node = left.shift();
      result.push(node);
      this.mergedArray.push(node);

      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }
    while(right.length) {
      let node = right.shift();
      result.push(node);
      this.mergedArray.push(node);

      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }

    return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
  }

  clearInputError() {
    this.input_error = "";
  }
}
