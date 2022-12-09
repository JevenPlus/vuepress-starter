### 更新人：朱雪萍

### 表格行列合并

### 2022-12-09

### 需求理解

根据重复的跟踪号合并行数据，将跟踪号那一列合并

### code

```js
const arr = []; // 接受table数据
const tempArr = [];
let tempNo = 0; // 临时序号
let noSort = 0; // 序号
// 处理数据
res.data.records.forEach((item, index) => {
  let itemTemp = Object.assign({}, item); // 将所有可枚举属性的值从一个或多个源对象(item)复制到目标对象({}),实现对象属性的合并
  item.details.forEach((value, key) => {
    var objTemp = Object.assign({}, itemTemp, value);
    if (key == 0) {
      objTemp.rowspan = item.details.length;
    }
    delete objTemp.details; // 新生成的数据不会带上原来的数据
    arr.push(objTemp);
  });
});
this.tableData = arr;
// 合并行归类
for (var i = 0; i < this.tableData.length; i++) {
  if (i === 0) {
    // 第一行(表头)必须存在
    tempArr.push(1);
    tempNo = 0;
  } else {
    if (this.tableData[i].trackingNo === this.tableData[i - 1].trackingNo) {
      tempArr[tempNo] += 1;
      tempArr.push(0);
    } else {
      tempArr.push(1);
      tempNo = i;
    }
  }
}
// 表格序号
for (let n in tempArr) {
  if (tempArr[n] > 0) {
    noSort += 1;
    this.$set(this.tableData[n], "noSort", noSort);
  }
}

// 合并行
objectSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (this.activeTab != "2") return;
  if (this.activeTab4 === "1") {
    // 前3列合并
    if (columnIndex < 3) {
      if (row.rowspan >= 1) {
        return {
          rowspan: row.rowspan,
          colspan: 1,
        };
      } else {
        return {
          rowspan: 0,
          colspan: 0,
        };
      }
    }
  }
},
```
