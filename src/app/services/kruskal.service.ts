
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

  sleepTime = 1000;

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
    this.edges[edgeIndex].style.color = 'red';
    this.edges[edgeIndex].style.lineStyle = 'solid';

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
    let s = await this.findIndexInKruskalArray(edge.source.key);
    let t = await this.findIndexInKruskalArray(edge.target.key);
    
    let edgeIndex = await this.findIndexOfEdge(edge);
    this.edges[edgeIndex].style.color = 'blue';
    this.edges[edgeIndex].style.lineStyle = 'solid';
    this.draw('cy');
    await this.sleep(this.sleepTime);

    let ret = await (s === t && s !== -1);
    if(ret) {
      this.edges[edgeIndex].style.color = 'gray';
      this.edges[edgeIndex].style.lineStyle = 'dashed';
      this.draw('cy');
      await this.sleep(this.sleepTime);
    }
    return ret;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
