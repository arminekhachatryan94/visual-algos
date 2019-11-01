import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { InversionComponent } from './views/inversion/inversion.component';
import { KruskalComponent } from './views/kruskal/kruskal.component';
import { SteinerComponent } from './views/steiner/steiner.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'counting-inversions', component: InversionComponent },
  { path: 'steiner', component: SteinerComponent },
  { path: 'kruskal', component: KruskalComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
