import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, throwError, interval } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import jsSHA from 'jssha';
import { ActivatedRoute, Router } from '@angular/router';

import * as L from 'leaflet';
import * as geojson from 'geojson';
import { async } from '@angular/core/testing';
import { makeBindingParser } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class TdxService {

  getAuthorizationHeader() {
    let AppID = '705e9a212c3242ed9a2fa2355b84f418';
    let AppKey = 'o2tSBueG3Dtk4o--mJKUv5kmGlE';

    let GMTString = new Date().toUTCString();
    let ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    let HMAC = ShaObj.getHMAC('B64');
    let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
    return { 'Authorization': Authorization, 'X-Date': GMTString };
  }

  httpOptions = {
    headers: new HttpHeaders({
      ...this.getAuthorizationHeader()
    })
  };

  selectedCity: string = "Taichung";
  selectedBus: string = "TXG300";
  selectedBusName: string = "300";
  direction: string = "0";
  selectedStopUID: string = 'TXG13567';
  stopDetail: any[] = [];
  markerOnClickEvent: any;
  map: any;
  location: any = [24.1369174, 120.6845513];
  lineLayer: any;
  stopsMarkersLayer: any;
  busMarkersLayer: any;


  shape$!: Observable<any[]>;
  shape!: any;
  public time: number = 30000;

  // selectedBus: string = "TXG300";
  // selectedBusName: string = "300";

  // selectedChange: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {

    this.route.queryParams.subscribe(params => {

      this.selectedCity = params['city'] || this.selectedCity;
      this.selectedBus = params['bus'] || this.selectedBus;
      this.selectedBusName = params['busName'] || this.selectedBusName;
      this.direction = params['direction'] || this.direction;


      //先取得所有路線
      // this.getRoutesDataSelect();

      this.getAsyncData();





      // this.setBusMarker();




    });
    interval(1000).subscribe(val => {
      // console.log(this.time / 1000, '秒')
      if (this.time === 0) {
        this.update();

      } else {
        this.time -= 1000
      }

    })

  }
  update() {
    this.time = 30000
    // 更新預估時間
    this.getEstimatesDataFill();
    // 更新公車位置
    this.setBusPositions()
    // 更新選取站點預估時間
    if (this.markerOnClickEvent) {
      this.markerOnClick(this.markerOnClickEvent, this.selectedStopUID);
    }
  }

  getCities(): Observable<any[]> {
    let citiesUrl = 'https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON';
    return this.http.get<any[]>(citiesUrl, this.httpOptions)
  }

  getRoutes(selectedCity: string): Observable<any[]> {
    let busUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}?$format=JSON`;
    return this.http.get<any[]>(busUrl, this.httpOptions)
  }

  bus$!: Observable<any[]>;
  busArr!: any[];


  selectedBusObj!: any;

  getName() {
    this.selectedBusObj = this.busArr.find(bus => bus.RouteUID === this.selectedBus);

    if (this.selectedBusObj) {
      this.selectedBusName = this.selectedBusObj['RouteName']['Zh_tw'];

    }
  }
  getRoutesDataSelect() {
    return new Promise(resolve => {
      // 防止數值在獲取、處理資料時更動造成錯誤
      let selectedCity = this.selectedCity;
      let selectedBus = this.selectedBus;
      let selectedBusName = this.selectedBusName;

      this.bus$ = this.getRoutes(this.selectedCity);

      this.bus$.subscribe(data => {

        this.busArr = data;
        // 如果找不到 就給第一台
        // 初始值一定找得到 不會進來
        if (data.find(el => el.RouteUID === selectedBus) === undefined) {

          this.selectedBus = this.busArr[0]['RouteUID'];

          // 如果找不到指定公車，消除參數
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { bus: null, busName: null },
              queryParamsHandling: 'merge',
              replaceUrl: true
            });

        }
        this.getName();
        resolve(true);

      });
    })

  }

  getStops(selectedCity: string, selectedBus: string, selectedBusName: string, direction: string) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`
    console.log(stopsUrl);
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }




  getDepartureAndDestination(selectedCity: string, selectedBus: string, selectedBusName: string) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}/${selectedBusName}?$filter=RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }
  getBusPositions() {
    let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/${this.selectedCity}/${this.selectedBusName}?$filter=Direction%20eq%20${this.direction}%20and%20RouteUID%20eq%20'${this.selectedBus}'&$format=JSON    `
    return this.http.get<any[]>(url, this.httpOptions);
  }
  getBusPositionsData() {
    return new Promise(resolve => {
      this.getBusPositions().subscribe(data => {
        resolve(data)
      })
    })
  }
  async setBusPositions() {

    let layerGroup: L.Layer[] = [];


    let data = <any[]>await this.getBusPositionsData();
    // 放在前面清空會少清第一次不知為何非同步到
    if (this.busMarkersLayer) {
      this.map.removeLayer(this.busMarkersLayer)
    };
    data.forEach(el => {

      // coordinates.push([el.StopPosition.PositionLon,el.StopPosition.PositionLat])
      let marker = L.marker([el.BusPosition.PositionLat, el.BusPosition.PositionLon], {
        icon: L.icon({
          iconUrl: 'assets/images/bus.gif',
          iconSize: [55, 55],
        })
      }).bindPopup(el.PlateNumb, { className: "plateNumb", closeButton: false });
      layerGroup.push(marker);

    });
    this.busMarkersLayer = L.layerGroup(layerGroup);
    this.busMarkersLayer.addTo(this.map);
  }
  getShape() {
    // selectedCity: string, selectedBus: string, selectedBusName: string, direction: string
    // let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/${this.selectedCity}/${this.selectedBusName}?$filter=Direction%20eq%20${this.direction}%20and%20%20RouteUID%20eq%20'${this.selectedBus}'&$format=JSON`;
    let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/${this.selectedCity}/${this.selectedBusName}?$filter=RouteUID%20eq%20'${this.selectedBus}'&$format=JSON`;

    console.log('getshape', url)
    return this.http.get<any[]>(url, this.httpOptions);
  }
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
      // 雙北多一個空格讓人處理資料困難
      if (temp.length > 2) {
        temp.splice(0, 1);
      }
      coordinates.push(temp)
    });
    let result = {
      "type": "LineString",
      "coordinates": coordinates

    }
    // console.log(result);
    return result;
  }

  getShapeData() {
    this.getShape().subscribe(data => {

      if (data.length > 0) {
        if (data.length > 1) {
          let el = data.find(el => el.Direction == this.direction)
          this.shape = this.processShape(el['Geometry']);
        } else {
          console.log('taipei')
          console.log(data);
          this.shape = this.processShape(data[0]['Geometry']);
        }

        console.log(this.shape);
        if (this.lineLayer) {
          this.map.removeLayer(this.lineLayer);

        }
        this.lineLayer = L.geoJSON(<geojson.LineString>this.shape, {
          style: { "color": "#6c99bb" }
        });
        this.map.fitBounds(this.lineLayer.getBounds())
        this.lineLayer.addTo(this.map);
      }



    })
  }

  stops: any[] = [];
  estimates: any[] = [];
  departure!: string;
  destination!: string



  async setDepartureAndDestination() {
    let departureAndDestination = <any>await this.getDepartureAndDestinationData()
    this.departure = departureAndDestination.DepartureStopNameZh;
    this.destination = departureAndDestination.DestinationStopNameZh;
  }
  getEstimates(selectedCity: string, selectedBus: string, selectedBusName: string, direction: string) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }

  getEstimatesByStop() {
    // let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${this.selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    // let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/${this.selectedCity}/Taichung?$select=StopName%2C%20RouteName%2C%20EstimateTime%2C%20NextBusTime&$filter=StopUID%20eq%20'${this.selectedStopUID}'&$format=JSON`;
    let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${this.selectedCity}?$select=StopName%2C%20RouteName%2C%20DestinationStop%2C%20EstimateTime%2C%20NextBusTime&$filter=StopUID%20eq%20%27${this.selectedStopUID}%27&$format=JSON`;
    console.log(url);
    return this.http.get<any[]>(url, this.httpOptions);
  }

  getEstimatesByStopData() {
    return new Promise(resolve => {
      this.getEstimatesByStop().subscribe(data => {
        data = data.sort(function (a, b) {
          if (a.EstimateTime && b.EstimateTime) {
            return 0;
          } else if (a.EstimateTime) {
            return -1;
          } else {
            return 1;
          }
        })
        data = data.sort(function (a, b) {
          if (a.EstimateTime && b.EstimateTime) {
            return a.EstimateTime - b.EstimateTime;
          } else if (a.EstimateTime || b.EstimateTime) {
            return a.EstimateTime ? -1 : 1;
          } else {
            if (a.NextBusTime && b.NextBusTime) {
              return <any>new Date(a.NextBusTime) - <any>new Date(b.NextBusTime);
            } else if (a.NextBusTime || b.NextBusTime) {
              return a.NextBusTime ? -1 : 1
            } else {
              return 1;
            }

          }
          // return <any>new Date(b.NextBusTime) - <any>new Date(a.NextBusTime);
        })
        this.stopDetail = data;
        console.log(this.stopDetail);
        resolve(this.stopDetail);
      })
    })

  }

  fillEstimates() {
    this.stops = this.stops.map((stop) => {
      // 清空上一筆資料
      stop.Estimates = null;
      stop.NextBusTime = null;
      stop.Status = null;

      this.estimates.map((estimate) => {
        if (stop.StopUID === estimate.StopUID) {

          if (estimate.EstimateTime) {
            if (estimate.EstimateTime / 60 <= 1) {
              stop.Estimates = "進站中";
              stop.color = '#ac4142';
            } else if (estimate.EstimateTime / 60 <= 3) {
              stop.Estimates = "即將到站";
              stop.color = '#6c99bb';
            } else {
              stop.Estimates = Math.floor(estimate.EstimateTime / 60) + ' 分';
              stop.color = '#808080';
            }
          } else if (estimate.NextBusTime) {
            stop.NextBusTime = estimate.NextBusTime;
          } else {
            stop.Status = "-";
          }

        }
      });
      return stop;
    })
  }




  getEstimatesDataFill() {

    this.getEstimates(this.selectedCity, this.selectedBus, this.selectedBusName, this.direction).subscribe((data: any[]) => {
      this.estimates = data;
      this.fillEstimates();
    })

  }
  getStopsData() {
    return new Promise(resolve => {
      this.getStops(this.selectedCity, this.selectedBus, this.selectedBusName, this.direction).subscribe((data: any[]) => {
        // console.log(data);

        if (data[0]) {
          this.stops = data[0]["Stops"]
          resolve(true);

        }



      });
    })

  }

  getDepartureAndDestinationData() {
    return new Promise(resolve => {
      this.getDepartureAndDestination(this.selectedCity, this.selectedBus, this.selectedBusName).subscribe((data: any[]) => {
        resolve(data[0]);
      })
    })
  }


  setStopsMarkers() {
    console.log('this.stops', this.stops)

    let layerGroup: L.Layer[] = [];
    if (this.stopsMarkersLayer) this.map.removeLayer(this.stopsMarkersLayer);
    // this.map.removeLayer(this.stopsMarkersLayer);

    this.stops.forEach(el => {

      // coordinates.push([el.StopPosition.PositionLon,el.StopPosition.PositionLat])
      let marker = L.marker([el.StopPosition.PositionLat, el.StopPosition.PositionLon], {
        icon: L.divIcon({
          className: 'markers',
          html: el.StopSequence
        })
      }).bindPopup('', { className: "stopDetail", closeButton: false }).on(<any>'click', e => this.markerOnClick(e, el.StopUID));
      el.Marker = marker;
      layerGroup.push(marker);

    });
    console.log('this.stops', this.stops)
    console.log('layerGroup', layerGroup)
    this.stopsMarkersLayer = L.layerGroup(layerGroup);
    this.stopsMarkersLayer.addTo(this.map);
    console.log(this.stopsMarkersLayer);

  }

  async markerOnClick(e: any, stopUID: string): Promise<any> {
    // console.log(e);
    // console.log(stopUID);
    e.target.closePopup();

    this.markerOnClickEvent = e;
    console.log("e", e);
    let popup = e.target.getPopup();
    this.selectedStopUID = stopUID;
    await this.getEstimatesByStopData();
    let stopDetail = this.stopDetail;
    // console.log(popup)
    console.log('stopDetail', stopDetail);
    let html = `
      <h3>${stopDetail[0].StopName.Zh_tw}</h3>
      <div class="routes-list">
    `;

    stopDetail.forEach(el => {
      let route: any = {};
      if (el.EstimateTime) {
        if (el.EstimateTime / 60 <= 1) {
          route.Status = "進站中";
          route.color = '#ac4142';
        } else if (el.EstimateTime / 60 <= 3) {
          route.Status = "即將到站";
          route.color = '#6c99bb';
        } else {
          route.Status = Math.floor(el.EstimateTime / 60) + ' 分';
          route.color = '#808080';
        }
      } else if (el.NextBusTime) {
        route.Status = new Date(el.NextBusTime).getHours().toString().padStart(2, "0") + ':' + new Date(el.NextBusTime).getMinutes().toString().padStart(2, "0");

      } else {
        route.Status = "-";
      }
      // console.log(route)
      let temp = `
      <li>

        <h4>${el.RouteName.Zh_tw}</h4>

        <span id="status" style="background-color: ${route.color}">${route.Status}</span> 

      </li>
      `;
      html += temp;

    })
    html += `</div>`;

    popup.setContent(html);
    e.target.openPopup();
    console.log(e.target);

    return true;
  }





  async test(stop: any): Promise<any> {
    await this.getEstimatesByStopData();
  }
  testClick() {
    console.log(this.time);
    // this.test('TXG13567');

  }



  // }
  async liOnClick(stop: any): Promise<any> {
    this.handleChange();
    console.log(stop);
    // stop.Marker.openPopup();
    let latlng = [stop.Marker._latlng.lat + 0.025, stop.Marker._latlng.lng]
    this.map.flyTo(latlng, 12);

    this.markerOnClick({ target: stop.Marker }, stop.StopUID);

    stop.Marker.openPopup();


    // this.selectedStopUID = stop.StopUID;
    // console.log(this.selectedStopUID);
    // await this.getEstimatesByStopData();
    // let stopDetail = this.stopDetail;
    // // console.log(popup)
    // console.log('stopDetail', stopDetail);
    // let html = `
    //       <h3>${stopDetail[0].StopName.Zh_tw}</h3>
    //       <div class="routes-list">
    //     `;

    // stopDetail.forEach(el => {
    //   let route: any = {};
    //   if (el.EstimateTime) {
    //     if (el.EstimateTime / 60 <= 1) {
    //       route.Status = "進站中";
    //       route.color = '#ac4142';
    //     } else if (el.EstimateTime / 60 <= 3) {
    //       route.Status = "即將到站";
    //       route.color = '#6c99bb';
    //     } else {
    //       route.Status = Math.floor(el.EstimateTime / 60) + ' 分';
    //       route.color = '#808080';
    //     }
    //   } else if (el.NextBusTime) {
    //     route.Status = new Date(el.NextBusTime).getHours().toString().padStart(2, "0") + ':' + new Date(el.NextBusTime).getMinutes().toString().padStart(2, "0");

    //   } else {
    //     route.Status = "-";
    //   }
    //   // console.log(route)
    //   let temp = `
    //       <li>

    //         <h4>${el.RouteName.Zh_tw}</h4>

    //         <span id="status" style="background-color: ${route.color}">${route.Status}</span> 

    //       </li>
    //       `;
    //   html += temp;

    // })
    // html += `</div>`;


    // let marker = L.marker([stop.StopPosition.PositionLat, stop.StopPosition.PositionLon], {
    //   icon: L.divIcon({
    //     className: 'markers',
    //     html: stop.StopSequence
    //   })
    // }).bindPopup(html, { className: "stopDetail", closeButton: false }).on(<any>'click', e => this.markerOnClick(e, stop.StopUID)).openPopup();
    // console.log(marker)
    // marker.addTo(this.map);
    // // popup.setContent(html);
    // return true;


  }




  setBusMarker() {

    let ll = [24.22592, 120.57661];
    // let ll = [120.57661, 24.22592];

    let marker = L.marker(<L.LatLngExpression>ll, {
      icon: L.icon({
        iconUrl: 'assets/images/bus.gif',
        iconSize: [55, 55],
      }),
      // zIndexOffset: 100
    })
    marker.addTo(this.map);
  }

  // 需要先決定公車路線才能呈現該資料
  async getAsyncData() {
    // 取得完所有路線後才能選擇路線並給予該路線的資訊
    // 已知路線
    await this.getRoutesDataSelect();
    // 取得該路線的路線圖
    this.getShapeData();
    // 取得起迄站名稱
    this.setDepartureAndDestination();
    //取得預估時間
    // this.getEstimatesDataFill();
    //取得並設置公車位置
    this.setBusPositions();

    // 取得站點位置
    await this.getStopsData()
    //  取得並填入預估時間
    this.getEstimatesDataFill()

    // 取得該路線的所有站點位置

    // 設置站點位置
    this.setStopsMarkers();

    // this.setBusMarker();
    this.getEstimatesByStopData();
  }

  change = false;
  handleChange() {
    console.log('change');
    this.change = !this.change;
  }

}
