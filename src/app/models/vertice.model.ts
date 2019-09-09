import { Pair } from './pair.model';

export class Vertice {
    id: Pair;
    kruskal: boolean;

    constructor(id: Pair) {
        this.id = id;
        this.kruskal = false;
    }

}