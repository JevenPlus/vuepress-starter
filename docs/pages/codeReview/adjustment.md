### 主讲人：朱雪萍

### 调整单

### 2022-12-08

### 需求

针对库存以及未来需要入库的 sku 进行属性，数量以及状态上的调整

### 功能理解

调整类型一共有四种：产品属性调整，库存属性调整，数量调整，状态调整
其中产品属性调整未来要入库的 sku，库存属性调整现在的库存
oms 只能调整产品属性，wms,owms 调整库存属性，数量，状态
状态包括冻结，暂存，正常
冻结和暂存的区别：冻结不能出不算仓租，暂存不能出算仓租，所以冻结状态调整为暂存或正常时要选择是否有仓租
数量调整可以调整未入库产品
oms 创建调整单需提交给 wms 审核，wms,owms 创建的调整单可自行审核,审核驳回需要填写驳回原因

### Code

```html
<!-- 属性调整，数量调整，状态调整所调整的内容不一样，使用WTable组件循环接收三种类型的table，将各自的column写在dictionary.js里 -->
<w-table
  :data="tableData"
  style="width: 100%"
  @selection-change="handleSelectionChange"
  :isPagination="false"
  :empty-text="emptyText"
  ref="table"
  max-height="490"
  :columns="columns"
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
>
  <!-- 数量调整时可调整未入库的产品，需要调整库区库位 -->
  <!-- isHas用来标识是否需要显示下拉选择框，true为需要，false为不需要 -->
  <template v-slot:warehouseAreaCode="scope">
    <div v-if="scope.row.isHas">
      <el-select
        v-model="scope.row.warehouseAreaCode"
        @change="onAreaCodeChange"
      >
        <el-option
          v-for="(item, index) of option_areaCode"
          :key="index"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>
    <div v-else>{{scope.row.warehouseAreaCode}}</div>
  </template>
  <template v-slot:warehouseLocationCode="scope">
    <div v-if="scope.row.isHas">
      <el-select v-model="scope.row.warehouseLocationCode">
        <el-option
          v-for="(item, index) of option_LocationCode"
          :key="index"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>
    <div v-else>{{scope.row.warehouseLocationCode}}</div>
  </template>
  <!-- 调整冻结状态为暂存或正常时，需要选择是否有仓租 -->
  <template v-slot:storageAgeFlag="scope">
    <el-select
      v-model="scope.row.storageAgeFlag"
      v-if="scope.row.oldGoodsType === '2' && scope.row.newGoodsType.length != 0"
    >
      <el-option
        :label="$t('page_adjustmentOrder.table_adjustment_yes')"
        :value="0"
      ></el-option>
      <el-option
        :label="$t('page_adjustmentOrder.table_adjustment_no')"
        :value="1"
      ></el-option>
    </el-select>
  </template>
</w-table>
```

```js

// 获取column
changeTableData() {
  let tableMap = {
    0: dictionaryColumns1, // 库存属性调整
    1: dictionaryColumns2, // 数量调整
    2: dictionaryColumns3, // 状态调整
  };
  const index = this.form.orderType.toString();
  this.columns = tableMap[index](this);
},

// 去重 查询库区时，后端返回的数据有重复的
let arr = []
let list = this.options_areaLocationCode.map((item) => item.warehouseAreaCode);
list.forEach((item) => {
  if (arr.indexOf(item) == -1) {
    arr.push(item);
  }
});
this.option_areaCode = arr;

// 选择的明细，明细与要提交的调整明细字段不一样，重新赋值
this.selectedData.forEach((item) => {
    this.$set(item, "newGoodsLength", item.goodsLength);
    this.$set(item, "newGoodsWidth", item.goodsWidth);
    this.$set(item, "newGoodsHigh", item.goodsHigh);
    this.$set(item, "newGoodsWeight", item.goodsWeight);
    this.$set(item, "newGoodsNum", item.inventoryAvaiableNum);
    this.$set(item, "oldGoodsLength", item.goodsLength);
    this.$set(item, "oldGoodsWidth", item.goodsWidth);
    this.$set(item, "oldGoodsHigh", item.goodsHigh);
    this.$set(item, "oldGoodsWeight", item.goodsWeight);
    this.$set(item, "oldGoodsNum", item.inventoryAvaiableNum);
    this.$set(item, "oldGoodsType", this.searchForm.goodsType);
    this.$set(item, "newGoodsType", "");
    this.$set(
      item,
      "options_goodsStatus",
      this.options_goodsStatus.filter(
        (ele) => item.oldGoodsType !== ele.value
      )
    );
    // 本地设置isHas作为标识，没有库区时设置为true
    this.$set(item, "isHas", item.warehouseAreaCode ? false : true);
  });
  this.tableData.push(...this.selectedData);
  // 根据后端所需参数转换id,并删除原来的id
  this.tableData.forEach((item) => {
    item.warehouseRelevanceId = item.id;
    delete item.id;
  });

// 调整数量时，可选择上架时间（计算仓租），将标准时间转化为所需要的格式，调多了的话根据这个上架时间算仓租
  if (stackingTime) {
    stackingTime = this.dayjs(stackingTime).format("YYYY-MM-DD HH:mm:ss");
  }

// 数量调整时，调整后的数量不可与调整前相同
  if (this.form.orderType === "1") {
    let flag = this.tableData.some(
      (item) => item.newGoodsNum == item.oldGoodsNum
    );
  }

```

### 学习心得

- 有一些辅助函数要做好注释，组件统一化
