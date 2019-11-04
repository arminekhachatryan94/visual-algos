import { Component, OnInit } from '@angular/core';
import { CytoService } from '../../services/cyto.service';
import { Vertice } from '../../models/vertice.model';
import { Pair } from '../../models/pair.model';

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

  solving: boolean;

  constructor(
    currentService: CytoService,
    optimalService: CytoService
  ) {
    this.currentService = currentService;
    this.optimalService = optimalService;
    this.vertices = [];
    this.numVertices = 3;
    this.solving = false;
  }

  async ngOnInit() {
    await this.currentService.draw('current');
    await this.createVertices();
    await this.addVerticesToGraph(this.currentService);
    await this.currentService.addKeyListener();
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
    let i = 0;
    while(i < this.numVertices) {
      let v = this.vertices[i];
      await service.addVertice(v);
      i++;
    }
    service.refresh();
  }

  async algorithm() {
    console.log('solve algo');
    this.solving = true;
    console.log(this.optimalService.getVertices());
    await this.addVerticesToGraph(this.optimalService);
    console.log('here');
    await this.optimalService.draw('optimal');
  }
}
