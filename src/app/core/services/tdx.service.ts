import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import jsSHA from 'jssha';

@Injectable({
  providedIn: 'root'
})
export class TdxService {

  getAuthorizationHeader() {
    //  填入自己 ID、KEY 開始
    let AppID = '705e9a212c3242ed9a2fa2355b84f418';
    let AppKey = 'o2tSBueG3Dtk4o--mJKUv5kmGlE';

    //  填入自己 ID、KEY 結束
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

  constructor(private http: HttpClient) { }

  getCities(): Observable<any[]> {
    let citiesUrl = 'https://gist.motc.gov.tw/gist_api/V3/Map/Basic/City?$format=JSON';
    return this.http.get<any[]>(citiesUrl, this.httpOptions)
  }

  getBus(selectedCity: string): Observable<any[]> {
    // let busUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/' + selectedCity + '?$format=JSON';
    let busUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${selectedCity}?$format=JSON`;
    return this.http.get<any[]>(busUrl, this.httpOptions)
  }

  getStops(selectedCity: string, selectedBus: string, selectedBusName: string, direction: string) {
    // let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${selectedCity}/${selectedBusName}?$select=Stops&$filter=Direction%20eq%200%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`
    let stopsUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${selectedCity}/${selectedBusName}?$filter=Direction%20eq%20${direction}%20and%20RouteUID%20eq%20'${selectedBus}'&$format=JSON`

    // console.log("======================");
    // console.log(selectedCity);
    // console.log(selectedBusName);
    // console.log(stopsUrl);

    return this.http.get<any[]>(stopsUrl, this.httpOptions);
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
}
