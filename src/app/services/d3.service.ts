
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
    private root: HierarchyPointNode<Node>;
    private tree: TreeLayout<Node>;
    private parent: any;
    // private diagonal: any;
  
    constructor() {
    }

    public initialize() {
        this.width = window.innerWidth - this.margin.right - this.margin.left;
        this.height = window.innerHeight - this.margin.top - this.margin.bottom;
        this.parent = d3.select('.myTree');
        
        // console.log("flare inside", this.treeData);
        this.tree = tree<Node>();
        this.tree.size([this.height, this.width]);
        // this.root = this.tree(hierarchy<Node>(this.treeData));
        // this.draw(this.root);
    }

    public draw() { // conditional = whether or not draw the parent
        // let parent = d3
        //     .select('.myTree')
        //     .append('div')
        //     .classed('text-center display-parent', true);

        if(this.root) {
            this.drawRecursion(this.root.data);
        }

        // let i = 0;
        // this.root.data.value.forEach((e) => {
        //     parent
        //         .insert("p")
        //         .classed("integer", true)
        //         .text(e);
        //     i++;
        // });
    }

    public drawRecursion(data) {
        // let parent = d3.select('#depth' + data.depth);
        // if(parent._groups[0][0] == null) {
        //     parent = d3
        //         .select('.myTree')
        //         .append('div')
        //         .attr('id', 'depth' + data.depth);
        // }
        
        // console.log( d ? true : false);

        // parent.insert('div')
        //     .classed('text-center display-parent', true);

        if(!data.children) {
            let parent = d3
                .select('.myTree')
                .insert('div')
                .classed('text-center display-parent', true);

            let i = 0;
            data.value.forEach((e) => {
                parent
                    .insert('p')
                    .classed('integer', true)
                    .text(e);
                i++;
            });
        }
        else {
            this.drawRecursion(data.children[0]);
            this.drawRecursion(data.children[1]);
        }
    }

    public setRoot(treeData: Node) {
        this.root = this.tree(hierarchy<Node>(treeData));
    }

    public removeAll() {
        d3.select('.myTree')
            .selectAll('div')
            .remove();
    }
}
