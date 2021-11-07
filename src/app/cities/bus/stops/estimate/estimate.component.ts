import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { TdxService } from 'src/app/core/services/tdx.service';

@Component({
  selector: 'app-estimate',
  providers: [TdxService],
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit {
  @Input() stopsLen!: number;
  @Input() selectedCity!: string;
  @Input() selectedBus!: string;
  @Input() selectedBusName!: string;
  data!: any[];

  constructor(private tdxService: TdxService) { }

  ngOnInit(): void {
    // this.getEstimate();
  }
  ngOnChanges(): void {
    // this.getEstimate();

  }

  // getEstimate() {
  //   this.tdxService.getEstimates(this.selectedCity, this.selectedBus, this.selectedBusName).subscribe((data: any[]) => {
  //     this.data = data;

  //   })

  // }

}
