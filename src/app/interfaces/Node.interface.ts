export class Node {
    id: number;
    depth: number;
    parent?: Node;
    value: Array<number>;
    left?: Node;
    right?: Node;
}