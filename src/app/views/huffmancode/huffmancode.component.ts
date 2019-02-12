import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-huffmancode',
  templateUrl: './huffmancode.component.html',
  styleUrls: ['./huffmancode.component.css']
})
export class HuffmancodeComponent implements OnInit {
  tree = new Object({
    val: -1,
    left: null,
    right: null
  });
  userText: String;

  constructor() {
    let tree2 = new Object({
      val: 2,
      leftChild: null,
      rightChild: null
    });

    let tree3 = new Object({
      val: 3,
      leftChild: null,
      rightChild: null
    });
    
    this.tree = new Object({
      val: 1,
      leftChild: tree2,
      rightChild: tree3
    });
  }

  ngOnInit() {
    console.log(this.tree);
  }

  convertToInt(el) {
    return el.charCodeAt(0);
  }

}
