import { Component, OnInit } from '@angular/core';
import { CytoService } from 'src/app/services/cyto.service';
import { Edge } from 'src/app/models/edge.model';
import { Pair } from 'src/app/models/pair.model';
import { Vertice } from 'src/app/models/vertice.model';
import PriorityQueue from 'ts-priority-queue';

@Component({
  selector: 'app-kruskal',
  templateUrl: './kruskal.component.html',
  styleUrls: ['./kruskal.component.css']
})
export class KruskalComponent implements OnInit {
  cytoService: CytoService;
  numVertices: number;
  vertices: Vertice[];
  edges: Edge[];
  queue: any;
  before: Edge[];
  after: Edge[];
  treeType: {
    type: string
  };
  edge: Edge;

  stopped = true;
  paused = true;
  solving = false;

  isNext = false;
  isPrevious = false;
  nextSolving = false;
  previousSolving = false;

  steps = [];

  sleepTime = 1000;
  speed: number;

  messages: string[];
  weightSum: number;

  constructor(cytoService: CytoService) {
    this.cytoService = cytoService;
    this.vertices = [];
    this.edges = [];
    this.treeType = {
      type: 'min'
    };
    this.edge = null;
    this.before = [];
    this.after = [];
    this.numVertices = 3;
    this.speed = 1;
    this.messages = [];
    this.weightSum = 0;
  }

  ngOnInit() {
    this.cytoService.draw('cy');
    this.createVertices();
    this.cytoService.addKeyListener();
    this.steps.push(this.cytoService.getKruskalArray());
  }

  async incrementVertices() {
    let v = new Vertice(new Pair(this.numVertices, this.numVertices+''));
    await this.cytoService.addVertice(v);
    this.vertices = this.cytoService.getVertices();
    this.numVertices++;
    this.cytoService.refresh();
  }

  async decrementVertices() {
    await this.numVertices--;
    await this.cytoService.removeLastVertice();
    this.vertices = this.cytoService.getVertices();
    this.cytoService.refresh();
  }

  async createVertices() {
    this.vertices = [];
    let i = 0;
    while(i < this.numVertices) {
      let v = new Vertice(new Pair(i, i+''));
      this.vertices.push(v);
      await this.cytoService.addVertice(v);
      i++;
    }
    this.cytoService.refresh();
  }

  addEdgesToQueue(): void {
    this.edges.forEach(edge => {
      this.queue.queue(edge);
    });
    this.steps.push(this.cytoService.getKruskalArray());
  }

  addEdgesToBeforeArray() {
    while(this.queue.length > 0) {
      this.before.unshift(this.queue.dequeue());
    }
  }

  async getKruskal() {
    this.edges = this.cytoService.getEdges();
    this.stopped = false;
    this.paused = false;
    this.solving = true;
    this.messages.push('Sort edges in ' + (this.treeType.type === 'asc' ? 'ascending' : 'descending') + ' order.');
    if(this.treeType.type === 'min') {
      this.queue = await new PriorityQueue({
        comparator: function(a: Edge, b: Edge) {
          return Number(a.weight) - Number(b.weight);
        }
      });
    } else {
      this.queue = await new PriorityQueue({
        comparator: function(a: Edge, b: Edge) {
          return Number(b.weight) - Number(a.weight);
        }
      });
    }
    await this.sleep(this.sleepTime);
    this.addEdgesToQueue();
    this.addEdgesToBeforeArray();
    this.isNext = true;

    await this.kruskalAlgorithm();
  }

  async kruskalAlgorithm() {
    this.solving = true;
    this.stopped = false;
    this.paused = false;
    while(this.before.length) {
      if(this.stopped || this.paused) {
        this.solving = true;
        this.paused = true;
        return;
      }
      if(this.edge === null) {
        this.edge = this.before.pop();
      }
      this.isPrevious = true;
      this.messages.push(
        'Pop the last edge from the queue, and ' +
        'Check if adding edge V' + this.edge.source.key +
        ' to V' + this.edge.target.key + ' with weight '
        + this.edge.weight + ' will create a cycle in the graph.'
      );
      await this.cytoService.changeEdgeStyle(this.edge, 'blue');
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'solid';
      await this.sleep(this.sleepTime);

      if(this.stopped || this.paused) {
        this.solving = true;
        this.paused = true;
        return;
      }

      let cyclic = await this.cytoService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.cytoService.addKruskalEdge(this.edge);
        await this.cytoService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';
        await this.steps.push(this.cytoService.getKruskalArray());
        this.messages.push(
          'Add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it does not create a cycle.'
        );
      } else {
        await this.cytoService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        this.messages.push(
          'Do not add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it will create a cycle.'
        );
      }
      this.after.push(this.edge);
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      this.edge = null;
      await this.sleep(this.sleepTime);
    }
    this.solving = false;
    this.stopped = true;
    this.paused = true;
    this.isNext = false;
  }

  async pauseContinueKruskal() {
    this.paused = !this.paused;
    if(!this.paused) {
      this.kruskalAlgorithm();
    }
  }

  async reset() {
    this.stopped = true;
    this.paused = true;
    this.solving = false;
    await this.cytoService.reset();
    this.steps = [];
    this.steps.push(this.cytoService.getKruskalArray());
    await this.sleep(this.sleepTime);
    this.before = [];
    this.after = [];
    this.edge = null;
    this.isNext = false;
    this.isPrevious = false;
  }

  async previous() {
    this.weightSum = null;
    this.previousSolving = true;
    if(this.edge === null) {
      this.steps.pop();
      let history = this.steps.pop();
      this.steps.push(history);
      this.messages.pop();
      this.edge = this.after.pop();
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'solid';
      await this.cytoService.setKruskalArray(history);
      await this.cytoService.changeEdgeStyle(this.edge, 'blue');
      await this.cytoService.removeKruskalEdge(this.edge);
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      await this.sleep(this.sleepTime);
    } else {
      this.messages.pop();
      this.before.push(this.edge);
      await this.cytoService.changeEdgeStyle(this.edge, 'black');
      this.edge.style.color = 'black';
      this.edge.style.lineStyle = 'dashed';
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      await this.sleep(this.sleepTime);
      this.edge = null;
    }
    this.isNext = true;
    if(!this.after.length && this.edge === null) {
      this.isPrevious = false;
    }
    this.previousSolving = false;
  }

  async next() {
    this.nextSolving = true;
    if(this.edge === null) {
      this.edge = this.before.pop();
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'solid';
      await this.cytoService.changeEdgeStyle(this.edge, 'blue');
      this.messages.push(
        'Pop the last edge from the queue, and '
        + 'check if adding edge V' + this.edge.source.key +
        ' to V' + this.edge.target.key + ' with weight '
        + this.edge.weight + ' will create a cycle in the graph.'
      );
      await this.sleep(this.sleepTime);
    } else {
      let cyclic = await this.cytoService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.cytoService.addKruskalEdge(this.edge);
        await this.cytoService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';  
        await this.steps.push(this.cytoService.getKruskalArray());
        this.messages.push(
          'Add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it does not create a cycle.'
        );
      } else {
        await this.cytoService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        this.messages.push(
          'Do not add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it will create a cycle.'
        );
      }
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      this.after.push(this.edge);
      this.edge = null;
      await this.sleep(this.sleepTime);
    }
    this.isPrevious = true;
    if(!this.before.length && this.edge === null) {
      this.isNext = false;
    }
    this.nextSolving = false;
  }

  generateRandomEdges() {
    this.cytoService.removeAllEdges();
    let vertices = [...this.vertices];
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
          this.cytoService.addEdge(e);
        }
      }
      vertices.pop();
    }
  }

  slower() {
    this.speed /= 2;
    this.sleepTime *= 2;
  }

  faster() {
    this.speed *= 2;
    this.sleepTime /= 2;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
