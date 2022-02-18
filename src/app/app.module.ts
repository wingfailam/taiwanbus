import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CitiesComponent } from './cities/cities.component';
import { BusComponent } from './cities/bus/bus.component';
import { StopsComponent } from './cities/bus/stops/stops.component';
import { EstimateComponent } from './cities/bus/stops/estimate/estimate.component';
import { MapComponent } from './map/map.component';
import { MainSelectComponent } from './main-select/main-select.component';





@NgModule({
  declarations: [
    AppComponent,
    CitiesComponent,
    BusComponent,
    StopsComponent,
    EstimateComponent,
    MapComponent,
    MainSelectComponent,



  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
