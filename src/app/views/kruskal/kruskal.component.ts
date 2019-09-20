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
  }

  ngOnInit() {
    this.createVertices();
    this.createEdges();
    this.addVertices();
    this.addEdges();
    this.drawService.draw();
  }

  createVertices(): void {
    let a = new Vertice(new Pair(0,'a'));
    this.vertices.push(a);
    let b = new Vertice(new Pair(1,'b'));
    this.vertices.push(b);
    let c = new Vertice(new Pair(2, 'c'));
    this.vertices.push(c);
    let d = new Vertice(new Pair(3, 'd'));
    this.vertices.push(d);
    let e = new Vertice(new Pair(4, 'e'));
    this.vertices.push(e);
    let f = new Vertice(new Pair(5, 'f'));
    this.vertices.push(f);
    let g = new Vertice(new Pair(6, 'g'));
    this.vertices.push(g);
    let h = new Vertice(new Pair(7, 'h'));
    this.vertices.push(h);
    let i = new Vertice(new Pair(8, 'i'));
    this.vertices.push(i);
    let j = new Vertice(new Pair(9, 'j'));
    this.vertices.push(j);
  }

  createEdges(): void {
    let ab = new Edge('ab', this.vertices[0].id, this.vertices[1].id, 10);
    this.edges.push(ab);
    let bc = new Edge('bc', this.vertices[1].id, this.vertices[2].id, 14);
    this.edges.push(bc);
    let cd = new Edge('cd', this.vertices[2].id, this.vertices[3].id, 2);
    this.edges.push(cd);
    let de = new Edge('de', this.vertices[3].id, this.vertices[4].id, 3);
    this.edges.push(de);
    let ef = new Edge('ef', this.vertices[4].id, this.vertices[5].id, 6);
    this.edges.push(ef);
    let fg = new Edge('fg', this.vertices[5].id, this.vertices[6].id, 11);
    this.edges.push(fg);
    let gh = new Edge('gh', this.vertices[6].id, this.vertices[7].id, 1);
    this.edges.push(gh);
    let hi = new Edge('hi', this.vertices[7].id, this.vertices[8].id, 5);
    this.edges.push(hi);
    let ij = new Edge('ij', this.vertices[8].id, this.vertices[9].id, 4);
    this.edges.push(ij);
    let ja = new Edge('ja', this.vertices[9].id, this.vertices[0].id, 1);
    this.edges.push(ja);
    let ad = new Edge('ad', this.vertices[0].id, this.vertices[3].id, 9);
    this.edges.push(ad);
    let db = new Edge('db', this.vertices[3].id, this.vertices[1].id, 2);
    this.edges.push(db);
    let ga = new Edge('ga', this.vertices[6].id, this.vertices[0].id, 7);
    this.edges.push(ga);
    let hd = new Edge('hd', this.vertices[7].id, this.vertices[3].id, 11);
    this.edges.push(hd);
  }

  addVertices(): void {
    this.vertices.forEach(vertice => {
      this.drawService.addVertice(vertice);
    });
  }

  addEdges(): void {
    this.edges.forEach(edge => {
      this.drawService.addEdge(edge);
    });
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
    this.drawService.draw();
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
      await this.drawService.draw();
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
        await this.drawService.draw();
        await this.steps.push(this.drawService.getKruskalArray());
        await this.sleep(this.sleepTime);
      } else {
        await this.drawService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        await this.drawService.draw();
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
    await this.drawService.draw();
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
      await this.drawService.draw();
      await this.sleep(this.sleepTime);
    } else {
      this.before.push(this.edge);
      await this.drawService.changeEdgeStyle(this.edge, 'black');
      this.edge.style.color = 'black';
      this.edge.style.lineStyle = 'dashed';
      await this.drawService.draw();
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
      await this.drawService.draw();
      await this.sleep(this.sleepTime);
    } else {
      let cyclic = await this.drawService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.drawService.addKruskalEdge(this.edge);
        await this.drawService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';  
        await this.steps.push(this.drawService.getKruskalArray());
        await this.drawService.draw();
      } else {
        await this.drawService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        await this.drawService.draw();
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
