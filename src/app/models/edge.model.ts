import { Pair } from './pair.model';

export class Edge {
    id: string;
    source: Pair;
    target: Pair;
    weight: number;
    kruskal: boolean;

    constructor(id: string, source: Pair, target: Pair, weight: number, kruskal: boolean) {
        this.id = id;
        this.source = source,
        this.target = target;
        this.weight = weight;
        this.kruskal = kruskal;
    }

}