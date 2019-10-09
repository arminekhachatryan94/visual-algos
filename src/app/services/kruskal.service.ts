
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

  clickedIndex: number;
  clickedEdgeIndex: string;

  constructor() {
    this.vertices = [];
    this.edges = [];
    this.kruskalEdges = [];
    this.adj = [];
    this.visited = [];
    this.kruskalCyc = [];
    this.tapped = false;
    this.clickedIndex = null;
    this.clickedEdgeIndex = null;
  }

  public draw() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: {
        nodes: [],
        edges: []
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
            'background-color': 'data(color)',
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
    this.verticeClickEvent();
    this.edgeClickEvent();
  }

  async refresh() {
    this.cy.layout({
      name: 'circle',
      rows: 5
    }).run();
  }

  edgeClickEvent() {
    this.cy.on('click', 'edge', async event => {
      if(this.clickedEdgeIndex !== null) {
        this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
      }
      this.clickedEdgeIndex = event.target.id();
      this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'green', lineStyle: 'dashed'});
    });
  }

  isEdgeSelected() {
    return this.clickedEdgeIndex !== null;
  }

  addToWeight(keyCode) {
    console.log(keyCode);
    let weight = this.cy.edges('#' + this.clickedEdgeIndex).data('weight');
    if(keyCode>=48 && keyCode<=57) {
      let num = keyCode - 48;
      if(weight === 1) {
        this.cy.edges('#' + this.clickedEdgeIndex).data('weight', num);
      } else {
        this.cy.edges('#' + this.clickedEdgeIndex).data('weight', (weight*10) + num);
      }
    }
    else if(keyCode === 13) {
      this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
      this.clickedEdgeIndex = null;
    }
  }

  async verticeClickEvent() {
    await this.cy.on('click', 'node', async event => {
      let id = event.target.id();
      let index = await this.findIndexOfVertice(id);
      if(index === this.clickedIndex) {
        this.vertices[index].color = 'black';
        this.cy.nodes('#' + this.vertices[index].id.value).first().data('color', 'black');
        this.clickedIndex = null;
      }
      else if(this.clickedIndex === null) {
        this.clickedIndex = index;
        this.vertices[this.clickedIndex].color = 'green';
        this.cy.nodes('#' + this.vertices[this.clickedIndex].id.value).first().data('color', 'green');
      } else {
        // check if edge already exists
        let edgeIndex = await this.findIndexOfEdge(this.vertices[this.clickedIndex].id.key, this.vertices[index].id.key);
        if(edgeIndex === -1) {
          // add edge
          let e = await new Edge(
            'e' + this.vertices[this.clickedIndex].id.value + this.vertices[index].id.value,
            this.vertices[this.clickedIndex].id,
            this.vertices[index].id,
            1
          );
          await this.addEdge(e);
        } else {
          // remove edge
          this.removeEdge(edgeIndex);

        }
        this.vertices[this.clickedIndex].color = 'black';
        this.cy.nodes('#' + this.vertices[this.clickedIndex].id.value).first().data('color', 'black');
        this.clickedIndex = null;
      }
      this.refresh();
    });
  }

  getEdges(): Edge[] {
    return this.edges;
  }

  addVertice(vertice: Vertice) {
    this.cy.add({
      group: 'nodes',
      data: {
        id: vertice.id.value,
        color: vertice.color
      }
    });
    this.vertices.push(vertice);
    let list = new LinkedList<Vertice>();
    this.adj.push(list);
    this.visited.push(false);
    this.kruskalCyc.push([vertice.id.key]);
  }

  removeLastVertice() {
    let v = this.vertices.pop();
    this.cy.remove('#' + v.id.value);
  }
  
  addEdge(edge: Edge) {
    this.edges.push(edge);
    this.cy.add({
      group: 'edges',
      data: {
        id: edge.id,
        source: edge.source.value,
        target: edge.target.value,
        weight: edge.weight,
        style: edge.style
      }
    });

    let source = edge.source.key;
    let target = edge.target.key;
    this.adj[source].append(this.vertices[target]);
    this.adj[target].append(this.vertices[source]);
  }
  
  removeEdge(index) {
    let e = this.edges.splice(index, 1)[0];
    this.cy.remove('#e' + e.source.value + e.target.value);
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
    this.vertices[v1].color = 'red';
    this.cy.nodes('#' + this.vertices[v1].id.value).first().data('color', 'red');
    this.vertices[v2].color = 'red';
    console.log('selector');
    this.cy.nodes('#' + this.vertices[v2].id.value).first().data('color', 'red');
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
    this.vertices[v1].color = 'black';
    this.cy.nodes('#' + this.vertices[v1].id.value).first().data('color', 'black');
    this.vertices[v2].color = 'black';
    console.log('selector');
    this.cy.nodes('#' + this.vertices[v2].id.value).first().data('color', 'black');

    this.kruskalEdges = this.kruskalEdges.splice(i, 1);
    return this.kruskalEdges;
  }

  async findIndexOfEdge(sourceKey, targetKey) {
    let index = -1;
    for(let i = 0; i < this.edges.length; i++) {
      if(
        (
          sourceKey === this.edges[i].source.key
          && targetKey === this.edges[i].target.key
        ) || (
          sourceKey === this.edges[i].target.key
          && targetKey === this.edges[i].source.key
        )
      ) {
        index = i;
        break;
      }
    }
    return index;
  }

  // edgeExists(sourceKey, targetKey) {
  //   let ret = -1;
  //     for(let i = 0; i < this.edges.length; i++) {
  //       if(
  //         (
  //           sourceKey === this.edges[i].source.key
  //           && targetKey === this.edges[i].target.key
  //         ) || (
  //           sourceKey === this.edges[i].target.key
  //           && targetKey === this.edges[i].source.key
  //         )
  //       ) {
  //         ret = i;
  //         break;
  //       }
  //     }
  //     return ret;
  // }

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

    let ret = await (s === t && s !== -1);
    return ret;
  }

  reset() {
    for(let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].color = 'black';
      this.cy.nodes('#' + this.vertices[i].id.value).first().data('color', 'black');
    }
    for(let i = 0; i < this.edges.length; i++) {
      this.edges[i].resetStyle();
      this.cy.edges('#e' + this.edges[i].source.value + this.edges[i].target.value).first().data('style', {color: 'black', lineStyle: 'dashed'});
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
    let indexEdge = await this.findIndexOfEdge(edge.source.key, edge.target.key);
    let style = {color: 'black', lineStyle: 'dashed'};

    if(color === 'blue') {
      style = {color: 'blue', lineStyle: 'solid'};
    }
    if(color === 'red') {
      style = {color: 'red', lineStyle: 'solid'};
    }
    if(color === 'gray') {
      style = {color: 'gray', lineStyle: 'dashed'};
    }

    this.cy.edges('#e' + edge.source.value + edge.target.value).first().data('style', style);
    this.edges[indexEdge].setStyle(style);
  }
}
