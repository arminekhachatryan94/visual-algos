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

  inversions: number;

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
    this.inversions = 0;
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
      elements.push(new Element(arr[i], 'yellow'));
    }
    this.treeData = new Node(0, 0, elements, null, null, null);
    this.drawService.setRoot(this.treeData);
    this.drawService.draw();
    return true;
  }

  async sortArray() {
    this.inversions = 0;
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

  async changeColorOfElementsInNode(node: Node, color: string) {
    for(let n = 0; n < node.value.length; n++) {
      await node.value[n].changeColor(color);
    }
  }

  async merge(leftNode, rightNode) {
    this.mergedArray = [];
    this.displayBefore = false;
    this.displayAfter = false;
    let result = [];

    await this.sleep(this.mergeSleepTime);

    await this.changeColorOfElementsInNode(leftNode, 'red');
    await this.changeColorOfElementsInNode(rightNode, 'blue');

    await this.drawService.removeAll();
    await this.drawService.setRoot(this.treeData);
    await this.drawService.draw();

    await this.sleep(this.mergeSleepTime);

    // get left part of array
    for(let n = 0; n < this.queue1.length; n++) {
      if(this.queue1[n].id === leftNode.id) {
        break;
      }
      if(this.queue1[n].id !== leftNode.id) {
        await this.beforeArray.push(this.queue1[n]);
      }
    }

    // get right part of array
    for(let n = this.queue1.length-1; n>= 0; n--) {
      if(this.queue1[n].id === rightNode.id) {
        break;
      }
      if(this.queue1[n].id !== rightNode.id) {
        await this.afterArray.unshift(this.queue1[n]);
      }
    }
  
    let leftI = 0, rightI = 0;
    while (leftI < leftNode.value.length && rightI < rightNode.value.length) {
      await this.sleep(this.mergeSleepTime);

      let node;
      if(this.ordering == 'ASC') {
        if(parseFloat(leftNode.value[leftI].value) < parseFloat(rightNode.value[rightI].value)) {
          node = await leftNode.value[leftI];
          leftI++;
        } else {
          node = await rightNode.value[rightI];
          this.inversions += (leftNode.value.length - leftI);
          rightI++;
        }
      } else {
        if (parseFloat(leftNode.value[leftI].value) > parseFloat(rightNode.value[rightI].value)) {
          node = await leftNode.value[leftI];
          leftI++;
        } else {
          node = await rightNode.value[rightI];
          this.inversions += (leftNode.value.length - leftI);
          rightI++;
        }
      }
      node.changeVisibility(false);

      await this.drawService.removeAll();
      await this.drawService.setRoot(this.treeData);
      await this.drawService.draw();

      await result.push(node);
      await this.mergedArray.push(node);
    }
    while(leftI < leftNode.value.length) {
      await this.sleep(this.mergeSleepTime);

      let node = await leftNode.value[leftI];
      await node.changeVisibility(false);

      await this.drawService.removeAll();
      await this.drawService.setRoot(this.treeData);
      await this.drawService.draw();

      await result.push(node);
      await this.mergedArray.push(node);

      leftI++;
    }
    while(rightI < rightNode.value.length) {
      await this.sleep(this.mergeSleepTime);

      let node = await rightNode.value[rightI];
      await node.changeVisibility(false);

      await this.drawService.removeAll();
      await this.drawService.setRoot(this.treeData);
      await this.drawService.draw();

      await result.push(node);
      await this.mergedArray.push(node);

      rightI++;
    }

    await this.sleep(this.mergeSleepTime);

    this.changeVisibilityOfArray(this.beforeArray, false);
    this.changeVisibilityOfArray(this.afterArray, false);

    await this.drawService.removeAll();
    await this.drawService.setRoot(this.treeData);
    await this.drawService.draw();

    this.displayBefore = true;
    this.displayAfter = true;

    await this.sleep(this.mergeSleepTime);

    this.changeVisibilityOfArray(this.beforeArray, true);
    this.changeVisibilityOfArray(this.afterArray, true);

    await this.drawService.removeAll();
    await this.drawService.setRoot(this.treeData);
    await this.drawService.draw();

    this.mergedArray = [];
    this.beforeArray = [];
    this.afterArray = [];

    let leftIndex = await this.getIndexOfNode(leftNode.id);
    if(leftIndex !== -1) {
      await this.queue1.splice(leftIndex, 2, new Node(
        leftNode.parent.id,
        leftNode.parent.depth,
        result,
        leftNode.parent,
        null,
        null
      ));
    }

    return result;
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

  changeVisibilityOfArray(arr: Node[], visibility: boolean) {
    for(let a = 0; a < arr.length; a++) {
      arr[a].value.forEach(el => {
        el.changeVisibility(visibility);
      });
    }
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

        this.sleep(this.mergeSleepTime);

        merged.forEach(el => {
          el.changeColor('yellow');
          el.changeVisibility(true);
        });

        tree.value = merged;    
        tree.left = null;
        tree.right = null;

      } else {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;

        this.sleep(this.mergeSleepTime);

        await this.breadthTraverse(nodeLeft, depth);
        await this.breadthTraverse(nodeRight, depth);
      }
    }
  }

  generateRandomInput() {
    let input = [];
    let length = Math.floor(Math.random()*8+2);
    for(let l = 0; l < length; l++) {
      let num = Math.floor(Math.random()*200-100);
      input.push(num);
    }
    this.userText = input.join(" ");
    this.convertStringToArray();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearInputError() {
    this.input_error = "";
  }
}
