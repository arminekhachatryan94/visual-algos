import { Component, OnInit } from '@angular/core';
import { KruskalService } from 'src/app/services/kruskal.service';
import { Edge } from 'src/app/models/edge.model';
import { Vertice } from 'src/app/models/vertice.model';

@Component({
  selector: 'app-kruskal',
  templateUrl: './kruskal.component.html',
  styleUrls: ['./kruskal.component.css']
})
export class KruskalComponent implements OnInit {
  drawService: KruskalService;

  constructor(drawService: KruskalService) {
    this.drawService = drawService;
  }

  ngOnInit() {
    this.setUp();
    this.drawService.draw();
  }

  setUp() {
    let a = new Vertice('a');
    this.drawService.addVertice(a);
    let b = new Vertice('b');
    this.drawService.addVertice(b);
    let c = new Vertice('c');
    this.drawService.addVertice(c);
    let d = new Vertice('d');
    this.drawService.addVertice(d);
    let e = new Vertice('e');
    this.drawService.addVertice(e);
    let f = new Vertice('f');
    this.drawService.addVertice(f);
    let g = new Vertice('g');
    this.drawService.addVertice(g);
    let h = new Vertice('h');
    this.drawService.addVertice(h);
    let i = new Vertice('i');
    this.drawService.addVertice(i);
    let j = new Vertice('j');
    this.drawService.addVertice(j);

    let ab = new Edge('ab', 'a', 'b');
    this.drawService.addEdge(ab);
    let bc = new Edge('bc', 'b', 'c');
    this.drawService.addEdge(bc);
    let cd = new Edge('cd', 'c', 'd');
    this.drawService.addEdge(cd);
    let de = new Edge('de', 'd', 'e');
    this.drawService.addEdge(de);
    let ef = new Edge('ef', 'e', 'f');
    this.drawService.addEdge(ef);
    let fg = new Edge('fg', 'f', 'g');
    this.drawService.addEdge(fg);
    let gh = new Edge('gh', 'g', 'h');
    this.drawService.addEdge(gh);
    let hi = new Edge('hi', 'h', 'i');
    this.drawService.addEdge(hi);
    let ij = new Edge('ij', 'i', 'j');
    this.drawService.addEdge(ij);
    let ja = new Edge('ja', 'j', 'a');
    this.drawService.addEdge(ja);
    let ad = new Edge('ad', 'a', 'd');
    this.drawService.addEdge(ad);
    let db = new Edge('db', 'd', 'b');
    this.drawService.addEdge(db);
    let ga = new Edge('ga', 'g', 'a');
    this.drawService.addEdge(ga);
    let hd = new Edge('hd', 'h', 'd');
    this.drawService.addEdge(hd);
  }

  getKruskal() {
    console.log(this.drawService.getKruskal());
  }

}
