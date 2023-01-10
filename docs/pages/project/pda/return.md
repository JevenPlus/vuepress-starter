#### 开发者
  郑凯力
#### 开发时间
  2022-10-24
  
  ### 退件
 设计稿链接(新增退件):  <br> [https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1](https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1)
 
  设计稿链接(处理退件):  <br> [https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1](https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1)
 <br>接口文档地址: [http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E9%80%80%E4%BB%B6%E8%AE%A2%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/checkSkuIsExistsUsingGET_1](http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E9%80%80%E4%BB%B6%E8%AE%A2%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/checkSkuIsExistsUsingGET_1) 
 
 ### 其中页面分为新增退件, 处理退件两个模块
 
 ### 新增退件
 ```js
import 'dart:convert';

import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_vant_kit/main.dart';
import 'package:flutter_vant_kit/widgets/dialog.dart';
import 'package:flutter_vant_kit/widgets/stepper.dart';
// import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/inventory/components/body.dart';
import 'package:pda/routers/return_router.dart';
import 'package:pda/utils/local_storage.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/widgets/commonStepDescribe.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:pda/widgets/common_table.dart';
// import 'package:pda_scanner/pda_listener_mixin.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart' as dioData;
import 'dart:io';
import 'package:pda/http/inbound.dart';

class AddReturnController extends GetxController {
  List addReturnOrder = [].obs;
  List orderDetailList = [].obs;
  // 初始化操作
  initAddShiftSheetList() {
    addReturnOrder = [];
  }

  // 存入一条数据
  addOneToAddShiftSheetList(data) {
    addReturnOrder.add(data);
    // 去重
    // var checkInfo = [];
    // addReturnOrder = Utils.uniqeList(dataList:addReturnOrder, checkInfo: checkInfo );
  }

  // 上报成功后操作
  submitCompleteAddShiftSheetList() {
    initAddShiftSheetList();
  }
}


class AddReturnOrder extends StatelessWidget {
  const AddReturnOrder({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final AddReturnController c = Get.put(AddReturnController());
    // 初始化
    c.initAddShiftSheetList();
    return Scaffold(
        appBar: AppBar(
          title: Text('add_return_order'.tr),
          centerTitle: true,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () async {
              late List addList;
              addList = c.addReturnOrder;
              if (addList.length > 0) {
                showDialog(
                  context: context,
                  builder: (_) {
                    return MyNDialog(
                        title: null,
                        message: '${'shiftSheetString_message1'.tr}${addList.length}${'shiftSheetString_message2'.tr}',
                        showCancelButton: true,
                        confirmButtonText: 'shiftSheetString_dialog1'.tr,
                        onConfirm: () {
                          addReturnGlobalKey.currentState?.submit(successfn: () {
                            Get.back();
                          }, catchFn: () {
                            Get.back();
                          });
                        },
                        onCancel: () {});
                  },
                );
              } else {
                Get.back();
              }
            },
          ),
          actions: <Widget>[
            IconButton(
                icon: Icon(Icons.list_alt),
                onPressed: () => {
                      Get.toNamed(ReturnOrderRouter.addReturnDetail),
                    }),
          ],
        ),
        body: ContentBox(key: addReturnGlobalKey));
  }
}

GlobalKey<_ContentState> addReturnGlobalKey = GlobalKey();

class ContentBox extends StatefulWidget {
  const ContentBox({
    Key? key,
  }) : super(key: key);

  _ContentState createState() => _ContentState();
}

class _ContentState extends State<ContentBox> {
  FocusNode _focusNode = FocusNode();
  final AddReturnController c = Get.find();

  // 来源跟踪号  获取sourceLocationController.text
  final step1NoController = TextEditingController();
  final step2NoController = TextEditingController();
  final step2_1NoController = TextEditingController();
  late Map tableData1;
  int step = 1;
  bool step1ButtonEnable = true;
  bool step2ButtonEnable = true;
  bool step3ButtonEnable = false;
  String QTY = '1';
  String orderNo = '';
  String chooseCodeRadio = ''; // 单选框选中的客户代码
  String customerCode = ''; // 客户代码
  String status = '';  // 1  可匹配到订单  2 匹配不到订单,但是可以匹配到客户代码  sku情况  3 匹配不到订单, 匹配不到客户带到 (未知商品)  4 未匹配到订单(等待后续操作决定是2还是3)
 // TXJW  794639230306
  // 客户代码列表
  String lpCode = ''; // 物流商
  List orderDetailList = [];
  List customeList = [
/*    {"label": '客户代码1', "value": '客户代码1', "id": 1},
    {"label": '客户代码2', "value": '客户代码2', "id": 2},
  ,*/
  ];
  List customeStatusList = [
    {"label": 'returnString1'.tr, "value": '0'},
    {"label": 'returnString2'.tr, "value": '1'},
    {"label": 'returnString3'.tr, "value": '2'},
  ];
  bool disableCustomerCode = false;
  // trackingNumber  794639230306

  // 货物状态
  String customeStatus = ''; // 货物良好  外包装破损 内容物破损
  List<String> imagesList = [
    /* "https://img.yzcdn.cn/vant/leaf.jpg"*/
  ];
  void initState() {
    super.initState();
    initData();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(children: [
        Expanded(
            child: SingleChildScrollView(
          child: Column(
            children: [_changeContent()],
          ),
        )),
        if (step == 1) ...[
          CommonBtn(
              text: 'next'.tr,
              height: 60.0,
              backgroundColor: MyColors.themeColor,
              textColor: MyColors.whiteColor,
              enable: step1ButtonEnable,
              onPressed: () {
                checkStep( clickType: 'next-step1');
              }
              // onPressed: null,
              ),
        ] else if (step == 2) ...[
          CommonBtn(
              text: 'next'.tr,
              height: 60.0,
              backgroundColor: MyColors.themeColor,
              textColor: MyColors.whiteColor,
              enable: step2ButtonEnable,
              onPressed: () {
                checkStep( clickType: 'next-step2');
              }
              // onPressed: null,
              ),
        ] else if (step == 3) ...[
          Row(
            children: [
              Container(
                width: MediaQuery.of(context).size.width / 2,
                height: 60.0,
                child: CommonBtn(
                    text: 'next_1'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    enable: step3ButtonEnable,
                    onPressed: () {
                      handleImageData(success: () {
                        initData(stepData: 2);
                      });
                    }
                    // onPressed: null,
                    ),
              ),
              Container(
                width: MediaQuery.of(context).size.width / 2,
                height: 60.0,
                child: CommonBtn(
                    text: 'complete'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.whiteColor,
                    textColor: MyColors.themeColor,
                    enable: step3ButtonEnable,
                    onPressed: () {
                      // 参数整合成相应的列表
                      handleImageData(success: () {
                        showDialog(context: context, builder: (_){
                          return MyNDialog(
                              title: null,
                              message: 'returnMessage1'.tr,
                              showCancelButton: true,
                              confirmButtonText: 'confirm'.tr,
                              onConfirm: () {
                                submit(successfn: (){
                                  Get.back();
                                });
                              },
                              onCancel: () {});
                        });
                        
                      });
                    }
                    // onPressed: null,
                    ),
              ),
            ],
          )
        ]
      ]),
    );
  }

  
  handleStep1Info() {
    var postData = {
      "trackingNumber": step1NoController.text,
    };
    ShiftReturnApi.queryOutBoundOrderByTrackingNumber(postData).then((resData){
      if (resData['success'] == true) {
        // 将商品信息填入
        if (resData['data'] != null) {
          setState((){
            tableData1['returnString4'.tr] = resData['data']['lpCode'];
            tableData1['returnString5'.tr] = resData['data']['customerCode'];
            customerCode = resData['data']['customerCode'];
            lpCode = resData['data']['lpCode'];
          });
          if (resData['data']['orderNo'] != null) {
            setState(() {
              status = '1'; // 可匹配到订单 
              orderNo = resData['data']['orderNo'];
            });
          } else if (resData['data']['orderNo'] == null && resData['data']['customerCode'] != null) {
            // 匹配不到订单 但可以匹配到客户代码
            setState(() {
              status = '2'; // sku情况 
            });
          } else {
            // 未知商品
            setState(() {
              status = '4'; // 未知商品 sku可为空
            });
          }
        } else {
          setState((){
            tableData1['returnString4'.tr] = '';
            tableData1['returnString5'.tr] = '';
          });
          // 未知商品
          setState(() {
            status = '4'; // 未知商品 sku可为空
          });
          Utils.toast('returnString6'.tr);
        }
      } else {

      }
    }).catchError((err){

    });
  }
  // 按钮点击事件
  void keyComplete() {
    print("${step1NoController.text}  --1");
    print("${step2NoController.text} --2");
   
    
    if (step == 1) {
      checkButtonEnable();
      handleStep1Info();
    } else if(step == 2) {
      // getSKUexistence(customerCode: );
      getSKUexistence1();
    }
  }
  getSKUexistence2() {
    getSKUexistence(customerCodeData: '', type: 2);
  }
  getSKUexistence1() {
    getSKUexistence(customerCodeData: customerCode, type: 1);
  }
  // 判断是否sku是否存在
  getSKUexistence({customerCodeData, type}) {
    var postData = {
      "skuNo": step2NoController.text,
      "customerCode": customerCodeData,
    };
    ShiftReturnApi.checkSkuIsExists(postData).then((res){
      if (res['success'] == true) {
        if (res['data'].length > 0) {
          // 判断该sku是否属于该客户
          if (customerCode != '') {
            if ( res['data'][0] != customerCode) {
              showDialog(context: context, builder: (_){
                return MyNDialog(
                    title: null,
                    message: 'returnMessage2'.tr,
                    showCancelButton: false,
                    confirmButtonText: 'confirm'.tr,
                    onConfirm: () {
                      setState(() {
                        step2NoController.text = '';
                      });
                    });
              });
            }
          }
          setState(() {
            customeList = [];
            res['data'].forEach((item){
              customeList.add({
                "label": item,
                "value": item,
              });
            });
            if (customerCode == '' || customerCode == null ) {
              // 如果没有值, 直接用第一个值
              customerCode = res['data'][0];
              // print('${res['data'][0]} - ${customerCode}');
            }
          });

        } else {
          // 重新调用一遍接口, customerCode 传空, 判断这个sku是否存在系统
          if (type == 1) {
            getSKUexistence2();
          } else {
            showDialog(context: context, builder: (_){
              return MyNDialog(
                  title: null,
                  message: 'returnMessage3'.tr,
                  showCancelButton: true,
                  confirmButtonText: 'returnDialog1'.tr,
                  onConfirm: () {
                    setState(() {
                      status = '3'; // 可匹配到订单 
                      step2NoController.text = '';
                    });
                  },
                  onCancel: () {
                    // 清空数据
                    setState(() {
                      step2NoController.text = '';
                    });
                  });
            });
          }
          /*// 未匹配到订单
            if (status == '4') {
              // 未知商品
              
            } else {
              showDialog(context: context, builder: (_){
                return MyNDialog(
                    title: null,
                    message: 'SKU与订单不符, 是否继续添加?',
                    showCancelButton: true,
                    confirmButtonText: '添加',
                    onConfirm: () {
                      print('点击了确定');
                    },
                    onCancel: () {
                      print('点击了取消');
                      // 清空数据
                      step2NoController.text = '';
                    });
              });
            }*/

        }
      }
    }).catchError((err){

    });
  }
  
  // 检验是否可以下一步
  checkButtonEnable() {
    // mock
    if (step1NoController.text != null &&
        step1NoController.text != '') {
      setState(() {
        step1ButtonEnable = false;
      });
    } else {
      setState(() {
        step1ButtonEnable = true;
      });
    }
    print('customeStatus');
    // 未知商品sku可以为空, 其他情况sku不能为空
    if (customeStatus != '' && customeStatus != null ) {
      if (status == '3') {
        setState(() {
          step2ButtonEnable = false;
        });
      } else if (step2NoController.text != '' && step2NoController.text != null) {
        setState(() {
          step2ButtonEnable = false;
        });
      } else {
        setState(() {
          step2ButtonEnable = true;
        });
      }
    } else {
      setState(() {
        step2ButtonEnable = true;
      });
    }
  }
  
  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {
    /*  扫码枪实现 textfild 会自动把扫码枪识别的二维码带入到输入框中, 不需要额外的一些操作

    其中方法写在onSubmitted中就可以了, 不需要在onkey 那里在去额外监听enter事件*/
  }

  _changeContent() {
    if (step == 1) {
      return Column(children: [
        StepDescribe(step: '1', text: 'returnString7'.tr),
        // Divider(),
        ScanText(
            onKey: onKey,
            controller: step1NoController,
            placeholder: 'returnString8'.tr,
            onChange: (val) {
              checkButtonEnable();
            },
            onSubmitted: (value) {
              print(value);
              keyComplete();
            },
        ),
        StepTable(
          dataInfo: tableData1,
          keyWidth: 150,
        ),
      ]);
    } else if (step == 2) {
      return Column(children: [
        StepDescribe(step: '2', text: 'shiftSheetString13'.tr),
        // Divider(),
        Container(
          color: MyColors.whiteColor,
          padding: EdgeInsets.fromLTRB(0, 0, 0, 16),
          child: Column(
            children: <Widget>[
              ScanText(
                onKey: onKey,
                controller: step2NoController,
                placeholder: 'shiftSheetString15'.tr,
                onChange: (val) {
                  checkButtonEnable();
                },
                onSubmitted: (value) {
                  keyComplete();
                },
              ),
              Container(
                width: 300,
                color: MyColors.whiteColor,
                child: Steppers(
                  value: 1,
                  inputWidth: 100,
                  min: 1,
                  onChange: (val) {
                    checkButtonEnable();
                    setState(() {
                      QTY = val;
                    });
                  },
                ),
              ),
            ],
          ),
        ),
        TableTitle(
            title: "returnString5".tr,
            require: false,
            fontSize: 16,
            center: true,
            size: 'normal'),
        ReadOnlyTableFile(
            text: customerCode,
            onClick: () {
              if (disableCustomerCode == false) {
                if (customeList.length > 0) {
                  showDialog(
                    context: context,
                    builder: (_) {
                      return MyNDialog(
                          title: null,
                          message: '',
                          showCancelButton: true,
                          confirmButtonText: 'returnDialog2'.tr,
                          onConfirm: () {
                            setState(() {
                              if (chooseCodeRadio != null && chooseCodeRadio != '') {
                                /* print('${chooseCodeRadio} - ${customerCode}');*/
                                customerCode = chooseCodeRadio;
                              }
                            });
                          },
                          onCancel: () {},
                          showConfirmButton: true,
                          // closeOnClickOverlay: true,
                          child: RadioList(
                              needScroll: true,
                              radioHeight: 300.toDouble(),
                              onChange: (val) {
                                setState(() {
                                  if (val != null) {
                                    chooseCodeRadio = val;
                                  }
                                });
                              },
                              listData: customeList,
                              startValue: customerCode
                          )
                      );
                    },
                  );
                }
              }
              print('点击');
            }),
        TableTitle(
            title: "returnString9".tr,
            require: true,
            fontSize: 16,
            center: true,
            size: 'normal'),
        RadioList(
          onChange: (val) {
            print('改变值');
            setState(() {
              if (val != null) {
                customeStatus = val;
                checkButtonEnable();
              }
            });
          },
          listData: customeStatusList,
          startValue: customeStatus,
        )
      ]);
    } else if (step == 3) {
      setState(() {
        imagesList = [];
      });
      return Column(
        children: [
          StepDescribe(step: '3', text: 'returnString10'.tr),
          ImageWallData(
            images: imagesList,
            count: 10,
            onChange: (image) {
              print('${image} ------>');
            },
            onUpload: (file) async {
              if (file != null) {
                // 这里get 和dio 冲突, 选用get方式弄formData
                dioData.FormData formData = dioData.FormData.fromMap({
                  "file": await dioData.MultipartFile.fromFile(
                    file.path,
                  )
                });
               /* FormData formData = FormData({"file": await MultipartFile(file.path, filename: 'avatar.png')});*/
                var resdata = await InboundApi.uploadimg(formData);
                if (resdata['success'] == true) {
                  return resdata['data']['previewUrl'];
                } else {
                  return null;
                }
              }
            },
            onRemove: (val) {},
            imageFit: BoxFit.contain,
          )
        ],
      );
    }
  }
  

  void submit({successfn, catchFn}) {
    Map postData = {
      "customerCode": customerCode,
      "lpCode": lpCode,
      "orderDetailList": orderDetailList,
      "stackingNumber": step1NoController.text,
      "orderNo": orderNo,
    };
    ShiftReturnApi.insertReturnOrder(postData).then((res){
      if (res['success'] == true) {
        successfn != null ? successfn() : null;
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e){
      
    });
    
    
  }

  checkStep({postData, successfn, clickType}) {
    // 检验接口
    // mock
    if (clickType == 'next-step1') {
      if (status == '3') {
        /*// 未知商品
        showDialog(context: context, builder: (_){
          return MyNDialog(
              title: null,
              message: '未知商品, 是否继续添加',
              showCancelButton: true,
              confirmButtonText: '添加',
              onConfirm: () {
                nextStep();
              },
              onCancel: () {});
        });*/
        nextStep();
      } else {
        nextStep();
      }
    } else if (clickType == 'next-step2') {
      // 新增一条数据
      setState(() {
        imagesList = [];
      });
      AddData(success: (){
        nextStep();
      });
    } else {
      nextStep();
    }
  
  }
  
  nextStep() {
    setState(() {
      step = step + 1;
      if (step > 3) {
        step = 1;
        initData();
      }
    });
  }

  
  // 处理图片数据(step为3时操作)
  handleImageData({success}) {
   /* orderDetailList.add({
    "goodsStatus": customeStatus,
    "goodsWydSku": step2NoController.text,
    "number": QTY,
     "fileInfoList": imagesList,
    });*/
    // 找到最后一条数据, 吧他的fileInfoList 修改一下
    orderDetailList[orderDetailList.length -1]['fileInfoList'] = imagesList;
    success != null ? success() : null;
  }
  // 插入一条数据 点击step2 下一步操作
  AddData({success}) {
    orderDetailList.add({
      "goodsStatus": customeStatus,
      "goodsWydSku": step2NoController.text,
      "number": QTY,
      "fileInfoList": imagesList,
    });
    success != null ? success() : null;
  }
  
  // 重置
  void initData({stepData = 1}) {
    print(stepData);
    if (stepData == 1) {
      setState(() {
        step = 1;
        tableData1 = {
          "returnString4".tr: "",
          "returnString5".tr: "",
        };
        QTY = '1';
        step1NoController.text = "";
        step2NoController.text = "";
        step2_1NoController.text = "";
        status = '';
      });
    } else if (stepData == 2) {
      print('进入这里');
      c.orderDetailList = orderDetailList;
      setState(() {
        step = 2;
        QTY = '1';
        customeStatus = '';
        step2NoController.text = "";
        step2ButtonEnable = true;
        status = '';
        disableCustomerCode = true;
      });
    }
  }

/*  @override
  Future<void> getPdaResult(String result) async {
    print('触发');
    if (ModalRoute.of(context)!.isCurrent) {
      if (_focusNode.hasFocus) {
        _focusNode.unfocus();
      }
      String code = result.trim();
      print('${code}----->');
     */ /* context.read<ShelfViewModel>().setPalletizeText(text: code);
      context.read<ShelfViewModel>().saveCurrentSelfPalletize();*/ /*
    }
  }*/

// 创建dom结构

/* void setStorage() async{
    final nameListCopy = json.decode(json.encode(nameList));
    for(var i = 0; i< 10; i++) {
      nameListCopy.add({
        "sourceLocation": '小2明${i}',
         "shiftNum": i,
      });
    }
    LocalStorage.setString('nameList', json.encode(nameListCopy));
    String? localstring_nameList = await LocalStorage.getString('nameList');
    if (localstring_nameList != null) {
      List localList_nameList = json.decode(localstring_nameList);
      print(localList_nameList);
    }
  }*/
}

```


### 处理退件
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_vant_kit/widgets/dialog.dart';
import 'package:flutter_vant_kit/widgets/stepper.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/outbound/components/body.dart';
import 'package:pda/page/return/page/mixinData.dart';
import 'package:pda/routers/return_router.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/widgets/commonStepDescribe.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_no_data.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:pda/widgets/common_table.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';


class SolveReturnOrderController extends GetxController {
  List addReturnOrder = [].obs;

  // 初始化操作
  initAddShiftSheetList() {
    addReturnOrder = [];
  }

  // 存入一条数据
  addOneToAddShiftSheetList(data) {
    addReturnOrder.add(data);
    // 去重
    // var checkInfo = [];
    // addReturnOrder = Utils.uniqeList(dataList:addReturnOrder, checkInfo: checkInfo );
  }

  // 上报成功后操作
  submitCompleteAddShiftSheetList() {
    initAddShiftSheetList();
  }
}


class SolveReturnOrder extends StatelessWidget {
  const SolveReturnOrder({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    final SolveReturnOrderController c = Get.put(SolveReturnOrderController());
    // 初始化
    c.initAddShiftSheetList();
    return Scaffold(
        backgroundColor: MyColors.whiteColor,
      appBar: AppBar(
        title: Text('returnString26'.tr),
        centerTitle: true,
        /*actions: <Widget>[
          IconButton(
              icon: Icon(Icons.list_alt),
              onPressed: () => {
                Get.toNamed(ReturnOrderRouter.solveReturnOrderDetail),
              }),
        ],*/
      ),
      body: ContentBox(key: solveReturnOrderGlobalKey),
    );
  }
}

GlobalKey<_ContentState> solveReturnOrderGlobalKey = GlobalKey();

class ContentBox extends StatefulWidget {
  const ContentBox({
    Key? key,
  }) : super(key: key);

  _ContentState createState() => _ContentState();
}

class _ContentState extends State<ContentBox> with fliterData{
  FocusNode _focusNode = FocusNode();
  final SolveReturnOrderController c = Get.find();
  int step = 1;
  final step1NoController = TextEditingController();
  final step2NoController = TextEditingController();
  final orderNo = Get.arguments['orderNo'] ?? '';
  
  bool step1ButtonEnable = true;
  bool step2ButtonEnable = true;

  // late Map tableData1;
  
  String Step1Name = 'next'.tr;
  String Step2Name = 'next'.tr;
  
  List orderDetailListAll = [];  // 当前单子所有列表(包含已上报等信息)
  List orderDetailList = [];  // 未操作列表(全)
  List orderDetailSearchList = []; // 用未操作列表--搜索
  List orderDetailListShow = [];  // 未操作列表--展示
  List goodsShelveDetailList = []; // setp2上传数据列表
  List goodsShelveDetailListShow = []; // setp2上传数据列表--展示
  Map selectedItem = {}; // 选中的信息
  String warehouseArea = ''; // 库区
  
  String customerCode = ''; // 客户号
  // int cumulativeCount = 1; // 累计值, 大于合计时候可以上架
  num cumulativeCount = 0; // 累计值, 大于合计时候可以上架
  num maxNUmber = 1000; // 最大值
  num QTY = 1; // step2选择的number
  void initState() {
    initData(stepData: 1);
  }
  @override
  Widget build(BuildContext context) {
    return Center(
        child: Column(children: [
          Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: [_changeContent()],
                ),
              )),
          if (step == 1) ...[
            CommonBtn(
                text: Step1Name,
                height: 60.0,
                backgroundColor: MyColors.themeColor,
                textColor: MyColors.whiteColor,
                enable: step1ButtonEnable,
                onPressed: () {
                  checkStep(
                    clickType: Step1Name == 'returnDialog6'.tr ? 'destory' : 'step-next',
                  );
                }
              // onPressed: null,
            ),
          ] else if (step == 2) ...[
            CommonBtn(
                text: Step2Name,
                height: 60.0,
                backgroundColor: MyColors.themeColor,
                textColor: MyColors.whiteColor,
                enable: step2ButtonEnable,
                onPressed: () {
                  checkStep(
                    clickType: Step2Name == 'returnDialog7'.tr ? 'submit' : 'setp2-next',
                  );
                }
              // onPressed: null,
            ),
          ]
        ])
    );
  }
  _changeContent() {
    if (step == 1) {
      return Column(children: [
        StepDescribe(step: '1', text: 'shiftSheetString13'.tr),
        // Divider(),
        ScanText(
          onKey: onKey,
          controller: step1NoController,
          placeholder: 'shiftSheetString15'.tr,
          onChange: (val) {
            if (val == '') {
              search();
            }
          },
          onSubmitted: (value) {
            keyComplete();
          },
        ),
        Container(
          height: MediaQuery.of(context).size.height - 290.sp,
          child:  SingleChildScrollView(
            child: Column(
              children: [
                if (orderDetailSearchList.length > 0) ...[
                  for (var i = 0; i < orderDetailSearchList.length; i++) ...[
                    Parent(
                      style: orderDetailSearchList[i]['isPress'] == true? cardStyleBlack() : cardStyleWhite(),
                      child: StepTable(
                        dataInfo: orderDetailListShow[i],
                        keyWidth: 150,
                        paddingtop: 10,
                        paddingbottom: 10,
                      ),
                      gesture: Gestures()
                        ..onTap(() => itemTap(index: i)),
                    )
                  ],
                ] else ...[
                  Expanded(
                      child: CommonNoDataBox(
                    text: 'no-data'.tr,
                    height: MediaQuery.of(context).size.height - 290.sp,
                  )
                  )
                ]
              ],
            ),
          ),
        ),
      ]);
    } else if (step == 2) {
      return Column(children: [
        StepDescribe(step: '2', text: 'returnString27'.tr),
        // Divider(),
        ScanText(
          onKey: onKey,
          controller: step2NoController,
          placeholder: 'returnString28'.tr,
          onChange: (val) {
            checkButtonEnable();
          },
          onSubmitted: (value) {
            keyComplete();
          },
        ),
        Parent(style: ParentStyle()..padding(all: 15.sp)..background.color(MyColors.whiteColor),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[Txt('${cumulativeCount + QTY} / ${selectedItem['returnNum']}', style: TxtStyle()..textColor(MyColors.colorGreen))],
          ),
        ),
        Container(
          width: 300.sp,
          color: MyColors.whiteColor,
          // padding: EdgeInsets.fromLTRB(10, 10, 10,10),
          child: MyStepper(
            value: QTY.toDouble(),
            inputWidth: 100,
            min: 1,
            max: 1000,
            onChange: (val) {
              setState(() {
                QTY = int.parse(val);
                print(QTY.runtimeType.toString());
                changeStepName(step: 2);
              });
            },
          ),
        ),
        Container(
          height: MediaQuery.of(context).size.height - 400.sp,
          width: MediaQuery.of(context).size.width,
          child:  SingleChildScrollView(
            child: Column(
              children: [
                if (goodsShelveDetailList.length > 0) ...[
                  for (var i = 0; i < goodsShelveDetailList.length; i++) ...[
                    Parent(
                      style: ParentStyle()..width(400)..padding(all: 10),
                      child: StepTable(
                        dataInfo: goodsShelveDetailList[i],
                        keyWidth: 180.sp,
                        paddingtop: 10,
                        paddingbottom: 10,
                      ),
                    )
                  ],
                ] else ...[
                
                ]
              ],
            ),
          ),
        ),
   
      ]);
    }
  }
  
 
  
  
  // 接口检验和新增
  void checkStep({postData, successfn, clickType}) {
    // mock
    if (step ==1) {
      if (clickType == 'destory') {
        destoryOrder();
        return;
      } else if (clickType == 'step-next') {
        setState(() {
          step = step + 1;
        });
        changeStepName(step: 2);
      }
    } else if (step == 2) {
      // 设置累计值
      setcumulativeCount();
      if (clickType == 'setp2-next') {
        findWarehouseCodeByLocation(success: () {
          // 查看输入的数据是否可填
          if (cumulativeCount + QTY > maxNUmber) {
            Utils.toast('returnString29'.tr);
          } else {
            AddData(success: () {
              initData(stepData: 2);
            });
          }
        });
      } else if (clickType == 'submit') {
        findWarehouseCodeByLocation(success: () {

          if (cumulativeCount + QTY > maxNUmber) {
            Utils.toast('returnString29'.tr);
          } else {
            AddData(
              success: () {
                submit(
                  success: (res) {
                  /*  Utils.toast('上架成功');
                    initData(stepData: 1);*/
                    /*Future.delayed(Duration(seconds: 2), (){
                      initData(stepData: 1);
                    });*/
                    showDialog(
                      context: context,
                      builder: (_) {
                        return MyNDialog(
                          title: null,
                          message: 'returnMessage4'.tr,
                          showCancelButton: false,
                          confirmButtonText: 'confirm'.tr,
                          onConfirm: () {
                            initData(stepData: 1);
                          },
                          onCancel: () {},
                        );
                      },
                    );
                  },
                  falseFn: () {
                    if (goodsShelveDetailList.length > 0) {
                      // 删除加的那条数据
                      setState(() {
                        goodsShelveDetailList.removeLast();
                      });
                    }
                    initData(stepData: 2);
                  },
                );
              },
            );
          }
        });
      }
    }
  }
  
  void keyComplete() {
    // step1
    if (step == 1) {
      search();
    } else if (step == 2) {
      // 找库区
      findWarehouseCodeByLocation();
    }
    // 检查button是否可点
    checkButtonEnable();
  }
  
  // sku模糊查询
  search() {
    setState(() {
      // 选择框都为空
      orderDetailSearchList.forEach((element) {
        element['isPress'] = false;
      });
      // 清空当前选择内容
      selectedItem= {};
      // 检查按钮是否可点击
      checkButtonEnable();
      
      orderDetailSearchList = orderDetailList.where((item) {
        return item['goodsWydSku'].contains(step1NoController.text);
      }).toList();
      orderDetailListShow = orderDetailSearchListToorderDetailListShow();
      // print(orderDetailSearchList);
      if (step1NoController.text != null && step1NoController.text != '') {
        if (orderDetailSearchList.length == 1) {
          itemTap(
            index: 0,
           /* success: () {
              checkStep(
                clickType: 'step-next',
              );
            },*/
          );
        }
      }
    });
  }
  
  // 上架提交
  submit({success, falseFn}) {
    Map postData = {
      "detailId": selectedItem['detailId'],
      "returnOrderNo": orderNo,
      "goodsShelveDetailList": goodsShelveDetailList,
    };
    ShiftReturnApi.returnOrderShelve(postData).then((res){
      if (res['success'] == true) {
        success != null ? success(res) : null;
      } else {
        Utils.toast(res['msg']);
        falseFn != null ? falseFn(res) : null;
      }
    }).catchError((e){
      falseFn != null ? falseFn() : null;
    });
    
  }

  // 查找库位是否在系统内
  findWarehouseCodeByLocation({callback, success}) {
    var postData = {
      "warehouseLocation": step2NoController.text
    };
    ShiftReturnApi.findWarehouseCodeByLocation(postData).then((res){
      // mock
     /* res = {
        "code": "000000",
        "data": {
          "warehouseArea": "123123",
          "warehouseLocation": "123123"
        },
        "msg": "SUCCESS",
        "success": true
      };*/
      if (res['success'] == true) {
       if (res['data'] != null && res['data']['warehouseArea'] != null) {
         warehouseArea = res['data']['warehouseArea'];
         success != null ? success() : null;
       } else {
         Utils.toast('returnMessage5'.tr);
         setState(() {
           warehouseArea = '';
           step2NoController.text = '';
         });
       }
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e){
      
    });
  }
  // 插入一条数据 点击step2 下一步操作
  AddData({success}) {
    setState(() {
      goodsShelveDetailList.add({
        "shelveNumber": QTY.toInt(),
        "warehouseArea": warehouseArea,
        "warehouseLocation": step2NoController.text,
      });
      success != null ? success() : null;
    });
   
   
  }
  // 获取累计值
  getCumulativeCount() {
    num count = 0;
    if (goodsShelveDetailList.length > 0) {
      goodsShelveDetailList.forEach((item){
        // print('shelveNumber ${item['shelveNumber']} ${item} -- ${item['shelveNumber'].runtimeType.toString()}');
        count = count + item['shelveNumber'];
      });
    }
    // print('count ${count.runtimeType.toString()}');
    return count;
  }
  // 检验是否可以下一步
  checkButtonEnable() {
    // print("selectedItem  ${selectedItem} ");
    if (selectedItem.isEmpty == true || selectedItem == null) {
      setState(() {
        step1ButtonEnable = true;
      });
    } else {
      setState(() {
        step1ButtonEnable = false;
      });
    }

    // step2
    if (step2NoController.text != null && step2NoController.text != '') {
      setState(() {
        step2ButtonEnable = false;
      });
    } else {
      setState(() {
        step2ButtonEnable = true;
      });
    }
  }
  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {
   
  }
  // 设置累计值
  setcumulativeCount() {
    setState(() {
      cumulativeCount = getCumulativeCount();
    });
  }
  // 转化step的name
  changeStepName({step}) {
    if (step == 2) {
      if (cumulativeCount+ QTY >= maxNUmber) {
        Step2Name = 'returnDialog7'.tr;
      } else {
        Step2Name = 'returnDialog8'.tr;
      }
    } else if (step == 1) {
      // 销毁和下一步
      if (selectedItem['processType'].toString() == '1') {
        Step1Name = 'returnDialog6'.tr;
      } else {
        Step1Name = 'returnDialog8'.tr;
      }
    }
  }
  // 重置
  void initData({stepData = 1}) {
    if (stepData == 1) {
      setState(() {
        /*tableData1 = {
          "SKU": "",
          "Status": "",
          "Require": "",
        };*/
        step = 1;
        step1NoController.text = "";
        step2NoController.text = "";
        step1ButtonEnable = true;
        step2ButtonEnable = true;
        Step1Name = 'returnDialog8'.tr;
        Step2Name = 'returnDialog8'.tr;
        selectedItem = {};
        QTY = 1;
        cumulativeCount = 0;
        maxNUmber = 0;
        warehouseArea = '';
        goodsShelveDetailList = [];
        goodsShelveDetailListShow = [];
        orderDetailListAll = [];
        orderDetailList = [];
        orderDetailListShow = [];
        orderDetailSearchList = [];
        warehouseArea = "";
      });
      getData();
      
    } else if (stepData == 2) {
      print('走了第二部');
      setState(() {
        step = 2;
        step2NoController.text = "";
        step2ButtonEnable = true;
        QTY = 1;
       
      /*  QTY = 1;
        warehouseArea = '';
        cumulativeCount = getCumulativeCount() + QTY;
        maxNUmber = selectedItem['returnNum'] - getCumulativeCount();*/
      });
      setcumulativeCount();
      changeStepName(step: 2);
      /*setState(() {
        try{
          print('${getCumulativeCount()} ----');
          cumulativeCount = getCumulativeCount() + QTY;
         
        }catch(e){
          print('${e}cumulativeCount ${cumulativeCount}');
        }
       
      })*/;
     
    }
   
  }

  // 获取详情数据
  void getData() {
    Map<String, dynamic> postData = {
      "returnOrderNo": orderNo,
    };
    ShiftReturnApi.queryReturnOrderListdetail(postData).then((resData){
      // mock
      /*resData = {
        "code": "000000",
        "msg": "操作成功",
        "data": {
          "returnOrderNo": "ROCAJW3220613701",
          "lpCode": "UPS",
          "stackingNumber": "32234234",
          "processNum": null,
          "operationNum": 5,
          "orderNo": "",
          "createTime": null,
          "customerCode": '123123123',
          "orderDetailList": [
            {
              "detailId": "b9dd84cd86cd2d9e421adc123d4d48b4",
              "goodsWydSku": "wk1",
              "goodsStatus": "0",
              "returnNum": 5,
              "processNum": null,
              "processType": "1",
              "processResult": "0"
            },
            {
              "detailId": "b9dd84cd86cd2d9e421adc123d4d48b2",
              "goodsWydSku": "wk2",
              "goodsStatus": "0",
              "returnNum": 5,
              "processNum": null,
              "processType": "0",
              "processResult": "0"
            },
            {
              "detailId": "b9dd84cd86cd2d9e421adc123d4d48b3",
              "goodsWydSku": "wk3",
              "goodsStatus": "0",
              "returnNum": 5,
              "processNum": null,
              "processType": "0",
              "processResult": "0"
            },
          ]
        },
        "success": true
      };*/
      
      if (resData['success'] == true) {
        setState(() {
          customerCode= resData['data']['customerCode'] ?? null;
        });
        if (resData['data']['orderDetailList'].length > 0) {
          
          setState(() {
            orderDetailListAll = [];
            orderDetailList = [];
            orderDetailListAll = resData['data']['orderDetailList'];
            orderDetailListAll.forEach((element) { 
              if (element['processResult'].toString() == '0') {
                var oneMap = {}..addAll(element)..addAll({
                  "isPress": false,
                });
                orderDetailList.add(oneMap);
                orderDetailSearchList = orderDetailList;
                orderDetailListShow = orderDetailSearchListToorderDetailListShow();
              }
            });
          });
          if (orderDetailList.isEmpty) {
              showDialog(
                      context: context,
                      builder: (_) {
                        return MyNDialog(
                          title: null,
                          message: 'returnMessage6'.tr,
                          showCancelButton: false,
                          confirmButtonText: 'confirm'.tr,
                          onConfirm: () {
                            Get.back();
                          },
                          onCancel: () {},
                        );
                      },
                    );
          }
        }
      }
    }).catchError((e) {
      
    });
    
  }
  
  // 销毁
  destoryOrder() {
    var postData = {
      "customerCode": customerCode,
      "detailId": selectedItem['detailId'],
    };
    ShiftReturnApi.destoryreturnOrderDesTroy(postData).then((res){
      if (res['success'] == true) {
        // 销毁
        // getData();
        Utils.toast('returnMessage7'.tr);
        initData(stepData: 1);
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e){
      
    });
  }
  // 转化成展示列表数据
  orderDetailSearchListToorderDetailListShow() {
    List ListShow = [];
    if (orderDetailSearchList.length > 0) {
      orderDetailSearchList.forEach((element) {
        ListShow.add({
          "SKU": element['goodsWydSku'],
          "Status": filterGoodsStatus(element['goodsStatus']),
          "Require": filterProcessType(element['processType']),
          "Result": filterProcessResult(element['processResult']),
          "Qty": element['returnNum'],
        });
      });
    } 
    return ListShow;
  }

  /**
   *  样式选择类
   */
  cardStyleWhite({pressed = false}) {
    return ParentStyle()..border(all: 2, color: MyColors.whiteColor)..margin(all: 10);
  }
  cardStyleBlack({pressed = false}) {
    return ParentStyle()
      ..border(all: 2, color: MyColors.themeColor)
      ..margin(all: 10)
    ;
  }
  itemTap({index, success}) {
    setState(() {
      // orderDetailSearchList 搜索列表 orderDetailList 未操作数据列表
      orderDetailSearchList.forEach((element) {
        element['isPress'] = false;
      });
      orderDetailSearchList[index]['isPress'] = true;
      // 设置selectedItem
      orderDetailList.forEach((element){
        if (element['detailId'] == orderDetailSearchList[index]['detailId']) {
          selectedItem = element;
        }
      });
      // 检查按钮是否可点击
      checkButtonEnable();
      // 销毁和下一步
      changeStepName(step: 1);
      maxNUmber = selectedItem['returnNum'];
      print(selectedItem);
      success != null ? success() : null;
    });
  }
}

```
 
