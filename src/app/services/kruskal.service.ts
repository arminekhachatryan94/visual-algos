
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';
import { LinkedList } from 'linked-list-typescript';

@Injectable()
export class KruskalService {
  cy: cytoscape;
  vertices: Vertice[];
  edges: Edge[];
  kruskalEdges: Edge[];
  adj: LinkedList<Vertice>[];
  kruskalCyc: Number[][];
  visited: boolean[];

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.kruskalEdges = [];
    this.adj = [];
    this.visited = [];
    this.kruskalCyc = [];
  }

  public draw(id: string) {
    this.cy = cytoscape({
      container: document.getElementById(id),
      elements: {
        nodes: this.vertices.map(function(vertice) {
          return {
            data: {
              id: vertice.id.value
            }
          }
        }),
        edges: (
          id == 'cy'
          ? this.edges.map(function(edge) {
            return {
              data: {
                id: edge.id,
                source: edge.source.value,
                target: edge.target.value,
                weight: edge.weight
              }
            }
          }) : this.kruskalEdges.map(function(edge) {
            return {
              data: {
                id: edge.id,
                source: edge.source.value,
                target: edge.target.value,
                weight: edge.weight
              }
            }
          })
        )
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
            'label': 'data(id)',
            'background-color': 'orange',
            'color': 'black'
          }
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(weight)',
            'line-color': 'pink',
            'line-style': 'dashed',
            'color': 'magenta'
          }
        }
      ]
    });
  }

  addVertice(vertice: Vertice) {
    this.vertices.push(vertice);
    let list = new LinkedList<Vertice>();
    this.adj.push(list);
    this.visited.push(false);
    this.kruskalCyc.push([vertice.id.key]);
  }
  
  addEdge(edge: Edge) {
    this.edges.push(edge);
    
    let source = edge.source.key;
    let target = edge.target.key;
    this.adj[source].append(this.vertices[target]);
    this.adj[target].append(this.vertices[source]);
  }

  async addKruskalEdge(edge: Edge) {
    this.kruskalEdges.push(edge);

    let source = edge.source.key;
    let target = edge.target.key;
    let s = await this.findIndexInKruskalArray(source);
    let t = await this.findIndexInKruskalArray(target);
    console.log(this.kruskalCyc, s, t);
    // console.log(this.kruskalCyc[source], this.kruskalCyc[target]);
    this.kruskalCyc[s] = (this.kruskalCyc[s]).concat(this.kruskalCyc[t]);
    this.kruskalCyc.splice(t, 1);
  }

  async findIndexInKruskalArray(key: number) {
    for(let i = 0; i < this.kruskalCyc.length; i++) {
      await this.kruskalCyc[i].forEach(v => {
        // console.log(v, key);
        if(v === key) {
          return i;
        }
      });
    }
    return -1;
  }

  async isKruskalCyclic(edge: Edge){
    let s = await this.findIndexInKruskalArray(edge.source.key);
    let t = await this.findIndexInKruskalArray(edge.target.key);
    return (s === t && s !== -1);
  }
}
