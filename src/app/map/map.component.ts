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

    this.map.locate().on('locationfound', (e:any)=>{
      const circle = L.circle([e.latitude, e.longitude],{radius: 100,color:'#7e8e50'});
      const width = document.body.clientWidth;
      this.map.addLayer(circle);
      if(width<768){
        
        this.map.setView([e.latitude, e.longitude],14);


      }
    });
  



    // url="	https://tile.openstreetmap.org/${z}/${x}/${y}.png";


    console.log('????????????',this.width)
    if(this.width>768){

      const tiles = L.tileLayer(this.url, {
        // maxZoom: 18,
        // minZoom: 3,
        attribution: '&copy; 公車地圖 by <a href="https://github.com/wingfailam">wingfailam</a>'
      });
  
      tiles.addTo(this.map);
    }





    // let geojsonFeature = {
    //   "type": "Feature",
    //   "properties": {
    //     "name": "Coors Field",
    //     "amenity": "Baseball Stadium",
    //     "popupContent": "This is where the Rockies play!"
    //   },
    //   "geometry": {
    //     "type": "Point",
    //     "coordinates": [-104.99404, 39.75621]
    //   }
    // };
    // let line = {
    //   "type": "LineString",
    //   "coordinates": [[120.68614, 24.13765], [120.68652, 24.13778]]
    // };
    // let point = {
    //   "type": "Point",
    //   "coordinates": [-104.99404, 39.75621]
    // }


  }


  ngAfterViewInit(): void {
    // this.tdxService.initMap();
    this.initMap();
  }

}
