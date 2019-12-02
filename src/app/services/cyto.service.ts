
import { Injectable } from '@angular/core';
import cytoscape from 'cytoscape';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';
import { Pair } from '../models/pair.model';

@Injectable()
export class CytoService {
  cy: cytoscape;
  kruskalEdges: Edge[];
  kruskalCyc: number[][];
  subVerticeIds: number[];
  tapped: boolean;

  clickedVerticeIndex: number;
  clickedEdgeIndex: string;

  selectSub: boolean;

  constructor() {
    this.kruskalEdges = [];
    this.kruskalCyc = [];
    this.tapped = false;
    this.clickedVerticeIndex = null;
    this.clickedEdgeIndex = null;
    this.selectSub = false;
    this.subVerticeIds = [];
  }

  public async draw(id: string) {
    this.cy = cytoscape({
      container: document.getElementById(id),
      elements: {
        nodes: [],
        edges: []
      },
      layout: {
        name: 'circle'
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
            'text-valign': 'center',
          }
        },
        {
          selector: 'node[shape = "circle"]',
          style: {
            'shape': 'circle'
          }
        },
        {
          selector: 'node[shape = "square"]',
          style: {
            'shape': 'square'
          }
        },
        {
          selector: 'node[shape = "star"]',
          style: {
            'shape': 'star'
          }
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(weight)',
            'text-margin-x': -15,
            'text-margin-y': 15,
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

  verticeClickEvent() {
    this.cy.on('click', 'node', async event => {
      if(this.selectSub !== null) {
        if(!this.selectSub) {
          if(this.clickedEdgeIndex !== null) {
            this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'black', lineStyle: 'dashed'});
            this.clickedEdgeIndex = null;
          }
          let index = event.target.id();
          if(index === this.clickedVerticeIndex) {
            this.cy.nodes('#' + index).first().data('color', 'black');
            this.cy.nodes('#' + index).first().data('shape', 'circle');
            this.clickedVerticeIndex = null;
          }
          else if(this.clickedVerticeIndex === null) {
            this.clickedVerticeIndex = index;
            this.cy.nodes('#' + this.clickedVerticeIndex).first().data('color', 'green');
            this.cy.nodes('#' + this.clickedVerticeIndex).first().data('shape', 'square');
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
            this.cy.nodes('#' + this.clickedVerticeIndex).first().data('shape', 'circle');
            this.clickedVerticeIndex = null;
          }
        } else {
          let id = event.target.id();
          this.addOrRemoveSubVertice(Number(id));
        }
      }
    });
  }

  addOrRemoveSubVertice(id: number) {
    let node = this.cy.nodes('#' + id).first();
    if(node.data('color') === 'red') {
      node.data('color', 'black');
      node.data('shape', 'circle');
      for(let s = 0; s < this.subVerticeIds.length; s++) {
        if(this.subVerticeIds[s] === id) {
          this.subVerticeIds.splice(s, 1);
          break;
        }
      }
    } else {
      node.data('color', 'red');
      node.data('shape', 'star');
      this.subVerticeIds.push(id);
    }
  }

  edgeClickEvent() {
    this.cy.on('click', 'edge', async event => {
      if(this.selectSub !== null) {
        if(this.clickedVerticeIndex !== null) {
          this.cy.nodes('#' + this.clickedVerticeIndex).data('color', 'black');
          this.cy.nodes('#' + this.clickedVerticeIndex).data('shape', 'circle');
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
            this.cy.edges('#' + this.clickedEdgeIndex).first().data('style', {color: 'green', lineStyle: 'dotted'});
          }
        }
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

  async refresh() {
    this.cy.layout({
      name: 'circle',
      rows: 5
    }).run();
  }

  updateSelectSub(val: boolean) {
    this.selectSub = val;
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

  generateRandomEdges() {
    this.removeAllEdges();
    let vertices = this.getVertices();
    while(vertices.length > 0) {
      let currentV = vertices[vertices.length-1];
      for(let i = 0; i < vertices.length-1; i++) {
        if(Math.floor(Math.random()*2)) {
          let e = new Edge(
            'e' + currentV.id.key + '-' + vertices[i].id.key,
            currentV.id,
            vertices[i].id,
            (Math.floor(Math.random()*99)+1) + ''
          );
          this.addEdge(e);
        }
      }
      vertices.pop();
    }
  }

  getVertices(): Vertice[] {
    return this.cy.nodes().map(vertice => {
      let v = new Vertice(
        new Pair(
          Number(vertice.data('id')),
          vertice.data('id')
        )
      );
      v.shape = vertice.shape;
      return v;
    });
  }

  getSubVerticeIds() {
    return [...this.subVerticeIds];
  }

  removeAllEdges() {
    this.cy.remove(this.cy.edges());
  }

  removeAllVertices() {
    this.cy.remove(this.cy.nodes());
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
        id: vertice.id.key,
        color: vertice.color,
        shape: vertice.shape
      }
    });
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
        source: edge.source.key,
        target: edge.target.key,
        weight: edge.weight,
        style: edge.style
      }
    });
  }
  
  removeEdge(index) {
    this.cy.remove('#' + index);
  }

  async addKruskalEdge(edge: Edge, changeColor = true) {
    edge.style = {color: 'red', lineStyle: 'solid'};
    this.kruskalEdges.push(edge);

    let source = edge.source.key;
    let target = edge.target.key;
    let s = await this.findIndexInKruskalArray(source);
    let t = await this.findIndexInKruskalArray(target);
    this.kruskalCyc[s] = (this.kruskalCyc[s]).concat(this.kruskalCyc[t]);
    this.kruskalCyc.splice(t, 1);
    
    if(changeColor) {
      this.cy.nodes('#' + source).first().data('color', 'red');
      this.cy.nodes('#' + target).first().data('color', 'red');
    }
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

    this.kruskalEdges.splice(i, 1);
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
      this.cy.nodes('#' + vertices[i].id.key).first().data('color', 'black');
      this.cy.nodes('#' + vertices[i].id.key).first().data('shape', 'circle');
      this.kruskalCyc.push([vertices[i].id.key]);
    }
    let edges = this.getEdges();
    for(let i = 0; i < edges.length; i++) {
      this.cy.edges('#e' + edges[i].source.key + '-' + edges[i].target.key).first().data('style', {color: 'black', lineStyle: 'dashed'});
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

  getKruskalEdges() {
    return this.kruskalEdges;
  }

  getSumOfEdgeWeights() {
    let sum = null;
    for(let k = 0; k < this.kruskalEdges.length; k++) {
      let weight = Number(this.kruskalEdges[k].weight);
      if(sum === null) {
        sum =  weight;
      } else {
        sum += weight;
      }
    }
    return sum;
  }

  async checkVerticesConnected(vertices: number[]) {
    if(vertices.length > 0) {
      let ret = true;
      let index = await this.findIndexInKruskalArray(vertices[0]);
      for(let i = 1; i < vertices.length; i++) {
        let index2 = await this.findIndexInKruskalArray(vertices[i]);
        if(index2 !== index) {
          ret = false;
          break;
        }
      }
      return ret;
    } else {
      return false;
    }
  }

  getEdgesBetweenSubset(subsetIds: number[]): Edge[] {
    let subEdges = [];
    let edges = this.getEdges();
    edges.forEach(e => {
      if(subsetIds.includes(e.source.key) && subsetIds.includes(e.target.key)) {
        subEdges.push(e);
      }
    });
    return subEdges;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async changeVerticeStyle(vertice: Vertice, color: string) {
    this.cy.nodes('#' + vertice.id.key).first().data('color', color);
    if(color === 'red') {
      this.cy.nodes('#' + vertice.id.key).first().data('shape', 'star');
    } else if(color === 'green') {
      this.cy.nodes('#' + vertice.id.key).first().data('shape', 'square');
    } else {
      this.cy.nodes('#' + vertice.id.key).first().data('shape', 'circle');
    }
  }

  async changeEdgeStyle(edge: Edge, color: string) {
    let style = {color: 'black', lineStyle: 'dashed'};

    if(color === 'blue') {
      style = {color: 'blue', lineStyle: 'dotted'};
    }
    if(color === 'red') {
      style = {color: 'red', lineStyle: 'solid'};
    }
    if(color === 'gray') {
      style = {color: 'gray', lineStyle: 'dashed'};
    }

    this.cy.edges('#e' + edge.source.key + '-' + edge.target.key).first().data('style', style);
  }
}
