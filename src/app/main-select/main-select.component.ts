import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit, Input, Output, forwardRef, EventEmitter, ViewChild, QueryList, ElementRef } from '@angular/core';

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
  @ViewChild('input') input:any;
  @ViewChild('close') close:any;

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
  @Input() placeholder:string="請輸入關鍵字"


  value: string ='';
  isDropdown:boolean=false;
  qureyString = '';

  get selectedValue() { //取得NgModel的值
    return this.value;
  }

  set selectedValue(value) { //寫進NgModel的值
    this.value = value;
    this.qureyString =  this.selectedLabel;
    this.notifyValueChange(); //通知父層值已修改
  }

  get selectedLabel(){
    if(this.items){
      const selectedObj = this.items.find((el:any)=>this.deepValue(el,this.bindValue) === this.selectedValue);
      const result = this.deepValue(selectedObj,this.bindLabel);
      console.log('// this.qureyString = result;')
      this.qureyString = result;
      return result;
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
  constructor() { 

    // this.qureyString =  this.selectedLabel;
    // console.log('this.qureyString =  this.selectedLabel;')
    // console.log(this.qureyString)
    // console.log( this.selectedLabel)

document.addEventListener("mouseup",(e:any)=>{
  if(e.target === this.input.nativeElement ){
    this.qureyString = ""
  }
  // 保持原先狀態
  if(e.target === this.input.nativeElement 
    || e.target === this.close.nativeElement
    || e.target.classList.contains("items")){
    return
  }else{
    this.isDropdown = false;
  }


})
  }

  ngOnChanges(): void {
    this.qureyString =  this.selectedLabel;
  }

  ngAfterViewInit(): void {
    // const cells = this.itemsRef.toArray();
    // console.log(cells[1].nativeElement);
    // console.log(cells[1].nativeElement.innerHTML);
  }

  handleClick(selectedValue:string){
    console.log('click')
    this.selectedValue = selectedValue;
    this.change.emit('click');
    this.isDropdown = false;
  }

  handelClose(){
    // this.isDropdown = true;
    // this.input.nativeElement.focus();
    if(this.qureyString === ""){
      
      setTimeout(() => {
        console.log('test')
        this.isDropdown = false;
        this.input.nativeElement.blur();
      }, 100);


    }
    this.qureyString=""
    console.log('handelClose',this.qureyString)
    // this.input.focus();
    console.log(this.input)
    this.input.nativeElement.focus();
  }

  handleFocusOut($event:Event){

    setTimeout(() => {
      console.log('handleFocusOut',$event)
      console.log('activeElement',document.activeElement);
       // This is the element that has focus
      this.isDropdown = false;

    }, 100);

    // $event.stopPropagation();


  }


}
