import { Vertice } from './vertice.model';
import { Edge } from 'src/app/models/edge.model';
import { Pair } from './pair.model';

export class Graph {
    vertices: Vertice[];
    edges: Edge[];
    subVertices: number[];
    name: string;
    minMax: number;

    constructor(size_vertices: number) {
        this.vertices = [];
        for(let i = 0; i < size_vertices; i++) {
            this.vertices.push(new Vertice(new Pair(i, i + '')));
        }
        this.edges = [];
        this.minMax = 0;
    }

    addEdge(source: number, target: number, weight: number) {
        this.edges.push(
            new Edge(
                'e' + source + '-' + target,
                new Pair(source, source + ''),
                new Pair(target, target + ''),
                weight + ''
            )
        );
    }

    addSubVertices(subs: number[]) {
        this.subVertices = subs;
    }

    setName(name: string) {
        this.name = name;
    }

    setMinMax(minMax: number) {
        this.minMax = minMax;
    }
}