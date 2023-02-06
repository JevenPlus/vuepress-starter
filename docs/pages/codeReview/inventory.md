### 主讲人：朱雪萍

### 盘点单

### 2023-01-05

### 需求

满足库内商品的数量清点工作

### 功能理解

- 盘点类型：产品盘点，库位盘点
- 盘点方式：明盘，暗盘（区别在于打印盘点上是否显示数量）
- 三端都可创建盘点单，oms只可进行产品盘点，wms,owms既可进行产品盘点，也可进行库位盘点
- 收费对象：oms不选择收费对象，默认为客户，owms默认为仓库，当收费对象为客户时，要指定客户
    - 仓库(不收取任何费用)
    - 客户(流水记录用户应收应付费用)
    - 无忧达（流水记录无忧达应付费用）
- 计费方式：
    - 产品盘点-计件收费：按件、按箱、按托
    - 库位盘点-计件收费：按储位计费
    - 工时收费：按工时、按加班
- 库位盘点时选择库位，带出该库位下的所有产品明细
- 如果有正在盘点中的明细，报错提示,如果sku有带拣货库存，需要重新选择明细
- oms创建的盘点单同步到wms进行审核，审核时wms需要给oms创建的盘点单选择计费方式，wms,owms自己创建的单子自己审核，wms创建时选择计费方式，owms不选择计费方式，审核通过以后owms进行盘点操作，再将信息同步回wms和oms
- 如果有异常（盘盈，盘亏，破损），owms列表记录异常数量，oms/wms可以进行复盘/异常确认
- 盘点完成后，盘盈/亏，破损都不影响库存数量，初盘时才收费，复盘不收费
### Code

```html

<!-- 进度 -->
 <w-steps :active="getStepList.active" type="success" v-if="getStepList.steps.length > 1">
    <w-step v-for="(item, index) in getStepList.steps" :title="item.name" :key="index"
    :text-status="item.status" :description="item.description"></w-step>
</w-steps>

<!-- 费用信息 -->
<SecondEl_Table v-show="activeTab == '2'" :summary-method="getSummaries" show-summary
  :data="tableData_cost" fit highlight-current-row style="width: 100%;"
  :header-cell-style="tableHeaderColor" size="small" class="content-table">
  <!-- 序号 -->
  <el-table-column :label="$t('common.costDetail_tableItem_index')" type="index" width="80" />
  <!-- 费用类型 -->
  <el-table-column :label="$t('common.costDetail_tableItem_costType')">
    <template slot-scope="scope">
      <!-- {{scope.row.checkKindCost === '0' && $t('common.expenseClass_F19') || '--'}} -->
      {{ valueConvertLabel( options_costType, scope.row.costItemArCode) }}
    </template>
  </el-table-column>
  <!-- 结算金额 -->
  <el-table-column :label="$t('common.costDetail_tableItem_cost')" prop="arAmount">
  </el-table-column>
  <!-- 结算币种 -->
  <el-table-column :label="$t('common.costDetail_tableItem_currency')" prop="arCurrency">
  </el-table-column>
  <!-- 扣费金额 -->
  <el-table-column :label="$t('common.costDetail_tableItem_deductionAmount')" align="left"
    prop="deductionAmount">
    <template slot-scope="scope">
      <el-popover v-if="scope.row.deductionRecordList.length" placement="top" width="300" trigger="hover">
        <SecondEl_Table :data="scope.row.deductionRecordList" :header-cell-style="tableHeaderColor">
          <!-- 币种 -->
          <el-table-column property="currency" :label="$t('common.costDetail_tableItem_currency')"
            align="left" />
          <!-- 扣款金额 -->
          <el-table-column property="amount" :label="$t('common.costDetail_tableItem_cost')"
            align="left" />
          <!-- 汇率 -->
          <el-table-column property="rate" :label="$t('common.costDetail_tableItem_rate')" align="left" />
        </SecondEl_Table>
        <el-button type="text" slot="reference" v-if="scope.row.deductionRecordList.length">
          {{ scope.row.deductionAmount }}
        </el-button>
      </el-popover>
      <span v-else>{{ scope.row.deductionAmount }}</span>
    </template>
  </el-table-column>
  <!-- 扣费币种 -->
  <el-table-column :label="$t('common.costDetail_tableItem_deductionCurrency')" prop="deductionCurrency">
  </el-table-column>
  <!-- 计费时间 -->
  <el-table-column :label="$t('common.costDetail_tableItem_createTime')" prop="billingTime">
  </el-table-column>
</SecondEl_Table>

```

```js
// 获取步骤信息
getStepList() {
  /**
   * 0: 待提交, 1: 待审核, 2: 审核通过, 3: 审核驳回, 4: 初盘完成, 5: 复盘中, 6: 复盘完成, 7: 完成
   */
  const { documentStatus, checkFinishTime } = this.submitform || {};
  const ns =
    documentStatus === 0 || documentStatus ? Number(documentStatus) : "";
  const getVal = (key) => this.$t(`page_InventoryManage.${key}`);
  // 各阶段对应的文案
  const strObj = {
    // 待提交
    0: getVal("dictionary1_string1"),
    // 待审核
    1: getVal("dictionary1_string2"),
    // 待盘点（审核通过）
    2: getVal("dictionary1_string12"),
    // 初盘中(审核通过)
    // 2: getVal("dictionary1_string9"),
    // 审核驳回
    3: getVal("dictionary1_string4"),
    // 初盘完成
    4: getVal("dictionary1_string5"),
    // 复盘中
    5: getVal("dictionary1_string6"),
    // 复盘完成
    6: getVal("dictionary1_string7"),
    // 完成
    7: getVal("dictionary1_string8"),
    // 盘点中
    8: getVal("dictionary1_string10"),
    // 待复盘
    9: getVal("dictionary1_string11"),
  };
  // 显示完成状态的阶段
  const statusObj = {
    4: "success",
    6: "success",
  };
  // 各阶段对应的文案
  const arr = [
    {
      name: ([0].includes(ns) && strObj[ns]) || getVal("tab_Submit"),
      active: [0].includes(ns),
    },
    {
      name: ([1, 3].includes(ns) && strObj[ns]) || getVal("Approved"),
      active: [1, 3].includes(ns),
    },
    {
      name:
        ([4, 5, 6, 2, 8, 9].includes(ns) && strObj[ns]) ||
        getVal("dictionary1_Inventory"),
      active: [4, 5, 6, 2, 8, 9].includes(ns),
    },
    {
      name:
        ([7].includes(ns) && strObj[ns]) || getVal("dictionary1_string8"),
      active: false,
      description:
        ([7].includes(ns) &&
          `${getVal("toolLabel")}：${checkFinishTime}`) ||
        "",
    },
  ];
  // 当前所在阶段
  let active = 0;
  let hasActie = false;
  const steps = [];
  arr.forEach((obj, index) => {
    const sObj = {
      name: obj.name,
      description: obj.description,
    };
    if (obj.active) {
      active = index;
      hasActie = true;
      sObj.status = statusObj[ns] || "warning";
    } else if (!hasActie && index === arr.length - 1) {
      active = index + 1;
    }
    steps.push(sObj);
  });

  return {
    active,
    steps,
  };
},

// 费用信息合计
getSummaries(param) {
    // 只计算第二列和第三列的总额
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = this.$t("common.costDetail_tableItem_summary");
      return;
    } else if ([3].includes(index)) {
      sums[index] = data[0] ? data[0][column.property] : "";
      return;
    }
    const values = data.map((item) => Number(item[column.property]));
    if ([2].includes(index)) {
      sums[index] = values
        .reduce((prev, curr) => {
          const value = Number(curr);
          if (!isNaN(value)) {
            return prev + curr;
          } else {
            return prev;
          }
        }, 0)
        .toFixed(4);
    } else {
      sums[index] = "";
    }
  });
  this.submitform.totalCost = sums[2] + sums[3];
  return sums;
},

```

### 学习心得

- 代码不规范：单双引号的使用，逗号，分号，换行的的格式不严谨
- 代码编写顺序没有计划，主次代码混乱
- 冗余代码没有及时删除
- 缺少必要的注释
