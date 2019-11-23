
import { Injectable } from '@angular/core';
import { Graph } from '../models/graph.model';

@Injectable()
export class FileService {

  constructor() {
  }


  convertStringToKruskalGraph(text: string): Graph {
    let lines = text.split('\n');
    let line1 = lines[0].split(' ');
    let numVertices = Number(line1[0]);
    let minMax = Number(line1[1]);
    console.log(numVertices);
    let g = new Graph(numVertices);
    g.setMinMax(minMax);
    for(let i = 1; i < lines.length; i++) {
      let line = lines[i].split(' ');
      let source = Number(line[0]);
      let target = Number(line[1]);
      let weight = Number(line[2]);
      console.log(source, target, weight);
      g.addEdge(source, target, weight);
    }
    return g;
  }
}
