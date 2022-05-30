import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { TdxService } from '../core/services/tdx.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import locations from './locations';

@Component({
  selector: 'app-cities',
  providers: [],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss'],
})
export class CitiesComponent implements OnInit {
  cities$!: Observable<any[]>;
  cities: any[];

  get width() {
    return this.tdxService.width;
  }

  get selectedCity() {
    return this.tdxService.selectedCity;
  }
  set selectedCity(city: string) {
    this.tdxService.selectedCity = city;
  }

  constructor(
    private tdxService: TdxService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cities$ = this.tdxService.getCities();
    this.cities = locations;
  }

  ngOnInit(): void {
    return;
  }
  changeCity() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        city: this.selectedCity,
        bus: null,
        busName: null,
      },

      // 預設即為 merge ， preserve 將不會改變網址、也不會傳遞參數
      // queryParamsHandling: 'merge',

      // 預設即為 false ， true 將會傳遞參數、但不會更改網址
      // skipLocationChange: false,

      // true 瀏覽器將不會有歷史記錄，預設為 false
      replaceUrl: true,
    });
  }
}
