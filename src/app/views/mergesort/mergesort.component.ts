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
  // private margin: any = { top: 20, right: 120, bottom: 20, left: 120 };
  // private width: number;
  // private height: number;
  private root: HierarchyPointNode<Node>;
  // private tree: TreeLayout<Node>;
  // private svg: any;
  // private diagonal: any;

  @ViewChildren("treeBreak") treeBreakRef : QueryList<ElementRef>;
  @ViewChildren("treeMerge") treeMergeRef : QueryList<ElementRef>;

  treeBreakArr = [];
  treeMergeArr = [];

  mergeSleepTime = 1000;

  constructor(private d3Service: D3Service) {
    this.userText = "";
    this.input_error = "";
    this.disable_solve = false;
  }

  ngOnInit() {
    this.ordering = 'ASC';
    this.int_array = [];
  }

  ngAfterContentInit(){
    // this.treeData = {
    //   depth: 0,
    //   parent: -1,
    //   value: '["1","0","5"]',
    //   children: []
    // }
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
        // console.log(value + " : invalid");
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

  queue1: Node[];

  async sortArray() {
    this.disable_solve = true;
    if(!this.input_error.length && this.int_array.length) {
      this.queue1 = [];
      this.queue1.push(this.treeData);
      this.split();
    }
    this.disable_solve = false;
  }

  async split() {
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

        node.children = [
          leftNode,
          rightNode
        ];

        this.queue1.push(leftNode);
        this.queue1.push(rightNode);

        this.d3Service.removeAll();
        this.d3Service.setRoot(this.treeData);
        this.d3Service.draw();
    
        await this.sleep(this.mergeSleepTime);
      }
    }
    console.log(this.treeData);
  }

  merge() {
    ;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearInputError() {
    this.input_error = "";
  }
}
