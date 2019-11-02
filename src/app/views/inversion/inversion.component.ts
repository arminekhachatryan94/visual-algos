import { 
  Component, 
  OnInit
} from '@angular/core';

import { Node } from '../../models/Node.model';
import { D3Service } from 'src/app/services/d3.service';
import { Element } from 'src/app/models/element.model';

@Component({
  selector: 'app-inversion',
  templateUrl: './inversion.component.html',
  styleUrls: ['./inversion.component.css'],
})

export class InversionComponent implements OnInit {
  int_array = [];
  // height_array = [];
  userText;
  input_error: String;
  ordering: String;
  // solutionType: String;
  num_nodes: number;
  paused: boolean;
  solving: boolean;

  treeData : Node;

  displayBefore: boolean;
  displayAfter: boolean;
  beforeArray: Node[];
  afterArray: Node[];
  mergedArray: Element[];
  queue1: Node[];
  maxDepth: number;

  inversions: string;

  mergeSleepTime = 2000;
  speed: number;

  constructor(private d3Service: D3Service) {
    this.userText = "";
    this.input_error = "";
    this.displayBefore = false;
    this.displayAfter = false;
    this.mergedArray = [];
    this.beforeArray = [];
    this.afterArray = [];
    // this.solutionType = 'breadth';
    this.inversions = '';
    this.speed = 1;
    this.paused = true;
    this.solving = false;
  }

  ngOnInit() {
    this.ordering = 'ASC';
    this.int_array = [];
    this.num_nodes = 0;
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
        this.treeData = new Node(0, 0, [], null, null, null);
        this.d3Service.setRoot(this.treeData);
        this.d3Service.draw();
        return false;
      }
    });
    let elements = [];
    for(let i = 0; i < arr.length; i++) {
      elements.push(new Element(arr[i], 'yellow'));
    }
    this.treeData = new Node(0, 0, elements, null, null, null);
    this.d3Service.setRoot(this.treeData);
    this.d3Service.draw();
    return true;
  }

  // async sortArray() {
  //   this.solving = true;
  //   this.paused = !this.paused;
  //   this.inversions = '';
  //   if(!this.input_error.length && this.int_array.length) {
  //     // if(this.solutionType === 'breadth') {
  //       // breadth
  //       this.queue1 = [];
  //       this.maxDepth = 0;
  //       this.queue1.push(this.treeData);
  //       this.num_nodes++;
  //       await this.breadthSplit();
  //       await this.breadthMerge();
  //     // } else {
  //       // depth
  //       // await this.depthMergeSort(this.int_array, 0, 1, this.treeData);
  //     // }
  //   this.paused = false;
  //   }
  // }

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

    await this.d3Service.removeAll();
    await this.d3Service.setRoot(this.treeData);
    await this.d3Service.draw();

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

    await this.sleep(this.mergeSleepTime);

    // inversions
    if(leftNode.inversions !== '' || rightNode.inversions !== '') {
      let tempLeft = leftNode.inversions !== '' ? leftNode.inversions : '0';
      let tempRight = rightNode.inversions !== '' ? rightNode.inversions : '0';
      this.inversions = tempLeft;
      leftNode.setInversions('');
      await this.sleep(this.mergeSleepTime);
      this.inversions += ' + ';
      await this.sleep(this.mergeSleepTime);
      this.inversions += tempRight;
      rightNode.setInversions('');
      await this.sleep(this.mergeSleepTime);
      this.inversions = parseInt(tempLeft) + parseInt(tempRight) + '';
      await this.sleep(this.mergeSleepTime);
    } else {
      this.inversions = '0';
      await this.sleep(this.mergeSleepTime);
    }
  
    let leftI = 0, rightI = 0;
    while (leftI < leftNode.value.length && rightI < rightNode.value.length) {
      await this.sleep(this.mergeSleepTime);

      let node;
      let tempInversions = null, totalInversions = null;
      if(this.ordering == 'ASC') {
        if(parseFloat(leftNode.value[leftI].value) < parseFloat(rightNode.value[rightI].value)) {
          node = await leftNode.value[leftI];
          leftI++;
        } else {
          node = await rightNode.value[rightI];
          tempInversions = leftNode.value.length - leftI;
          totalInversions = tempInversions + parseInt(this.inversions);
          rightI++;
        }
      } else {
        if (parseFloat(leftNode.value[leftI].value) > parseFloat(rightNode.value[rightI].value)) {
          node = await leftNode.value[leftI];
          leftI++;
        } else {
          node = await rightNode.value[rightI];
          tempInversions = leftNode.value.length - leftI;
          totalInversions = tempInversions + parseInt(this.inversions);
          rightI++;
        }
      }
      node.changeVisibility(false);

      await this.d3Service.removeAll();
      await this.d3Service.setRoot(this.treeData);
      await this.d3Service.draw();

      await result.push(node);
      await this.mergedArray.push(node);
      
      if(tempInversions !== null || totalInversions !== null) {
        await this.sleep(this.mergeSleepTime);
        this.inversions += ' + ';
        await this.sleep(this.mergeSleepTime);
        this.inversions += tempInversions;
        await this.sleep(this.mergeSleepTime);
        this.inversions = totalInversions + '';
        await this.sleep(this.mergeSleepTime);
      }
    }
    while(leftI < leftNode.value.length) {
      await this.sleep(this.mergeSleepTime);

      let node = await leftNode.value[leftI];
      await node.changeVisibility(false);

      await this.d3Service.removeAll();
      await this.d3Service.setRoot(this.treeData);
      await this.d3Service.draw();

      await result.push(node);
      await this.mergedArray.push(node);

      leftI++;
    }
    while(rightI < rightNode.value.length) {
      await this.sleep(this.mergeSleepTime);

      let node = await rightNode.value[rightI];
      await node.changeVisibility(false);

      await this.d3Service.removeAll();
      await this.d3Service.setRoot(this.treeData);
      await this.d3Service.draw();

      await result.push(node);
      await this.mergedArray.push(node);

      rightI++;
    }

    await this.sleep(this.mergeSleepTime);

    this.changeVisibilityOfArray(this.beforeArray, false);
    this.changeVisibilityOfArray(this.afterArray, false);

    await this.d3Service.removeAll();
    await this.d3Service.setRoot(this.treeData);
    await this.d3Service.draw();

    this.displayBefore = true;
    this.displayAfter = true;

    await this.sleep(this.mergeSleepTime);

    this.changeVisibilityOfArray(this.beforeArray, true);
    this.changeVisibilityOfArray(this.afterArray, true);

    this.mergedArray = [];
    this.beforeArray = [];
    this.afterArray = [];

    let leftIndex = await this.getIndexOfNode(leftNode.id);
    if(leftIndex !== -1) {
      let m = new Node(
        leftNode.parent.id,
        leftNode.parent.depth,
        result,
        leftNode.parent,
        null,
        null
      );
      this.queue1.splice(leftIndex, 2, m);
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

  async algorithm() {
    if(!this.solving) {
      this.solving = true;
      this.queue1 = [];
      this.maxDepth = 0;
      this.queue1.push(this.treeData);
      this.num_nodes++;
    }
    this.paused = !this.paused;
    if(!this.paused) {
      console.log('running');
      await this.breadthSplit();
      await this.breadthMerge();
      this.paused = true;
    }
  }

  async breadthSplit() {
    while(this.queue1.length < this.int_array.length) {
      if(this.paused) {
        break;
      }

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
    for(let depth = this.maxDepth-1; depth >= 0; depth--) {
      if(this.paused) {
        break;
      }
      await this.breadthTraverse(this.treeData, depth);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }
  }

  async breadthTraverse(tree, depth) {
    if(tree.left && tree.right) {
      if(tree.depth === depth) {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;

        let merged = await this.merge(nodeLeft, nodeRight);

        merged.forEach(el => {
          el.changeColor('yellow');
          el.changeVisibility(true);
        });

        tree.value = merged;
        tree.setInversions(this.inversions);
        this.inversions = '';
        await this.sleep(this.mergeSleepTime);
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

  slower() {
    this.mergeSleepTime *= 2;
    this.speed /= 2;
  }

  faster() {
    this.mergeSleepTime /= 2;
    this.speed *= 2;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearInputError() {
    this.input_error = "";
  }
}
