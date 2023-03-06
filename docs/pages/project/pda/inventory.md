#### 开发者
  郑凯力
#### 开发时间
  2022-10-14
  
### 需求理解
方便仓库人员使用手持pda进行盘点

  ### 盘点
   设计稿链接:  <br> [https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1](https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1)
   
<br>接口文档地址: [http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E7%9B%98%E7%82%B9%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/costSubmitUsingPOST](http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E7%9B%98%E7%82%B9%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/costSubmitUsingPOST) 


 ### 其中页面分为列表, 详情, 盘点处理 , 盘点异常, 计费 共5个模块
 
 ###列表
 ```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyrefresh/easy_refresh.dart';
import 'package:flutter_vant_kit/main.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/page/inventoryOrder/page/mixin.dart';
import 'package:pda/routers/inventory_order.dart';
import 'package:pda/routers/return_router.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_cardLeftIconRightValue.dart';
import 'package:pda/widgets/common_no_data.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class InventoryProductPage extends StatelessWidget {
  const InventoryProductPage({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final checkType = Get.arguments['checkType'] ?? 0;
    return Scaffold(
        appBar: AppBar(
          title: checkType == 0 ? Text('inventory_product'.tr) : Text('inventory_bound'.tr) ,
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

class _ContentState extends State<ContentBox> with TickerProviderStateMixin, inventoryOrderMixin{
  final step1NoController = TextEditingController();
  FocusNode _focusNode = FocusNode();
  late TabController _tabController;
  int changeType =  0; // 0全部 1我的
  List tableList = [];
  late String status;  // 待分配 已分配  未开始  作业中 初盘完成  复盘完成  已完成  已过期 未完成  盘点中 待复盘
  int current = 1;
  int size = 10;
  final checkType = Get.arguments['checkType'] ?? 0; // 0产品盘点  1 库位盘点
  void initState() {
    
    _tabController = new TabController(length: 2, vsync: this);
// 监听点击事件
    _tabController.addListener(() {
      // print(_tabController.index);
      // 因为这里会请求多次, 所以得加个锁
      if (changeType != _tabController.index) {
        changeType = _tabController.index;
        print('tab--$changeType');
        step1NoController.text = "";
        _focusNode.unfocus();
        getData();
        // 清空上面的搜索框
      }
    });
    getData();
    // Map daak =HandleJumpURL('222');
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Parent(
          child: ScanText(
            onKey: onKey,
            controller: step1NoController,
            placeholder: 'common_vocabulary15'.tr,
            onChange: (val) {
              if (val == '') {
                // 清除时候重新请求
                getData();
              }
            },
            focusNode:_focusNode,
            onSubmitted: (value) {
              keyComplete();
            },
          ),
          style: ParentStyle()..background.color(MyColors.whiteColor),
        ),
        Parent(style: ParentStyle()..margin(top: 12)),
        Parent(
          child:  TabBar(
            controller: _tabController,
            indicatorSize: TabBarIndicatorSize.label,
            labelColor: MyColors.themeColor,
            unselectedLabelColor: MyColors.colorDisabled,
            tabs: [
              Parent(style: ParentStyle()..height(30), child:  Text('all'.tr),),
              Parent(style: ParentStyle()..height(30), child:  Text('mine'.tr),),
            ],
          ),
          style: ParentStyle()..background.color(MyColors.whiteColor)..padding(top: 12, bottom: 12),
        ),
        Expanded(
          child: Container(
            height: MediaQuery.of(context).size.height - 280.sp,
            child: EasyRefresh(
              onRefresh: () async {
                _refresh();
              },
              onLoad: () async {
                _load();
              },
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    if (tableList.length > 0) ...[
                      for (var i = 0; i < tableList.length; i++) ...[
                        Column(
                          children: [
                            if (changeType == 0) ...[
                              TitleBar(
                                text: tableList[i]['checkNo'],
                                icon: Row(
                                  children: [
                                    chooseIcon(
                                      status: changeStatus(tab1value: (tableList[i]['documentStatus'].toString())),
                                    ),
                                    chooseIcon(
                                      status: changeStatus(tab0value: (tableList[i]['isDraw'].toString())),
                                    ),
                                  ],
                                ),
                              ),
                            ] else if (changeType == 1) ...[
                              TitleBar(
                                text: tableList[i]['checkNo'],
                                icon: chooseIcon(
                                  status: changeStatus(tab1value: (tableList[i]['documentStatus'].toString())),
                                ),
                              ),
                            ],
                            CardLeftIconRightValue(
                              showButton: false,
                              buttonText: 'details'.tr,
                              buttonClick: () {},
                              dataList: [
                                {"icon": StaticIcons.TimeIcon, "value": tableList[i]['createTime']},
                                if (tableList[i]['checkMethod'].toString() == '0') ...[
                                  // 明盘
                                  {"icon": StaticIcons.ViewIcon, "value": 'Targeted'},
                                  {
                                    "icon": StaticIcons.PathIcon,
                                    "value": '${tableList[i]['checkedSkuTotalQuantity']} / ${tableList[i]['skuTotalQuantity']}'
                                  }
                                ] else if (tableList[i]['checkMethod'].toString() == '1') ...[
                                  {"icon": StaticIcons.ViewOffIcon, "value": 'Random'}
                                ]
                              ],
                              children: Column(
                                children: [
                                  if (changeType == 0) ...[
                                    chooseButton(
                                      status1: changeStatus(tab0value: tableList[i]['isDraw']),
                                      status2: changeStatus(tab1value: tableList[i]['documentStatus']),
                                      item: tableList[i],
                                    )
                                  ] else if (changeType == 1) ...[
                                    chooseButton(
                                      status2: changeStatus(tab1value: tableList[i]['documentStatus']),
                                      item: tableList[i],
                                    )
                                  ]
                                ],
                              ),
                            )
                          ],
                        )
                      ],
                    ] else ...[
                      CommonNoDataBox(
                        text: 'no-data'.tr,
                      )
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

 

  _refresh() {
    current = 1;
    print('下拉刷新');
    getData();
  }
  _load() {
    current += 1;
    getData(currentPageData: current);
    print('上拉加载');
  }
  
  goDetail( router, {arguments = const {}}) {
    Get.toNamed(router, arguments: arguments)?.then((res){
      getData();
      print('${res} ---> 回退');
    });
  }
  changeStatus({tab0value = '', tab1value = ''}) {
    tab0value = tab0value.toString();
    tab1value = tab1value.toString();
    var status = '';
    switch (tab0value) {
    // token 失效过期
      case "0":
        status = 'common_status5'.tr;
        break;
      case "1":
        status = 'common_status6'.tr;
        break;
    }
    switch (tab1value) {
    // token 失效过期
      case "2":
        status = 'common_status10'.tr;
        break;
      case "5":
        status = 'common_status16'.tr;
        break;
      case "4":
        status = 'common_status8'.tr;
        break;
      case "6":
        status = 'common_status9'.tr;
        break;
      case "7":
        status = 'common_status4'.tr;
        break;
      case "8":
        status = 'common_status14'.tr;
        break;
      case "9":
        status = 'common_status15'.tr;
        break;
    }
    return status;
  }
  
  chooseIcon ({status = ''}) {
    if (status == 'common_status5'.tr) {
      return Image.asset( StaticIcons.Status6Icon, width: 25.sp);
    } else if (status == 'common_status6'.tr) {
      return Image.asset( StaticIcons.Status5Icon, width: 25.sp);
    } else if (status == 'common_status7'.tr) {
      return Image.asset( StaticIcons.Status1Icon, width: 25.sp);
    } else if (status == 'common_status2'.tr) {
      return Image.asset( StaticIcons.Status2Icon, width: 25.sp);
    }else if (status == 'common_status3'.tr) {
      return Image.asset( StaticIcons.Status3Icon, width: 25.sp);
    }else if (status == 'common_status4'.tr) {
      return Image.asset( StaticIcons.Status4Icon, width: 25.sp);
    } else if (status == 'common_status8'.tr) {
      return Image.asset( StaticIcons.Status7Icon, width: 25.sp);
    } else if (status == 'common_status9'.tr) {
      return Image.asset( StaticIcons.Status8Icon, width: 25.sp);
    } else if (status == 'common_status10'.tr) {
      return Image.asset( StaticIcons.Status9Icon, width: 25.sp);
    } else if (status == 'common_status14'.tr) {
      return Image.asset( StaticIcons.Status2Icon, width: 25.sp);
    } else if (status == 'common_status15'.tr) {
      return Image.asset( StaticIcons.Status1Icon, width: 25.sp);
    }  else if (status == 'common_status16'.tr) {
      return Image.asset( StaticIcons.Status2Icon, width: 25.sp);
    } else {
      // 默认值未知
      return Text('');
    }
  }

  chooseButton({status1 = '', item, status2}) {
    // print(status);
    String status;
    if (status1 != null) {
      status = status1;
    } else {
      status = status2;
    }

    // 未完成 盘点中，待复盘，复盘中，PDA上对应盘点单都得有盘点按钮
    if ((status1 == 'common_status5'.tr || status1 == '') && (status2 == 'common_status10'.tr  || status2 == 'common_status14'.tr || status2 == 'common_status15'.tr || status2 == 'common_status16'.tr)) {
      print('显示盘点按钮');
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          NButton(
              text: 'details'.tr,
              width: 150.sp,
              onClick: () {
                goDetail(InventoryOrderRouter.inventoryDetail, arguments: {"orderNo": item['checkNo'], 'status': status, "checkType": checkType});
              }),
          NButton(
              color: MyColors.themeColor,
              text: 'inventory_order'.tr,
              width: 150.sp,
              onClick: () {
                if (changeType == 0) {
                  // 全部里面点击盘点
                  startOrder(item: item);
                } else {
                  
                  Map uRLData = HandleJumpURL(item);
                  if (uRLData['path'] == 'expense') {
                    print('item[checkNo]-----${item['checkNo']}');
                    goDetail(InventoryOrderRouter.inventoryExpense, arguments: {"orderNO": item['checkNo'], "type":  uRLData['checkType']});
                  } else {
                    goDetail(InventoryOrderRouter.inventoryHandle, arguments: {"orderNO": item['checkNo']});
                  }
          
                  // goDetail(InventoryOrderRouter.inventoryExpense, arguments: {"orderNO": item['checkNo']});
                }
              }),
        ],
      );
    } else {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          NButton(
              text: 'details'.tr,
              width: 310.sp,
              onClick: () {
                
                goDetail(InventoryOrderRouter.inventoryDetail, arguments: {"orderNo": item['checkNo'], 'status': status, "checkType": checkType});
              }),
        ],
      );
    }
  }
  
  // 领取任务
  startOrder({item = const {}}) {
    return showDialog(
      context: context,
      builder: (_) {
        return MyNDialog(
            title: null,
            message: 'inventoryOrderString8'.tr,
            showCancelButton: true,
            confirmButtonText: 'start'.tr,
            onConfirm: () {
              var postData = {
                "checkNo": item['checkNo'],
              };
              ShiftReturnApi.checkOrderDraw(postData).then((res){
                if (res['success'] == true) {
                  Utils.toast(res['msg']);
                  // 直接去到盘点页面
                  Map uRLData = HandleJumpURL(item);
                  if (uRLData['path'] == 'expense') {
                    goDetail(InventoryOrderRouter.inventoryExpense, arguments: {"orderNO": item['checkNo'], "type":  uRLData['checkType']});
                  } else {
                    goDetail(InventoryOrderRouter.inventoryHandle, arguments: {"orderNO": item['checkNo']});
                  }
                } else {
                  showDialog(
                    context: context,
                    builder: (_) {
                      return MyNDialog(
                        title: null,
                        message: res['msg'],
                        showCancelButton: false,
                        confirmButtonText: 'confirm'.tr,
                        onConfirm: () {
                         
                        },
                        onCancel: () {},
                      );
                    },
                  );
                }
              }).catchError((e){
                
              });
            },
            onCancel: () {},
            showConfirmButton: true,
        );
      },
    );
  }
  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {}

  // 按钮点击事件
  void keyComplete() {
    getData();
  }

  void getData({currentPageData = 1}) {

    if (currentPageData == 1) {
      setState(() {
        tableList = [];
        current = 1;
      });
    }
    var postData = {
      "checkNo": step1NoController.text,
      "current":currentPageData,
      "size": 10,
      "tab": changeType,
      "checkType": checkType
    };

    ShiftReturnApi.checkOrderPageQuery(postData).then((res) {
      // mock
      /*res = {
        "code": "000000",
        "data": {
          "current": 0,
          "hitCount": true,
          "optimizeCountSql": true,
          "orders": [
            {
              "asc": false,
              "column": "id"
            }
          ],
          "records": [
            {
              "checkFinishTime": "",
              "checkMethod": "0", // 0 明盘  1 暗盘
              "checkNo": "123123123",
              "checkType": "",
              "createTime": "2020-11-1",
              "dataBelong": "",
              "documentStatus": "2",
              "id": "",
              "operatorList": "",
              "remarks": "",
              "skuClassificationQuantity": 0,
              "skuTotalQuantity": 10, // sku总数量
              "warehouseCode": "",
              "isDraw": 0, // 领取状态   0 否 1是
            },
            {
              "checkFinishTime": "",
              "checkMethod": "1", // 0 明盘  1 暗盘
              "checkNo": "123123123",
              "checkType": "",
              "createTime": "2020-11-1",
              "dataBelong": "",
              "documentStatus": "7",
              "id": "",
              "operatorList": "",
              "remarks": "",
              "skuClassificationQuantity": 0,
              "skuTotalQuantity": 10, // sku总数量
              "warehouseCode": "",
              "isDraw": 1, // 领取状态   0 否 1是
            }
          ],
          "searchCount": true,
          "size": 0,
          "total": 0
        },
        "msg": "SUCCESS",
        "success": true
      };*/
      print('res------------------$res');
      if (res['success'] == true) {
        setState(() {
          tableList.addAll(res['data']['records']);
        });
      } else {

      }
    }).catchError((e) => {});
  }

  @override
  void deactivate() {
    print('触发回退');
    /*var bool = ModalRoute.of(context).isCurrent;

    if (bool) {

      getData();

    }*/
  }
}

```


### 详情
```js
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/routers/inventory_order.dart';
import 'package:pda/routers/return_router.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pda/widgets/common_table.dart';



class InventoryDetailPage extends StatelessWidget {
  const InventoryDetailPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar( 
          title: Text('details'.tr),
          centerTitle: true,
          elevation: 0,
          leading: IconButton(icon: Icon(Icons.arrow_back), onPressed: () async {
            
            Get.back();
          }),
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

class _ContentState extends State<ContentBox> {
  List tableList = [];
  List shiftOrderDetailVOList = []; // 产品明细展示列表表格
  Map shiftOrderVO = {};
  // String status = '未开始'; // 未开始  作业中 已过期 已完成 
  final orderNO = Get.arguments['orderNo'] ?? '';
  final status = Get.arguments['status'] ?? '';
  final checkType = Get.arguments['checkType'] ?? ''; // 0 商品盘点 1库位盘点
  String checkMethod = "0"; // 0 明盘  1暗盘
  int currentPage = 1;
  int pageSize = 100;
  // final orderNO = '123123';

  void initState() {
    getData();
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
      if (status == 'common_status1'.tr || status == 'common_status2'.tr) ...[
        CommonBtn(
            text: 'inventoryOrderDialog1'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            onPressed: () {
              goDetail(arguments: {"orderNo": orderNO, 'status': status, 'checkType': checkType});
              // Get.toNamed(InventoryOrderRouter.inventoryHandle, arguments: {
              //   "shiftOrderNo": shiftOrderNo
              // });
            }
          // onPressed: null,
        ),
      ]
    ]);
  }

  _createContent() {
    return Column(children: [
      TitleBar(
        text: 'basic_info'.tr,
        icon: chooseIcon(status:status),
      ),
      StepTable(
        dataInfo: shiftOrderVO,
        keyWidth: 150,
      ),
      Container(
        height: 30.sp,
      ),
      TitleBar(text: 'product_info'.tr),
      for (var i = 0; i < shiftOrderDetailVOList.length; i++) ...[
        StepTable(
          dataInfo: shiftOrderDetailVOList[i],
          keyWidth: 150,
          paddingtop: 10,
          paddingbottom: 10,
        ),
        Container(
          height: 10.sp,
        ),
      ]
    ]);
  }

  goDetail({arguments = const {}}) {
    Get.toNamed(InventoryOrderRouter.inventoryHandle, arguments: arguments);
  }
  
  void getData() {
    Map<String, dynamic> postData = {
      "checkNo": orderNO,
    };

    ShiftReturnApi.checkOrderInfo(postData).then((res){
      // mock
     /* res = {
        "code": "000000",
        "data": {
          "checkFinishTime": "",
          "checkMethod": "0",
          "checkNo": "234333333",
          "checkTimes": 0,
          "checkType": "",
          "createTime": "1231233333",
          "dataBelong": "",
          "documentSource": "",
          "documentStatus": "",
          "id": "",
          "isDraw": 0,
          "operatorList": "",
          "remarks": "",
          "skuClassificationQuantity": 0,
          "skuTotalQuantity": 0,
          "warehouseCode": ""
        },
        "msg": "SUCCESS",
        "success": true
      };*/
        // 产品盘点
        setState(() {
          shiftOrderVO['Order No'] = res['data']['checkNo'];
          shiftOrderVO['Time'] = res['data']['createTime'];
          shiftOrderVO['inventoryOrderString1'.tr] = filterCheckMethod(res['data']['checkMethod']);
          shiftOrderVO['QTY'] = '${res['data']['checkedSkuTotalQuantity']} | ${res['data']['skuTotalQuantity']}';
          checkMethod =  res['data']['checkMethod'].toString();
        });
    }).catchError((e){
     
    });

    Map<String, dynamic> postData2 = {
      "checkNo": orderNO,
      "current": currentPage,
      "size": pageSize,
    };
    ShiftReturnApi.checkOrderInfoList(postData2).then((res){
      /*res = {
        "code": "000000",
        "data": {
          "current": 0,
          "hitCount": true,
          "optimizeCountSql": true,
          "orders": [
            {
              "asc": false,
              "column": "id"
            }
          ],
          "records": [
            {
              "checkNo": "",
              "checkNum": 0,
              "checkTime": "",
              "customerCode": "",
              "differenceNum": 0,
              "goodsWydSku": "",
              "id": "",
              "inventoryNum": 0,
              "operator": "",
              "packErrorNum": 0,
              "status": 0,
              "warehouseAreaCode": "",
              "warehouseCode": "",
              "warehouseLocationCode": ""
            }
          ],
          "searchCount": true,
          "size": 0,
          "total": 0
        },
        "msg": "SUCCESS",
        "success": true
      };*/
      // mock
      var shiftOrderDetailVOListMap = {};
      if (res['success'] == true) {
        if (res['data']['records'].length > 0) {
          res['data']['records'].forEach((item){
            setState(() {
              if (checkType == 0) {
                // 产品盘点
                shiftOrderDetailVOListMap = {
                  'SKU': item['goodsWydSku'],
                  'Customer': item['customerCode'],
                  "inventoryOrderString2".tr: item['warehouseLocationCode'],
                  'Qty': text1LTR(val1: item['checkNum'], val2:  item['inventoryNum']),
                };
                if (checkMethod == '1') {
                  shiftOrderDetailVOListMap.remove('Qty');
                }
                shiftOrderDetailVOList.add(shiftOrderDetailVOListMap);
              } else {
                // 库位盘点
                shiftOrderDetailVOListMap = {
                  "inventoryOrderString2".tr: item['warehouseLocationCode'],
                  'SKU': item['goodsWydSku'],
                  'Customer': item['customerCode'],
                  'Qty': text1LTR(val1: item['checkNum'], val2:  item['inventoryNum']),
                };
                if (checkMethod == '1') {
                  shiftOrderDetailVOListMap.remove('Qty');
                }
                shiftOrderDetailVOList.add(shiftOrderDetailVOListMap);
              }
            });
          });
        }
      }
    }).catchError((e){

    });
    
    
    
    
  }

  chooseIcon ({status = ''}) {
    if (status == 'common_status5'.tr) {
      return Image.asset( StaticIcons.Status6Icon, width: 25.sp);
    } else if (status == 'common_status6'.tr) {
      return Image.asset( StaticIcons.Status5Icon, width: 25.sp);
    } else if (status == 'common_status7'.tr) {
      return Image.asset( StaticIcons.Status1Icon, width: 25.sp);
    }else if (status == 'common_status2'.tr) {
      return Image.asset( StaticIcons.Status2Icon, width: 25.sp);
    }else if (status == 'common_status3'.tr) {
      return Image.asset( StaticIcons.Status3Icon, width: 25.sp);
    }else if (status == 'common_status4'.tr) {
      return Image.asset( StaticIcons.Status4Icon, width: 25.sp);
    } else if (status == 'common_status8'.tr) {
      return Image.asset( StaticIcons.Status7Icon, width: 25.sp);
    } else if (status == 'common_status9'.tr) {
      return Image.asset( StaticIcons.Status8Icon, width: 25.sp);
    } else if (status == 'common_status10'.tr) {
      return Image.asset( StaticIcons.Status9Icon, width: 25.sp);
    } else if (status == 'common_status14'.tr) {
      return Image.asset( StaticIcons.Status2Icon, width: 25.sp);
    } else if (status == 'common_status15'.tr) {
      return Image.asset( StaticIcons.Status1Icon, width: 25.sp);
    } else if (status == 'common_status16'.tr) {
      return Image.asset( StaticIcons.Status2Icon, width: 25.sp);
    }  else {
      // 默认值未知
      return Text('');
    }
  }
  
  filterCheckMethod(val) {
    var status = '';
    val = val.toString();
    switch (val) {
    // token 失效过期
      case "0":
        status = 'Targeted';
        break;
      case "1":
        status = 'Random';
        break;
    }
    return status;
  }
  
  text1LTR({val1 = '', val2 = ''}) {
    if ((val1 != null && val1 != '') && (val2 != null && val2 != '')) {
      return '${val1} | ${val2}';
    }else if (val2 == null || val2 == '') {
      if (val1 != null && val1 != '') {
        return '${val1}';
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
}

```

### 盘点处理
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_vant_kit/widgets/dialog.dart';
import 'package:flutter_vant_kit/widgets/stepper.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/page/inventoryOrder/page/mixin.dart';
import 'package:pda/routers/inventory_order.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/widgets/commonStepDescribe.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:pda/widgets/common_table.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class InventoryHandleController extends GetxController {
  List addOrder = [].obs;

  // 初始化操作
  initList() {
    addOrder = [];
  }

  // 存入一条数据
  addOneToList(data) {
    addOrder.add(data);
    // 去重
    // var checkInfo = [];
    // addReturnOrder = Utils.uniqeList(dataList:addReturnOrder, checkInfo: checkInfo );
  }

  // 上报成功后操作
  submitList() {
    initList();
  }
}

class InventoryHandle extends StatelessWidget {
  const InventoryHandle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final InventoryHandleController c = Get.put(InventoryHandleController());
    // 初始化
    c.initList();
    return Scaffold(
        appBar: AppBar(
          title: Text('inventory_product'.tr),
          centerTitle: true,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () async {
           
                showDialog(
                  context: context,
                  builder: (_) {
                    return MyNDialog(
                        title: null,
                        message: 'common_vocabulary7'.tr,
                        showCancelButton: true,
                        confirmButtonText: 'confirm'.tr,
                        onConfirm: () {
                        /*  Get.until((route){
                            print("${route} -->");
                            return Get.currentRoute == '/inventoryProduct';
                          });*/
                          // Get.until((route) => Get.currentRoute == '/inventoryOrder');
                          Get.back();
                        },
                        onCancel: () {});
                  },
                );
              
            },
          ),
        ),
        body: ContentBox(key: inventoryHandleGlobalKey));
  }
}

GlobalKey<_ContentState> inventoryHandleGlobalKey = GlobalKey();

class ContentBox extends StatefulWidget {
  const ContentBox({
    Key? key,
  }) : super(key: key);

  _ContentState createState() => _ContentState();
}

class _ContentState extends State<ContentBox> with inventoryOrderMixin{
  FocusNode _focusNode = FocusNode();
  final InventoryHandleController c = Get.find();

  final step1NoController = TextEditingController();
  final step2NoController = TextEditingController();
  late Map tableData1;
  int step = 1;
  bool step1ButtonEnable = true;
  bool step2ButtonEnable = true;
  bool step3ButtonEnable = false;
  String QTY1 = '0'; // 实际清点数量
  String QTY2 = '0'; // 破损数量

  String checkMethod = '0'; // 0 产品明盘  1 产品暗盘
  final orderNO = Get.arguments['orderNO'] ?? '';
  // final orderNO = 'CO220908-101';
  String orderDetailsId = ''; // 订单id

  List errCodeList = [
    {
      "code": "oxpda12201",
      "value": "inventoryOrderCode_oxpda12201".tr,
    },
    {
      "code": "oxpda12202",
      "value": "inventoryOrderCode_oxpda12202".tr,
    },
    {
      "code": "oxpda12203",
      "value": "inventoryOrderCode_oxpda12203".tr,
    },
    {
      "code": "oxpda12204",
      "value": "inventoryOrderCode_oxpda12204".tr,
    },
    {
      "code": "oxpda12206",
      "value": "inventoryOrderCode_oxpda12206".tr,
    },
    {
      "code": "oxpda12207",
      "value": "inventoryOrderDialog_oxpda12207".tr,
    },
  ];

  /*{
  "checkNo": "CO220908-101",
  "locationNo": "A002-629-A1",
  "skuNo": "zykkh1-zyj-66-L11"
  }*/

  void initState() {
    super.initState();
    initData();
    getData();
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
              Map postData = {
                "checkNo":orderNO,
                "locationNo": step1NoController.text,
                "skuNo": step2NoController.text,
              };
              checkStep(postData: postData);
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
              Map postData = {
                "checkNo":orderNO,
                "locationNo": step1NoController.text,
                "skuNo": step2NoController.text,
              };
              checkStep(postData: postData);
            }
            ),
      ] else if (step == 3) ...[
        CommonBtn(
            text: 'next_1'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            enable: step3ButtonEnable,
            onPressed: () {
              Map postData = {
                "checkNum":QTY1,
                "orderDetailsId": orderDetailsId,
                "packErrorNum": QTY2,
              };
              submit(postData: postData );
            }
            // onPressed: null,
            ),
      ]
    ]));
  }

  // 按钮点击事件
  void keyComplete() {
    print("${step1NoController.text}  --1");
    print("${step2NoController.text} --2");
    // mock
    // step1
    if (step1NoController.text != null && step1NoController.text != '') {
      setState(() {
        step1ButtonEnable = false;
      });
    } else {
      setState(() {
        step1ButtonEnable = true;
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
    /*// step3
    if (int.parse(QTY1) > 0) {
      setState(() {
        step3ButtonEnable = false;
      });
    } else {
      setState(() {
        step3ButtonEnable = true;
      });
    }*/
  
  }

  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {
    /*  扫码枪实现 textfild 会自动把扫码枪识别的二维码带入到输入框中, 不需要额外的一些操作

    其中方法写在onSubmitted中就可以了, 不需要在onkey 那里在去额外监听enter事件*/
  }

 

  _changeContent() {
    if (step == 1) {
      return Column(children: [
        StepDescribe(step: '1', text: 'common_vocabulary8'.tr),
        // Divider(),
        ScanText(
            onKey: onKey,
            controller: step1NoController,
            placeholder: 'common_vocabulary9'.tr,
            onChange: (val) {
              keyComplete();
            },
            onSubmitted: (value) {
              print(value);
              keyComplete();
            },
            onEditingComplete: () {
              print('onEditingComplete');
            }),
      /*  StepTable(
          dataInfo: tableData1,
          keyWidth: 150,
        ),*/
      ]);
    } else if (step == 2) {
      return Column(children: [
        StepDescribe(step: '2', text: 'common_vocabulary10'.tr),
        // Divider(),
        ScanText(
            onKey: onKey,
            controller: step2NoController,
            placeholder: 'common_vocabulary11'.tr,
            onChange: (val) {
              keyComplete();
            },
            onSubmitted: (value) {
              print(value);
              keyComplete();
            },
            onEditingComplete: () {
              print('onEditingComplete');
            }),
      /*  StepTable(
          dataInfo: tableData1,
          keyWidth: 150,
        ),*/
      ]);
    } else if (step == 3) {
      return Column(children: [
        TableTitle(title: "inventoryOrderString4".tr, require: false, fontSize: 16, center: true, size: 'normal'),
        Parent(
            style: ParentStyle()
              ..width(MediaQuery.of(context).size.width)
              ..padding(left: 16, right: 16)
              ..background.color(MyColors.whiteColor),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Parent(
                    style: ParentStyle()..width(300.sp),
                    child: Steppers(
                      value: 0,
                      inputWidth: 100,
                      min: 0,
                      onChange: (val) {
                        setState(() {
                          QTY1 = val;
                        });
                        keyComplete();
                      },
                    )),
              ],
            )),
        TableTitle(title: "common_vocabulary12".tr, require: false, fontSize: 16, center: true, size: 'normal'),
        Parent(
            style: ParentStyle()
              ..width(MediaQuery.of(context).size.width)
              ..padding(left: 16, right: 16)
              ..background.color(MyColors.whiteColor),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Parent(
                    style: ParentStyle()..width(300.sp),
                    child: Steppers(
                      value: 0,
                      inputWidth: 100,
                      min: 0,
                      onChange: (val) {
                        setState(() {
                          QTY2 = val;
                        });
                        keyComplete();
                      },
                    )),
              ],
            )),
        StepTable(
          dataInfo: tableData1,
          keyWidth: 150,
        ),
      ]);
    }
  }
  submit({postData, successfn, clickType}) {
    ShiftReturnApi.submitPageQuery(postData).then((res){
      // mock
    /*  res = {
        "code": "000000",
        "data": {
          "isCheckEnd": 0,  // 是否全部盘点完  0否 1是
          "recommendScan": 1 // 0 库位+sku  1 sku
        },
        "msg": "SUCCESS",
        "success": true
      };*/
      if (res['success'] == true) {
        print('提交 isCheckEnd------${res['data']['isCheckEnd']}');
        print('提交 recommendScan------${res['data']['recommendScan']}');
      
        if (res['data']['isCheckEnd'] == 1) {
          // 已盘点完成
          // 先注释, 还未进行联调 跳转费用页面
          // 先确认 产品盘点完成
            showDialog(
              context: context,
              builder: (_) {
                return MyNDialog(
                    title: null,
                    message: 'inventoryOrderString5'.tr,
                    showCancelButton: false,
                    confirmButtonText: 'confirm'.tr,
                    onConfirm: () {
                      // Get.until((route) => Get.currentRoute == '/inventoryProduct');
                        Map uRLData = HandleJumpURL(res['data']);
                        print('uRLData-----$uRLData');
                        if (uRLData['path'] == 'expense') {
                          goDetail(InventoryOrderRouter.inventoryExpense, arguments: {"orderNO": orderNO, "type":  uRLData['checkType']});
                        } else {
                          Get.until((route) => Get.currentRoute == '/inventoryProduct');
                        }
                    },
                    onCancel: () {});
              },
            );
          // Map uRLData = HandleJumpURL(res['data']);
          // print('uRLData-----$uRLData');
          // if (uRLData['path'] == 'expense') {
          //   goDetail(InventoryOrderRouter.inventoryExpense, arguments: {"orderNO": orderNO, "type":  uRLData['checkType']});
          // } 
          // else {
          //   showDialog(
          //     context: context,
          //     builder: (_) {
          //       return MyNDialog(
          //           title: null,
          //           message: 'inventoryOrderString5'.tr,
          //           showCancelButton: false,
          //           confirmButtonText: 'confirm'.tr,
          //           onConfirm: () {
          //             Get.until((route) => Get.currentRoute == '/inventoryProduct');
          //           },
          //           onCancel: () {});
          //     },
          //   );
          // }
        } else {
          // 未盘点完成
          // 重新走
          if (res['data']['recommendScan'] == 0) {
            initData();
          } else if (res['data']['recommendScan'] == 1) {
            // 去到sku
            initData(stepdata: 2);
          } else {
            initData();
          }
        }
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e){
      
    });
  }
  checkStep({postData, successfn, clickType}) {
    // 检验接口
    // mock
    // 测试
    // Get.until((route) => Get.currentRoute == '/inventoryProduct');
    // Get.offNamedUntil('/inventoryOrder');

    ShiftReturnApi.checkScanValid(postData).then((res) {
      
      
      if (res['success'] == true) {
       
        setState(() {
        
          step = step + 1;
          if (res['data'] != null) {
            tableData1 = {
              "common_vocabulary13".tr: res['data']['checkNo'],
              "common_vocabulary4".tr: res['data']['warehouseLocationCode'],
              "SKU": res['data']['goodsWydSku'],
              "common_vocabulary5".tr: res['data']['customerCode'],
              "common_vocabulary14".tr: text1LTR(val1: res['data']['checkNum'], val2: res['data']['inventoryNum']),
            };
            if (checkMethod == '1') {
              // 暗盘没有账面数量
              tableData1.remove('common_vocabulary14'.tr);
            }
            orderDetailsId = res['data']['id'];
          }
          if (step > 3) {
            step = 1;
            initData();
          }
        });
      } else {
        if (res['code'] == 'oxpda12205') {
          // 上报异常
          showDialog(
            context: context,
            builder: (_) {
              return MyNDialog(
                  title: null,
                  message: 'inventoryOrderString6'.tr,
                  showCancelButton: true,
                  confirmButtonText: 'inventoryOrderString7'.tr,
                  onConfirm: () {
                    Map postDatainfo = {
                      "checkNo": orderNO,
                      "goodsWydSku": step2NoController.text,
                      "warehouseLocationCode": res['code'],
                    };
                    ShiftReturnApi.submitErrorPageQuery(postDatainfo).then((res){
                      if (res['success'] == true) {
                        // 回到第一步
                        initData();
                      } else {
                        Utils.toast(res['msg']);
                      }
                    }).catchError((err){
                      
                    });
                  },
                  onCancel: () {});
            },
          );
        } else {
          errCodeMessage(code: res['code'] , message: res['msg']);
        }
      }
    }).catchError((e) {});

   
  }
  
  // 重置
  void initData({stepdata = 1}) {
    if (stepdata == 2) {
      setState(() {
        tableData1 = {
          "common_vocabulary13".tr: "",
          "common_vocabulary4".tr: "",
          "SKU": "",
          "common_vocabulary5".tr: "",
          "common_vocabulary14".tr: "",
        };
        if (checkMethod == '1') {
          tableData1.remove('common_vocabulary14'.tr);
        }
        orderDetailsId = '';
        step = 2;
        QTY1 = '0';
        QTY2 = '0';
        step2NoController.text = '';
        step2ButtonEnable = true;
        step3ButtonEnable = false;
      });
    } else {
      setState(() {
        tableData1 = {
          "common_vocabulary13".tr: "",
          "common_vocabulary4".tr: "",
          "SKU": "",
          "common_vocabulary5".tr: "",
          "common_vocabulary14".tr: "",
        };
        if (checkMethod == '1') {
          tableData1.remove('common_vocabulary14'.tr);
        }
        orderDetailsId = '';
        step = 1;
        QTY1 = '0';
        QTY2 = '0';
        step1NoController.text = "";
        step2NoController.text = '';
        step1ButtonEnable = true;
        step2ButtonEnable = true;
        step3ButtonEnable = false;
      });
    }
   
  }

  //
  getData() {
    Map<String, dynamic> postData = {
      "checkNo": orderNO,
    };
    ShiftReturnApi.checkOrderInfo(postData).then((res) {
      // mock
      /*res = {
        "code": "0000",
        "data": {
          "checkFinishTime": "",
          "checkMethod": "0",  // 0 明盘  1 暗盘
          "checkNo": "",
          "checkTimes": 0,
          "checkType": "0",  // 0 商品盘点  1 库位盘点
          "createTime": "",
          "dataBelong": "",
          "documentSource": "",
          "documentStatus": "",
          "id": "",
          "isDraw": 0,
          "operatorList": "",
          "remarks": "",
          "skuClassificationQuantity": 0,
          "skuTotalQuantity": 0,
          "warehouseCode": ""
        },
        "msg": "SUCCESS",
        "success": true
      };*/
      if (res['success'] == true) {
        setState(() {
          checkMethod = res['data']['checkMethod'];
        });
      }
    }).catchError((e) {});
  }
  
  hasErrCode({code = ''}) {
    var hasCode = false;
    List codeList = errCodeList;
    for(var i = 0; i< codeList.length; i++) {
      if (codeList[i]['code'] == code) {
        hasCode = true;
      }
    }
    return hasCode;
  }
  errCodeMessage({code = '', message = ''}) {
    var hasCode = false;
    var toastValue = '';
    List codeList = errCodeList;
    for(var i = 0; i< codeList.length; i++) {
      if (codeList[i]['code'] == code) {
        hasCode = true;
        toastValue = codeList[i]['value'];
      }
    }
    if (hasCode == true) {
      Utils.toast(toastValue);
    } else {
      Utils.toast(message);
    }
  }

  text1LTR({val1 = '', val2 = ''}) {
 /*   if ((val1 != null && val1 != '') && (val2 != null && val2 != '')) {
      return '${val1} | ${val2}';
    }else if (val2 == null || val2 == '') {
      if (val1 != null && val1 != '') {
        return '${val1}';
      } else {
        return '';
      }
    } else {
      return '';
    }*/
    if (val1 != null && val1 != '') {
      if (val2 != null && val2 != '') {
        return '${val1} | ${val2}';
      } else {
        return '${val1}';
      }
    } else if (val2 != null && val2 != '') {
      if (val1 != null && val1 != '') {
        return '${val1} | ${val2}';
      } else {
        return '${val2}';
      }
    }
  }

  goDetail( router, {arguments = const {}}) {
    Get.toNamed(router, arguments: arguments)?.then((res){
      print('${res} ---> 回退');
    });
  }
}

```


### 盘点异常
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyrefresh/easy_refresh.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/routers/inventory_order.dart';
import 'package:pda/routers/my_shift_sheet.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_cardLeftIconRightValue.dart';
import 'package:pda/widgets/common_no_data.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class InventoryErrorPage extends StatelessWidget {
  const InventoryErrorPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('inventory_error'.tr),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(child: ContentBox()),
    );
  }
}

class ContentBox extends StatefulWidget {
  const ContentBox({
    Key? key,
  }) : super(key: key);

  _ContentState createState() => _ContentState();
}

class _ContentState extends State<ContentBox> {
  final step1NoController = TextEditingController();
  FocusNode _focusNode = FocusNode();
  List tableList = [];
  int currentPage = 1;
  int pageSize = 10;

  void initState() {
    getData();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Parent(
          child: ScanText(
              onKey: onKey,
              controller: step1NoController,
              placeholder: 'inventoryOrderString3'.tr,
              onChange: (val) {
                if (val == '') {
                  print('清除');
                  getData();
                }
              },
              focusNode: _focusNode,
              onSubmitted: (value) {
                keyComplete();
              },
              onEditingComplete: () {
                print('结束');
              }),
          style: ParentStyle()..background.color(MyColors.whiteColor),
        ),
        
        Container(
          height: MediaQuery.of(context).size.height - 150.sp,
          child: EasyRefresh(
            onRefresh: () async {
              _refresh();
            },
            onLoad: () async {
              _load();
            },
            child: SingleChildScrollView(
              child: Column(
                children: [
                  if (tableList.length > 0) ...[
                    for (var i = 0; i < tableList.length; i++) ...[
                      Column(
                        children: [
                          TitleBar(text: tableList[i]['checkNo']),
                          CardLeftIconRightValue(
                            showButton: true,
                            buttonText: 'details'.tr,
                            buttonClick: () {
                              Get.toNamed(InventoryOrderRouter.inventoryErrorDetail, arguments: {"shiftOrderNo": tableList[i]['id']});
                            },
                            dataList: [
                              {"icon": StaticIcons.TimeIcon, "value": tableList[i]['createTime']},
                              {"icon": StaticIcons.WarnIcon, "value": filterType(tableList[i]['type'])}
                            ],
                          )
                        ],
                      ),
                    ],
                  ] else ...[
                    Expanded(child:  CommonNoDataBox(
                      text: 'no-data'.tr,
                    ))
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  filterType(val) {
    val = val.toString();
    var status = '';
    switch (val) {
      case '1':
        status = 'common_status11'.tr;
        break;
      case "2":
        status = 'common_status12'.tr;
        break;
      case "3":
        status = 'common_status13'.tr;
        break;
    }
    return status;
  }

  _refresh() {
    currentPage = 1;
    print('下拉刷新');
    getData();
  }

  _load() {
    if (tableList.length > 0) {
      currentPage += 1;
      getData(currentPageData: currentPage);
    }
    print('上拉加载');
  }

  void getData({currentPageData = 1}) {
    if (currentPageData == 1) {
      setState(() {
        tableList = [];
        currentPage = 1;
      });
    }
    var postData = {
      "current": currentPageData,
      "size": 10,
      "checkNo": step1NoController.text,
    };
    ShiftReturnApi.errorpageQuery(postData).then((res) {
      // mockdata
    /*  res = {
        "code": "000000",
        "data": {
          "current": 0,
          "hitCount": true,
          "optimizeCountSql": true,
          "orders": [
            {"asc": false, "column": "id"}
          ],
          "records": [
            {
              "checkNo": "2123123123",
              "createTime": "23242342343",
              "creator": "",
              "customerCode": "",
              "goodsWydSku": "",
              "id": "",
              "modifier": "",
              "modifyTime": "",
              "type": 2,
              "warehouseAreaCode": "",
              "warehouseCode": "",
              "warehouseLocationCode": "",
              "errorValue": 10,
            },
            {
              "checkNo": "222222",
              "createTime": "23242342343",
              "creator": "",
              "customerCode": "",
              "goodsWydSku": "",
              "id": "",
              "modifier": "",
              "modifyTime": "",
              "type": 2,
              "warehouseAreaCode": "",
              "warehouseCode": "",
              "warehouseLocationCode": "",
              "errorValue": 0,
            },
          ],
          "searchCount": true,
          "size": 0,
          "total": 0
        },
        "msg": "SUCCESS",
        "success": true
      };*/
      if (res['success'] == true) {
        setState(() {
          tableList.addAll(res['data']['records']);
        });
      } else {}
    }).catchError((e) => {});
  }

  void keyComplete() {
    print('回车');
    getData();
  }

  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {}
}

```


### 计费页面
```js

import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/routers/inventory_order.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_table.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class InventoryExpense extends StatelessWidget {
  const InventoryExpense({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: MyColors.whiteColor,
        appBar: AppBar(
          title: Text('inventoryExpense'.tr),
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

class _ContentState extends State<ContentBox> {
  
  final checkType = Get.arguments['type'] ?? 0; // 0 按箱计费 1 按托计费 2 按工时计费 3 按加班计费    
  // final checkType = 0; // 0 按箱计费 1 按托计费 2 按工时计费 3 按加班计费   
  Map selectedItemShow = {}; // 选中的信息展示用
  num QTY = 1; // 计数器1数量
  num QTY1 = 1; // 计数器2数量
  bool step0ButtonEnable = false; // 确认
  final step0NoController = TextEditingController();
  final orderNo = Get.arguments['orderNO'] ?? '';
  String TableTitle1 = '';
  String TableTitle2 = '';
  void initState() {
    selectedItemShow = getSelectedItemToshow();
    if (checkType == 0 ) {
      TableTitle1 = 'InventoryExpenseString1'.tr;
    } else if(checkType == 1) {
      TableTitle1 = 'InventoryExpenseString2'.tr;
    } else if (checkType == 2) {
      TableTitle1 = 'InventoryExpenseString3'.tr;
      TableTitle2 = 'InventoryExpenseString4'.tr;
    } else if (checkType == 3) {
      TableTitle1 = 'InventoryExpenseString5'.tr;
      TableTitle2 = 'InventoryExpenseString4'.tr;
    }
  }
  @override
  Widget build(BuildContext context) {
    return Center(
      child:  Column(children: [
        Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [_changeContent()],
              ),
            )),
        Row(
          children: [
            CommonBtn(
              text: 'confirm_1'.tr,
              height: 60.0,
              backgroundColor: MyColors.themeColor,
              textColor: MyColors.whiteColor,
              borderColor: MyColors.themeColor,
              enable: step0ButtonEnable,
              width: MediaQuery.of(context).size.width ,
              onPressed: () {
                checkStep(
                  clickType: 'submit',
                );
              },
            ),
          ],
        ),
      ])
    );
   
  }

  _changeContent() {
    return Column(children: [
      StepTable(
        dataInfo: Utils.showGivenMap(selectedItemShow, keyList: ['common_vocabulary1'.tr, 'common_vocabulary22'.tr, 'common_vocabulary23'.tr]),
        keyWidth: 150,
        paddingtop: 10,
        paddingbottom: 10,
      ),
      Separate(),
      if (checkType == 0 || checkType == 1) ...[
        TableTitle(
            title: TableTitle1,
            require: true,
            fontSize: 16,
            center: true, size: 'normal'),
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
              });
            },
          ),
        ),
      ] else if(checkType == 2 || checkType == 3)...[
        TableTitle(
            title: TableTitle1,
            require: true,
            fontSize: 16,
            center: true, size: 'normal'),
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
              });
            },
          ),
        ),
        TableTitle(
            title: TableTitle2,
            require: true,
            fontSize: 16,
            center: true, size: 'normal'),
        Container(
          width: 300.sp,
          color: MyColors.whiteColor,
          // padding: EdgeInsets.fromLTRB(10, 10, 10,10),
          child: MyStepper(
            value: QTY1.toDouble(),
            inputWidth: 100,
            min: 1,
            max: 1000,
            onChange: (val) {
              setState(() {
                QTY1 = int.parse(val);
              });
            },
          ),
        ),
      ],
    ]);
  }
  getSelectedItemToshow() {
      String common_vocabulary22 = '';
      String common_vocabulary23 = '';
      if (checkType == 0) {
        common_vocabulary22 = 'common_vocabulary24'.tr;
        common_vocabulary23 = 'common_vocabulary25'.tr;
      }  else if (checkType == 1) {
        common_vocabulary22 = 'common_vocabulary24'.tr;
        common_vocabulary23 = 'common_vocabulary26'.tr;
      } else if (checkType == 2) {
        common_vocabulary22 = 'common_vocabulary27'.tr;
        common_vocabulary23 = 'common_vocabulary28'.tr;
      }  else if (checkType == 3) {
        common_vocabulary22 = 'common_vocabulary27'.tr;
        common_vocabulary23 = 'common_vocabulary29'.tr;
      }
      return {
        "common_vocabulary1".tr: orderNo,
        "common_vocabulary22".tr: common_vocabulary22,
        "common_vocabulary23".tr: common_vocabulary23,
      };
  }

  // 接口检验和新增
  void checkStep({postData, successfn, clickType}) {
    // mock
    if (clickType == 'submit') {
      submit(
        success: (res) {
          // 回退到列表页
          Get.until((route) => Get.currentRoute == '/inventoryProduct');
        },
      );
    }
  
  }

  // 确认操作
  submit({success, falseFn}) {
    print('jinru');
    // 二次弹窗确认
    String messageStr = '';
    if (checkType == 0) {
      messageStr = "${QTY}${'InventoryExpenseDialog1'.tr}?";
    } else if (checkType == 1) {
      messageStr = "${QTY}${'InventoryExpenseDialog2'.tr}?";
    } else if (checkType == 2) {
      messageStr = "${'InventoryExpenseDialog3'.tr}${QTY}H,${'InventoryExpenseDialog5'.tr}${QTY1}${'InventoryExpenseDialog6'.tr}?";
    } else if (checkType == 3) {
      messageStr = "${'InventoryExpenseDialog4'.tr}${QTY}H,${'InventoryExpenseDialog5'.tr}${QTY1}${'InventoryExpenseDialog6'.tr}?";
    }
    showDialog(
      context: context,
      builder: (_) {
        return MyNDialog(
          title: null,
          message: messageStr,
          showCancelButton: true,
          confirmButtonText: 'confirm'.tr,
          onConfirm: () {
            print('orderNo---$orderNo');
            // 进行接口请求
            Map postData = {
              "checkNo": orderNo,
            };
            if (checkType == 0 || checkType == 1) {
              postData..addAll({
                'pieceworkNum': QTY,
              });
            } else if (checkType == 2) {
              postData..addAll({
                'workingHours': QTY,
                'workingPeoples': QTY1
              });
            } else if (checkType == 3) {
              postData..addAll({
                'workingHours': QTY,
                'workingPeoples': QTY1
              });
            }

            ShiftReturnApi.submitPageQueryCost(postData).then((res) {
              if (res['success'] == true) {
                success != null ? success(res) : null;
              } else {
                Utils.toast(res['msg']);
                falseFn != null ? falseFn(res) : null;
              }
            }).catchError((e) {
              falseFn != null ? falseFn() : null;
            });
          },
          onCancel: () {},
        );
      },
    );
  }
}
```
