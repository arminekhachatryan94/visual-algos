import { Component, OnInit } from '@angular/core';
import { CytoService } from '../../services/cyto.service';
import { Vertice } from '../../models/vertice.model';
import { Edge } from '../../models/edge.model';
import { Pair } from '../../models/pair.model';
import Combinatorics from 'js-combinatorics';

@Component({
  selector: 'app-steiner',
  templateUrl: './steiner.component.html',
  styleUrls: ['./steiner.component.css']
})
export class SteinerComponent implements OnInit {
  currentService: any;
  optimalService: any;

  numVertices: number;
  vertices: Vertice[];
  subsets: Vertice[][];

  solving: boolean;
  selectingSubs: boolean;

  constructor() {
    this.currentService = new CytoService;
    this.optimalService = new CytoService;
    this.vertices = [];
    this.numVertices = 3;
    this.solving = true;
    this.selectingSubs = false;
  }

  async ngOnInit() {
    await this.currentService.draw('current');
    await this.createVertices();
    await this.addVerticesToGraph(this.currentService);
    await this.currentService.addKeyListener();
    await this.optimalService.draw('optimal').then(f => {this.solving = false;});
  }

  async incrementVertices() {
    let v = new Vertice(new Pair(this.numVertices, this.numVertices+''));
    await this.currentService.addVertice(v);
    this.vertices = await this.currentService.getVertices();
    await this.numVertices++;
    await this.currentService.refresh();
  }
  
  async decrementVertices() {
    await this.numVertices--;
    await this.currentService.removeLastVertice();
    this.vertices = await this.currentService.getVertices();
    await this.currentService.refresh();
  }

  async createVertices() {
    this.vertices = [];
    let i = 0;
    while(i < this.numVertices) {
      let v = new Vertice(new Pair(i, i+''));
      this.vertices.push(v);
      i++;
    }
  }

  async addVerticesToGraph(service: CytoService) {
    service.removeAllVertices();
    let i = 0;
    while(i < this.numVertices) {
      await service.addVertice(this.vertices[i]);
      i++;
    }
    await service.refresh();
  }

  generateRandomEdges() {
    this.currentService.generateRandomEdges();
  }

  selectSubVertices() {
    this.selectingSubs = true;
    this.currentService.updateSelectSub(true);
  }

  async algorithm() {
    this.solving = true;
    await this.addVerticesToGraph(this.optimalService);
    await this.addEdgesToGraph(
      this.optimalService,
      this.currentService.getEdges()
    );
    await this.optimalService.refresh();

    this.setSubsets();
  }

  async addEdgesToGraph(service: CytoService, edges: Edge[]) {
    service.removeAllEdges();
    edges.forEach(edge => {
      service.addEdge(edge);
    });
  }

  setSubsets() {
    let subIds = this.currentService.getSubVerticeIds();
    let vertices = this.currentService.getVertices();
    let subVertices = [];
    let additionalVertices = [];
    for(let v = 0; v < vertices.length; v++) {
      if(subIds.includes(vertices[v].id.value)) {
        vertices[v].changeColor('red');
        subVertices.push(vertices[v]);
      } else {
        vertices[v].changeColor('blue');
        additionalVertices.push(vertices[v]);
      }
    }

    this.subsets = [];
    let combos = Combinatorics.power(additionalVertices);
    combos.forEach((combo) => {
      let c = combo.concat(subVertices);
      if(c.length !== 0) {
        this.subsets.push(c)
      }
    });

    this.subsets.sort(function(a, b) {
      return a.length - b.length;
    });

    console.log(this.subsets);
  }
}
