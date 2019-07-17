import { 
  Component, 
  OnInit, 
  ViewChildren, 
  QueryList, 
  ChangeDetectionStrategy, 
  ElementRef 
} from '@angular/core';

import {
  hierarchy,
  HierarchyPointNode,
  TreeLayout,
  tree,
} from 'd3-hierarchy'

import * as d3 from 'd3';

import { Node } from '../../interfaces/Node.interface';

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
  private margin: any = { top: 20, right: 120, bottom: 20, left: 120 };
  private width: number;
  private height: number;
  private root: HierarchyPointNode<Node>;
  private tree: TreeLayout<Node>;
  private svg: any;
  private diagonal: any;

  @ViewChildren("treeBreak") treeBreakRef : QueryList<ElementRef>;
  @ViewChildren("treeMerge") treeMergeRef : QueryList<ElementRef>;

  treeBreakArr = [];
  treeMergeArr = [];

  mergeSleepTime = 500;

  constructor() {
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
    //   data: '["1","0","5"]',
    //   children: []
    // }

    this.width = 720 - this.margin.right - this.margin.left;
    this.height = 640 - this.margin.top - this.margin.bottom;
    this.svg = d3.select('.myTree').append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("class", "g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    d3.select('svg g.g')
      .append("g")
      .attr("class", "links");
    d3.select('svg g.g')
      .append("g")
      .attr("class", "nodes");
    
    // console.log("flare inside", this.treeData);
    this.tree = tree<Node>();
    this.tree.size([this.height, this.width]);
    // this.root = this.tree(hierarchy<Node>(this.treeData));
    // this.draw(this.root);
  }

  private draw(root: HierarchyPointNode<Node>) {
    // Nodes
    var parent = d3.select('svg g.nodes')
      .selectAll('circle.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('style', "fill: #fff;stroke: #ccc;stroke-width: 3px;")
      .attr('x', function (d) { return d.x-20; })
      .attr('y', function (d) { return d.y-20; })
      .attr('width', ()=>{ return "40px"})
      .attr('height', ()=>{ return "40px"});

    parent.append('rect')
      .classed('node', true)
      .attr('style', "fill: #fff;stroke: #ccc;stroke-width: 3px;")
      .attr('x', function (d) { return d.x-20; })
      .attr('y', function (d) { return d.y-20; })
      .attr('width', ()=>{ return "40px"})
      .attr('height', ()=>{ return "40px"});

    parent.append('text')
      .attr('style', "fill: #000;stroke: #000;stroke-width: 1px;")
      .attr("dy", "1em")
      .attr('x', function (d) { return d.x-20; })
      .attr('y', function (d) { return d.y-20; })
      .attr("text-anchor", function(d) { return d.children || d.children ? "end" : "start";})
      .text(function(d) { return d.data.data; })
    
    // Links
    d3.select('svg g.links')
      .selectAll('line.link')
      .data(root.links())
      .enter()
      .append('line')
      .classed('link', true)
      .attr('style', "stroke: #ccc;stroke-width: 3px;")
      .attr('x1', function (d) { return d.source.x; })
      .attr('y1', function (d) { return d.source.y; })
      .attr('x2', function (d) { return d.target.x; })
      .attr('y2', function (d) { return d.target.y; });
  
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
    /*
    for(let i = 0; i < this.int_array.length; i++) {
      let el_style = document.getElementById('' + i).style
      el_style.removeProperty('leftMargin');
      // console.log(el_style);
    }
    */
  }

  validateInput() {
    this.clearMargins();
    let arr = this.userText.replace(/\s+/g,' ').trim().split(" ");
    arr.forEach(value => {
      if(!this.isNumeric(value)) {
        // console.log(value + " : invalid");
        this.input_error = "Error in input.";
        return false;
      } else {
        this.treeData = {
          depth: 0,
          parent: -1,
          data: arr
        };
        this.root = this.tree(hierarchy<Node>(this.treeData));
        this.draw(this.root);
      }
    });
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
      this.height_array = [];
    
      var height = (Math.log2(this.int_array.length)+2);

      console.log("height of merge tree:", height);

      for (let index = 0; index < height; index++) {
        this.height_array.push(index);
      }

      while(this.treeBreakArr.length < height && this.treeMergeArr.length < height)
      {
        await this.sleep(10);
      }

      this.treeData.data = JSON.stringify(this.int_array);

      this.tree = tree<Node>();
      this.tree.size([this.height, this.width]);
      this.root = this.tree(hierarchy<Node>(this.treeData));
      this.draw(this.root);


      //console.log(this.treeBreakArr);
      this.treeBreakArr.forEach(el=>{
        el.nativeElement.innerHTML = "";
      })
      this.treeMergeArr.forEach(el=>{
        el.nativeElement.innerHTML = "";
      })

      this.treeBreakArr[0].nativeElement.innerHTML = "start: "+JSON.stringify(this.int_array);
    
      await this.mergeSort(this.int_array, 0,1).then((res) => {
        this.treeMergeArr[0].nativeElement.innerHTML += "end: "+JSON.stringify(res);
      });
      this.clearMargins();
    }
    this.disable_solve = false;
  }

  async mergeSort (arr, index, depth) {
    if (arr.length < 2) {
      await this.sleep(this.mergeSleepTime);
      this.treeBreakArr[depth].nativeElement.innerHTML += "node: "+JSON.stringify(arr) + " ";
      return await arr;
    }
    
    var mid = Math.floor(arr.length / 2);
    
    var subLeft = arr.slice(0, mid);

    var subRight = arr.slice(mid);

    await this.sleep(this.mergeSleepTime);

    this.treeBreakArr[depth].nativeElement.innerHTML += "left: "+JSON.stringify(subLeft)+"right: "+JSON.stringify(subRight)+" ";
    
    await this.mergeSort(subLeft, index, depth+1).then((res) => {
      subLeft = res;
    }).catch(console.log);

    await this.sleep(this.mergeSleepTime);
    
    await this.mergeSort(subRight, index + subLeft.length,depth+1).then((res) => {
      subRight = res;
    }).catch(console.log);

    await this.sleep(this.mergeSleepTime);
    
    var merged = await this.merge(subLeft, subRight, index);

    this.treeMergeArr[depth].nativeElement.innerHTML += "merged: "+JSON.stringify(merged);

    await this.sleep(this.mergeSleepTime);

    return merged; 
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  merge (left, right, index) {
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
      console.log(left, right)
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
