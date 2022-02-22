import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';

export const MAIN_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MainSelectComponent),
  multi: true
};

@Component({
  selector: 'app-main-select',
  templateUrl: './main-select.component.html',
  styleUrls: ['./main-select.component.scss'],
  providers: [MAIN_SELECT_VALUE_ACCESSOR]
})
export class MainSelectComponent implements ControlValueAccessor {

  @Input() msg = '無此選項。';

  @Input() items:any = [
    {
      "City":"Tainan",
      "CityName": "臺南市"
    },
    {
      "City":"Taipei",
      "CityName": "臺北市"
    }
  ];
  @Input() bindLabel:string="CityName";
  @Input() bindValue:string="City";
  @Output('change') change = new EventEmitter<string>();


  value: string ='';
  isDropdown:boolean=false;
  qureyString = '';

  get selectedValue() { //取得NgModel的值
    return this.value;
  }

  set selectedValue(value) { //寫進NgModel的值
    this.value = value;
    this.notifyValueChange(); //通知父層值已修改
  }

  get selectedLabel(){
    if(this.items){
      const selectedObj = this.items.find((el:any)=>this.deepValue(el,this.bindValue) === this.selectedValue);
      return this.deepValue(selectedObj,this.bindLabel);
    }else{
      return "";
    }

  }

  get filteredItems(){
    return this.items.filter((el:any)=>this.deepValue(el,this.bindLabel).indexOf(this.qureyString) > -1)
  }
  
  // get normalizeBindLabel(){
  //   const bindLabelArr = this.bindLabel.split(".");
  // }

  get bindLabelArr(){
    return this.bindLabel.split(".");
  }
  // deepValue(obj:any, path:any){
  //     for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
  //         obj = obj[path[i]];
  //     };
  //     return obj;
  // };
  deepValue = (o:any, p:any) => p.split('.').reduce((a:any, v:any) => a[v], o);

  notifyValueChange() {
    if (this.onChange) {
      this.onChange(this.selectedValue);
    }
  }

  onChange: ((value: string) => {}) | undefined;
  onTouched: (() => {}) | undefined;

  writeValue(obj: any): void {
    this.selectedValue = obj;
    if (!this.selectedValue) {
      this.selectedValue = '';
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  constructor() { }

  ngOnInit(): void {
  }

  handleClick(selectedValue:string){
    console.log('click')
    this.selectedValue = selectedValue;
    this.change.emit('click');
  }

  handelClose(){
    this.qureyString=""
  }

  handleFocusOut(){
    setTimeout(() => {
      this.isDropdown = false;
    }, 100);
  }

}
