
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
  kruskalAdj: LinkedList<Vertice>[];
  visited: boolean[];

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.kruskalEdges = [];
    this.adj = [];
    this.kruskalAdj = [];
    this.visited = [];
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

  findVerticeIndex(val): number {
    for(let i = 0; i < this.vertices.length; i++) {
      if(this.vertices[i].data.id == val) {
        return i;
      }
    }
    return -1;
  }

  addVertice(vertice: Vertice) {
    this.vertices.push(vertice);
    let list = new LinkedList<Edge>();
    this.adj.push(list);
    this.kruskalAdj.push(list);
    this.visited.push(false);
  }
  
  addEdge(edge: Edge) {
    this.edges.push(edge);
    
    let source = this.findVerticeIndex(edge.data.source);
    let target = this.findVerticeIndex(edge.data.target);
    this.adj[source].append(this.vertices[target]);
    this.adj[target].append(this.vertices[source]);
  }

  addKruskalEdge(edge: Edge) {
    this.kruskalEdges.push(edge);

    let source = this.findVerticeIndex(edge.data.source);
    let target = this.findVerticeIndex(edge.data.target);
    console.log('add', edge, source, target);
    this.kruskalAdj[source].append(this.vertices[target]);
    this.kruskalAdj[target].append(this.vertices[source]);
  }

  removeLastKruskalEdge() {
    let edge = this.kruskalEdges.pop();

    let source = this.findVerticeIndex(edge.data.source);
    let target = this.findVerticeIndex(edge.data.target);

    let sourceRemoved = this.kruskalAdj[source].removeTail();
    let targetRemoved = this.kruskalAdj[target].removeTail();
    console.log('remove', edge, sourceRemoved, targetRemoved);
  }

  isCyclicRecursion(v: number, parent: number): boolean {
    this.visited[v] = true;
    
    var adjList = this.kruskalAdj[v];
    for(let vertice of adjList){
      let target = this.findVerticeIndex(vertice.data.id);
      console.log(target);
      if(!this.visited[target]) {
        if(this.isCyclicRecursion(target, v)) {
          return true;
        }
      }
      else if(target != parent) {
        return true;
      }
    }
    return false;
  }

  isKruskalCyclic(): boolean {
    for(let i = 0; i < this.visited.length; i++) {
      this.visited[i] = false;
    }

    for(let i = 0; i < this.vertices.length; i++) {
      if(!this.visited[i]) {
        if(this.isCyclicRecursion(i, -1)) {
          return true;
        }
      }
    }
    return false;
  }
}
