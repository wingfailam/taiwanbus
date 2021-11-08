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
  private map: any;
  shape$!: Observable<any[]>;
  shape!: any;

  processShape = (geometry: string) => {
    // geometry = "LINESTRING(120.57661 24.22592,120.57965 24.22111,120.58007 24.21982,120.58041 24.21724,120.58131 24.20892,120.58141 24.20664,120.58115 24.20464,120.57962 24.19052,120.57963 24.19013,120.57979 24.18962,120.57996 24.18927,120.58030 24.18875,120.58073 24.18836,120.58116 24.18806,120.58615 24.18587,120.59358 24.18272,120.59494 24.18225,120.59636 24.18198,120.59749 24.18191,120.59864 24.18191,120.59955 24.18201,120.60038 24.18217,120.60361 24.18294,120.60659 24.18360,120.60977 24.18440,120.61079 24.18449,120.61175 24.18443,120.61283 24.18416,120.61430 24.18356,120.61577 24.18280,120.61730 24.18203,120.61929 24.18108,120.62332 24.17903,120.63060 24.17537,120.63503 24.17215,120.63959 24.16868,120.64177 24.16708,120.64350 24.16587,120.64414 24.16555,120.64807 24.16342,120.65599 24.15905,120.65925 24.15729,120.66117 24.15626,120.66313 24.15517,120.66652 24.15323,120.66728 24.15279,120.66790 24.15237,120.66860 24.15187,120.66929 24.15131,120.66990 24.15072,120.67177 24.14908,120.67482 24.14643,120.67653 24.14496,120.67806 24.14361,120.68014 24.14181,120.68225 24.13999,120.68397 24.13850,120.68453 24.13783,120.68462 24.13776,120.68486 24.13752,120.68493 24.13752,120.68503 24.13750,120.68548 24.13755,120.68585 24.13760,120.68614 24.13765,120.68652 24.13778)";
    let temp = geometry.split("(");
    let coordinates: number[][] = [];
    temp = temp[1].split(")");
    temp = temp[0].split(",");
    temp.forEach(el => {
      // console.log(el.split(" "));
      // coordinates.push(el.split(" "))
      let temp = el.split(" ").map(el => {
        return parseFloat(el);
      })
      coordinates.push(temp)
    });
    let result = {
      "type": "LineString",
      "coordinates": coordinates

    }
    // console.log(result);
    return result;
  }
  getShape() {
    this.tdxService.getShape().subscribe(data => {
      console.log(data);
      this.shape = this.processShape(data[0]['Geometry']);

      L.geoJSON(<geojson.LineString>this.shape, {
      }).addTo(this.map);
    })
  }

  private initMap(): void {
    this.getShape()
    this.map = L.map('map', {
      // center: [39.8282, -98.5795],
      center: this.tdxService.location,
      zoom: 15
    });

    let url = "https://api.mapbox.com/styles/v1/pandaoao/ckuib6yuz54fd17qm2bkxqeqt/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGFuZGFvYW8iLCJhIjoiY2t1aWI0dGgwMm1oejMycTZ2YWt5dWw3OSJ9.zMxDIA087Tqzl8DdTIr0Gg"

    const tiles = L.tileLayer(url, {
      // maxZoom: 18,
      // minZoom: 3,
      attribution: '&copy; 公車地圖 by <a href="https://github.com/wingfailam">wingfailam</a>'
    });

    tiles.addTo(this.map);

    let geojsonFeature = {
      "type": "Feature",
      "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
      }
    };
    let line = {
      "type": "LineString",
      "coordinates": [[120.68614, 24.13765], [120.68652, 24.13778]]
    };
    let point = {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
    }


  }
  constructor(private tdxService: TdxService) {
    // this.shape$.subscribe(data=>{
    //   this.shape= data[0]['Geometry'];
    // })

  }

  ngAfterViewInit(): void {
    this.initMap();

  }

}
