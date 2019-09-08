
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
        edges: this.edges.map(function(edge) {
          return {
            data: {
              id: edge.id,
              source: edge.source.value,
              target: edge.target.value,
              weight: edge.weight,
              kruskal: edge.kruskal
            }
          }
        })
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
            'line-color': function( edge ){
              return (edge.data('kruskal') ? 'red' : 'black');
            },
            'line-style': function( edge ){
              return (edge.data('kruskal') ? 'solid' : 'dashed');
            },
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
    let edgeIndex = await this.findIndexOfEdge(edge);
    this.edges[edgeIndex].kruskal = true;

    let source = edge.source.key;
    let target = edge.target.key;
    let s = await this.findIndexInKruskalArray(source);
    let t = await this.findIndexInKruskalArray(target);
    this.kruskalCyc[s] = (this.kruskalCyc[s]).concat(this.kruskalCyc[t]);
    this.kruskalCyc.splice(t, 1);
  }

  async findIndexOfEdge(edge: Edge) {
    let index = -1;
    for(let i = 0; i < this.edges.length; i++) {
      if(edge.id == this.edges[i].id) {
        index = i;
        break;
      }
    }
    return index;
  }

  async findIndexInKruskalArray(key: number) {
    let ret = -1;
    for(let i = 0; i < this.kruskalCyc.length; i++) {
      for(let j = 0; j < this.kruskalCyc[i].length; j++) {
        let v = this.kruskalCyc[i][j];
        if(v == key) {
          ret = i;
          break;
        }
      }
    }
    return ret;
  }

  async isKruskalCyclic(edge: Edge){
    let s = await this.findIndexInKruskalArray(edge.source.key);
    let t = await this.findIndexInKruskalArray(edge.target.key);
    return (s === t && s !== -1);
  }
}
