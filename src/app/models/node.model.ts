import { Element } from './element.model';

export class Node {
    id: number;
    depth: number;
    value: Element[];
    parent: Node;
    left: Node;
    right: Node;

    constructor(
        id: number,
        depth: number,
        val: Element[],
        parent: Node,
        left: Node,
        right: Node
    ) {
        this.id = id;
        this.depth = depth;
        this.value = val;
        this.parent = parent;
        this.left = left;
        this.right = right;
    }
}