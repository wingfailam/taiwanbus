import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TdxService } from 'src/app/core/services/tdx.service';

@Component({
  selector: 'app-stops',
  providers: [],
  templateUrl: './stops.component.html',
  styleUrls: ['./stops.component.scss'],
})
export class StopsComponent implements OnInit {
  test: string = 'test';

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
  get destination() {
    return this.tdxService.destination;
  }
  get direction() {
    return this.tdxService.direction;
  }
  set direction(val: string) {
    this.tdxService.direction = val;
  }

  constructor(
    private tdxService: TdxService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
    return;
  }

  changeDir(dir: string) {
    this.direction = dir;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { direction: dir },
      queryParamsHandling: 'merge',
    });
    this.tdxService.getAsyncData();
  }
  liOnClick(stop: string) {
    this.tdxService.liOnClick(stop);
  }
  update() {
    this.tdxService.update();
  }
}
