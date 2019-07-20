
import {
    // hierarchy,
    HierarchyPointNode,
    TreeLayout,
    tree,
    hierarchy,
} from 'd3-hierarchy';

import { Injectable } from '@angular/core';
import { Node } from '../interfaces/Node.interface';
import * as d3 from 'd3';

// import 'rxjs/Rx';

@Injectable()
export class D3Service {
    private margin: any = { top: 20, right: 120, bottom: 20, left: 120 };
    private width: number;
    private height: number;
    // private root: HierarchyPointNode<Node>;
    private tree: TreeLayout<Node>;
    private svg: any;
    // private diagonal: any;
  
    constructor() {
    }

    public initialize() {
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

    public draw(root: HierarchyPointNode<Node>) {
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
          .text(function(d) { return d.data.value; })
        
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

    public d3Tree(treeData: Node) {
        return this.tree(hierarchy<Node>(treeData));
    }

    public removeAll() {
        d3.select('svg g.nodes').selectAll('*').remove();
    }
}
