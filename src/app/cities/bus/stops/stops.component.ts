import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { resolve } from 'dns';
// import { promises, resolve } from 'dns';
import { Observable } from 'rxjs';
import { TdxService } from 'src/app/core/services/tdx.service';


@Component({
  selector: 'app-stops',
  providers: [TdxService],
  templateUrl: './stops.component.html',
  styleUrls: ['./stops.component.scss']
})
export class StopsComponent implements OnInit {

  @Input() selectedBusName!: string;
  @Input() selectedBus!: string;
  @Input() selectedCity!: string;

  direction: string = "0";
  stops: any[] = [];
  estimates: any[] = [];
  // stopsLength: number = 0;
  departure!: string;
  destination!: string

  constructor(private tdxService: TdxService, private route: ActivatedRoute, private router: Router) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.direction = params['direction'] || "0";
    });
    this.getAll();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.getAll();
  }

  async getAll() {
    this.stops = <any[]>await this.getStops();
    this.estimates = <any[]>await this.getEstimates();
    console.log(this.estimates);
    let departureAndDestination = <any>await this.getDepartureAndDestination()
    this.departure = departureAndDestination.DepartureStopNameZh;
    this.destination = departureAndDestination.DestinationStopNameZh;

    this.stops = this.stops.map((stop) => {
      // stop.Estimates = stop["Estimates"] || "-";

      this.estimates.map((estimate) => {

        if (stop.StopUID === estimate.StopUID) {
          // stop.Estimates = estimate.Estimates[0].EstimateTime;
          // console.log('estimate data', estimate.EstimateTime)
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

  getStops() {
    return new Promise(resolve => {
      this.tdxService.getStops(this.selectedCity, this.selectedBus, this.selectedBusName, this.direction).subscribe((data: any[]) => {
        // console.log(data);
        resolve(data[0]["Stops"]);



      });
    })

  }

  getEstimates() {
    return new Promise(resolve => {
      this.tdxService.getEstimates(this.selectedCity, this.selectedBus, this.selectedBusName, this.direction).subscribe((data: any[]) => {
        resolve(data);
      })
    })
  }

  getDepartureAndDestination() {
    return new Promise(resolve => {
      this.tdxService.getDepartureAndDestination(this.selectedCity, this.selectedBus, this.selectedBusName).subscribe((data: any[]) => {
        resolve(data[0]);
      })
    })
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
    this.getAll();
  }

}
