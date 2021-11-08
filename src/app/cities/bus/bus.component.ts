import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TdxService } from 'src/app/core/services/tdx.service';



@Component({
  selector: 'app-bus',
  providers: [],
  templateUrl: './bus.component.html',
  styleUrls: ['./bus.component.scss']
})
export class BusComponent implements OnInit {



  bus$!: Observable<any[]>;
  busArr!: any[];


  selectedBusObj!: any;


  constructor(private tdxService: TdxService, private router: Router, private route: ActivatedRoute) {

    this.route.queryParams.subscribe(params => {


      // if (Object.keys(params).length === 0) {

      // }
      // if ('city' in params) {


      // }
      // if ('bus' in params && 'busName' in params) {
      //   this.selectedBus = params['bus'];
      //   this.selectedBusName = params['busName']
      // }
      this.getBus();


    });

  }

  get selectedCity() {
    return this.tdxService.selectedCity;
  }

  get selectedBus() {
    return this.tdxService.selectedBus;
  }


  set selectedBus(val: string) {
    this.tdxService.selectedBus = val;
  }

  get selectedBusName() {
    return this.tdxService.selectedBusName;
  }

  set selectedBusName(val: string) {
    this.tdxService.selectedBusName = val;
  }

  selectedBusChange() {
    console.log("會進來這邊嗎？");


    if (this.selectedBus == null) {
      console.log('this.selectedBus == null');
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: {
            bus: null,
            busName: null,
          },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });

    } else {
      this.getName();
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: {
            bus: this.selectedBus,
            busName: this.selectedBusName
          },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
    }


  }
  getName() {
    this.selectedBusObj = this.busArr.find(bus => bus.RouteUID === this.selectedBus);

    if (this.selectedBusObj) {
      this.selectedBusName = this.selectedBusObj['RouteName']['Zh_tw'];

    }
  }
  getBus() {

    // 防止數值在獲取、處理資料時更動造成錯誤
    let selectedCity = this.selectedCity;
    let selectedBus = this.selectedBus;
    let selectedBusName = this.selectedBusName;

    this.bus$ = this.tdxService.getBus(this.selectedCity);

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
    });
  }

  ngOnInit(): void {

  }

}
