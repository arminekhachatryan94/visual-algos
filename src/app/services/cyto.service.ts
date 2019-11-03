
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';
// import { LinkedList } from 'linked-list-typescript';
import { Pair } from '../models/pair.model';

@Injectable()
export class CytoService {
  cy: cytoscape;
  kruskalEdges: Edge[];
  kruskalCyc: Number[][];
  visited: boolean[];
  tapped: boolean;

  sleepTime = 1000;

  clickedVerticeIndex: number;
  clickedEdgeIndex: string;

  constructor() {
    this.kruskalEdges = [];
    this.visited = [];
    this.kruskalCyc = [];
    this.tapped = false;
    this.clickedVerticeIndex = null;
    this.clickedEdgeIndex = null;
  }

  public draw(id: string) {
    this.cy = cytoscape({
      container: document.getElementById(id),
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

  addWeight(keyCode) {
    let edge = this.cy.edges('#' + this.clickedEdgeIndex).first();
    let weight = edge.data('weight');
    if(keyCode >= 48 && keyCode <= 57) { // 0 - 9
      let num = Number(keyCode) - 48;
      if(weight === '' || weight === '0') {
        edge.data('weight', num + '');
      } else if(weight === '-0') {
        edge.data('weight', '-' + num);
      } else {
        edge.data('weight', weight + ('' + num));
      }
    }
    else if(keyCode === 13) { // enter
      edge.data('style', {color: 'black', lineStyle: 'dashed'});
      this.clickedEdgeIndex = null;
    } else if(keyCode === 189) { // -
      if(weight === '0' || weight === '') {
        edge.data('weight', '-');
      }
    } else if(keyCode === 8 && weight.length){ // delete
      if(weight === '-0.') {
        edge.data('weight', '-');
      } else if(weight === '0.') {
        edge.data('weight', '');
      } else {
        edge.data('weight', weight.substring(0, weight.length-1));
      }
    } else if(keyCode === 190) { // .
      if(!weight.includes('.')) {
        let w = '';
        if(weight.length === 0 ||
          (weight.length === 1 &&
          weight === '-')
        ) {
          w += '0';
        }
        edge.data('weight', weight + w + '.');
      }
    }
  }

  verticeClickEvent() {
    this.cy.on('click', 'node', async event => {
      if(this.clickedEdgeIndex !== null) {
        this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
        this.clickedEdgeIndex = null;
      }
      let index = event.target.id();
      if(index === this.clickedVerticeIndex) {
        this.cy.nodes('#' + index).first().data('color', 'black');
        this.clickedVerticeIndex = null;
      }
      else if(this.clickedVerticeIndex === null) {
        this.clickedVerticeIndex = index;
        this.cy.nodes('#' + this.clickedVerticeIndex).first().data('color', 'green');
      } else {
        // check if edge already exists
        let edgeIndex1 = this.cy.edges('#e' + this.clickedVerticeIndex + '-' + index);
        let edgeIndex2 = this.cy.edges('#e' + index + '-' + this.clickedVerticeIndex);
        if(edgeIndex1.length === 0 && edgeIndex2.length === 0) {
          // add edge
          let e = await new Edge(
            'e' + this.clickedVerticeIndex + '-' + index,
            new Pair(this.clickedVerticeIndex, this.clickedVerticeIndex + ''),
            new Pair(index, index + ''),
            ''
          );
          await this.addEdge(e);
        } else {
          // remove edge
          if(edgeIndex1.length !== 0) {
            this.removeEdge(edgeIndex1.first().data('id'));
          }
          if(edgeIndex2.length !== 0) {
            this.removeEdge(edgeIndex2.first().data('id'));
          }
        }
        this.cy.nodes('#' + this.clickedVerticeIndex).first().data('color', 'black');
        this.clickedVerticeIndex = null;
      }
    });
  }

  addKeyListener() {
    document.addEventListener('keydown', event => {
      if(this.isEdgeSelected()) {
        this.addWeight(event.keyCode);
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

  removeAllEdges() {
    this.cy.remove(this.cy.edges());
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
    this.cy.remove('#' + index);
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

    let source = await this.findIndexInKruskalArray(edge.source.key);
    if(this.kruskalCyc[source].length === 1) {
      this.cy.nodes('#' + edge.source.key).first().data('color', 'black');
    }
    let target = await this.findIndexInKruskalArray(edge.target.key);
    if(this.kruskalCyc[target].length === 1) {
      this.cy.nodes('#' + edge.target.key).first().data('color', 'black');
    }

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
    this.kruskalCyc = [];
    for(let i = 0; i < vertices.length; i++) {
      this.cy.nodes('#' + vertices[i].id.value).first().data('color', 'black');
      this.cy.nodes('#' + vertices[i].id.value).first();
      this.kruskalCyc.push([vertices[i].id.key]);
    }
    let edges = this.getEdges();
    for(let i = 0; i < edges.length; i++) {
      this.cy.edges('#e' + edges[i].source.value + '-' + edges[i].target.value).first().data('style', {color: 'black', lineStyle: 'dashed'});
    }
    while(this.kruskalEdges.length > 0) {
      this.kruskalEdges.pop();
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

    this.cy.edges('#e' + edge.source.value + '-' + edge.target.value).first().data('style', style);
  }
}