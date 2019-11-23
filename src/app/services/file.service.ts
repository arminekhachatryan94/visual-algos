
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
    if(isNaN(numVertices)) {
      return null;
    }
    let minMax = Number(line1[1]);
    if(isNaN(minMax)) {
      return null;
    }
    let g = new Graph(numVertices);
    g.setMinMax(minMax);
    for(let i = 1; i < lines.length; i++) {
      let line = lines[i].split(' ');
      if(line.length !== 3) {
        return null;
      }
      let source = Number(line[0]);
      if(isNaN(source)) {
        return null;
      }
      let target = Number(line[1]);
      if(isNaN(numVertices)) {
        return null;
      }
      let weight = Number(line[2]);
      if(isNaN(weight)) {
        return null;
      }
      g.addEdge(source, target, weight);
    }
    return g;
  }

  readKruskalGraphFromFile(path: string) {
    console.log(path);   
  }
}
