
import { Injectable } from '@angular/core';
import { Graph } from '../models/graph.model';
import { Edge } from '../models/edge.model';
import { saveAs } from 'file-saver';
import { Arr } from '../models/arr.model';

@Injectable()
export class FileService {

  constructor() {}

  convertStringToCountingInversionsArray(text: string): Arr {
    let input = text.split(" ");
    let n = [];
    if(input.length > 21) {
      return null;
    }
    for(let i = 0; i < input.length; i++) {
      if(isNaN(Number(input[i])) || Number(input[i]) < -999 || Number(input[i]) > 999) {
        return null;
      }
      n.push(Number(input[i]));
    }
    if(n[0] !== 0 && n[0] !== 1) {
      return null;
    }
    let arr = new Arr();
    arr.setArray(n.slice(1));
    arr.setOrdering(n[0]);
    return arr;
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

  convertKruskalGraphToString(numVertices: number, minMax: string, edges: Edge[]) {
    let text = numVertices + ' ';
    if(minMax === 'min') {
      text += '0';
    } else {
      text += '1';
    }
    for(let i = 0; i < edges.length; i++) {
      let e = edges[i];
      text += '\n' + e.source.key + ' ' + e.target.key + ' ' + e.weight;
    }

    return text;
  }

  downloadFile(text: string, fileName: string) {
    let blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName + ".txt");
  }
}
