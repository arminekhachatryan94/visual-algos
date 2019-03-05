import { Component, OnInit } from '@angular/core';
import { HuffmanNode } from 'src/app/models/huffmannode.model';

@Component({
  selector: 'app-huffmancode',
  templateUrl: './huffmancode.component.html',
  styleUrls: ['./huffmancode.component.css']
})
export class HuffmancodeComponent implements OnInit {
  tree: HuffmanNode;
  userText: String;
  textArray: HuffmanNode[];

  constructor() {}

  ngOnInit() {
    console.log(this.tree);
    this.textArray = new Array();
  }

  convertToInt(el) {
    return el.charCodeAt(0);
  }

  generateHuffmanCodeTree() {
    console.log(this.userText);
    if(this.userText != undefined) {
      for(let i = 0; i < this.userText.length; i++) {
        let temp = new HuffmanNode();
        temp.character = this.userText[i];
        temp.frequency = -1;
        temp.leftChild = null;
        temp.rightChild = null;
        this.textArray.push(temp);
      }
    }
  }

}
