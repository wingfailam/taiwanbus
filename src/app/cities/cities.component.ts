import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { TdxService } from '../core/services/tdx.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'app-cities',
  providers: [TdxService],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent implements OnInit {


  cities$!: Observable<any[]>;
  selectedCity!: string;

  constructor(private tdxService: TdxService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {


    this.route.queryParams.subscribe(params => {
      this.selectedCity = params['city'] || "Taichung";
    });

    this.cities$ = this.tdxService.getCities();

  }
  changeCity() {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { city: this.selectedCity },
        queryParamsHandling: 'merge'
      });
  }


}
