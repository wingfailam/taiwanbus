import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as geojson from 'geojson';
import { Observable } from 'rxjs';
import { TdxService } from '../core/services/tdx.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  get width(){
    return this.tdxService.width;
  }
  get url(){
    return this.tdxService.url;
  }
  get map() {
    return this.tdxService.map;
  }
  set map(value: any) {
    this.tdxService.map = value
  }

  set lat(val: number){
    this.tdxService.lat = val;
  }
  set lon(val: number){
    this.tdxService.lat = val;
  }


  constructor(private tdxService: TdxService) {
    // this.shape$.subscribe(data=>{
    //   this.shape= data[0]['Geometry'];
    // })


  }
  initMap(): void {
    this.map = L.map('map', {
      // center: this.tdxService.location,
      // zoom: 12
    });

    // 定位
    this.map.locate().on('locationfound', (e:any)=>{
      this.lat = e.latitude;
      this.lon = e.longitude;
      const circle = L.circle([e.latitude, e.longitude],{radius: 100,color:'#7e8e50'});
      this.map.addLayer(circle);
    });

    // 如果非手機才會在一開始就載入圖磚（流量控管）
    if(this.width>768){

      const tiles = L.tileLayer(this.url, {
        // maxZoom: 18,
        // minZoom: 3,
        attribution: '<a href="https://www.mapbox.com/">Mapbox</a> &copy; 公車地圖 by <a href="https://www.wingfailam.com/">wingfailam</a>'
      });
  
      tiles.addTo(this.map);
    }

  }


  ngAfterViewInit(): void {
    // this.tdxService.initMap();
    this.initMap();
  }

}
