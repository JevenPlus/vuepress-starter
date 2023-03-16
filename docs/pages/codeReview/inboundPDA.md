### 主讲人：郑凯力

### PDA第二版入库收货

### 2023-03-09


### 需求
因为第一版本的pda交互上有些繁琐, 且手动点击的地方较多, 因为特地设计第二版入库交互, 来改善第一版交互中出现的问题

### 功能理解
第二版本pda 入库模块主要分为三个模块 , 收货模块, 上架模块以及打托模块, 另外更改了登录页的一些交互
此次分享主要涉及到收货模块,  收货模块一共分为列表, 详情, 上报异常, 上传图片, 扫描收货, 错发上报,  溢装上报, 费用 8个页面


### 学习心得
做好模块化工作, 可以提高开发效率

### Code

```js
class InboundExceptionShort extends StatelessWidget {
  const InboundExceptionShort({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // 防止键盘顶起按键
        resizeToAvoidBottomInset:false,
        appBar: AppBar(
          title: Text('inbound_s_receive'.tr),
          centerTitle: true,
          elevation: 0,
        ),
        body: ContentBox()
    );
  }
}


class ContentBox extends StatefulWidget {
  const ContentBox({
    Key? key,
  }) : super(key: key);

  _ContentState createState() => _ContentState();
}


class _ContentState extends State<ContentBox> with receiveMixin{
  bool step1ButtonEnable = true;
  final orderNo = Get.arguments['orderNo'] ?? '';
  final exceptionId = Get.arguments['id'] ?? '';
  final status = Get.arguments['status'] ?? '';
  List dataSkuShowList = [];
  List errorOverList = [];
  List receivingDetailList = [];
  List warehouseExceptionInboundDTOList = [];
  bool canSubmit = false;
  void initState() {
    Future.delayed(Duration.zero).then((value) async {
      // String? dataSkuShowListString = await LocalStorage.getString('dataSkuShowList');
   

      dataSkuShowList = await getCookie(name: 'dataSkuShowList');
      errorOverList = await getCookie(name: 'errorOverList');
      receivingDetailList = await getCookie(name: 'receivingDetailList');
      warehouseExceptionInboundDTOList = await getCookie(name: 'warehouseExceptionInboundDTOList');
     /* errorOverList = dataSkuShowList.where((element) {
        if ((num.parse(element['showGoodsNum'].toString()) > num.parse(element['goodsNum'].toString())) && element['exceptionType'] != '4') {
          return true;
        } else {
          return false;
        }
      }).toList();*/
      errorOverList.forEach((element) {
        element['Controller'] = TextEditingController();
        element['OverloadQTY'] = (num.parse(element['showGoodsNum'].toString()) - num.parse(element['goodsNum'].toString()));
      });

      setState(() {
        errorOverList= errorOverList;
        dataSkuShowList = dataSkuShowList;
        receivingDetailList = receivingDetailList;
        warehouseExceptionInboundDTOList = warehouseExceptionInboundDTOList;
      });

      print('${warehouseExceptionInboundDTOList}-----L1');
      print('${receivingDetailList}-----L2');
    });
  }
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: [_createContent()],
            ),
          )),
      CommonBtn(
          text: 'inbound_s_resport'.tr,
          height: 60.0,
          backgroundColor: MyColors.themeColor,
          textColor: MyColors.whiteColor,
          borderColor: MyColors.themeColor,
          enable: step1ButtonEnable,
          onPressed: () {
            // 进行上报
            keyComplete(type: 'submit');
          }
        // onPressed: null,
      ),
    ]);
  }

  _createContent() {
    return Column(
      children: [
        TitleBar(
          text: orderNo,
        ),
    Parent(
      style: ParentStyle()..background.color(MyColors.whiteColor),
        child:Column(
          children: [
            for(var i = 0; i< errorOverList.length; i++) ...[
              StepTable(
                dataInfo: {
                  'SKU': errorOverList[i]['sku'], 
                  'Forecast QTY' : errorOverList[i]['goodsNum'],
                  'Overload QTY': errorOverList[i]['OverloadQTY'],
                },
                keyWidth: 150,
                paddingtop: 10,
                paddingbottom: 10,
              ),
              ScanText(
                autofocus: false,
                onKey: onKey,
                controller: errorOverList[i]['Controller'],
                placeholder: 'Input location',
                onEditingComplete: () {
                  print(' 触发结束');
                },
                onChange: (val) {
                  checkButtonEnable();
                  if (val == '') {
                    keyComplete();
                  }
                },
                onSubmitted: (value) {
                  keyComplete(type: 'location', index: i);
                },
              ),
            ],
          ],
        )
    ),
      ],
    );
  }


  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {

  }

  checkButtonEnable() {
    canSubmit = errorOverList.every((element) { 
      return element['Controller'].text != '';
    });
    if (canSubmit == true) {
      setState(() {
        step1ButtonEnable = false;
      });
    } else {
      setState(() {
        step1ButtonEnable = true;
      });
    }
  }
  checkComplete() {

  }

  keyComplete({type, index}) {
    if (type == 'submit') {
      List postReceivingDetailList = receivingDetailList;
      List postWarehouseExceptionInboundDTOList = [];
      errorOverList.forEach((item){
      
        
        postWarehouseExceptionInboundDTOList.add({
          'goodsWydSku': item['sku'],
          'exceptionType': 1, // 益装
          'exceptionNum': item['OverloadQTY'],
          'warehouseAreaCode': item['warehouseArea'],
          'warehouseLocationCode': item['Controller'].text,
          
        });
      });
      print('${warehouseExceptionInboundDTOList} --- KKKK');
      
      
      warehouseExceptionInboundDTOList.forEach((item) {
        postWarehouseExceptionInboundDTOList.add(item);
      });

      num receivingType = 0; // 0 保存 1完成收货
      if (status == 'complete') {
        receivingType = 1;
      } else {
        receivingType = 0;
      }
      Map<String, dynamic> postData = {
        'inboundNo': orderNo,
        'receivingDetailList': postReceivingDetailList,
        'warehouseExceptionInboundDTOList': postWarehouseExceptionInboundDTOList,
        'receivingType': receivingType,
        // 库区 库位
      };
      print(postData);
      
      WarehouseApi.inboundReceiving(postData).then((resData){
        // mock
        /*resData = {
          "code": "000001",
          "msg": "No Handler Found",
          "data": null,
          "success": true
        };*/
        if (resData['success'] == true) {
          // 回退到扫码页面并触发init方法
          if (status == 'complete') {
            // 去计费页面
            // 清空数据与缓存
            Utils.toast('Report successfully');
            getOffDetail(InboundRouter.inboundUnload ,arguments: {
              "orderNo": orderNo,'id': exceptionId
            });
          } else {
            // 清空数据与缓存
            Utils.toast('Report successfully');
            Get.back(result: 'short');
          }
         
        } else {
          Utils.toast(resData['msg']);
        }
      });
    }
    if (type == 'location') {
      findWarehouseCodeByLocation(index: index);
    }
  }


  findWarehouseCodeByLocation({callback, success, index}) {
    var postData = {
      "warehouseLocation": errorOverList[index]['Controller'].text
    };
    InboundApi.checkWarehouseLocation(postData).then((res){
      // mock
      /*    res = {
        "code": "000000",
        "msg": "操作成功",
        "data": {"areaId": "9", "warehouseArea": "EC-SMALL_ZONE", "warehouseLocation": "A-04"},
        "success": true
      };*/
      if (res['success'] == true) {
        if (res['data'] != null && res['data']['warehouseArea'] != null) {
          errorOverList[index]['warehouseArea'] = res['data']['warehouseArea'];
          success != null ? success() : null;
        } else {
          Utils.toast('shelvingMessage2'.tr);
          setState(() {
            errorOverList[index]['warehouseArea'] = '';
            errorOverList[index]['Controller'].text = '';
            checkButtonEnable();
          });
        }
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e){

    });
  }
  
}
```
