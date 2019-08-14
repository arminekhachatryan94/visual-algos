
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
  adj: LinkedList<Edge>[];
  kruskalAdj: LinkedList<Edge>[];

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.kruskalEdges = [];
    this.adj = [];
    this.kruskalAdj = [];
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
  }
  
  addEdge(edge: Edge) {
    this.edges.push(edge);
    
    let start = this.findVerticeIndex(edge.data.source);
    let end = this.findVerticeIndex(edge.data.target);
    this.adj[start].append(new Edge(edge.data.id, edge.data.source, edge.data.target, edge.data.weight));
    this.adj[end].append(new Edge(edge.data.id, edge.data.target, edge.data.source, edge.data.weight));
  }

  addKruskalEdge(edge: Edge) {
    this.kruskalEdges.push(edge);

    let start = this.findVerticeIndex(edge.data.source);
    let end = this.findVerticeIndex(edge.data.target);
    this.kruskalAdj[start].append(new Edge(edge.data.id, edge.data.source, edge.data.target, edge.data.weight));
    this.kruskalAdj[end].append(new Edge(edge.data.id, edge.data.target, edge.data.source, edge.data.weight));
  }

  isCyclicRecursion(v: number, visited: boolean[], parent: number): boolean {
    visited[v] = true;
    
    var item = this.kruskalAdj[v]

    for(let it of item){
      if(!visited[it.data.target])
      {
        if(this.isCyclicRecursion(this.findVerticeIndex(it.data.target),visited,v))
        {
          return true;
        }
        else if(this.findVerticeIndex(it.data.target) != parent)
        {
          return true;
        }
      }
      return false;
    }
  }

  isKruskalCyclic(): boolean {
    if(this.kruskalEdges.length == 0) {
      return false;
    }

    let visited = [];
    for(let i = 0; i < this.vertices.length; i++) {
      visited.push(false);
    }

    for(let i = 0; i < this.vertices.length; i++) {
      if(!visited[i]) {
        if(this.isCyclicRecursion(i, visited, -1)) {
          return true;
        }
      }
    }
    return false;
  }
}
