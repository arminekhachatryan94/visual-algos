import { Pair } from './pair.model';

export class Edge {
    id: string;
    source: Pair;
    target: Pair;
    weight: string;
    style: {
        color: string,
        lineStyle: string
    };

    constructor(id: string, source: Pair, target: Pair, weight: string) {
        this.id = id;
        this.source = source,
        this.target = target;
        this.weight = weight;
        this.style = {
            color: 'black',
            lineStyle: 'dashed'
        };
    }

    resetStyle() {
        this.style = {
            color: 'black',
            lineStyle: 'dashed'
        };
    }

    setStyle(style: {color: string, lineStyle: string}) {
        this.style = {
            color: style.color,
            lineStyle: style.lineStyle
        };
    }
}