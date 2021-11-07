import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TdxService } from 'src/app/core/services/tdx.service';



@Component({
  selector: 'app-bus',
  providers: [TdxService],
  templateUrl: './bus.component.html',
  styleUrls: ['./bus.component.scss']
})
export class BusComponent implements OnInit, OnChanges {

  @Input() selectedCity!: string;

  bus$!: Observable<any[]>;
  busArr!: any[];

  selectedBus!: string;
  selectedBusObj!: any;
  selectedBusName!: string;

  constructor(private tdxService: TdxService, private router: Router, private route: ActivatedRoute) { }

  selectedBusChange() {
    this.getName();



    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { bus: this.selectedBus },
        queryParamsHandling: 'merge'
      });
  }
  getName() {
    this.selectedBusObj = this.busArr.find(bus => bus.RouteUID === this.selectedBus);
    this.selectedBusName = this.selectedBusObj['RouteName']['Zh_tw'];
  }
  getBus() {
    this.bus$ = this.tdxService.getBus(this.selectedCity);
    this.bus$.subscribe(data => {
      this.busArr = data
      this.selectedBus = this.selectedBus || this.busArr[0]['RouteUID'];
      this.getName();
    });
  }

  ngOnInit(): void {

    // this.bus$ = this.busService.getBus(this.selectedCity);
    // this.bus$.subscribe(data => {
    //   this.busArr = data
    //   this.selectedBus = this.busArr[0]['RouteUID'];
    // });
    this.route.queryParams.subscribe(params => {
      this.selectedBus = params['bus'];
    });
    this.getBus();

  }

  ngOnChanges(changes: SimpleChanges) {
    // this.bus$ = this.busService.getBus(this.selectedCity);
    this.getBus();
    // this.doSomething(changes.selectedCity.currentValue);
    // You can also use categoryId.previousValue and 
    // categoryId.firstChange for comparing old and new values
    // this.router.navigate(
    //   [],
    //   {
    //     relativeTo: this.activatedRoute,
    //     queryParams: { city: this.selectedCity },
    //     queryParamsHandling: 'merge'
    //   });

  }
}
