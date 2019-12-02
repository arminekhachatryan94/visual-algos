import { Component, OnInit } from '@angular/core';
import { CytoService } from 'src/app/services/cyto.service';
import { FileService } from 'src/app/services/file.service';
import { Edge } from 'src/app/models/edge.model';
import { Pair } from 'src/app/models/pair.model';
import { Vertice } from 'src/app/models/vertice.model';
import { Graph } from 'src/app/models/graph.model';
import PriorityQueue from 'ts-priority-queue';

@Component({
  selector: 'app-kruskal',
  templateUrl: './kruskal.component.html',
  styleUrls: ['./kruskal.component.css']
})
export class KruskalComponent implements OnInit {
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

  paused: boolean;
  solving: boolean;

  isNext: boolean;
  isPrevious: boolean;
  nextSolving: boolean;
  previousSolving: boolean;

  sleepTime: number;
  speed: number;

  messages: string[];
  weightSum: number;

  steps = [];

  exampleGraphs: Graph[];

  uploadText: string;
  uploadFile: string;
  uploadError: boolean;

  graphString: string;

  finished: boolean;

  constructor(
    private cytoService: CytoService,
    private fileService: FileService
  ) {
    this.vertices = [];
    this.edges = [];
    this.treeType = {
      type: 'min'
    };
    this.edge = null;
    this.before = [];
    this.after = [];
    this.numVertices = 3;
    this.speed = 1;
    this.messages = [];
    this.weightSum = null;
    this.paused = true;
    this.solving = false;

    this.isNext = false;
    this.isPrevious = false;
    this.nextSolving = false;
    this.previousSolving = false;
  
    this.steps = [];
  
    this.sleepTime = 1000;
    this.exampleGraphs = [];

    this.uploadText = '';
    this.uploadFile = '';
    this.uploadError = false;
    this.graphString = '';

    this.finished = false;
  }

  ngOnInit() {
    this.cytoService.draw('cy');
    this.createVertices();
    this.cytoService.addKeyListener();
    this.steps.push(this.cytoService.getKruskalArray());
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
    this.fileService.downloadFile(this.graphString, 'kruskal');
  }

  getStringFromGraph() {
    let edges = this.cytoService.getEdges();
    this.graphString = this.fileService.convertKruskalGraphToString(this.numVertices, this.treeType.type, edges);
  }

  uploadAlgo() {
    if(this.uploadText.length !== 0) {
      let g = this.fileService.convertStringToKruskalGraph(this.uploadText);
      if(g === null) {
        this.uploadError = true;
      } else {
        this.useExampleGraph(g);
        this.fileService.closeModal('uploadModal');
      }
    }
  }

  async incrementVertices() {
    let v = new Vertice(new Pair(this.numVertices, this.numVertices+''));
    await this.cytoService.addVertice(v);
    this.vertices = this.cytoService.getVertices();
    this.numVertices++;
    this.cytoService.refresh();
  }

  async decrementVertices() {
    await this.numVertices--;
    await this.cytoService.removeLastVertice();
    this.vertices = this.cytoService.getVertices();
    this.cytoService.refresh();
  }

  createExampleGraphs() {
    let graph1 = new Graph(5);
    graph1.addEdge(0, 1, 3);
    graph1.addEdge(0, 2, 3);
    graph1.addEdge(0, 3, 7);
    graph1.addEdge(0, 4, 2);
    graph1.setName('Tree graph (V = 5)');
    this.exampleGraphs.push(graph1);

    let graph2 = new Graph(5);
    graph2.addEdge(0, 1, 2);
    graph2.addEdge(0, 2, 4);
    graph2.addEdge(0, 3, 6);
    graph2.addEdge(0, 4, 3);
    graph2.addEdge(1, 2, 1)
    graph2.addEdge(1, 3, 9);
    graph2.addEdge(1, 4, 1);
    graph2.addEdge(2, 3, 7);
    graph2.addEdge(2, 4, 1);
    graph2.addEdge(3, 4, 1);
    graph2.setName('Complete graph (V = 4)');
    this.exampleGraphs.push(graph2);
  }

  async useExampleGraph(g: Graph) {
    await this.cytoService.reset();
    await this.cytoService.removeAllVertices();
    await this.cytoService.removeAllEdges();

    this.numVertices = g.vertices.length;
    await this.createVertices();
    for(let i = 0; i < g.edges.length; i++) {
      await this.cytoService.addEdge(g.edges[i]);
    }
    this.treeType.type = (g.minMax === 0 ? 'min' : 'max');
  }

  async createVertices() {
    this.vertices = [];
    let i = 0;
    while(i < this.numVertices) {
      let v = new Vertice(new Pair(i, i+''));
      this.vertices.push(v);
      await this.cytoService.addVertice(v);
      i++;
    }
    this.cytoService.refresh();
  }

  addEdgesToQueue(): void {
    this.edges.forEach(edge => {
      this.queue.queue(edge);
    });
    this.steps.push(this.cytoService.getKruskalArray());
  }

  addEdgesToBeforeArray() {
    while(this.queue.length > 0) {
      this.before.unshift(this.queue.dequeue());
    }
  }

  async getKruskal() {
    this.cytoService.reset();
    this.weightSum = null;
    this.edges = this.cytoService.getEdges();
    this.paused = false;
    this.solving = true;
    this.cytoService.updateSelectSub(null);
    this.messages.push('Sort edges in ' + (this.treeType.type === 'asc' ? 'ascending' : 'descending') + ' order.');
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
    await this.cytoService.sleep(this.sleepTime);
    this.addEdgesToQueue();
    this.addEdgesToBeforeArray();
    this.isNext = true;

    await this.kruskalAlgorithm();
    this.finished = true;
  }

  async kruskalAlgorithm() {
    this.solving = true;
    this.paused = false;
    while(this.before.length) {
      if(this.paused) {
        this.solving = true;
        this.paused = true;
        return;
      }
      if(this.edge === null) {
        this.edge = this.before.pop();
      }
      this.isPrevious = true;
      this.messages.push(
        'Pop the last edge from the queue, and ' +
        'Check if adding edge V' + this.edge.source.key +
        ' to V' + this.edge.target.key + ' with weight '
        + this.edge.weight + ' will create a cycle in the graph.'
      );
      await this.cytoService.changeEdgeStyle(this.edge, 'blue');
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'dotted';
      await this.cytoService.sleep(this.sleepTime);

      if(this.paused) {
        this.solving = true;
        this.paused = true;
        return;
      }

      let cyclic = await this.cytoService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.cytoService.addKruskalEdge(this.edge);
        await this.cytoService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';
        await this.steps.push(this.cytoService.getKruskalArray());
        this.messages.push(
          'Add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it does not create a cycle.'
        );
      } else {
        await this.cytoService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        this.messages.push(
          'Do not add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it will create a cycle.'
        );
      }
      this.after.push(this.edge);
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      this.edge = null;
      await this.cytoService.sleep(this.sleepTime);
    }
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
    this.paused = true;
    this.solving = false;
    this.cytoService.updateSelectSub(false);
    await this.cytoService.reset();
    this.steps = [];
    this.steps.push(this.cytoService.getKruskalArray());
    await this.cytoService.sleep(this.sleepTime);
    this.before = [];
    this.after = [];
    this.edge = null;
    this.isNext = false;
    this.isPrevious = false;
    this.weightSum = null;
    this.messages = [];
    this.finished = false;
  }

  async previous() {
    this.weightSum = null;
    this.previousSolving = true;
    if(this.edge === null) {
      this.steps.pop();
      let history = this.steps.pop();
      this.steps.push(history);
      this.messages.pop();
      this.edge = this.after.pop();
      this.edge.style.color = 'blue';
      this.edge.style.lineStyle = 'dotted';
      await this.cytoService.setKruskalArray(history);
      await this.cytoService.changeEdgeStyle(this.edge, 'blue');
      await this.cytoService.removeKruskalEdge(this.edge);
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      await this.cytoService.sleep(this.sleepTime);
    } else {
      this.messages.pop();
      this.before.push(this.edge);
      await this.cytoService.changeEdgeStyle(this.edge, 'black');
      this.edge.style.color = 'black';
      this.edge.style.lineStyle = 'dashed';
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      await this.cytoService.sleep(this.sleepTime);
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
      this.edge.style.lineStyle = 'dotted';
      await this.cytoService.changeEdgeStyle(this.edge, 'blue');
      this.messages.push(
        'Pop the last edge from the queue, and '
        + 'check if adding edge V' + this.edge.source.key +
        ' to V' + this.edge.target.key + ' with weight '
        + this.edge.weight + ' will create a cycle in the graph.'
      );
      await this.cytoService.sleep(this.sleepTime);
    } else {
      let cyclic = await this.cytoService.isKruskalCyclic(this.edge);
      if(!cyclic) {
        await this.cytoService.addKruskalEdge(this.edge);
        await this.cytoService.changeEdgeStyle(this.edge, 'red');
        this.edge.style.color = 'red';
        this.edge.style.lineStyle = 'solid';  
        await this.steps.push(this.cytoService.getKruskalArray());
        this.messages.push(
          'Add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it does not create a cycle.'
        );
      } else {
        await this.cytoService.changeEdgeStyle(this.edge, 'gray');
        this.edge.style.color = 'gray';
        this.edge.style.lineStyle = 'dashed';
        this.messages.push(
          'Do not add edge V' + this.edge.source.key +
          ' to V' + this.edge.target.key + ' with weight '
          + this.edge.weight + ' to the graph because it will create a cycle.'
        );
      }
      this.weightSum = this.cytoService.getSumOfEdgeWeights();
      this.after.push(this.edge);
      this.edge = null;
      await this.cytoService.sleep(this.sleepTime);
    }
    this.isPrevious = true;
    if(!this.before.length && this.edge === null) {
      this.isNext = false;
    }
    this.nextSolving = false;
  }

  generateRandomEdges() {
    this.cytoService.generateRandomEdges();
  }

  slower() {
    this.speed /= 2;
    this.sleepTime *= 2;
  }

  faster() {
    this.speed *= 2;
    this.sleepTime /= 2;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
