import { Pair } from './pair.model';

export class Vertice {
    id: Pair;
    color: string;

    constructor(id: Pair) {
        this.id = id;
        this.color = 'black';
    }
}