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

  busArr:any = [];

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



    });

    this.bus$.subscribe((busArr)=>{
      this.busArr = busArr;
    })

  }

  get width() {
    return this.tdxService.width;
  }

  get bus$() {
    return this.tdxService.bus$;
  };
  // busArr!: any[];
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
      this.tdxService.getName();
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



  ngOnInit(): void {

  }

}
