import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { TdxService } from '../core/services/tdx.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'app-cities',
  providers: [],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent implements OnInit {


  cities$!: Observable<any[]>;



  get selectedCity() {
    return this.tdxService.selectedCity;
  }
  set selectedCity(city: string) {
    this.tdxService.selectedCity = city;
  }

  constructor(private tdxService: TdxService, private router: Router, private route: ActivatedRoute) {

    // this.route.queryParams.subscribe(params => {
    //   if ('city' in params) {
    //     this.tdxService.selectedCity = params['city'];
    //     this.selectedCity = params['city'];
    //   } else {
    //     this.selectedCity = this.selectedCity;
    //   }

    // });


    this.cities$ = this.tdxService.getCities();
  }

  ngOnInit(): void {




  }
  changeCity() {
    // this.tdxService.selectedChange.next({ "selectedCity": this.selectedCity })
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {
          city: this.selectedCity,
          bus: null,
          busName: null
        },
        queryParamsHandling: 'merge',
        // skipLocationChange: true
        replaceUrl: true
      });
  }


}
