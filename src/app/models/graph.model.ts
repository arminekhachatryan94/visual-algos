import { Vertice } from './vertice.model';
import { Edge } from 'src/app/models/edge.model';
import { Pair } from './pair.model';

export class Graph {
    vertices: Vertice[];
    edges: Edge[];

    constructor(size_vertices: number) {
        this.vertices = [];
        for(let i = 0; i < size_vertices; i++) {
            this.vertices.push(new Vertice(new Pair(i, i + '')));
        }
        this.edges = [];
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
}