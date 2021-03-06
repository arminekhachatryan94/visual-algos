import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CountingInversionsComponent } from './views/counting-inversions/counting-inversions.component';
import { KruskalComponent } from './views/kruskal/kruskal.component';
import { HomeComponent } from './views/home/home.component';
import { D3Service } from './services/d3.service';
import { CytoService } from './services/cyto.service';
import { SteinerComponent } from './views/steiner/steiner.component';
import { FileService } from './services/file.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CountingInversionsComponent,
    KruskalComponent,
    HomeComponent,
    SteinerComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    D3Service,
    CytoService,
    FileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
