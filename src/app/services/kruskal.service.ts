
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';

@Injectable()
export class KruskalService {
    cy: cytoscape;
    vertices: Vertice[];
    edges: Edge[];

    constructor() {
      this.vertices = [];
      this.edges = [];
    }

    public draw() {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
              nodes: this.vertices,
              edges: this.edges
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

    public getKruskal() {
        return this.cy.elements().kruskal();
    }
}
