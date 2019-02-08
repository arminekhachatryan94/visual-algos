import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { MergesortComponent } from './views/mergesort/mergesort.component';
import { HuffmancodeComponent } from './views/huffmancode/huffmancode.component';
import { KruskalComponent } from './views/kruskal/kruskal.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'mergesort', component: MergesortComponent },
  { path: 'huffmancode', component: HuffmancodeComponent },
  { path: 'kruskal', component: KruskalComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
