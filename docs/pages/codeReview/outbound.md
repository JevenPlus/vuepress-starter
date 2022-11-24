### 主讲人：肖柢

### 出库拣货单

### 2022-11-24

### Before
``` html
 <w-tab v-model="activeTab" @tab-click="handleClick" :list="tabOptions"></w-tab>
```


``` js
// 切换 tab栏
 handleClick(tab) {
      const index = tab.index;
      if (index >= 0) {
        this.checkForm.pickStatus = index - 1;
      }
      if (index <= 0) {
        this.checkForm.pickStatus = "";
      }
      this.query();
    },

  judgeSupportStatus() {
      let judgeNumberObj = {
        UnderpinningState: "", // 1  未打托  2 //部分打托  3//全部打托
      };
      let pickListObj = {};
      let playListObj = {};
      if (!this.playListData.length) {
        judgeNumberObj.UnderpinningState = "1";
        return judgeNumberObj;
      }
      this.pickListData.forEach((item) => {
        if (!pickListObj[item.goodsWydSku]) {
          pickListObj[item.goodsWydSku] = {
            totalPickedNum: Number(item.pickedNum) || 0,
          };
        } else {
          pickListObj[item.goodsWydSku]["totalPickedNum"] += Number(
            item.pickedNum
          );
        }
      });
      this.playListData.forEach((item) => {
        if (item.content) {
          item.content.forEach((value) => {
            if (!playListObj[value.goodsWydSku]) {
              playListObj[value.goodsWydSku] = {
                totalPlaceNum: Number(value.placeNum) || 0,
              };
            } else {
              playListObj[value.goodsWydSku]["totalPlaceNum"] += Number(
                value.placeNum
              ) || 0;
            }
          });
        }
      });
      if(JSON.stringify(pickListObj) == "{}" || JSON.stringify(playListObj) == "{}"){
        judgeNumberObj.UnderpinningState = "1";
        return judgeNumberObj
      } 
      let count = 0
      this.playListData.forEach(item=>{
        if(item.isShow) count++
      })
      if(count == this.playListData.length){
          if(Object.keys(pickListObj).length != Object.keys(playListObj).length){
            judgeNumberObj.UnderpinningState = "2";
            return judgeNumberObj
        }
      }else if(count == 0) {
        judgeNumberObj.UnderpinningState = "1";
          return judgeNumberObj
      }else if(count != this.playListData.length){
          judgeNumberObj.UnderpinningState = "2";
          return judgeNumberObj
      }


      Object.keys(pickListObj).forEach((item) => {
        Object.keys(playListObj).forEach((value) => {
          if (playListObj[value].totalPlaceNum <= 0) {
            judgeNumberObj.UnderpinningState = "1";
          } else {
            if (
              pickListObj[item].totalPickedNum !=
              playListObj[value].totalPlaceNum 
            ) {
              judgeNumberObj.UnderpinningState = "2";
            }
          }
        });
      });
      if (!["1", "2"].includes(judgeNumberObj.UnderpinningState)) {
        judgeNumberObj.UnderpinningState = "3";
      }
      return judgeNumberObj;
    },

```

### After
``` html
<w-tab v-model="activeTab" @tab-click="handleClick(activeTab)" :list="tabOptions"></w-tab>
```

``` js
// 切换 tab栏
 handleClick(activeTab) {
      this.checkForm.pickStatus = activeTab == '-1' ? '' : activeTab
      this.query();
    },

  judgeSupportStatus() {
      let judgeNumberObj = {
        UnderpinningState: "", // 1  未打托  2 //部分打托  3//全部打托
      };
      let pickListObj = {};  //收集拣货明细不同sku数据
      let playListObj = {}; //收集拣货明细不同sku数据
      if (!this.playListData.length) {
        judgeNumberObj.UnderpinningState = "1";
        return judgeNumberObj;
      }
      // 拣货明细数据  将拣货明细中不同类sku 添加到对应的对象中 将拣货数量相加
      this.pickListData.forEach((item) => {
        if (!pickListObj[item.goodsWydSku]) {
          pickListObj[item.goodsWydSku] = {
            totalPickedNum: Number(item.pickedNum) || 0,
          };
        } else {
          pickListObj[item.goodsWydSku]["totalPickedNum"] += Number(
            item.pickedNum
          );
        }
      });
      // 打托明细数据  将打托明细中不同类sku 添加到对应的对象中 将拣货数量相加
      this.playListData.forEach((item) => {
        if (item.content) {
          item.content.forEach((value) => {
            if (!playListObj[value.goodsWydSku]) {
              playListObj[value.goodsWydSku] = {
                totalPlaceNum: Number(value.placeNum) || 0,
              };
            } else {
              console.log("value.placeNum", value.placeNum);
              playListObj[value.goodsWydSku]["totalPlaceNum"] += Number(
                value.placeNum
              ) || 0;
            }
          });
        }
      });
      // 若获取的sku对象位空 则此时为未打托
      if(JSON.stringify(pickListObj) == "{}" || JSON.stringify(playListObj) == "{}"){
        judgeNumberObj.UnderpinningState = "1";
        return  judgeNumberObj
      } 
      let count=0  // 收集此时打托明细中已经打托的数据
      this.playListData.forEach(item=>{
        if(item.isShow){
          count++
        }
      })
      // count 等于playListData 则为部分打托 0 为未打托  不等于 则为部分打托
      if(count == this.playListData.length){
          if(Object.keys(pickListObj).length != Object.keys(playListObj).length){
            judgeNumberObj.UnderpinningState = "2";
            return judgeNumberObj
        }
      }else if(count == 0) {
        judgeNumberObj.UnderpinningState = "1";
          return judgeNumberObj
      }else if(count != this.playListData.length){
          judgeNumberObj.UnderpinningState = "2";
          return judgeNumberObj
      }

      // 判断 拣货明细中不同种类的sku是否与打托明细中不同种类sku相等
      Object.keys(pickListObj).forEach((item) => {
        Object.keys(playListObj).forEach((value) => {
          if (playListObj[value].totalPlaceNum <= 0) {
            judgeNumberObj.UnderpinningState = "1";
          } else {
            if (
              pickListObj[item].totalPickedNum !=
              playListObj[value].totalPlaceNum 
            ) {
              judgeNumberObj.UnderpinningState = "2";
            }
          }
        });
      });
      if (!["1", "2"].includes(judgeNumberObj.UnderpinningState)) {
        judgeNumberObj.UnderpinningState = "3";
      }
      return judgeNumberObj;
    },
```

### 学习心得

- 复杂逻辑一定要有明确的注释
- 写代码尽量简洁优化 提高代码复用性


