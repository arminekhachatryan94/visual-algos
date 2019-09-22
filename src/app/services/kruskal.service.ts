
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';
import { LinkedList } from 'linked-list-typescript';
import { Pair } from '../models/pair.model';

@Injectable()
export class KruskalService {
  cy: cytoscape;
  vertices: Vertice[];
  edges: Edge[];
  kruskalEdges: Edge[];
  adj: LinkedList<Vertice>[];
  kruskalCyc: Number[][];
  visited: boolean[];
  tapped: boolean;

  sleepTime = 1000;

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.kruskalEdges = [];
    this.adj = [];
    this.visited = [];
    this.kruskalCyc = [];
    this.tapped = false;
  }

  public draw() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: {
        nodes: this.vertices.map(function(vertice) {
          return {
            data: {
              id: vertice.id.value,
              kruskal: vertice.kruskal
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
              style: edge.style
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
            'background-color': function(v) {
              return (v.data('kruskal') ? 'red' : 'black');
            },
            'color': 'white',
            'text-halign': 'center',
            'text-valign': 'center'
          }
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(weight)',
            'line-color': 'data(style.color)',
            'line-style': 'data(style.lineStyle)',
            'width': '2px',
            'color': 'data(style.color)',
            'text-background-color': 'white',
            'text-background-opacity': '1',
            'text-background-padding': '3px'
          }
        }
      ]
    });
    // console.log('draw', this.vertices);
    // this.verticeClickEvent();
  }

  // clickEvent(event) {
  //   console.log('click', this);
  //   let x = event.position.x;
  //   let y = event.position.y;
  //   // let v = new Vertice(new Pair(this.vertices.length, this.vertices.length+''));
  //   // this.vertices.push(v);
  //   console.log(x, y);
  // }

  // verticeClickEvent() {
  //   this.cy.on('tap', this.clickEvent).bind(this);
  // }

  addVertice(vertice: Vertice) {
    this.vertices.push(vertice);
    let list = new LinkedList<Vertice>();
    this.adj.push(list);
    this.visited.push(false);
    this.kruskalCyc.push([vertice.id.key]);
  }

  removeLastVertice() {
    this.vertices.pop();
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
    // let edgeIndex = await this.findIndexOfEdge(edge);

    let source = edge.source.key;
    let target = edge.target.key;
    let s = await this.findIndexInKruskalArray(source);
    let t = await this.findIndexInKruskalArray(target);
    this.kruskalCyc[s] = (this.kruskalCyc[s]).concat(this.kruskalCyc[t]);
    this.kruskalCyc.splice(t, 1);
    
    let v1 = await this.findIndexOfVertice(source);
    let v2 = await this.findIndexOfVertice(target);
    this.vertices[v1].kruskal = true;
    this.vertices[v2].kruskal = true;
  }

  async removeKruskalEdge(edge: Edge) {
    let i = 0;
    for(i = 0; i < this.kruskalEdges.length; i++) {
      if(edge.id === this.kruskalEdges[i].id) {
        break;
      }
    }

    let v1 = await this.findIndexOfVertice(edge.source.key);
    let v2 = await this.findIndexOfVertice(edge.target.key);
    this.vertices[v1].kruskal = false;
    this.vertices[v2].kruskal = false;

    this.kruskalEdges = this.kruskalEdges.splice(i, 1);
    return this.kruskalEdges;
    // console.log(this.kruskalEdges);
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

  async findIndexOfVertice(key: number) {
    let index = -1;
    for(let i = 0; i < this.vertices.length; i++) {
      if(this.vertices[i].id.key == key) {
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
    // console.log(this.kruskalCyc);
    let s = await this.findIndexInKruskalArray(edge.source.key);
    let t = await this.findIndexInKruskalArray(edge.target.key);

    let ret = await (s === t && s !== -1);
    return ret;
  }

  reset() {
    for(let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].kruskal = false;
    }
    for(let i = 0; i < this.edges.length; i++) {
      this.edges[i].resetStyle();
    }
  }

  getKruskalArray() {
    return [...this.kruskalCyc];
  }

  setKruskalArray(kruskalCyc) {
    this.kruskalCyc = [...kruskalCyc];
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async changeEdgeStyle(edge: Edge, color: string) {
    let indexEdge = await this.findIndexOfEdge(edge);
    let style = await {color: 'black', lineStyle: 'dashed'};

    if(color === 'blue') {
      style = await {color: 'blue', lineStyle: 'solid'};
    }
    if(color === 'red') {
      style = await {color: 'red', lineStyle: 'solid'};
    }
    if(color === 'gray') {
      style = await {color: 'gray', lineStyle: 'dashed'};
    }

    await this.edges[indexEdge].setStyle(style);
  }
}
