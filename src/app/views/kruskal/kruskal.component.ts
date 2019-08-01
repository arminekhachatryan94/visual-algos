import { Component, OnInit } from '@angular/core';
import { KruskalService } from 'src/app/services/kruskal.service';

@Component({
  selector: 'app-kruskal',
  templateUrl: './kruskal.component.html',
  styleUrls: ['./kruskal.component.css']
})
export class KruskalComponent implements OnInit {
  drawService: KruskalService;

  constructor(drawService: KruskalService) {
    this.drawService = drawService;
  }

  ngOnInit() {
    this.drawService.draw();
  }

  getKruskal() {
    console.log(this.drawService.getKruskal());
  }

}
