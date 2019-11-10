import { Vertice } from './vertice.model';
import { Edge } from 'src/app/models/edge.model';

export class Graph {
    vertices: Vertice[];
    edges: Edge[];

    constructor(
        vertices = [],
        edges = []
    ) {
        this.vertices = vertices;
        this.edges = edges;
    }

    addVertice(vertice: Vertice) {
        this.vertices.push(vertice);
    }

    addEdge(edge: Edge) {
        this.edges.push(edge);
    }
}