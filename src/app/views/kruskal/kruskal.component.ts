import { Component, OnInit } from '@angular/core';
import { KruskalService } from 'src/app/services/kruskal.service';
import { Edge } from 'src/app/models/edge.model';
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

  sleepTime = 1000;

  constructor(drawService: KruskalService) {
    this.drawService = drawService;
    this.vertices = [];
    this.edges = [];
    this.queue = new PriorityQueue({ comparator: function(a: Edge, b: Edge) { return a.data.weight - b.data.weight; }});
  }

  ngOnInit() {
    this.createVertices();
    this.createEdges();
    this.addVertices();
    this.addEdges();
    this.drawService.draw('cy');
  }

  createVertices(): void {
    let a = new Vertice('a');
    this.vertices.push(a);
    let b = new Vertice('b');
    this.vertices.push(b);
    let c = new Vertice('c');
    this.vertices.push(c);
    let d = new Vertice('d');
    this.vertices.push(d);
    let e = new Vertice('e');
    this.vertices.push(e);
    let f = new Vertice('f');
    this.vertices.push(f);
    let g = new Vertice('g');
    this.vertices.push(g);
    let h = new Vertice('h');
    this.vertices.push(h);
    let i = new Vertice('i');
    this.vertices.push(i);
    let j = new Vertice('j');
    this.vertices.push(j);
  }

  createEdges(): void {
    let ab = new Edge('ab', 'a', 'b', 10);
    this.edges.push(ab);
    let bc = new Edge('bc', 'b', 'c', 14);
    this.edges.push(bc);
    let cd = new Edge('cd', 'c', 'd', 2);
    this.edges.push(cd);
    let de = new Edge('de', 'd', 'e', 3);
    this.edges.push(de);
    let ef = new Edge('ef', 'e', 'f', 6);
    this.edges.push(ef);
    let fg = new Edge('fg', 'f', 'g', 11);
    this.edges.push(fg);
    let gh = new Edge('gh', 'g', 'h', 1);
    this.edges.push(gh);
    let hi = new Edge('hi', 'h', 'i', 5);
    this.edges.push(hi);
    let ij = new Edge('ij', 'i', 'j', 4);
    this.edges.push(ij);
    let ja = new Edge('ja', 'j', 'a', 1);
    this.edges.push(ja);
    let ad = new Edge('ad', 'a', 'd', 9);
    this.edges.push(ad);
    let db = new Edge('db', 'd', 'b', 2);
    this.edges.push(db);
    let ga = new Edge('ga', 'g', 'a', 7);
    this.edges.push(ga);
    let hd = new Edge('hd', 'h', 'd', 11);
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
    this.drawService.draw('mst');
    await this.sleep(this.sleepTime);
    this.addEdgesToQueue();
    
    while(this.queue.length) {
      let e = this.queue.dequeue();
      this.drawService.addKruskalEdge(e);
      if(!this.drawService.isKruskalCyclic()) {
        this.drawService.draw('mst');
        await this.sleep(this.sleepTime);
      } else {
        this.drawService.removeLastKruskalEdge();
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
