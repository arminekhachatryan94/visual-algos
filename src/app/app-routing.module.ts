import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { CountingInversionsComponent } from './views/counting-inversions/counting-inversions.component';
import { KruskalComponent } from './views/kruskal/kruskal.component';
import { SteinerComponent } from './views/steiner/steiner.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'counting-inversions', component: CountingInversionsComponent },
  { path: 'steiner', component: SteinerComponent },
  { path: 'kruskal', component: KruskalComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
