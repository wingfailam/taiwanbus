import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TdxService } from './core/services/tdx.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '台灣公車即時動態';
  public constructor(private titleService: Title, private tdxService: TdxService) { }
  ngOnInit(): void {
    this.titleService.setTitle(this.title);

  }
  refresh() {

    this.tdxService.selectedCity = "Taichung";
    this.tdxService.selectedBus = "TXG300";
    this.tdxService.selectedBusName = "300";
    this.tdxService.direction = "0";
  }

}
