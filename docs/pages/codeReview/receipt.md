### 主讲人：刘宁刚

### 入库-清点收货

### 2022-12-01

### 需求

清点收货，顾名思义，对获取进行清点，然后进行收货作业。

### 收货功能介绍

首先可以选择本次卸货类型为紧急卸货还是困难收货(不是必填),如果该入库单下的 SKU 过多，那么可以进行 SKU 检索。如果有卸柜照片，也可以上传，最少上传 3 张。
列表中查询有该入库单号下所有的 SKU，操作人员可以输入本次收货数量，然后进行打托，或者保存/完成收货。本次讲述内容为收货异常。

### 收货异常功能介绍

收货异常类型有短装，溢装，发错货。

1. 如果没有异常，直接保存/完成收货，走收货接口。
2. 如果有异常，弹出异常类型及数量，展示异常明细列表，走收货接口，并上报异常。
3. 异常明细列表中只有溢装，错发两种异常类型，然后选择该库位，根据库位得到库区，保存收货/完成收货并上报异常。

### 异常数量计算规则

1. 短装(本次实收数量 + 累计实收数量 < 预报数量)

- 短装数量 = 预报数量 - (本次实收数量 + 累计实收数量)

2. 溢装(本次实收数量 + 累计实收数量 > 预报数量)

- 累计实收数量 < 预报数量：本次实收数量 + 累计实收数量 - 预报数量
- 累计实收数量 >= 预报数量：本次实收数量

### Code

```js
// 保存请求 type 0 保存  1 完成收货
async saveRequest(type) {
  const errorNum = this.checkIsHasAbnormal()
  const title =
    type == 0
      ? this.$t("page_wareHouseList.error_message16")
      : this.$t("page_wareHouseList.error_message15");
  let errorStr // 无异常
  // 无异常
  if (errorNum.wrongNum == 0 && errorNum.shortNum == 0 && errorNum.overNum == 0) {
    errorStr =
      this.$t("page_wareHouseList.error_message10") +
      this.inboundNo +
      (type == 0
        ? this.$t("page_wareHouseList.error_message18")
        : this.$t("page_wareHouseList.error_message14"));
  } else {
    // 有异常
    if (type == 0) {
      // 保存
      errorStr = `
        ${this.$t("page_wareHouseList.error_message10")}
        ${this.inboundNo}
        ${this.$t("page_wareHouseList.error_message11")}
        ${errorNum.overNum}
        ${this.$t("page_wareHouseList.error_message13")}
        ${errorNum.wrongNum}
        ${this.$t("page_wareHouseList.error_message19")}
      `;
    } else {
      // 完成收货
      errorStr = `
        ${this.$t("page_wareHouseList.error_message10")}
        ${this.inboundNo}
        ${this.$t("page_wareHouseList.error_message11")}
        ${errorNum.overNum}
        ${this.$t("page_wareHouseList.error_message12")}
        ${errorNum.shortNum}
        ${this.$t("page_wareHouseList.error_message13")}
        ${errorNum.wrongNum}
        ${this.$t("page_wareHouseList.error_message24")}
      `;
    }
  }
  this.$confirm(errorStr, title, {
    confirmButtonText: this.$t("page_wareHouseList.btn_confirm"),
    cancelButtonText: this.$t("page_wareHouseList.btn_cancel"),
    type: "warning",
  })
    .then(() => {
      // 如果只有短装，则不展示异常明细表
      if (errorNum.wrongNum == 0 && errorNum.overNum == 0 && errorNum.shortNum >= 0) {
        this.saveAndPostData(type);
      } else {
        // 如果有溢装和错发，展示异常明细表(收货，上报异常)
        this.abnormalData = this.abnormalData.filter(item => item.exceptionNum > 0)
        this.abnormalVisible = true;
      }
    })
    .catch(() => {
      // this.$message.info(this.$t("page_wareHouseList.error_message17"));
    });
},

/**
 * @description 确认上报异常
 */
async confirmReportException() {
  const bool = this.abnormalData.every(item => item.warehouseAreaCode && item.warehouseLocationCode)
  if (!bool) {
    return this.$message.warning(this.$t('page_wareHouseList.promptMsg_locationEmpty'))
  }
  await this.saveAndPostData(1);
},

/**
 * 检查收货是否有异常
 * goodsNum 预报数量
 * realGoodsNumSum  累计实收数量
 * realGoodsNum 本次实收数量
 */
checkIsHasAbnormal() {
  // 存储异常数据
  this.abnormalData = []
  let wrongNum = 0; // 发错货
  let shortNum = 0; // 短装
  let overNum = 0; // 溢装
  // 如果预报数量为0，则为发错货
  let arr = this.tableData.filter((item) => item.goodsNum == 0)
  arr.forEach(item => {
    wrongNum += parseInt(item.realGoodsNum)
    if (item.realGoodsNum > 0) {
      this.abnormalData.push({
        ...item,
        mainSku: item.mainCode,
        goodsWydSku: item.wydSkuNo,
        exceptionNum: item.realGoodsNum,
        orderNum: item.goodsNum,
        relGoodNum: item.realGoodsNum,
        relationNo: this.submitform.inboundNo,
        exceptionType: '4'
      })
    }
  })
  const dataList = this.tableData.filter((item) => item.goodsNum != 0)
  // 计算短装，溢装数量
  dataList.forEach(item => {
    // 本次实收数量 + 累计实收数量 > 预报数量
    if ((parseInt(item.realGoodsNum) + parseInt(item.realGoodsNumSum)) > parseInt(item.goodsNum)) {
      let errorNum = 0;
      // 溢装
      if (parseInt(item.realGoodsNumSum) < parseInt(item.goodsNum)) {
        errorNum = ((parseInt(item.realGoodsNum) + parseInt(item.realGoodsNumSum)) - parseInt(item.goodsNum))
      } else {
        errorNum = parseInt(item.realGoodsNum)
      }
      item.errorNum = errorNum
      overNum += errorNum
      if (errorNum > 0) {
        this.abnormalData.push({
          ...item,
          mainSku: item.mainCode,
          goodsWydSku: item.wydSkuNo,
          exceptionNum: errorNum,
          orderNum: item.goodsNum,
          relGoodNum: item.realGoodsNum,
          relationNo: this.submitform.inboundNo,
          exceptionType: '1'
        })
      }
    } else {
      // 短装
      shortNum += (parseInt(item.goodsNum) - (parseInt(item.realGoodsNum) + (parseInt(item.realGoodsNumSum))))
    }
  })
  shortNum = Math.abs(shortNum)
  return {
    wrongNum,
    shortNum,
    overNum
  }
},

// 发送数据
async saveAndPostData(type) {
  // 数据处理
  this.submitDisabled = true;
  const loading = this.fullScreenLoading();
  const arr = [];
  this.tableData.forEach((item) => {
    if (item.inboundPalletList) {
      arr.push(...item.inboundPalletList);
    }
    item.high = item.high;
  });
  this.submitform.deliveryMethod == 0
    ? (this.submitform.realTrayNum = 0)
    : (this.submitform.realCaseNum = 0);
  const { loadType } = this.submitform || {};
  const res = await this.$api.InboundScanReceiptSave({
    inboundNo: this.submitform.inboundNo,
    infoList: this.tableData.map((item) => {
      // 部分属性重置值
      // const selfObj = this.propsToProps(item, 2);
      return {
        ...item,
        // ...selfObj,
        isExist: item.isNewData == null ? "1" : "2",
        skuNo: item.wydSkuNo,
      };
    }),
    deliveryMethod: this.submitform.deliveryMethod,
    inboundPalletList: arr,
    realCaseNum: this.submitform.caseHistoryNum,
    realTrayNum: this.submitform.trayHistoryNum,
    caseNum: this.submitform.caseNum,
    trayNum: this.submitform.trayNum,
    saveType: this.receiptType,
    // 紧急卸货
    unloadEmergency: loadType.includes("unloadEmergency") ? 1 : 0,
    // 困难卸货
    unloadHard: loadType.includes("unloadHard") ? 1 : 0,
    fileInfoList: this.fileList,
  });
  loading.close();
  this.submitDisabled = false;
  if (res.code === 200) {
    if (this.abnormalData.length) {
      await this.$api.inboundExceptionAddWarehouseException({
        warehouseExceptionList: this.abnormalData
      });
    }
    // if (errorRes.code != 200) {
    //   return this.codeToMessage(errorRes.code)
    // }
    this.$message.success(
      this.$t("page_wareHouseList.error_message3") +
      res.data.goodsNumSum +
      this.$t("page_wareHouseList.error_message4") +
      res.data.errorNum +
      this.$t("page_wareHouseList.error_message5") +
      (res.data.errorNum != 0 ? this.$t("page_wareHouseList.error_message5_1") : '')
    );
    this.cancel();
  } else if (res.code === "oxowm1101119") {
    this.$message.error(res.msg);
  } else {
    this.codeToMessage(res.code, res);
  }
}
```

### 学习心得

- 对于功能复杂，函数较长的代码块需要进行代码分离，并做好注释，避免屎山代码。
