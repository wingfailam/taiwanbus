import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TdxService } from 'src/app/core/services/tdx.service';

@Component({
  selector: 'app-bus',
  providers: [],
  templateUrl: './bus.component.html',
  styleUrls: ['./bus.component.scss'],
})
export class BusComponent implements OnInit {
  busArr: any = [];

  constructor(
    private tdxService: TdxService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get width() {
    return this.tdxService.width;
  }

  get bus$() {
    return this.tdxService.bus$;
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
    if (this.selectedBus == null) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          bus: null,
          busName: null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      this.tdxService.getName();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          bus: this.selectedBus,
          busName: this.selectedBusName,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  ngOnInit(): void {
    return;
  }
}
