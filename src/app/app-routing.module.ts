import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { MergesortComponent } from './views/mergesort/mergesort.component';
import { KruskalComponent } from './views/kruskal/kruskal.component';
import { SteinerComponent } from './views/steiner/steiner.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'mergesort', component: MergesortComponent },
  { path: 'steiner', component: SteinerComponent },
  { path: 'kruskal', component: KruskalComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
