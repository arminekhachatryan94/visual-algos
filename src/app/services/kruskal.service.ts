
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
    let list = new LinkedList<Vertice>();
    this.adj.push(list);
    this.kruskalAdj.push(list);
    this.visited.push(false);
  }
  
  addEdge(edge: Edge) {
    this.edges.push(edge);
    
    let source = edge.source.key;
    let target = edge.target.key;
    this.adj[source].append(this.vertices[target]);
    this.adj[target].append(this.vertices[source]);
  }

  addKruskalEdge(edge: Edge) {
    this.kruskalEdges.push(edge);

    let source = edge.source.key;
    let target = edge.target.key;
    // console.log('add', edge, source, target);
    this.kruskalAdj[source].append(this.vertices[target]);
    this.kruskalAdj[target].append(this.vertices[source]);
  }

  removeLastKruskalEdge() {
    let edge = this.kruskalEdges.pop();

    let source = edge.source.key;
    let target = edge.target.key;

    let sourceRemoved = this.kruskalAdj[source].removeTail();
    let targetRemoved = this.kruskalAdj[target].removeTail();
    // console.log('remove', edge, sourceRemoved, targetRemoved);
  }

  isCyclicRecursion(current: number, target: number): boolean {
    this.visited[current] = true;
    console.log(this.visited);
    
    var adjList = this.kruskalAdj[current];
    for(let vertice of adjList){
      // console.log(vertice);
      let new_current = vertice.id.key;
      if(!this.visited[new_current]) {
        if(this.isCyclicRecursion(new_current, target)) {
          console.log('recursion', new_current, target);
          return true;
        }
      } else if(current == target) {
        console.log('current', new_current, target);
        return true;
      }
    }
    return false;
  }

  isKruskalCyclic(e: Edge): boolean {
    for(let i = 0; i < this.visited.length; i++) {
      this.visited[i] = false;
    }

    let source = e.source.key;
    let target = e.target.key;
    return this.isCyclicRecursion(source, target);
  }
}
