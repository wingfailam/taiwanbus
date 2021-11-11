import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { resolve } from 'dns';
// import { promises, resolve } from 'dns';
import { Observable } from 'rxjs';
import { TdxService } from 'src/app/core/services/tdx.service';


@Component({
  selector: 'app-stops',
  providers: [],
  templateUrl: './stops.component.html',
  styleUrls: ['./stops.component.scss']
})
export class StopsComponent implements OnInit {

  // direction: string = "0";
  get time() {
    return this.tdxService.time;
  }
  get stops() {
    return this.tdxService.stops;
  }
  get estimates() {
    return this.tdxService.estimates;
  }
  get departure() {
    return this.tdxService.departure;
  }
  get destination() { return this.tdxService.destination }
  get direction() {
    return this.tdxService.direction
  }
  set direction(val: string) {
    this.tdxService.direction = val;
  }

  constructor(private tdxService: TdxService, private route: ActivatedRoute, private router: Router) {
    // this.route.queryParams.subscribe(params => {
    //   if ('city' in params || ('bus' in params && 'busName' in params)) {
    //     console.log("查詢", this.selectedCity, '之', this.selectedBus, '的公車');
    //     console.log(this.selectedBusName);

    //     // console.log("TTTTT test getStopsWithoutName")
    //     // let test = this.tdxService.getStopsWithoutName(this.selectedCity, this.selectedBus, "0");
    //     // console.log("TTTTT test getStopsWithoutName", test);
    //   }
    //   this.tdxService.getStopsAllData();


    // });


  }

  get selectedCity() {
    return this.tdxService.selectedCity;
  }

  get selectedBus() {
    return this.tdxService.selectedBus;
  }
  get selectedBusName() {
    return this.tdxService.selectedBusName;
  }
  ngOnInit(): void {

    // this.route.queryParams.subscribe(params => {
    //   this.direction = params['direction'] || "0";
    // });
    // this.getAll();

  }

  changeDir(dir: string) {
    this.direction = dir;

    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { direction: dir },
        queryParamsHandling: 'merge'
      });
    // this.tdxService.getStopsAllData();
    this.tdxService.getAsyncData();
  }




}
