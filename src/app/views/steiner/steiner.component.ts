import { Component, OnInit } from '@angular/core';
import { CytoService } from '../../services/cyto.service';
import { Vertice } from '../../models/vertice.model';
import { Edge } from '../../models/edge.model';
import { Pair } from '../../models/pair.model';
import Combinatorics from 'js-combinatorics';
import PriorityQueue from 'ts-priority-queue';
import { Graph } from '../../models/graph.model';

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
  paused: boolean;
  selectingSubs: boolean;

  weightSum: number;
  optimalWeightSum: number;

  smallestSubset: Vertice[];
  biggestSubset: Vertice[];

  sleepTime: number;
  speed: number;

  exampleGraphs: Graph[];

  constructor() {
    this.currentService = new CytoService;
    this.optimalService = new CytoService;
    this.vertices = [];
    this.numVertices = 3;
    this.solving = true;
    this.subsets = [];
    this.selectingSubs = false;
    this.sleepTime = 2000;
    this.speed = 1;
    this.weightSum = null;
    this.optimalWeightSum = null;
    this.paused = true;
    this.exampleGraphs = [];
  }

  async ngOnInit() {
    await this.currentService.draw('current');
    await this.createVertices();
    await this.addVerticesToGraph(this.currentService);
    await this.currentService.addKeyListener();
    await this.optimalService.draw('optimal').then(f => {this.solving = false;});
    this.createExampleGraphs();
  }

  createExampleGraphs() {
    let graph1 = new Graph(6);
    graph1.addEdge(0, 1, 1);
    graph1.addEdge(0, 2, 1);
    graph1.addEdge(0, 5, 1);
    graph1.addEdge(1, 5, 2);
    graph1.addEdge(1, 2, 2);
    graph1.addEdge(5, 2, 2);
    graph1.addEdge(5, 4, 4);
    graph1.addEdge(4, 3, 1);
    graph1.addEdge(3, 2, 1);
    this.exampleGraphs.push(graph1);
  }

  async useExampleGraph() {
    await this.currentService.reset();
    let len = this.exampleGraphs.length;
    let g = this.exampleGraphs[Math.floor(Math.random()*len)];
    this.numVertices = g.vertices.length;
    await this.createVertices();
    await this.addVerticesToGraph(this.currentService);
    for(let i = 0; i < g.edges.length; i++) {
      await this.currentService.addEdge(g.edges[i]);
    }
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

  faster() {
    this.sleepTime /= 2;
    this.speed *= 2;
  }

  slower() {
    this.sleepTime *= 2;
    this.speed /= 2;
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

  editGraph() {
    this.selectingSubs = false;
    this.currentService.updateSelectSub(false);
  }

  async reset() {
    this.solving = false;
    this.paused = true;

    // reset current service
    this.currentService.reset();
    await this.smallestSubset.forEach(v => {
      this.currentService.changeVerticeStyle(v, 'red');
    });
    this.currentService.refresh();

    // reset optimal service
    await this.optimalService.reset();
    await this.optimalService.removeAllVertices();
    await this.optimalService.removeAllEdges();
    await this.optimalService.refresh();

    this.subsets = [];
    this.smallestSubset = null;
    this.biggestSubset = null;
    this.weightSum = null
    this.optimalWeightSum = null;
  }

  async algorithm() {
    this.paused = !this.paused;
    if(!this.solving) {
      this.solving = true;
      await this.addVerticesToGraph(this.optimalService);
      await this.addEdgesToGraph(
        this.optimalService,
        this.currentService.getEdges()
      );
      await this.optimalService.refresh();

      this.setSubsets();
      this.smallestSubset = this.subsets[0];
      this.biggestSubset = this.subsets[this.subsets.length-1];

      await this.currentService.sleep(this.sleepTime);
    }

    while(this.subsets.length > 0) {
      if(this.paused) {
        return;
      }
      this.currentService.reset();
      let subset = this.subsets[0].map(function(v) {
        return v.id.key;
      });
      this.updateVerticeColorsInGraph(
        this.currentService,
        this.biggestSubset,
        subset
      );
      let edges = await this.currentService.getEdgesBetweenSubset(subset);
      await this.createKruskalTree(edges);
      await this.currentService.refresh();

      this.weightSum = await this.currentService.getSumOfEdgeWeights();
      if(this.optimalWeightSum === null ||
        (this.weightSum < this.optimalWeightSum &&
          await this.currentService.checkVerticesConnected(subset)
        )
      ) {
        await this.optimalService.reset();
        await this.updateVerticeColorsInGraph(
          this.optimalService,
          this.biggestSubset,
          subset
        );
        let kruskalEdges = this.currentService.getKruskalEdges();
        console.log(kruskalEdges);
        await this.updateEdgeColorsInGraph(
          this.optimalService,
          kruskalEdges
        );
        await this.optimalService.refresh();

        this.optimalWeightSum = this.weightSum;
      }
      this.subsets.shift();

      await this.currentService.sleep(this.sleepTime);
    }
    this.paused = true;
  }

  async addEdgesToGraph(service: CytoService, edges: Edge[]) {
    service.removeAllEdges();
    edges.forEach(edge => {
      service.addEdge(edge);
    });
  }

  async updateVerticeColorsInGraph(
    service: CytoService,
    biggestSet: Vertice[],
    set: number[]
  ) {
    for(let s = 0; s < biggestSet.length; s++) {
      if(biggestSet[s].color === 'red' || set.includes(biggestSet[s].id.key)) {
        await service.changeVerticeStyle(biggestSet[s], biggestSet[s].color);
      }
    }
  }

  async updateEdgeColorsInGraph(
    service: CytoService,
    edges: Edge[]
  ) {
    for(let e = 0; e < edges.length; e++) {
      await service.changeEdgeStyle(edges[e], edges[e].style.color);
    }
  }

  async createKruskalTree(edges: Edge[]) {
    let queue = new PriorityQueue({
      comparator: function(a: Edge, b: Edge) {
        return Number(a.weight) - Number(b.weight);
      }
    });

    edges.forEach(e => {
      queue.queue(e);
    });

    while(queue.length > 0) {
      let e = queue.dequeue();

      let cyclic = await this.currentService.isKruskalCyclic(e);
      if(!cyclic) {
        await this.currentService.addKruskalEdge(e, false);
        await this.currentService.changeEdgeStyle(e, 'red');
      }
    }
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
  }

  togglePaused() {
    this.paused = !this.paused;
  }
}
