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
  }

  async incrementVertices() {
    let v = new Vertice(new Pair(this.numVertices, this.numVertices+''));
    await this.drawService.addVertice(v);
    this.numVertices++;
    this.drawService.refresh();
  }
  
  async decrementVertices() {
    await this.numVertices--;
    this.drawService.removeLastVertice();
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
          return a.weight - b.weight;
        }
      });
    } else {
      this.queue = await new PriorityQueue({
        comparator: function(a: Edge, b: Edge) {
          return b.weight - a.weight;
        }
      });
    }
    // this.drawService.refresh();
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
      // await this.drawService.refresh();
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
        // await this.drawService.refresh();
        await this.steps.push(this.drawService.getKruskalArray());
        await this.sleep(this.sleepTime);
      } else {
        await this.drawService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        // await this.drawService.refresh();
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
    await this.sleep(this.sleepTime);
    // await this.drawService.draw();
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
      await this.drawService.setKruskalArray(history);
      // await this.drawService.draw();
      await this.sleep(this.sleepTime);
    } else {
      this.before.push(this.edge);
      await this.drawService.changeEdgeStyle(this.edge, 'black');
      this.edge.style.color = 'black';
      this.edge.style.lineStyle = 'dashed';
      // await this.drawService.draw();
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
      // await this.drawService.draw();
      await this.sleep(this.sleepTime);
    } else {
      let cyclic = await this.drawService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.drawService.addKruskalEdge(this.edge);
        await this.drawService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';  
        await this.steps.push(this.drawService.getKruskalArray());
        // await this.drawService.draw();
      } else {
        await this.drawService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        // await this.drawService.draw();
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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
