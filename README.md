# Bus-web 

台灣公車即時動態網站

本專案為 [wingfailam](https://www.wingfailam.com/info) 的 Side Project，串接 [PTX 公共運輸整合資訊流通服務平臺](https://ptx.transportdata.tw/PTX/) 之資料，目前規劃上架至 [智生活 App](https://apps.apple.com/tw/app/%E4%BB%8A%E7%B6%B2%E6%99%BA%E7%94%9F%E6%B4%BB/id1071519372) `生活便利通 / 大眾交通` 中。
### Feature

* 任選縣市、公車路線、往返方向以取得所選站點資訊及預估到站時間
* 地圖呈現公車路線、其站序、與行駛中的公車位置
* 點擊地圖上的站點將顯示該站點各路線之預估到站時間（依時間排序）
* 點擊地圖上的公車將顯示車牌號碼
* 以 30 秒為期自動更新，亦可手動更新
* 支援 RWD

## Installation

此專案由 [Angular CLI](https://github.com/angular/angular-cli) version 12.2.12 生成


先前準備請先安裝套件

```
yarn install 
```

開發人員模式

```
yarn start
```
導出產品

```
yarn build
```

## Dependencies
* [Leaflet](https://leafletjs.com/)

	Javascript 地圖套件
	
* [ng-select](https://github.com/ng-select/ng-select)

	Angular select 套件
	
* [Mapbox](https://www.mapbox.com/)

	地圖圖磚（Tiles）供應者

## Latest releases

`v1.0.0`

## API references

* [PTX 公共運輸整合資訊流通服務平臺](https://ptx.transportdata.tw/MOTC/#/CityBus)

	公車資訊來源

## Build and Test

暫無撰寫測試

## Contribute

歡迎為 Bus-web 做出貢獻：

* 提交 Bugs 並幫助我們驗證修復。
* 提交 Pull requests 來修復 Bugs、提供新功能以及討論現有提案
