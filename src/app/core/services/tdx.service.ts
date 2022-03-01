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
  providedIn: 'root',
})
export class TdxService {
  getAuthorizationHeader() {
    // let AppID = '705e9a212c3242ed9a2fa2355b84f418';
    // let AppKey = 'o2tSBueG3Dtk4o--mJKUv5kmGlE';
    const AppID = '8cfb982247da47e78b804403071b05c3';
    const AppKey = 'FwagQsmudU_uvDwmFRPzFy_O9XQ';

    let GMTString = new Date().toUTCString();
    let ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    let HMAC = ShaObj.getHMAC('B64');
    let Authorization =
      'hmac username="' +
      AppID +
      '", algorithm="hmac-sha1", headers="x-date", signature="' +
      HMAC +
      '"';
    return { Authorization: Authorization, 'X-Date': GMTString };
  }
  get httpOptions() {
    return {
      headers: new HttpHeaders({
        ...this.getAuthorizationHeader(),
      }),
    };
  }
  // 如果不行就不要用 get

  width: number = 0;

  selectedCity: string = 'Taichung';
  selectedBus: string = 'TXG300';
  selectedBusName: string = '300';
  direction: string = '0';
  selectedStopUID: string = 'TXG13567';
  stopDetail: any[] = [];
  markerOnClickEvent: any;
  map: any;

  lineLayer: any;
  stopsMarkersLayer: any;
  busMarkersLayer: any;
  lat: number = 0;
  lon: number = 0;

  public time: number = 30000;

  tilesUrl: string =
    'https://api.mapbox.com/styles/v1/pandaoao/ckuib6yuz54fd17qm2bkxqeqt/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGFuZGFvYW8iLCJhIjoiY2t1aWI0dGgwMm1oejMycTZ2YWt5dWw3OSJ9.zMxDIA087Tqzl8DdTIr0Gg';
  isChanged: boolean = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // 取得視窗寬度
    this.width = document.body.clientWidth;

    // 監聽視窗寬度
    window.onresize = (event: any) => {
      this.width = document.body.clientWidth;
    };

    this.route.queryParams.subscribe(params => {
      this.selectedCity = params['city'] || this.selectedCity;
      this.selectedBus = params['bus'] || this.selectedBus;
      this.selectedBusName = params['busName'] || this.selectedBusName;
      this.direction = params['direction'] || this.direction;
      // 更新除了縣市外的所有資料
      this.getAsyncData();
    });
    // 更新倒數計時
    interval(1000).subscribe(val => {
      if (this.time === 0) {
        this.updateEstimateAndBusPosition();
      } else {
        this.time -= 1000;
      }
    });
  }
  updateEstimateAndBusPosition() {
    this.time = 30000;
    // 更新預估時間
    this.getEstimatesDataFill();
    // 更新公車位置
    this.setBusPositions();
    // 更新選取站點預估時間
    if (this.markerOnClickEvent) {
      this.markerOnClick(this.markerOnClickEvent, this.selectedStopUID);
    }
  }

  getCities(): Observable<any[]> {
    let citiesUrl =
      'https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON';
    return this.http.get<any[]>(citiesUrl, this.httpOptions);
  }

  getRoutes(selectedCity: string): Observable<any[]> {
    let busUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}?$format=JSON`;
    return this.http.get<any[]>(busUrl, this.httpOptions);
  }

  bus$!: Observable<any[]>;
  busArr!: any[];

  selectedBusObj!: any;

  getSelectedBusName() {
    this.selectedBusObj = this.busArr.find(
      bus => bus.RouteUID === this.selectedBus
    );

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
        console.log('bus', data);
        this.busArr = data;
        // 如果找不到 就給第一台
        // 初始值一定找得到 不會進來
        if (data.find(el => el.RouteUID === selectedBus) === undefined) {
          this.selectedBus = this.busArr[0]['RouteUID'];

          // 如果找不到指定公車，消除參數
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { bus: null, busName: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
        this.getSelectedBusName();
        resolve(true);
      });
    });
  }

  getStops(
    selectedCity: string,
    selectedBus: string,
    selectedBusName: string,
    direction: string
  ) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`;

    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }

  getDepartureAndDestination(
    selectedCity: string,
    selectedBus: string,
    selectedBusName: string
  ) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}/${selectedBusName}?$filter=RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }
  getBusPositions() {
    let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/${this.selectedCity}/${this.selectedBusName}?$filter=Direction%20eq%20${this.direction}%20and%20RouteUID%20eq%20'${this.selectedBus}'&$format=JSON    `;
    return this.http.get<any[]>(url, this.httpOptions);
  }
  getBusPositionsData() {
    return new Promise(resolve => {
      this.getBusPositions().subscribe(data => {
        resolve(data);
      });
    });
  }
  async setBusPositions() {
    let layerGroup: L.Layer[] = [];

    let data = <any[]>await this.getBusPositionsData();
    // 放在前面清空會少清第一次不知為何非同步到
    if (this.busMarkersLayer) {
      this.map.removeLayer(this.busMarkersLayer);
    }
    data.forEach(el => {
      const iconUrl =
        el.Azimuth < 180
          ? 'assets/images/bus-right.gif'
          : 'assets/images/bus.gif';
      let marker = L.marker(
        [el.BusPosition.PositionLat, el.BusPosition.PositionLon],
        {
          icon: L.icon({
            iconUrl: iconUrl,
            iconSize: [55, 55],
          }),
        }
      ).bindPopup(el.PlateNumb, { className: 'plateNumb', closeButton: false });
      layerGroup.push(marker);
    });
    this.busMarkersLayer = L.layerGroup(layerGroup);
    this.busMarkersLayer.addTo(this.map);
  }
  getShape() {
    let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/${this.selectedCity}/${this.selectedBusName}?$filter=RouteUID%20eq%20'${this.selectedBus}'&$format=JSON`;

    return this.http.get<any[]>(url, this.httpOptions);
  }
  processShape = (geometry: string) => {
    let temp = geometry.split('(');
    let coordinates: number[][] = [];
    temp = temp[1].split(')');
    temp = temp[0].split(',');
    temp.forEach(el => {
      let temp = el.split(' ').map(el => {
        return parseFloat(el);
      });
      // 雙北多一個空格讓人處理資料困難
      if (temp.length > 2) {
        temp.splice(0, 1);
      }
      coordinates.push(temp);
    });
    let result = {
      type: 'LineString',
      coordinates: coordinates,
    };
    return result;
  };

  getShapeData() {
    this.getShape().subscribe(data => {
      let shape;
      if (data.length > 0) {
        // 判斷資料格式是否如預期
        if (data.length > 1) {
          let el = data.find(el => el.Direction == this.direction);
          shape = this.processShape(el['Geometry']);
        } else {
          // 台北的 data 格式跟其他人有些微差異
          shape = this.processShape(data[0]['Geometry']);
        }
        // 如果地圖上已有路線圖層則移除該圖層
        if (this.lineLayer) {
          this.map.removeLayer(this.lineLayer);
        }
        // 將路線畫進圖層
        this.lineLayer = L.geoJSON(<geojson.LineString>shape, {
          style: { color: '#6c99bb' },
        });
        // 將地圖移動縮放至剛好可以看見該路線的範圍
        this.map.fitBounds(this.lineLayer.getBounds());
        // 將圖層加進地圖
        this.lineLayer.addTo(this.map);
      }
    });
  }

  stops: any[] = [];
  estimates: any[] = [];
  departure!: string;
  destination!: string;

  async setDepartureAndDestination() {
    let departureAndDestination = <any>(
      await this.getDepartureAndDestinationData()
    );
    this.departure = departureAndDestination.DepartureStopNameZh;
    this.destination = departureAndDestination.DestinationStopNameZh;
  }
  getEstimates(
    selectedCity: string,
    selectedBus: string,
    selectedBusName: string,
    direction: string
  ) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }

  getEstimatesByStop() {
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
        });
        data = data.sort(function (a, b) {
          if (a.EstimateTime && b.EstimateTime) {
            return a.EstimateTime - b.EstimateTime;
          } else if (a.EstimateTime || b.EstimateTime) {
            return a.EstimateTime ? -1 : 1;
          } else {
            if (a.NextBusTime && b.NextBusTime) {
              return (
                <any>new Date(a.NextBusTime) - <any>new Date(b.NextBusTime)
              );
            } else if (a.NextBusTime || b.NextBusTime) {
              return a.NextBusTime ? -1 : 1;
            } else {
              return 1;
            }
          }
        });
        this.stopDetail = data;

        resolve(this.stopDetail);
      });
    });
  }

  fillEstimates() {
    this.stops = this.stops.map(stop => {
      // comment at 2022/02/23（三） 17:11
      // 清空上一筆資料，否則會接在後面
      stop.Estimates = null;
      stop.NextBusTime = null;
      stop.Status = null;

      this.estimates.map(estimate => {
        if (stop.StopUID === estimate.StopUID) {
          if (estimate.EstimateTime) {
            if (estimate.EstimateTime / 60 <= 1) {
              stop.Estimates = '進站中';
              stop.Status = 'arriving';
            } else if (estimate.EstimateTime / 60 <= 3) {
              stop.Estimates = '即將到站';
              stop.Status = 'coming';
            } else {
              stop.Estimates = Math.floor(estimate.EstimateTime / 60) + ' 分';
              stop.Status = 'in-minutes';
            }
          } else if (estimate.NextBusTime) {
            stop.NextBusTime = estimate.NextBusTime;
          } else {
            stop.Status = '-';
            stop.Estimates = '-';
          }
        }
      });
      return stop;
    });
  }

  getEstimatesDataFill() {
    console.log('getEstimatesDataFill');

    this.getEstimates(
      this.selectedCity,
      this.selectedBus,
      this.selectedBusName,
      this.direction
    ).subscribe((data: any[]) => {
      this.estimates = data;
      this.fillEstimates();
    });
  }
  getStopsData() {
    return new Promise(resolve => {
      this.getStops(
        this.selectedCity,
        this.selectedBus,
        this.selectedBusName,
        this.direction
      ).subscribe((data: any[]) => {
        if (data[0]) {
          this.stops = data[0]['Stops'];
          resolve(true);
        }
      });
    });
  }

  getDepartureAndDestinationData() {
    return new Promise(resolve => {
      this.getDepartureAndDestination(
        this.selectedCity,
        this.selectedBus,
        this.selectedBusName
      ).subscribe((data: any[]) => {
        resolve(data[0]);
      });
    });
  }

  setStopsMarkers() {
    let layerGroup: L.Layer[] = [];
    if (this.stopsMarkersLayer) this.map.removeLayer(this.stopsMarkersLayer);

    this.stops.forEach(el => {
      let marker = L.marker(
        [el.StopPosition.PositionLat, el.StopPosition.PositionLon],
        {
          icon: L.divIcon({
            className: 'markers',
            html: el.StopSequence,
          }),
        }
      )
        .bindPopup('', { className: 'stopDetail', closeButton: false })
        .on(<any>'click', e => this.markerOnClick(e, el.StopUID));
      el.Marker = marker;
      layerGroup.push(marker);
    });
    console.log('this.stops', this.stops);
    console.log('layerGroup', layerGroup);
    this.stopsMarkersLayer = L.layerGroup(layerGroup);
    this.stopsMarkersLayer.addTo(this.map);
    console.log(this.stopsMarkersLayer);
  }

  async markerOnClick(e: any, stopUID: string): Promise<any> {
    e.target.closePopup();

    this.markerOnClickEvent = e;
    console.log('e', e);
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
          route.Status = '進站中';
          route.StatusEn = 'arriving';
        } else if (el.EstimateTime / 60 <= 3) {
          route.Status = '即將到站';
          route.StatusEn = 'coming';
        } else {
          route.Status = Math.floor(el.EstimateTime / 60) + ' 分';
          route.StatusEn = 'in-minutes';
        }
      } else if (el.NextBusTime) {
        route.Status =
          new Date(el.NextBusTime).getHours().toString().padStart(2, '0') +
          ':' +
          new Date(el.NextBusTime).getMinutes().toString().padStart(2, '0');
        route.StatusEn = 'default';
      } else {
        route.Status = '-';
        route.StatusEn = 'default';
      }
      // console.log(route)
      let temp = `
      <li>

        <h4>${el.RouteName.Zh_tw}</h4>

        <span id="status" class="${route.StatusEn}" style="background-color: ${route.color}">${route.Status}</span> 

      </li>
      `;
      html += temp;
    });
    html += `</div>`;

    popup.setContent(html);
    e.target.openPopup();
    console.log(e.target);

    return true;
  }

  async liOnClick(stop: any): Promise<any> {
    this.handleChange();

    const latlng = [stop.Marker._latlng.lat + 0.025, stop.Marker._latlng.lng];
    this.map.flyTo(latlng, 12);

    this.markerOnClick({ target: stop.Marker }, stop.StopUID);

    stop.Marker.openPopup();
  }

  // 需要先決定公車路線才能呈現該資料
  async getAsyncData() {
    // 取得完所有路線後才能選擇路線並給予該路線的資訊
    await this.getRoutesDataSelect();
    // 取得該路線的路線圖
    this.getShapeData();
    // 取得起迄站名稱
    this.setDepartureAndDestination();
    // 取得並設置公車位置
    this.setBusPositions();

    // 取得站點位置
    await this.getStopsData();
    // 取得附近站牌
    this.getNearStops();
    //  取得並填入預估時間
    this.getEstimatesDataFill();
    // 設置站點位置
    this.setStopsMarkers();
    // 取得站點的全部路線預估時間
    this.getEstimatesByStopData();
  }

  change = false;
  handleChange() {
    this.change = !this.change;
    if (!this.isChanged) {
      const tiles = L.tileLayer(this.tilesUrl, {
        attribution:
          '<a href="https://www.mapbox.com/">Mapbox</a> &copy; 公車地圖 by <a href="https://www.wingfailam.com/info/">wingfailam</a>',
      });

      tiles.addTo(this.map);
    }
  }

  async getNearStops() {
    console.log('getNearStops');
    if (!(this.lat && this.lon)) {
      // 定位
      await this.locate();
    }

    if (this.width < 768) {
      const distances = this.stops.map(el => {
        return this.getDistanceFromLatLng(
          el.StopPosition.PositionLat,
          el.StopPosition.PositionLon,
          this.lat,
          this.lon,
          false
        );
      });
      const nearestIndex = this.indexOfSmallest(distances);
      console.log('nearDistance', distances[nearestIndex]);
      // 如果該路線最近的站牌在 20 km 內則以該站牌為中心顯示，並且放大
      if (distances[nearestIndex] < 20) {
        console.log('nearDistance', this.stops[nearestIndex].StopName.Zh_tw);
        console.log(
          'nearDistance',
          this.stops[nearestIndex].StopPosition.PositionLat,
          this.stops[nearestIndex].StopPosition.PositionLon
        );
        this.map.flyTo(
          [
            this.stops[nearestIndex].StopPosition.PositionLat,
            this.stops[nearestIndex].StopPosition.PositionLon,
          ],
          14
        );
      }
    }
  }

  /* Distance between two lat/lng coordinates in km using the Haversine formula */
  getDistanceFromLatLng(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    miles: boolean
  ) {
    // miles optional
    if (typeof miles === 'undefined') {
      miles = false;
    }
    function deg2rad(deg: number) {
      return deg * (Math.PI / 180);
    }
    function square(x: number) {
      return Math.pow(x, 2);
    }
    var r = 6371; // radius of the earth in km
    lat1 = deg2rad(lat1);
    lat2 = deg2rad(lat2);
    var lat_dif = lat2 - lat1;
    var lng_dif = deg2rad(lng2 - lng1);
    var a =
      square(Math.sin(lat_dif / 2)) +
      Math.cos(lat1) * Math.cos(lat2) * square(Math.sin(lng_dif / 2));
    var d = 2 * r * Math.asin(Math.sqrt(a));
    if (miles) {
      return d * 0.621371;
    } //return miles
    else {
      return d;
    } //return km
  }
  /* Copyright 2016, Chris Youderian, SimpleMaps, http://simplemaps.com/resources/location-distance
  Released under MIT license - https://opensource.org/licenses/MIT */

  indexOfSmallest(a: number[]) {
    let lowest = 0;
    for (let i = 1; i < a.length; i++) {
      if (a[i] < a[lowest]) lowest = i;
    }
    return lowest;
  }

  locate() {
    return new Promise(resolve => {
      // 定位成功
      this.map.locate().on('locationfound', (e: any) => {
        this.lat = e.latitude;
        this.lon = e.longitude;
        const circle = L.circle([e.latitude, e.longitude], {
          radius: 100,
          color: '#7e8e50',
        });
        this.map.addLayer(circle);
        resolve(true);
      });
    });
  }
}
