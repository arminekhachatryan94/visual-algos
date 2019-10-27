
import {
    // hierarchy,
    HierarchyPointNode,
    TreeLayout,
    tree,
    hierarchy,
} from 'd3-hierarchy';

import { Injectable } from '@angular/core';
import { Node } from '../models/Node.model';
import * as d3 from 'd3';

@Injectable()
export class MergesortService {
    private margin: any = { top: 20, right: 120, bottom: 20, left: 120 };
    private width: number;
    private height: number;
    private root: HierarchyPointNode<Node>;
    private tree: TreeLayout<Node>;
    private parent: any;
  
    constructor() {
    }

    public initialize() {
        this.width = window.innerWidth - this.margin.right - this.margin.left;
        this.height = window.innerHeight - this.margin.top - this.margin.bottom;
        this.parent = d3.select('.myTree');
        this.tree = tree<Node>();
        this.tree.size([this.height, this.width]);
    }

    public draw() {
        if(this.root) {
            this.drawRecursion(this.root.data);
        }
    }

    public drawRecursion(data) {
        if(!(data.left && data.right)) {
            let parent = d3
                .select('.myTree')
                .insert('div')
                .classed('text-center display-parent', true);

            let i = 0;
            data.value.forEach((e) => {
                parent
                    .insert('p')
                    .classed('integer', true)
                    .style('background-color', e.background)
                    .style('border-color', e.border)
                    .style('visibility', e.visibility ? 'visible' : 'hidden')
                    .text(e.value);
                i++;
            });
        } else {
            this.drawRecursion(data.left);
            this.drawRecursion(data.right);
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
