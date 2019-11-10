import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InversionComponent } from './views/inversion/inversion.component';
import { HuffmancodeComponent } from './views/huffmancode/huffmancode.component';
import { KruskalComponent } from './views/kruskal/kruskal.component';
import { HomeComponent } from './views/home/home.component';
import { D3Service } from './services/d3.service';
import { CytoService } from './services/cyto.service';
import { SteinerComponent } from './views/steiner/steiner.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    InversionComponent,
    HuffmancodeComponent,
    KruskalComponent,
    HomeComponent,
    SteinerComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    D3Service,
    CytoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
