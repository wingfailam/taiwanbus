import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import jsSHA from 'jssha';
import { ActivatedRoute } from '@angular/router';

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

  location: any = [24.1369174, 120.6845513];
  // selectedBus: string = "TXG300";
  // selectedBusName: string = "300";

  // selectedChange: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {

      this.selectedCity = params['city'] || this.selectedCity;
      this.selectedBus = params['bus'] || this.selectedBus;
      this.selectedBusName = params['busName'] || this.selectedBusName;
      this.direction = params['direction'] || this.direction;

    });

  }

  getCities(): Observable<any[]> {
    let citiesUrl = 'https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON';
    return this.http.get<any[]>(citiesUrl, this.httpOptions)
  }

  getBus(selectedCity: string): Observable<any[]> {
    let busUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}?$format=JSON`;
    return this.http.get<any[]>(busUrl, this.httpOptions)
  }

  getStops(selectedCity: string, selectedBus: string, selectedBusName: string, direction: string) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }

  async getStopsWithoutName(selectedCity: string, selectedBus: string, direction: string) {
    let getBus = () => {
      return new Promise(resolve => {
        this.getBus(selectedCity).subscribe((data: any[]) => {
          let result = data.find(el => el.RouteUID === selectedBus)['RouteName']['Zh_tw']
          result && resolve(result);

        })
      })
    }

    // let getBusArr = async () => {
    //   let busArr = await getBus();
    // }
    return await getBus();

  }

  getEstimates(selectedCity: string, selectedBus: string, selectedBusName: string, direction: string) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    console.log(stopsUrl);
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }

  getDepartureAndDestination(selectedCity: string, selectedBus: string, selectedBusName: string) {
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}/${selectedBusName}?$filter=RouteUID%20eq%20'${selectedBus}'&$format=JSON`;
    return this.http.get<any[]>(stopsUrl, this.httpOptions);
  }
  getShape() {
    // selectedCity: string, selectedBus: string, selectedBusName: string, direction: string
    let url = `https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/${this.selectedCity}/${this.selectedBusName}?$filter=Direction%20eq%20${this.direction}%20and%20%20RouteUID%20eq%20'${this.selectedBus}'&$format=JSON`;
    return this.http.get<any[]>(url, this.httpOptions);
  }
}
