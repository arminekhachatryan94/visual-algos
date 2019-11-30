import { Pair } from './pair.model';

export class Vertice {
    id: Pair;
    color: string;
    shape: string;

    constructor(id: Pair) {
        this.id = id;
        this.color = 'black';
        this.shape = 'circle';
    }

    changeColor(color: string) {
        this.color = color;
    }

    changeShape(shape: string) {
        this.shape = shape;
    }
}