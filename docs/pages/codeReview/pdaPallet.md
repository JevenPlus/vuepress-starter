### 主讲人：朱雪萍

### pda打托

### 2023-04-14

### 需求
第一版pda打托操作繁琐，为了解决该问题进行相关优化

### 功能理解
- 所以入库订单入库均必须打托，不存在未打托的情况
- 主流程：在全部列表领取入库单 -> 单据流转到我的 -> 扫描托盘 -> 托盘是否使用 -> 否：显示托盘号相关信息，选择托盘类型 -> 扫描sku -> sku是否存在 -> sku是否与已添加的sku重复 -> 是：输入数量，累加；否：覆盖原来的sku，输入数量 -> 保存 -> 该入库单是否打托完成 -> 是：打托完成，返回主列表；否：继续打托

### Code

```html
<!-- enter按钮禁用与启用 -->
ButtonTheme(
    height: 50,
    // ignore: deprecated_member_use
    child: RaisedButton(
        color: MyColors.themeColor,
        disabledColor: MyColors.colorDisabled,
        child: Text(
                'Enter'.tr,
                 style: TextStyle(color: MyColors.whiteColor),
                ),
        onPressed: !enableButton ? () => onSubmit() : null),
        )
```

```js
// 输入数量之后enter按钮启用
keyCompleteQTY() {
    if (step2NoController.text != '' && QTY.text != '') {
      setState(() {
        enableButton = false;
      });
    } else {
      setState(() {
        enableButton = true;
      });
    }
  }
// 如果sku与已扫描的sku不一致，则弹出提示：是否替换已扫描的sku，若是：则替换，否：则清空sku输入框
if (res['data']['wydSku'] !=
    shiftOrderDetailVOList[0]['wydSkuNo']) {
        showDialog(
            context: context,
            builder: (_) {
                return MyNDialog(
                  title: 'switch'.tr,
                  message: 'switch_sku'.tr,
                  showCancelButton: true,
                  confirmButtonText: 'shelvingDialog3'.tr,
                  onConfirm: () {
                    setState(() {
                      shiftOrderDetailVOList = [];
                      list = [];
                    });
                  },
                  onCancel: () {
                    step2NoController.text = '';
                  },
                  showConfirmButton: true,
                );
              },
            );
          }
//  输入数量之后
    list.forEach((item) {
        // 如果sku相同则数量累加
    setState(() {
        num sum = num.parse(item['number'].toString()) + num.parse(QTY.text);
        item['number'] = sum.toString();
        });
        confirmEnter();
    });
```

### 学习心得

