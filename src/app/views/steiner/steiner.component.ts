import { Component, OnInit } from '@angular/core';
import { CytoService } from '../../services/cyto.service';
import { Vertice } from '../../models/vertice.model';
import { Edge } from '../../models/edge.model';
import { Pair } from '../../models/pair.model';
import Combinatorics from 'js-combinatorics';
import PriorityQueue from 'ts-priority-queue';
import { Graph } from '../../models/graph.model';
import { FileService } from '../../services/file.service';

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

  uploadText: string;
  uploadFile: string;
  uploadError: boolean;
  graphString: string;

  messages: string[];

  currentSubset: number[];

  finished: boolean;

  constructor(private fileService: FileService) {
    this.currentService = new CytoService;
    this.optimalService = new CytoService;
    this.optimalService.updateSelectSub(null);
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

    this.uploadText = '';
    this.uploadFile = '';
    this.uploadError = false;
    this.graphString = '';

    this.messages = [];
    this.currentSubset = null;

    this.finished = false;
  }

  async ngOnInit() {
    await this.currentService.draw('current');
    await this.createVertices();
    await this.addVerticesToGraph(this.currentService);
    await this.currentService.addKeyListener();
    await this.optimalService.draw('optimal').then(f => {this.solving = false;});
    this.createExampleGraphs();
  }

  readFile(event) {
    this.uploadError = false;
    let file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.uploadText = fileReader.result.toString();
    }
    fileReader.readAsText(file);
  }

  saveAlgo() {
    this.getStringFromGraph();
    this.fileService.downloadFile(this.graphString, 'steiner');
  }

  getStringFromGraph() {
    let edges = this.currentService.getEdges();
    let subVertices = this.currentService.getSubVerticeIds();
    this.graphString = this.fileService.convertSteinerGraphToString(this.numVertices, subVertices, edges);
  }

  uploadAlgo() {
    if(this.uploadText.length !== 0) {
      let g = this.fileService.convertStringToSteinerGraph(this.uploadText);
      if(g === null) {
        this.uploadError = true;
      } else {
        this.useExampleGraph(g);
        this.fileService.closeModal('uploadModal');
      }
    }
  }

  createExampleGraphs() {
    let graph1 = new Graph(5);
    graph1.addEdge(4, 0, 11);
    graph1.addEdge(4, 3, 85);
    graph1.addEdge(3, 0, 30);
    graph1.addEdge(3, 0, 30);
    graph1.addEdge(3, 2, 58);
    graph1.addEdge(2, 1, 56);
    graph1.addEdge(1, 0, 70);
    graph1.setName('V = 5');
    graph1.addSubVertices([4, 3]);
    this.exampleGraphs.push(graph1);

    let graph2 = new Graph(6);
    graph2.addEdge(0, 1, 1);
    graph2.addEdge(0, 2, 1);
    graph2.addEdge(0, 5, 1);
    graph2.addEdge(1, 5, 2);
    graph2.addEdge(1, 2, 2);
    graph2.addEdge(5, 2, 2);
    graph2.addEdge(5, 4, 4);
    graph2.addEdge(4, 3, 1);
    graph2.addEdge(3, 2, 1);
    graph2.addSubVertices([1, 2, 3, 5]);
    graph2.setName('V = 6');
    this.exampleGraphs.push(graph2);

    let graph3 = new Graph(7);
    graph3.addEdge(0, 1, 2);
    graph3.addEdge(0, 2, 6);
    graph3.addEdge(0, 3, 3);
    graph3.addEdge(0, 4, 2);
    graph3.addEdge(1, 3, 4);
    graph3.addEdge(1, 5, 13);
    graph3.addEdge(2, 4, 5);
    graph3.addEdge(2, 6, 5);
    graph3.addEdge(3, 4, 2);
    graph3.addEdge(3, 5, 2);
    graph3.addEdge(3, 6, 3);
    graph3.addEdge(5, 6, 4);
    graph3.setName('V = 7');
    graph3.addSubVertices([0, 1, 5, 6]);
    this.exampleGraphs.push(graph3);
  }

  async useExampleGraph(g: Graph) {
    await this.currentService.reset();
    await this.currentService.removeAllVertices();
    await this.currentService.removeAllEdges();

    this.numVertices = g.vertices.length;
    await this.createVertices();
    await this.addVerticesToGraph(this.currentService);
    for(let i = 0; i < g.edges.length; i++) {
      await this.currentService.addEdge(g.edges[i]);
    }
    for(let i = 0; i < g.subVertices.length; i++) {
      await this.currentService.addOrRemoveSubVertice(g.subVertices[i]);
    }
    this.selectingSubs = true;
    await this.currentService.updateSelectSub(true);
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
    this.currentService.updateSelectSub(null);
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
    this.messages = [];
    this.finished = false;
  }

  async algorithm() {
    this.currentService.updateSelectSub(null);
    this.paused = !this.paused;
    if(!this.solving) {
      this.solving = true;
      await this.addVerticesToGraph(this.optimalService);
      await this.addEdgesToGraph(
        this.optimalService,
        this.currentService.getEdges()
      );
      await this.optimalService.refresh();

      await this.setSubsets();
      this.messages.push('Get combination of all required vertices and optional vertices.');
      this.smallestSubset = this.subsets[0];
      this.biggestSubset = this.subsets[this.subsets.length-1];

      await this.currentService.sleep(this.sleepTime);
    }

    let i = 0;
    while(this.subsets.length > 0) {
      if(this.paused) {
        return;
      }
      if(this.currentSubset === null) {
        this.currentService.reset();
        this.currentSubset = this.subsets[0].map(function(v) {
          return v.id.key;
        });
        this.updateVerticeColorsInGraph(
          this.currentService,
          this.biggestSubset,
          this.currentSubset
        );
        let edges = await this.currentService.getEdgesBetweenSubset(this.currentSubset);
        await this.createKruskalTree(edges);
        await this.currentService.refresh();

        if(i === 0) {
          this.messages.push('Get spanning tree for first subset.');
        } else {
          this.messages.push('Use spanning tree for next subset.');
        }
        this.subsets.shift();
        this.weightSum = await this.currentService.getSumOfEdgeWeights();
        await this.currentService.sleep(this.sleepTime);
      }

      if(this.paused) {
        return;
      }

      this.weightSum = await this.currentService.getSumOfEdgeWeights();
      if((this.optimalWeightSum === null ||
        this.weightSum < this.optimalWeightSum) &&
        await this.currentService.checkVerticesConnected(this.currentSubset)
      ) {
        if(this.optimalWeightSum === null) {
          this.messages.push('Update optimal tree because optimal tree is blank.');
        } else {
          this.messages.push('Update optimal tree because current tree is connected and weight of current tree < weight of optimal tree.');
        }
        await this.optimalService.reset();
        await this.updateVerticeColorsInGraph(
          this.optimalService,
          this.biggestSubset,
          this.currentSubset
        );
        let kruskalEdges = this.currentService.getKruskalEdges();
        await this.updateEdgeColorsInGraph(
          this.optimalService,
          kruskalEdges
        );
        await this.optimalService.refresh();

        this.optimalWeightSum = this.weightSum;
      } else {
        if(!(await this.currentService.checkVerticesConnected(this.currentSubset))) {
          this.messages.push('Do not update optimal tree because current tree is disconnected.');
        } else {
          this.messages.push('Do not update optimal tree because weight of current tree > weight of optimal tree.')
        }
      }
      this.currentSubset = null;
      i++;

      await this.currentService.sleep(this.sleepTime);
    }
    if(this.optimalWeightSum === null) {
      this.messages.push('This graph has no Steiner Tree');
    }
    this.paused = true;
    this.finished = true;
  }

  async addEdgesToGraph(service: CytoService, edges: Edge[]) {
    await service.removeAllEdges();
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
      if(subIds.includes(vertices[v].id.key)) {
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
      if(c.length >= 2) {
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
