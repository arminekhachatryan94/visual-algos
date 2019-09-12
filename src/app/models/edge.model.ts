import { Pair } from './pair.model';

export class Edge {
    id: string;
    source: Pair;
    target: Pair;
    weight: number;
    style: {
        color: string,
        lineStyle: string
    };

    constructor(id: string, source: Pair, target: Pair, weight: number) {
        this.id = id;
        this.source = source,
        this.target = target;
        this.weight = weight;
        this.style = {
            color: 'black',
            lineStyle: 'dashed'
        };
    }
}