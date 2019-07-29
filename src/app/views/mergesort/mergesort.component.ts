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

  treeData : Node;

  mergedArray: number[];
  queue1: Node[];
  maxDepth: number;

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
        this.sleep(this.mergeSleepTime);
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
      // depth
      // await this.depthMergeSort(this.int_array, 0,1, this.treeData);

      // breadth
      this.queue1 = [];
      this.maxDepth = 0;
      this.queue1.push(this.treeData);
      await this.breadthSplit();
      console.log('tree', this.treeData);
      await this.breadthMerge();

    }
    this.disable_solve = false;
  }

  async depthTraverse(tree, depth) {
    if( depth > 0) {
      if(tree.left) {
        var left = this.treeData.left;
        await this.depthTraverse(left,depth-1);
      }
      if(tree.right) {
        var right = this.treeData.right;
        await this.depthTraverse(right,depth-1);
      }
    } else{
      return await tree.left && tree.right;
    }
  }

  async depthMergeSort (arr, index, depth, parent) {
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
    parent.left = {
      depth: depth,
      parent: depth-1,
      value: subLeft
    };
    parent.right = {
      depth: depth,
      parent: depth-1,
      value: subRight
    }
    
    this.d3Service.removeAll();
    this.d3Service.setRoot(this.treeData);
    this.d3Service.draw();
    
    await this.depthMergeSort(subLeft, index, depth+1, parent.left).then((res) => {
      subLeft = res;
    }).catch(console.log);

    await this.sleep(this.mergeSleepTime);
    
    await this.depthMergeSort(subRight, index + subLeft.length,depth+1, parent.right).then((res) => {
      subRight = res;
    }).catch(console.log);

    await this.sleep(this.mergeSleepTime);
    
    var merged = await this.merge(parent.left, parent.right);
    
    parent.left = null;
    parent.right = null;
    parent.value = merged;
    
    await this.sleep(this.mergeSleepTime);

    this.d3Service.removeAll();
    this.d3Service.setRoot(this.treeData);
    this.d3Service.draw();
    
    // this.treeMergeArr[depth].nativeElement.innerHTML += "merged: "+JSON.stringify(merged);

    await this.sleep(this.mergeSleepTime);

    return merged; 
  }

  async merge(leftNode, rightNode) {
    this.mergedArray = [];
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (leftNode.value && leftNode.value.length && rightNode.value && rightNode.value.length) {
      console.log("before", leftNode.value, rightNode.value);
      if(this.ordering == 'ASC') {
        if(parseFloat(leftNode.value[0]) < parseFloat(rightNode.value[0])) {
          let node = leftNode.value.shift();

          result.push(node);
          this.mergedArray.push(node);
          
          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();
        } else {
          let node = rightNode.value.shift();

          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();

          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();
        }
      } else {
        if (parseFloat(leftNode.value[0]) > parseFloat(rightNode.value[0])) {
          let node = leftNode.value.shift();

          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();
    
          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();
        } else {
          let node = rightNode.value.shift();

          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();
    
          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.d3Service.removeAll();
          this.d3Service.setRoot(this.treeData);
          this.d3Service.draw();          
        }
      }
      console.log("after", leftNode.value, rightNode.value);
    }
    while(leftNode.value.length) {
      let node = leftNode.value.shift();

      await this.sleep(this.mergeSleepTime);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();

      result.push(node);
      this.mergedArray.push(node);

      await this.sleep(this.mergeSleepTime);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }
    while(rightNode.value.length) {
      let node = rightNode.value.shift();

      await this.sleep(this.mergeSleepTime);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();

      result.push(node);
      this.mergedArray.push(node);

      await this.sleep(this.mergeSleepTime);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }

    await this.sleep(this.mergeSleepTime);
    this.mergedArray = [];
    
    return result.concat(leftNode.value.slice(indexLeft)).concat(rightNode.value.slice(indexRight));
  }

  async breadthSplit() {
    while(this.queue1.length < this.int_array.length) {
      let node = this.queue1.shift();

      if(node.value.length > 1) {
        var mid = Math.floor(node.value.length / 2);
        
        var subLeft = node.value.slice(0, mid);

        var subRight = node.value.slice(mid);

        let leftNode = {
          depth: node.depth+1,
          parent: node.depth,
          value: subLeft
        };
        
        let rightNode = {
          depth: node.depth+1,
          parent: node.depth,
          value: subRight
        };

        if(this.maxDepth < node.depth + 1) {
          this.maxDepth = node.depth+1;
        }

        node.left = leftNode;
        node.right = rightNode;

        this.queue1.push(leftNode);
        this.queue1.push(rightNode);

        this.d3Service.removeAll();
        this.d3Service.setRoot(this.treeData);
        this.d3Service.draw();
    
        await this.sleep(this.mergeSleepTime);
      } else {
        this.queue1.push(node);
      }
    }
  }

  async breadthMerge() {
    console.log("depth", this.maxDepth);
    // console.log(this.queue1, this.maxDepth);
    for(let depth = this.maxDepth-1; depth >= 0; depth--) {
      await this.breadthTraverse(this.treeData, depth);
      await this.sleep(this.mergeSleepTime);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }
  }

  async breadthTraverse(tree, depth) {
    // console.log(depth, tree);
    if(tree.left && tree.right) {
      if(tree.depth === depth) {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;
        console.log("merging....");
        this.sleep(this.mergeSleepTime);
        console.log("....merged");
        let merged = await this.merge(nodeLeft, nodeRight);
        tree.value = merged;
        tree.left = null;
        tree.right = null;

      } else {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;
        await this.breadthTraverse(nodeLeft, depth);
        await this.breadthTraverse(nodeRight, depth);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearInputError() {
    this.input_error = "";
  }
}
