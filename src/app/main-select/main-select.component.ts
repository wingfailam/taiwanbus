import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
  Component,
  OnInit,
  Input,
  Output,
  forwardRef,
  EventEmitter,
  ViewChild,
  QueryList,
  ElementRef,
} from '@angular/core';

export const MAIN_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MainSelectComponent),
  multi: true,
};

@Component({
  selector: 'app-main-select',
  templateUrl: './main-select.component.html',
  styleUrls: ['./main-select.component.scss'],
  providers: [MAIN_SELECT_VALUE_ACCESSOR],
})
export class MainSelectComponent implements ControlValueAccessor {
  @ViewChild('input') input: any;
  @ViewChild('close') close: any;

  @Input() msg = '無此選項。';

  @Input() items: any = [
    {
      City: 'Tainan',
      CityName: '臺南市',
    },
    {
      City: 'Taipei',
      CityName: '臺北市',
    },
  ];
  @Input() bindLabel: string = 'CityName';
  @Input() bindValue: string = 'City';
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<string>();
  @Input() placeholder: string = '請輸入關鍵字';
  @Input() inputmode: string = 'text';
  @Input() subLabel: string = '';

  value: string = '';
  isDropdown: boolean = false;
  qureyString = '';

  getSubLabelString(o: any) {
    if (this.subLabel) {
      const arr = this.subLabel.split('+');

      const newArr = arr.map(el => {
        const trimed = el.trim();

        if (trimed[0] !== "'" && trimed[trimed.length - 1] !== "'") {
          return this.deepValue(o, trimed);
        } else {
          return trimed.replace(/'/g, '');
        }
      });
      return newArr.join('');
    }
    return '';
  }

  get selectedValue() {
    //取得NgModel的值
    return this.value;
  }

  set selectedValue(value) {
    //寫進NgModel的值
    this.value = value;
    this.qureyString = this.selectedLabel;
    this.notifyValueChange(); //通知父層值已修改
  }

  get selectedLabel() {
    if (this.items) {
      const selectedObj = this.items.find(
        (el: any) => this.deepValue(el, this.bindValue) === this.selectedValue
      );
      const result = this.deepValue(selectedObj, this.bindLabel);
      console.log('// this.qureyString = result;');
      this.qureyString = result;
      return result;
    } else {
      return '';
    }
  }

  get filteredItems() {
    return this.items.filter(
      (el: any) =>
        this.deepValue(el, this.bindLabel).indexOf(this.qureyString) > -1
    );
  }

  get bindLabelArr() {
    return this.bindLabel.split('.');
  }

  deepValue = (o: any, p: any) =>
    p.split('.').reduce((a: any, v: any) => a[v], o);

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
    document.addEventListener('mouseup', (e: any) => {
      if (e.target === this.input.nativeElement) {
        this.qureyString = '';
      }
      // 保持原先狀態
      if (
        e.target === this.input.nativeElement ||
        e.target === this.close.nativeElement ||
        e.target.classList.contains('items')
      ) {
        return;
      } else {
        this.isDropdown = false;
      }
    });
  }

  ngOnChanges(): void {
    this.qureyString = this.selectedLabel;
  }

  ngAfterViewInit(): void {
    return;
  }

  handleClick(selectedValue: string) {
    this.selectedValue = selectedValue;
    this.change.emit('click');
    this.isDropdown = false;
  }

  handelClose() {
    if (this.qureyString === '') {
      setTimeout(() => {
        this.isDropdown = false;
        this.input.nativeElement.blur();
      }, 100);
    }
    this.qureyString = '';
    this.input.nativeElement.focus();
  }

  handleFocusOut($event: Event) {
    setTimeout(() => {
      this.isDropdown = false;
    }, 100);
  }
}
