
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';

// import 'rxjs/Rx';

@Injectable()
export class KruskalService {
    cy: cytoscape;

    constructor() {
    }

    public draw() {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
              nodes: [
                {
                  data: { id: 'a' }
                },
                {
                  data: { id: 'b' }
                },
                {
                  data: { id: 'c' }
                },
                {
                  data: { id: 'd' }
                },
                {
                  data: { id: 'e' }
                },
                {
                  data: { id: 'f' }
                },
              ],
              edges: [
                {
                  data: { id: 'ab', source: 'a', target: 'b' }
                },
                {
                  data: { id: 'bc', source: 'b', target: 'c' }
                },
                {
                  data: { id: 'cd', source: 'c', target: 'd' }
                },
                {
                  data: { id: 'de', source: 'd', target: 'e' }
                },
                {
                  data: { id: 'ef', source: 'e', target: 'f' }
                },
                {
                  data: { id: 'fa', source: 'f', target: 'a' }
                },
                {
                  data: { id: 'cf', source: 'c', target: 'f' }
                },
                {
                  data: { id: 'ac', source: 'a', target: 'c' }
                },
              ]
            },
            layout: {
              name: 'circle',
              rows: 5
            },
            directed: true,
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

    public getKruskal() {
        return this.cy.elements().kruskal();
    }
}
