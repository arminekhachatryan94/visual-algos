import { 
  Component, 
  OnInit
} from '@angular/core';

import { Node } from '../../models/Node.model';
import { MergesortService } from 'src/app/services/mergesort.service';
import { Element } from 'src/app/models/element.model';

@Component({
  selector: 'app-mergesort',
  templateUrl: './mergesort.component.html',
  styleUrls: ['./mergesort.component.css'],
})

export class MergesortComponent implements OnInit {
  int_array = [];
  height_array = [];
  userText;
  input_error: String;
  ordering: String;
  disable_solve: Boolean;
  solutionType: String;
  num_nodes: number;

  treeData : Node;

  displayBefore: boolean;
  displayAfter: boolean;
  beforeArray: Node[];
  afterArray: Node[];
  mergedArray: Element[];
  queue1: Node[];
  maxDepth: number;

  mergeSleepTime = 1000;

  constructor(private drawService: MergesortService) {
    this.userText = "";
    this.input_error = "";
    this.disable_solve = false;
    this.displayBefore = false;
    this.displayAfter = false;
    this.mergedArray = [];
    this.beforeArray = [];
    this.afterArray = [];
    this.solutionType = 'breadth';
  }

  ngOnInit() {
    this.ordering = 'ASC';
    this.int_array = [];
    this.num_nodes = 0;
  }

  ngAfterContentInit(){
    this.drawService.initialize();
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
    this.drawService.removeAll();

    let arr = this.userText.replace(/\s+/g,' ').trim().split(" ");
    arr.forEach(value => {
      if(!this.isNumeric(value)) {
        this.input_error = "Error in input.";
        this.treeData = new Node(0, 0, [], null, null, null);
        this.sleep(this.mergeSleepTime);
        this.drawService.setRoot(this.treeData);
        this.drawService.draw();
        return false;
      }
    });
    let elements = [];
    for(let i = 0; i < arr.length; i++) {
      elements.push(new Element(arr[i], 'blue'));
    }
    this.treeData = new Node(0, 0, elements, null, null, null);
    this.drawService.setRoot(this.treeData);
    this.drawService.draw();
    return true;
  }

  async sortArray() {
    this.disable_solve = true;
    if(!this.input_error.length && this.int_array.length) {
      if(this.solutionType === 'breadth') {
        // breadth
        this.queue1 = [];
        this.maxDepth = 0;
        this.queue1.push(this.treeData);
        this.num_nodes++;
        await this.breadthSplit();
        await this.breadthMerge();
      } else {
        // depth
        await this.depthMergeSort(this.int_array, 0, 1, this.treeData);
      }
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
      return await arr;
    }
    
    var mid = Math.floor(arr.length / 2);
    
    var subLeft = arr.slice(0, mid);

    var subRight = arr.slice(mid);

    await this.sleep(this.mergeSleepTime);

    parent.left = new Node(this.num_nodes, depth, subLeft, parent, null, null);
    this.num_nodes++;
    parent.right = new Node(this.num_nodes, depth, subRight, parent, null, null);
    this.num_nodes++;
    
    this.drawService.removeAll();
    this.drawService.setRoot(this.treeData);
    this.drawService.draw();
    
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

    this.drawService.removeAll();
    this.drawService.setRoot(this.treeData);
    this.drawService.draw();
    
    await this.sleep(this.mergeSleepTime);

    return merged; 
  }

  async merge(leftNode, rightNode) {
    this.mergedArray = [];
    this.displayBefore = false;
    this.displayAfter = false;
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    // get left part of array
    for(let n = 0; n < this.queue1.length; n++) {
      if(this.queue1[n].id === leftNode.id) {
        break;
      }
      if(this.queue1[n].id !== leftNode.id) {
        this.beforeArray.push(this.queue1[n]);
      }
    }

    // get right part of array
    for(let n = this.queue1.length-1; n>= 0; n--) {
      if(this.queue1[n].id === rightNode.id) {
        break;
      }
      if(this.queue1[n].id !== rightNode.id) {
        this.afterArray.unshift(this.queue1[n]);
      }
    }
  
    while (leftNode.value && leftNode.value.length && rightNode.value && rightNode.value.length) {
      if(this.ordering == 'ASC') {
        if(parseFloat(leftNode.value[0].value) < parseFloat(rightNode.value[0].value)) {
          let node = leftNode.value.shift();

          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();
        } else {
          let node = rightNode.value.shift();

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();

          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();
        }
      } else {
        if (parseFloat(leftNode.value[0].value) > parseFloat(rightNode.value[0].value)) {
          let node = leftNode.value.shift();

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();
    
          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();
        } else {
          let node = rightNode.value.shift();

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();
    
          result.push(node);
          this.mergedArray.push(node);

          await this.sleep(this.mergeSleepTime);
          this.drawService.removeAll();
          this.drawService.setRoot(this.treeData);
          this.drawService.draw();          
        }
      }
    }
    while(leftNode.value.length) {
      let node = leftNode.value.shift();

      await this.sleep(this.mergeSleepTime);
      this.drawService.removeAll();
      this.drawService.setRoot(this.treeData);
      this.drawService.draw();

      result.push(node);
      this.mergedArray.push(node);

      await this.sleep(this.mergeSleepTime);
      this.drawService.removeAll();
      this.drawService.setRoot(this.treeData);
      this.drawService.draw();
    }
    while(rightNode.value.length) {
      let node = rightNode.value.shift();

      await this.sleep(this.mergeSleepTime);
      this.drawService.removeAll();
      this.drawService.setRoot(this.treeData);
      this.drawService.draw();

      result.push(node);
      this.mergedArray.push(node);

      await this.sleep(this.mergeSleepTime);
      this.drawService.removeAll();
      this.drawService.setRoot(this.treeData);
      this.drawService.draw();
    }
    await this.sleep(this.mergeSleepTime);

    this.displayBefore = true;
    this.displayAfter = true;

    await this.sleep(this.mergeSleepTime);

    this.mergedArray = [];
    this.beforeArray = [];
    this.afterArray = [];

    await this.sleep(this.mergeSleepTime);
    
    let ret = result.concat(leftNode.value.slice(indexLeft)).concat(rightNode.value.slice(indexRight));

    let leftIndex = this.getIndexOfNode(leftNode.id);
    if(leftIndex !== -1) {
      this.queue1.splice(leftIndex, 2, new Node(
        leftNode.parent.id,
        leftNode.parent.depth,
        ret,
        leftNode.parent,
        null,
        null
      ));
    }

    return ret;
  }

  getIndexOfNode(id: number) {
    let index = -1;
    for(let q = 0; q < this.queue1.length; q++) {
      if(this.queue1[q].id === id) {
        index = q;
        break;
      }
    }
    return index;
  }

  async breadthSplit() {
    while(this.queue1.length < this.int_array.length) {
      let node = this.queue1.shift();

      if(node.value.length > 1) {
        var mid = Math.floor(node.value.length / 2);
        
        var subLeft = node.value.slice(0, mid);

        var subRight = node.value.slice(mid);

        let leftNode = new Node(
          this.num_nodes,
          node.depth+1,
          subLeft,
          node,
          null,
          null
        );
        this.num_nodes++;
        
        let rightNode = new Node(
          this.num_nodes,
          node.depth+1,
          subRight,
          node,
          null,
          null
        );
        this.num_nodes++;

        if(this.maxDepth < node.depth + 1) {
          this.maxDepth = node.depth+1;
        }

        node.left = leftNode;
        node.right = rightNode;

        this.queue1.push(leftNode);
        this.queue1.push(rightNode);

        this.drawService.removeAll();
        this.drawService.setRoot(this.treeData);
        this.drawService.draw();
    
        await this.sleep(this.mergeSleepTime);
      } else {
        this.queue1.push(node);
      }
    }
  }

  async breadthMerge() {
    for(let depth = this.maxDepth-1; depth >= 0; depth--) {
      await this.breadthTraverse(this.treeData, depth);
      await this.sleep(this.mergeSleepTime);
      this.drawService.removeAll();
      this.drawService.setRoot(this.treeData);
      this.drawService.draw();
    }
  }

  async breadthTraverse(tree, depth) {
    if(tree.left && tree.right) {
      if(tree.depth === depth) {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;
        this.sleep(this.mergeSleepTime);
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
