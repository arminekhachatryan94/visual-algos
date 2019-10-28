import { Component, OnInit } from '@angular/core';
import { KruskalService } from 'src/app/services/kruskal.service';
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
  drawService: KruskalService;
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

  constructor(drawService: KruskalService) {
    this.drawService = drawService;
    this.vertices = [];
    this.edges = [];
    this.treeType = {
      type: 'min'
    };
    this.edge = null;
    this.before = [];
    this.after = [];
    this.numVertices = 3;
  }

  ngOnInit() {
    this.drawService.draw();
    this.createVertices();
    this.drawService.addKeyListener();
    this.steps.push(this.drawService.getKruskalArray());
  }

  async incrementVertices() {
    let v = new Vertice(new Pair(this.numVertices, this.numVertices+''));
    await this.drawService.addVertice(v);
    this.vertices = this.drawService.getVertices();
    this.numVertices++;
    this.drawService.refresh();
  }
  
  async decrementVertices() {
    await this.numVertices--;
    await this.drawService.removeLastVertice();
    this.vertices = this.drawService.getVertices();
    this.drawService.refresh();
  }

  async createVertices() {
    this.vertices = [];
    let i = 0;
    while(i < this.numVertices) {
      let v = new Vertice(new Pair(i, i+''));
      this.vertices.push(v);
      await this.drawService.addVertice(v);
      i++;
    }
    this.drawService.refresh();
  }

  addEdgesToQueue(): void {
    this.edges.forEach(edge => {
      this.queue.queue(edge);
    });
    this.steps.push(this.drawService.getKruskalArray());
  }

  addEdgesToBeforeArray() {
    while(this.queue.length > 0) {
      this.before.unshift(this.queue.dequeue());
    }
  }

  async getKruskal() {
    this.edges = this.drawService.getEdges();
    this.stopped = false;
    this.paused = false;
    this.solving = true;
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
      await this.drawService.changeEdgeStyle(this.edge, 'blue');
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'solid';
      await this.sleep(this.sleepTime);

      if(this.stopped || this.paused) {
        this.solving = true;
        this.paused = true;
        return;
      }

      let cyclic = await this.drawService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.drawService.addKruskalEdge(this.edge);
        await this.drawService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';
        await this.steps.push(this.drawService.getKruskalArray());
        await this.sleep(this.sleepTime);
      } else {
        await this.drawService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        await this.sleep(this.sleepTime);
      }
      this.after.push(this.edge);
      this.edge = null;
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
    await this.drawService.reset();
    this.steps = [];
    this.steps.push(this.drawService.getKruskalArray());
    await this.sleep(this.sleepTime);
  }

  async previous() {
    this.previousSolving = true;
    if(this.edge === null) {
      this.edge = this.after.pop();
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'solid';
      await this.drawService.changeEdgeStyle(this.edge, 'blue');
      await this.drawService.removeKruskalEdge(this.edge);
      this.steps.pop();
      let history = this.steps.pop();
      this.steps.push(history);
      console.log(this.steps);
      await this.drawService.setKruskalArray(history);
      await this.sleep(this.sleepTime);
    } else {
      this.before.push(this.edge);
      await this.drawService.changeEdgeStyle(this.edge, 'black');
      this.edge.style.color = 'black';
      this.edge.style.lineStyle = 'dashed';
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
      await this.drawService.changeEdgeStyle(this.edge, 'blue');
      await this.sleep(this.sleepTime);
    } else {
      let cyclic = await this.drawService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.drawService.addKruskalEdge(this.edge);
        await this.drawService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';  
        await this.steps.push(this.drawService.getKruskalArray());
      } else {
        await this.drawService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
      }
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
    this.drawService.removeAllEdges();
    let vertices = [...this.vertices];
    while(vertices.length > 0) {
      let currentV = vertices[vertices.length-1];
      for(let i = 0; i < vertices.length-1; i++) {
        if(Math.floor(Math.random()*2)) {
          let e = new Edge(
            'e' + currentV.id.key + '-' + vertices[i].id.key,
            currentV.id,
            vertices[i].id,
            (Math.floor(Math.random()*100)-50) + ''
          );
          this.drawService.addEdge(e);
        }
      }
      vertices.pop();
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
