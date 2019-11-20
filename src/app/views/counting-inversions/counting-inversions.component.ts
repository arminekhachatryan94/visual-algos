import { 
  Component, 
  OnInit
} from '@angular/core';

import { Node } from '../../models/Node.model';
import { D3Service } from 'src/app/services/d3.service';
import { Element } from 'src/app/models/element.model';

@Component({
  selector: 'app-counting-inversions',
  templateUrl: './counting-inversions.component.html',
  styleUrls: ['./counting-inversions.component.css'],
})

export class CountingInversionsComponent implements OnInit {
  int_array = [];
  userText;
  input_error: string;
  ordering: string;
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

  message: string;

  constructor(private d3Service: D3Service) {
    this.userText = "";
    this.input_error = "";
    this.displayBefore = false;
    this.displayAfter = false;
    this.mergedArray = [];
    this.beforeArray = [];
    this.afterArray = [];
    this.inversions = '';
    this.speed = 1;
    this.paused = false;
    this.solving = false;
    this.message = '';
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

  async changeColorOfElementsInNode(node: Node, color: string) {
    for(let n = 0; n < node.value.length; n++) {
      await node.value[n].changeColor(color);
    }
  }

  async sleepWhilePaused() {
    if(this.paused) {
      while(this.paused) {
        await this.d3Service.sleep(this.mergeSleepTime);
        if(!this.solving) {
          return;
        }
      }
    } else {
      await this.d3Service.sleep(this.mergeSleepTime);
    }
  }

  async merge(leftNode, rightNode) {
    let result = [];
    this.afterArray = [];
    this.displayBefore = false;
    this.displayAfter = false;

    await this.sleepWhilePaused();
    if(!this.solving) {
      return;
    }

    await this.changeColorOfElementsInNode(leftNode, 'red');
    await this.changeColorOfElementsInNode(rightNode, 'blue');

    await this.d3Service.removeAll();
    await this.d3Service.setRoot(this.treeData);
    await this.d3Service.draw();

    await this.sleepWhilePaused();
    if(!this.solving) {
      return;
    }

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

    await this.sleepWhilePaused();
    if(!this.solving) {
      return;
    }

    // inversions
    if(leftNode.inversions !== '0' || rightNode.inversions !== '0') {
      let leftInversions = leftNode.inversions;
      let rightInversions = rightNode.inversions;
      this.inversions = leftInversions;
      this.message = 'Left array inversions ' + leftInversions;
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }
      this.inversions += ' + ';
      this.message += ' + ';
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }
      this.inversions += rightInversions;
      this.message += ' right array inversions ' + rightInversions;
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }
      this.inversions = parseInt(leftInversions) + parseInt(rightInversions) + '';
      this.message += ' = ' + this.inversions;
    } else {
      this.message = 'Inversions is 0.';
      this.inversions = '0';
    }
  
    let leftI = 0, rightI = 0;
    while (leftI < leftNode.value.length && rightI < rightNode.value.length) {
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }

      let node;
      let tempInversions = null, totalInversions = null;
      if(this.ordering == 'ASC') {
        if(parseFloat(leftNode.value[leftI].value) < parseFloat(rightNode.value[rightI].value)) {
          node = await leftNode.value[leftI];
          leftI++;
          this.message = 'First value of left array > first value of the right array, so bring down the first value of the left array.';
        } else {
          node = await rightNode.value[rightI];
          tempInversions = leftNode.value.length - leftI;
          totalInversions = tempInversions + parseInt(this.inversions);
          rightI++;
          this.message = 'First value of right array > first value of left array, so bring down the first value of the right array.';
        }
      } else {
        if (parseFloat(leftNode.value[leftI].value) > parseFloat(rightNode.value[rightI].value)) {
          node = await leftNode.value[leftI];
          leftI++;
          this.message = 'First value of left array > first value of the right array, so bring down the first value of the left array.';
        } else {
          node = await rightNode.value[rightI];
          tempInversions = leftNode.value.length - leftI;
          totalInversions = tempInversions + parseInt(this.inversions);
          rightI++;
          this.message = 'First value of right array > first value of the left array, so bring down the first value of the right array.';
        }
      }
      node.changeVisibility(false);

      await this.d3Service.removeAll();
      await this.d3Service.setRoot(this.treeData);
      await this.d3Service.draw();

      await result.push(node);
      await this.mergedArray.push(node);
      
      if(tempInversions !== null || totalInversions !== null) {
        await this.sleepWhilePaused();
        if(!this.solving) {
          return;
        }
        this.message = 'Add size of left array to number of inversions.';
        this.inversions += ' + ';
        await this.sleepWhilePaused();
        if(!this.solving) {
          return;
        }
        this.inversions += tempInversions;
        await this.sleepWhilePaused();
        if(!this.solving) {
          return;
        }
        this.inversions = totalInversions + '';
        await this.sleepWhilePaused();
        if(!this.solving) {
          return;
        }
      }
    }
    while(leftI < leftNode.value.length) {
      this.message = 'There are no more elements in the right array, so bring down the remaining values of the left array.';
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }

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
      this.message = 'There are no more elements in the left array, so bring down the remaining values of the right array.';
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }

      let node = await rightNode.value[rightI];
      await node.changeVisibility(false);

      await this.d3Service.removeAll();
      await this.d3Service.setRoot(this.treeData);
      await this.d3Service.draw();

      await result.push(node);
      await this.mergedArray.push(node);

      rightI++;
    }

    await this.sleepWhilePaused();
    if(!this.solving) {
      return;
    }

    this.changeVisibilityOfArray(this.beforeArray, false);
    this.changeVisibilityOfArray(this.afterArray, false);

    await this.d3Service.removeAll();
    await this.d3Service.setRoot(this.treeData);
    await this.d3Service.draw();

    this.displayBefore = true;
    this.displayAfter = true;

    await this.sleepWhilePaused();
    if(!this.solving) {
      return;
    }

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

  pauseContinue() {
    this.paused = !this.paused;
  }

  async algorithm() {
    this.solving = true;
    this.queue1 = [];
    this.maxDepth = 0;
    this.queue1.push(this.treeData);
    this.num_nodes++;
    await this.breadthSplit();
    if(!this.solving) {
      return;
    }
    this.message = '';
    await this.breadthMerge();
    this.paused = true;
  }

  async breadthSplit() {
    while(this.queue1.length < this.int_array.length) {
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }

      let node = this.queue1.shift();

      if(node.value.length > 1) {
        var mid = Math.floor(node.value.length / 2);
        
        var subLeft = node.value.slice(0, mid);
        var subRight = node.value.slice(mid);

        this.message = 'Split [' + node.value.map(function(el) {
          return el.value;
        }).join(', ') + '] into two arrays: \n\n[' + subLeft.map(function(el) {
          return el.value;
        }).join(', ') + '] and [' + subRight.map(function(el) {
          return el.value;
        }).join(', ') + '].';

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
    
        await this.sleepWhilePaused();
        if(!this.solving) {
          return;
        }
      } else {
        this.queue1.push(node);
      }
    }
  }

  async breadthMerge() {
    for(let depth = this.maxDepth-1; depth >= 0; depth--) {
      await this.sleepWhilePaused();
      if(!this.solving) {
        return;
      }

      await this.breadthTraverse(this.treeData, depth);
      this.d3Service.removeAll();
      this.d3Service.setRoot(this.treeData);
      this.d3Service.draw();
    }
  }

  async breadthTraverse(tree, depth) {
    if(this.paused) {
      return;
    }
    if(tree.left && tree.right) {
      if(tree.depth === depth) {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;

        let merged = await this.merge(nodeLeft, nodeRight);
        if(!this.solving) {
          return;
        }    

        merged.forEach(el => {
          el.changeColor('yellow');
          el.changeVisibility(true);
        });

        this.message = 'Merge [' + nodeLeft.value.map(function(el) {
          return el.value;
        }).join(', ') + '] and [' + nodeRight.value.map(function(el) {
          return el.value
        }).join(', ') + '], so you have [' + merged.map(function(el) {
          return el.value;
        }) + '].';

        tree.value = merged;
        tree.setInversions(this.inversions);
        this.inversions = '';
        await this.d3Service.sleep(this.mergeSleepTime);
        tree.left = null;
        tree.right = null;

      } else {
        let nodeLeft = tree.left;
        let nodeRight = tree.right;

        await this.breadthTraverse(nodeLeft, depth);
        if(!this.solving) {
          return;
        }    
        await this.breadthTraverse(nodeRight, depth);
        if(!this.solving) {
          return;
        }    
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

  clearInputError() {
    this.input_error = "";
  }

  reset() {
    this.solving = false;
    this.treeData.left = null;
    this.treeData.right = null;
    this.paused = false;
    this.displayBefore = false;
    this.displayAfter = false;
    this.beforeArray = [];
    this.afterArray = [];
    this.mergedArray = [];
    this.queue1 = [];
    this.inversions = '';
    this.message = '';
    this.validateInput();
  }
}
