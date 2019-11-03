import { Component, OnInit } from '@angular/core';
import { CytoService } from '../../services/cyto.service';

@Component({
  selector: 'app-steiner',
  templateUrl: './steiner.component.html',
  styleUrls: ['./steiner.component.css']
})
export class SteinerComponent implements OnInit {
  currentService: any;
  optimalService: any;

  constructor(
    currentService: CytoService,
    optimalService: CytoService
  ) {
    this.currentService = currentService;
    this.optimalService = optimalService;
  }

  ngOnInit() {
    this.currentService.draw('current');
    this.currentService.addKeyListener();
    this.optimalService.draw('optimal');
    this.optimalService.addKeyListener();
  }

}
