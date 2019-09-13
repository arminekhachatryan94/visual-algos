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
  treeType: {
    type: string
  };

  stopped = true;
  paused = true;
  solving = false;

  sleepTime = 1000;

  constructor(drawService: KruskalService) {
    this.drawService = drawService;
    this.vertices = [];
    this.edges = [];
    this.treeType = {
      type: 'min'
    };
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

    await this.kruskalAlgorithm();
  }

  async kruskalAlgorithm() {
    this.stopped = false;
    this.paused = false;
    while(this.queue.length) {
      if(this.stopped || this.paused) {
        this.solving = true;
        this.paused = true;
        return;
      }
      let e = this.queue.dequeue();
      let cyclic = await this.drawService.isKruskalCyclic(e);
      if(!cyclic) {
        await this.drawService.addKruskalEdge(e);
        await this.drawService.draw();
        await this.sleep(this.sleepTime);
      }
    }
    this.solving = false;
    this.stopped = true;
    this.paused = true;
  }

  async pauseContinueKruskal() {
    this.paused = !this.paused;
    if(!this.paused) {
      this.kruskalAlgorithm();
    }
  }

  async reset() {
    this.stopped = false;
    this.solving = true;
    this.drawService.reset();
    await this.sleep(this.sleepTime);
    this.drawService.draw();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
