
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';

@Injectable()
export class KruskalService {
    cy: cytoscape;
    vertices: Vertice[];
    edges: Edge[];
    kruskalEdges: Edge[];

    constructor() {
      this.vertices = [];
      this.edges = [];
      this.kruskalEdges = [];
    }

    public draw(id: string) {
      this.cy = cytoscape({
        container: document.getElementById(id),
        elements: {
          nodes: this.vertices,
          edges: (id == 'cy' ? this.edges : this.kruskalEdges)
        },
        layout: {
          name: 'circle',
          rows: 5
        },
        directed: false,
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(id)'
            }
          },
          {
            selector: 'edge',
            style: {
              'label': 'data(weight)'
            }
          }
        ]
        });
    }

    addVertice(vertice: Vertice) {
      this.vertices.push(vertice);
    }
    
    addEdge(edge: Edge) {
      this.edges.push(edge);
    }

    addKruskalEdge(edge: Edge) {
      this.kruskalEdges.push(edge);
    }
}
