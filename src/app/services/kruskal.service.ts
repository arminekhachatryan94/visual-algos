
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';
import { LinkedList } from 'linked-list-typescript';
import { Pair } from '../models/pair.model';

@Injectable()
export class KruskalService {
  cy: cytoscape;
  kruskalEdges: Edge[];
  adj: LinkedList<Vertice>[];
  kruskalCyc: Number[][];
  visited: boolean[];
  tapped: boolean;

  sleepTime = 1000;

  clickedVerticeIndex: number;
  clickedEdgeIndex: string;

  constructor() {
    this.kruskalEdges = [];
    this.adj = [];
    this.visited = [];
    this.kruskalCyc = [];
    this.tapped = false;
    this.clickedVerticeIndex = null;
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
      if(this.clickedVerticeIndex !== null) {
        this.cy.nodes('#' + this.clickedVerticeIndex).data('color', 'black');
        this.clickedVerticeIndex = null;
      }
      let index = event.target.id();
      if(index === this.clickedEdgeIndex) {
        this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
        this.clickedEdgeIndex = null;
      } else {
        if(this.clickedEdgeIndex !== null) {
          this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
          this.clickedEdgeIndex = null;
        }
        if(this.clickedEdgeIndex === null) {
          this.clickedEdgeIndex = event.target.id();
          this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'green', lineStyle: 'dashed'});
        }
      }
    });
  }

  isEdgeSelected() {
    return this.clickedEdgeIndex !== null;
  }

  addToWeight(keyCode) {
    let weight = this.cy.edges('#' + this.clickedEdgeIndex).first();
    console.log(keyCode);
    if(keyCode >= 48 && keyCode <= 57) {
      let num = Number(keyCode) - 48;
      if(weight === '') {
        weight.data('weight', num);
      } else {
        weight.data('weight', weight.data('weight') + num);
      }
    }
    else if(keyCode === 13) {
      weight.data('style', {color: 'black', lineStyle: 'dashed'});
      this.clickedEdgeIndex = null;
    } else if(keyCode === 189) {
      if(weight.data('weight') === '0' || weight.data('weight') === '') {
        weight.data('weight', '-');
      }
    } else if(keyCode === 8){
      weight.data('weight', weight.data('weight').substring(0, weight.data('weight').length-1));
    } else if(keyCode === 190) {
      if(!weight.data('weight').includes('.')) {
        weight.data('weight', weight.data('weight') + '.');
      }
    }
  }

  verticeClickEvent() {
    this.cy.on('click', 'node', async event => {
      if(this.clickedEdgeIndex !== null) {
        this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
        this.clickedEdgeIndex = null;
      }
      let id = event.target.id();
      let index = id;
      if(index === this.clickedVerticeIndex) {
        this.cy.nodes('#' + index).first().data('color', 'black');
        this.clickedVerticeIndex = null;
      }
      else if(this.clickedVerticeIndex === null) {
        this.clickedVerticeIndex = index;
        this.cy.nodes('#' + this.clickedVerticeIndex).first().data('color', 'green');
      } else {
        // check if edge already exists
        let edgeIndex = this.cy.edges('#' + this.clickedVerticeIndex + index).length;
        console.log('tired');
        console.log(edgeIndex);
        if(edgeIndex === 0) {
          // add edge
          let e = await new Edge(
            'e' + this.clickedVerticeIndex + index,
            new Pair(this.clickedVerticeIndex, this.clickedVerticeIndex + ''),
            new Pair(index, index + ''),
            ''
          );
          await this.addEdge(e);
        } else {
          // remove edge
          this.removeEdge(edgeIndex);

        }
        this.cy.nodes('#' + this.clickedVerticeIndex).first().data('color', 'black');
        this.clickedVerticeIndex = null;
      }
      // this.refresh();
    });
  }

  addKeyListener() {
    document.addEventListener('keydown', event => {
      if(this.isEdgeSelected()) {
        this.addToWeight(event.keyCode);
      }
    });
  }

  getVertices(): Vertice[] {
    return this.cy.nodes().map(vertice => {
      let v = new Vertice(
        new Pair(
          Number(vertice.data('id')),
          vertice.data('id')
        )
      );
      return v;
    });
  }

  getEdges(): Edge[] {
    return this.cy.edges().map(edge => {
      let e = new Edge(
        edge.data('id'),
        new Pair(
          Number(edge.data('source')),
          edge.data('source')
        ),
        new Pair(
          Number(edge.data('target')),
          edge.data('target')
        ),
        edge.data('weight')
      );
      return e;
    });
  }

  addVertice(vertice: Vertice) {
    this.cy.add({
      group: 'nodes',
      data: {
        id: vertice.id.value,
        color: vertice.color
      }
    });
    let list = new LinkedList<Vertice>();
    this.adj.push(list);
    this.visited.push(false);
    this.kruskalCyc.push([vertice.id.key]);
  }

  removeLastVertice() {
    let v = this.cy.nodes().last().data('id');
    this.cy.remove('#' + v);
  }
  
  addEdge(edge: Edge) {
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
  }
  
  removeEdge(index) {
    this.cy.remove('#e' + index);
  }

  async addKruskalEdge(edge: Edge) {
    this.kruskalEdges.push(edge);

    let source = edge.source.key;
    let target = edge.target.key;
    let s = await this.findIndexInKruskalArray(source);
    let t = await this.findIndexInKruskalArray(target);
    this.kruskalCyc[s] = (this.kruskalCyc[s]).concat(this.kruskalCyc[t]);
    this.kruskalCyc.splice(t, 1);
    
    this.cy.nodes('#' + source).first().data('color', 'red');
    this.cy.nodes('#' + target).first().data('color', 'red');
  }

  async removeKruskalEdge(edge: Edge) {
    let i = 0;
    for(i = 0; i < this.kruskalEdges.length; i++) {
      if(edge.id === this.kruskalEdges[i].id) {
        break;
      }
    }

    this.cy.nodes('#' + edge.source.key).first().data('color', 'black');
    this.cy.nodes('#' + edge.target.key).first().data('color', 'black');

    this.kruskalEdges = this.kruskalEdges.splice(i, 1);
    return this.kruskalEdges;
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
    let vertices = this.getVertices();
    for(let i = 0; i < vertices.length; i++) {
      this.cy.nodes('#' + vertices[i].id.value).first().data('color', 'black');
      let k = this.cy.nodes('#' + vertices[i].id.value).first();
    }
    let edges = this.getEdges();
    for(let i = 0; i < edges.length; i++) {
      this.cy.edges('#e' + edges[i].source.value + edges[i].target.value).first().data('style', {color: 'black', lineStyle: 'dashed'});
    }
    while(this.kruskalEdges.length > 0) {
      this.kruskalEdges.pop();
    }
    console.log(this.kruskalEdges.length)
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
  }
}
