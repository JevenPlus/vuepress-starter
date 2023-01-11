#### 开发者
  郑凯力
#### 开发时间
  2022-10-24
  
### 需求理解
仓库人员使用手持pda进行上架动作 , 发现异常则进行上报
  
### 上架
设计稿链接:  <br> [https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1](https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1)
<br>接口文档地址: [http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E5%BC%82%E5%B8%B8%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/addWarehouseExceptionInboundUsingPOST](http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E5%BC%82%E5%B8%B8%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/addWarehouseExceptionInboundUsingPOST)

### 其中页面分为列表查询 - 详情 - 上架处理三个模块

### 列表查询模块
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyrefresh/easy_refresh.dart';
import 'package:flutter_vant_kit/widgets/button.dart';
import 'package:flutter_vant_kit/widgets/dialog.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/http/shiftReturn.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/routers/inbound_router.dart';
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

class ShelvingList extends StatelessWidget {
  const ShelvingList({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('shelving'.tr),
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

class _ContentState extends State<ContentBox> with TickerProviderStateMixin{
  final step1NoController = TextEditingController();
  FocusNode _focusNode = FocusNode();
  late TabController _tabController;
  int changeType = 0; // 0全部  1 我的
  List tableList = [];
  late String status; // '待分配'  已分配  未开始  作业中 已过期 已完成
  int currentPage = 0;
  int pageSize = 10;

  void initState() {
    _tabController = new TabController(length: 2, vsync: this);
// 监听点击事件
    _tabController.addListener(() {
      // print(_tabController.index);
      // 因为这里会请求多次, 所以得加个锁
      if (changeType != _tabController.index) {
        changeType = _tabController.index;
        step1NoController.text = "";
        _focusNode.unfocus();
        getData();
      }
    });
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
            placeholder: 'shelvingString8'.tr,
            onChange: (val) {
              if (val == '') {
                // 清除时候重新请求
                getData();
              }
            },
            focusNode: _focusNode,
            onSubmitted: (value) {
              keyComplete();
            },
          ),
          style: ParentStyle()..background.color(MyColors.whiteColor),
        ),
        Parent(style: ParentStyle()..margin(top: 12.sp)),
        Parent(
          child: TabBar(
            controller: _tabController,
            indicatorSize: TabBarIndicatorSize.label,
            labelColor: MyColors.themeColor,
            unselectedLabelColor: MyColors.colorDisabled,
            tabs: [
              Parent(
                style: ParentStyle()..height(30.sp),
                child: Text('all'.tr),
              ),
              Parent(
                style: ParentStyle()..height(30.sp),
                child: Text('mine'.tr),
              ),
            ],
          ),
          style: ParentStyle()
            ..background.color(MyColors.whiteColor)
            ..padding(top: 12.sp, bottom: 12.sp),
        ),
        Expanded(
          child:   Parent(
            // style: ParentStyle()..height(MediaQuery.of(context).size.height - 280.sp),
            style: ParentStyle(),
            child: EasyRefresh(
              onRefresh: () async{
                _refresh();
              },
              onLoad: () async {
                _load();
              },
              child: SingleChildScrollView(
                  child: Column(children: [
                    if (tableList.length > 0) ...[
                      for (var i = 0; i < tableList.length; i++) ...[
                        Column(
                          children: [
                            if (changeType == 0) ...[
                              TitleBar(
                                text: tableList[i]['stackingNumber'],
                                icon: Row(
                                  children: [
                                    chooseIcon(changeStatus(tab0value: (tableList[i]['distributionStatus']))),
                                    chooseIcon(changeStatus(tab1value: (tableList[i]['stackingStatus']))),
                                  ],
                                ),
                              ),
                            ] else if (changeType == 1) ...[
                              TitleBar(
                                  text: tableList[i]['stackingNumber'], icon: chooseIcon(changeStatus(tab1value: (tableList[i]['stackingStatus'])))),
                            ],
                            CardLeftIconRightValue(
                              showButton: false,
                              buttonText: 'details'.tr,
                              buttonClick: () {},
                              dataList: [
                                {"icon": StaticIcons.TimeIcon, "value": tableList[i]['createTime']},
                                {"icon": StaticIcons.InboundShelvingUserIcon, "value": '${tableList[i]['customerCode']}'}
                              ],
                              children: Column(
                                children: [
                                  if (changeType == 0) ...[
                                    chooseButton(
                                      status1: changeStatus(tab0value: (tableList[i]['distributionStatus'])),
                                      item: tableList[i],
                                      status2: changeStatus(tab1value: (tableList[i]['stackingStatus'])),
                                    )
                                  ] else if (changeType == 1) ...[
                                    chooseButton(
                                      status2: changeStatus(tab1value: (tableList[i]['stackingStatus'])),
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
                  ])),
            ),
          ),
        ),
      ],
    );
  }

  _refresh() {
    currentPage = 0;
    print('下拉刷新');
    getData();
  }

  _load() {
    currentPage += 1;
    getData(currentPageData: currentPage);
    print('上拉加载');
  }

  changeStatus({tab0value = '', tab1value = ''}) {
    tab0value = tab0value.toString();
    tab1value = tab1value.toString();
    var status = '';

    // 全部
  /*  switch (tab0value) {
    // token 失效过期
      case "0":
        status = '待分配';
        break;
      case "1":
        status = '已分配';
        break;
    }*/
    if (tab0value != '') {
      if (tab0value == '0') {
        status = 'shelvingString13'.tr;
      } else {
        status = 'shelvingString15'.tr;
      }
    }

    switch (tab1value) {
    // token 失效过期
      case "1":
        status = 'shelvingString9'.tr;
        break;
      case "2":
        status = 'shelvingString10'.tr;
        break;
      case "4":
        status = 'shelvingString11'.tr;
        break;
      case "3":
        status = 'shelvingString12'.tr;
        break;
    }

    return status;
  }

  chooseButton({status1 = '', item, status2}) {
    String status;
    if (status1 != null && status1 != '') {
      status = status1;
    } else {
      status = status2;
    }
    print('${status}- ${status2}');
    if ((status1 == 'shelvingString13'.tr || status1 == '') && (status2 == 'shelvingString9'.tr || status2 == 'shelvingString10'.tr || status2 == 'shelvingString14'.tr)) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          NButton(
              text: 'details'.tr,
              width: 150.sp,
              onClick: () {
                goDetail(InboundRouter.shelvingListDetail,arguments: {
                  "orderNo": item['stackingNumber'], 'status': status
                } );
              }),
          NButton(
              color: MyColors.themeColor,
              text: 'shelvingTitle1'.tr,
              width: 150.sp,
              onClick: () {

                if (changeType == 0) {
                  // 全部里面点击上架
                  startOrder(item: item);
                } else {
                  goDetail(InboundRouter.shelvingHandle,arguments: {
                    "orderNo": item['stackingNumber'], 'status': status
                  });
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
                goDetail(InboundRouter.shelvingListDetail,arguments: {
                  "orderNo": item['stackingNumber'], 'status': status
                } );
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
          message: 'shelvingMessage3'.tr,
          showCancelButton: true,
          confirmButtonText: 'shelvingDialog3'.tr,
          onConfirm: () {
            var postData = {
              "workDistributionRelevanceNo": item['stackingNumber'],
              "workDistributionType": '3',
            };
            ShiftReturnApi.drawWorkDistribution(postData).then((res){
              // mock
             /* res = {
                "success": true,
                "data": {

                },
                "msg": '领取成功',
              };*/
              if (res['success'] == true) {
                Utils.toast(res['msg']);
                goDetail(InboundRouter.shelvingHandle ,arguments: {
                  "orderNo": item['stackingNumber']
                });
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
  goDetail( router, {arguments = const {}}) {
    Get.toNamed(router, arguments: arguments)?.then((res){
      getData();
      print('${res} ---> 回退');
    });
  }
  chooseIcon(status) {
    if (status == 'shelvingString13'.tr) {
      return Image.asset(StaticIcons.Status6Icon, width: 25.sp);
    } else if (status == 'shelvingString15'.tr) {
      return Image.asset(StaticIcons.Status5Icon, width: 25.sp);
    } else if (status == 'shelvingString16'.tr) {
      return Image.asset(StaticIcons.Status1Icon, width: 25.sp);
    } else if (status == 'shelvingString17'.tr) {
      return Image.asset(StaticIcons.Status2Icon, width: 25.sp);
    } else if (status == 'shelvingString18'.tr) {
      return Image.asset(StaticIcons.Status3Icon, width: 25.sp);
    } else if (status == 'shelvingString12'.tr) {
      return Image.asset(StaticIcons.Status4Icon, width: 25.sp);
    } else {
      return Text('');
    }
  }

  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {}

  // 按钮点击事件
  void keyComplete() {
    print('回车');
    getData();
  }

  void getData({currentPageData = 0}) {
    if (currentPageData == 0) {
      setState(() {
        tableList = [];
        currentPage = 0;
      });
    }
    var postData = {
      "stackingNumber": step1NoController.text,
      "currentPage": currentPageData,
      "pageSize": 10,
      "type": changeType,
    };
    InboundApi.queryStackingOrderList(postData).then((res) {
      // mock
      /*res = {
        "code": "000000",
        "data": [
          {
            "createTime": "",
            "customerCode": "",
            "distributionStatus": "",
            "stackingNumber": "",
            "stackingStatus": 0
          }
        ],
        "msg": "SUCCESS",
        "success": true
      };*/
      if (res['success'] == true) {
        setState(() {
          tableList.addAll(res['data']);
          // tableList = res['data'];
        });
        // print(res['data'][0]['id']);
      } else {}
    }).catchError((e) => {});
  }
}

```

### 详情页面
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_vant_kit/widgets/button.dart';
import 'package:flutter_vant_kit/widgets/imagePreview.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/page/return/page/mixinData.dart';
import 'package:pda/routers/inbound_router.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_table.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ShelvingListDetail extends StatelessWidget {
  const ShelvingListDetail({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('details'.tr),
          centerTitle: true,
          elevation: 0,
          
        ),
        body: SheetContent());
  }
}

class SheetContent extends StatefulWidget {
  const SheetContent({
    Key? key,
  }) : super(key: key);

  _SheetContentState createState() => _SheetContentState();
}

class _SheetContentState extends State<SheetContent> with fliterData{
  List tableList = [];
  List shiftOrderDetailVOList = []; // 产品明细展示列表表格
  List shiftOrderDetailVOListAll = []; // 接口产品明细列表
  Map shiftOrderVO = {};
  // String status = '未开始'; // 未开始  作业中 已过期 已完成 
  final orderNo = Get.arguments['orderNo'] ?? '';
  // final orderNo = '123123';
  final status = Get.arguments['status'] ?? '';
  // final status = '';
  void initState() {
    getData();
    print("status ${status}");
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
      if (status == 'shelvingString9'.tr) ...[
        CommonBtn(
            text: 'shelvingDialog4'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            borderColor: MyColors.themeColor,
            onPressed: () {
              goDetail(InboundRouter.shelvingHandle,arguments: {
                "orderNo": orderNo, 'status': status
              } );
            }
          // onPressed: null,
        ),
      ] else if (status == 'shelvingString17'.tr) ...[
        CommonBtn(
            text: 'shelvingDialog5'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            borderColor: MyColors.themeColor,
            onPressed: () {
              goDetail(InboundRouter.shelvingHandle,arguments: {
                "orderNo": orderNo, 'status': status
              } );
            }
          // onPressed: null,
        ),
      ] else if (status == 'shelvingString11'.tr) ...[
        CommonBtn(
            text: 'shelvingDialog6'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            borderColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            onPressed: () {
              // 进行销毁
            }
          // onPressed: null,
        ),
      ]
    ]);
  }

  _createContent() {
    return Column(
      children: [
        TitleBar(
          text: 'basic_info'.tr,
          icon: chooseIcon(status),
        ),
        StepTable(
          dataInfo: shiftOrderVO,
          keyWidth: 150,
        ),
        Container(
          height: 30.sp,
        ),
        TitleBar(text: 'product_info'.tr),
        for (var i = 0; i < shiftOrderDetailVOListAll.length; i++) ...[
          StepTable(
            dataInfo: shiftOrderDetailVOList[i],
            keyWidth: 150,
            paddingtop: 10,
            paddingbottom: 10,
          ),
          if (shiftOrderDetailVOListAll[i]['img'] != null && shiftOrderDetailVOListAll[i]['img'].length > 0) ...{
            Parent(
                style: ParentStyle()
                  ..background.color(MyColors.whiteColor)
                  ..padding(all: 15.sp)
                  ..width(MediaQuery.of(context).size.width),
                child: Column(
                  children: [
                    NButton(
                        text: 'checkImage'.tr,
                        width: 350.sp,
                        onClick: () {
                          showDialog(
                              context: context,
                              barrierDismissible: true,
                              builder: (BuildContext context) {
                                return ImagePreview(
                                  images: shiftOrderDetailVOListAll[i]['img'],
                                );
                              });
                        }),
                  ],
                )),
          },
          Container(
            height: 30.sp,
          ),
          // Divider(),
        ],
      ],
    );
  }
  void getData() {
    Map<String, dynamic> postData = {
      "stackingNumber": orderNo,
    };
    InboundApi.findStackingDetailByStackingNumber(postData).then((resData){
      // mock
       /* resData = {
          "code": "000000",
          "data": {
            "allStackingNum": "",
            "createTime": "",
            "customerCode": "",
            "stackingDetailList": [
              {
                "assignArea": "",
                "assignLocation": "",
                "assignStackNum": 0,
                "containerNumber": "",
                "id": "",
                "realArea": "",
                "realLocation": "",
                "realStackNum": 0,
                "wydSkuNo": ""
              }
            ],
            "stackingNum": "",
            "stackingNumber": "",
            "stackingStatus": 0
          },
          "msg": "SUCCESS",
          "success": true
        };*/
      if (resData['success'] == true) {
        final orderDetailList = resData['data']['stackingDetailList'];
        setState(() {
          shiftOrderVO['Order No'] = resData['data']['stackingNumber'];
          shiftOrderVO['Time'] = resData['data']['createTime'];
          shiftOrderVO['shelvingString19'.tr] = resData['data']['customerCode'];
          shiftOrderVO['SKU'] = QTYHandle(left: resData['data']['stackingNum'], right: resData['data']['allStackingNum']);
          for (var i = 0; i < orderDetailList.length; i++) {
            // mock图片
            shiftOrderDetailVOListAll.add({
              'img': [
                /* Image.network('https://img.yzcdn.cn/vant/leaf.jpg'),
                Image.network("https://img.yzcdn.cn/vant/tree.jpg"),
                Image.network("https://img.yzcdn.cn/vant/sand.jpg"),*/
              ],
            });
            shiftOrderDetailVOList.add({
              // 打托和sku区分,
              'SKU': orderDetailList[i]['wydSkuNo'],
              'Pallet No': orderDetailList[i]['containerNumber'],
              'shelvingString6'.tr: orderDetailList[i]['assignLocation'],
              'shelvingString7'.tr: orderDetailList[i]['assignStackNum'],
              "shelvingString20".tr: orderDetailList[i]['realLocation'],
              "shelvingString21".tr: orderDetailList[i]['realStackNum'],
            });
          }
        });
      }

    }).catchError((err){

    });
  }
  
  chooseIcon(status) {
    if (status == 'shelvingString13'.tr) {
      return Image.asset(StaticIcons.Status6Icon, width: 25.sp);
    } else if (status == 'shelvingString15'.tr) {
      return Image.asset(StaticIcons.Status5Icon, width: 25.sp);
    } else if (status == 'shelvingString16'.tr) {
      return Image.asset(StaticIcons.Status1Icon, width: 25.sp);
    } else if (status == 'shelvingString17'.tr) {
      return Image.asset(StaticIcons.Status2Icon, width: 25.sp);
    } else if (status == 'shelvingString18'.tr) {
      return Image.asset(StaticIcons.Status3Icon, width: 25.sp);
    } else if (status == 'shelvingString12'.tr) {
      return Image.asset(StaticIcons.Status4Icon, width: 25.sp);
    } else {
      return null;
    }
  }

  goDetail( router, {arguments = const {}}) {
    Get.toNamed(router, arguments: arguments)?.then((res){
      // getData();
    });
  }
}



```

### 上架模块
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_vant_kit/widgets/button.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/page/return/page/mixinData.dart';
import 'package:pda/routers/inbound_router.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/widgets/commonStepDescribe.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_no_data.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pda/widgets/common_table.dart';

class ShelvingHandle extends StatelessWidget {
  const ShelvingHandle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: MyColors.whiteColor,
        appBar: AppBar(
          title: Text('shelvingTitle1'.tr),
          centerTitle: true,
          elevation: 0,
          actions: <Widget>[
            IconButton(
                icon: Icon(Icons.list_alt),
                onPressed: () {
                  // 跳转去详情
                  handleOrderGlobalKey.currentState
                      ?.goDetail(InboundRouter.shelvingHandleDetail, arguments: {"orderNo": handleOrderGlobalKey.currentState?.orderNo});
                }),
          ],
        ),
        body: ContentBox(key: handleOrderGlobalKey));
  }
}

GlobalKey<_ContentState> handleOrderGlobalKey = GlobalKey();

class ContentBox extends StatefulWidget {
  const ContentBox({
    Key? key,
  }) : super(key: key);

  _ContentState createState() => _ContentState();
}

class _ContentState extends State<ContentBox> with fliterData {
  FocusNode _focusNode = FocusNode();
  List customeStatusList = [
    {"label": 'common_vocabulary16'.tr, "value": '1'},
  ];
  String customeStatus = ''; // 溢装 
  int step = 1; // 1 第一步  2 上架  9 上架异常
  final step1NoController = TextEditingController();
  final step2NoController = TextEditingController();

  final orderNo = Get.arguments['orderNo'] ?? '';
  // final orderNo = '123123';
  bool step1ButtonEnable = true;
  bool step2ButtonEnable = true;
  bool stepTo1ButtonEnable = false; // 取消 常开启
  bool step0ButtonEnable = true; // 上架异常
  bool steperrorButtonEnable = true; // 上架异常-确认上报
  String chooseType = '1'; //1 按sku 2 按托盘 
  num QTY = 1; // step2选择的number
  num QTYError = 1; // 异常数量

  List orderDetailListAll = []; // 当前单子所有列表(包含已上报等信息)
  List orderDetailList = []; // 未操作列表(全)
  List orderDetailSearchList = []; // 用未操作列表--搜索
  List orderDetailListShow = []; // 未操作列表--展示
  Map selectedItem = {}; // 选中的信息
  Map selectedItemShow = {}; // 选中的信息展示用
  String customerCode = ''; // 客户号
  num maxNUmber = 1000; // 最大值
  String warehouseArea = ''; // 库区

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
        Row(
          children: [
            CommonBtn(
              text: 'report_exception'.tr,
              height: 60.0,
              backgroundColor: MyColors.whiteColor,
              textColor: MyColors.themeColor,
              borderColor: MyColors.themeColor,
              enable: step0ButtonEnable,
              width: MediaQuery.of(context).size.width / 2,
              disabledColor: MyColors.whiteColor,
              disabledTextColor: MyColors.colorDisabled,
              onPressed: () {
                checkStep(
                  clickType: 'step-error',
                );
              },
            ),
            CommonBtn(
              text: 'shelvingDialog1'.tr,
              height: 60.0,
              backgroundColor: MyColors.themeColor,
              textColor: MyColors.whiteColor,
              borderColor: MyColors.themeColor,
              enable: step1ButtonEnable,
              width: MediaQuery.of(context).size.width / 2,
              onPressed: () {
                checkStep(
                  clickType: 'step-next',
                );
              },
            ),
          ],
        ),
      ] else if(step == 2) ...[
        Row(
          children: [
            CommonBtn(
              text: 'cancel'.tr,
              height: 60.0,
              backgroundColor: MyColors.whiteColor,
              textColor: MyColors.themeColor,
              borderColor: MyColors.themeColor,
              enable: stepTo1ButtonEnable,
              width: MediaQuery.of(context).size.width / 2,
              disabledColor: MyColors.whiteColor,
              disabledTextColor: MyColors.colorDisabled,
              onPressed: () {
                checkStep(
                  clickType: 'cancle',
                );
              },
            ),
            CommonBtn(
              text: 'shelvingDialog1'.tr,
              height: 60.0,
              backgroundColor: MyColors.themeColor,
              borderColor: MyColors.themeColor,
              textColor: MyColors.whiteColor,
              enable: step2ButtonEnable,
              width: MediaQuery.of(context).size.width / 2,
              onPressed: () {
                checkStep(
                  clickType: 'submit',
                );
              },
            ),
          ],
        ),
      ] else if (step == 9) ...[
        Row(
            children: [
              CommonBtn(
                text: 'cancel'.tr,
                height: 60.0,
                backgroundColor: MyColors.whiteColor,
                textColor: MyColors.themeColor,
                borderColor: MyColors.themeColor,
                enable: stepTo1ButtonEnable,
                width: MediaQuery.of(context).size.width / 2,
                disabledColor: MyColors.whiteColor,
                disabledTextColor: MyColors.colorDisabled,
                onPressed: () {
                  checkStep(
                    clickType: 'cancle',
                  );
                },
              ),
              CommonBtn(
                text: 'confirm_reporting'.tr,
                height: 60.0,
                backgroundColor: MyColors.themeColor,
                borderColor: MyColors.themeColor,
                textColor: MyColors.whiteColor,
                enable: steperrorButtonEnable,
                width: MediaQuery.of(context).size.width/2,
                onPressed: () {
                  checkStep(
                    clickType: 'submitError',
                  );
                },
              ),
            ]
        ),
      ]
    ]));
  }

  _changeContent() {
    if (step == 1) {
      return Column(children: [
        StepDescribe(step: '1', text: 'shelvingString1'.tr),
        // Divider(),
        ScanText(
          onKey: onKey,
          controller: step1NoController,
          placeholder: 'shelvingString2'.tr,
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
          child: SingleChildScrollView(
            child: Column(
              children: [
                if (orderDetailSearchList.length > 0) ...[
                  for (var i = 0; i < orderDetailSearchList.length; i++) ...[
                    Parent(
                      style: orderDetailSearchList[i]['isPress'] == true ? cardStyleBlack() : cardStyleWhite(),
                      child: StepTable(
                        dataInfo: orderDetailListShow[i],
                        keyWidth: 150,
                        paddingtop: 10,
                        paddingbottom: 10,
                      ),
                      gesture: Gestures()..onTap(() => itemTap(index: i)),
                    )
                  ],
                ] else ...[
                  CommonNoDataBox(
                    text: 'no-data'.tr,
                    height: MediaQuery.of(context).size.height - 290.sp,
                  )
                ]
              ],
            ),
          ),
        ),
      ]);
    } else if (step == 2) {
      return Column(children: [
        StepTable(
          dataInfo: selectedItemShow,
          keyWidth: 150,
          paddingtop: 10,
          paddingbottom: 10,
        ),
        Separate(),
        // 按托上架不需要填写数量
        if (selectedItem['containerNumber'] == null || selectedItem['containerNumber'] == "") ...[
          TableTitle(
              title: "shelvingString3".tr,
              require: true,
              fontSize: 16,
              center: true,
              size: 'normal'),
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
        ],
        TableTitle(
            title: "shelvingString4".tr,
            require: true,
            fontSize: 16,
            center: true,
            size: 'normal'),
        ScanText(
          onKey: onKey,
          controller: step2NoController,
          placeholder: 'shelvingString5'.tr,
          onChange: (val) {
            checkButtonEnable();
          },
          onSubmitted: (value) {
            keyComplete();
          },
        ),
        
      ]);
    } else if (step == 9) {
      return Column(children: [
        StepTable(
          dataInfo: showGivenMap(selectedItemShow, keyList: ['Order NO', 'SKU', 'Pallet NO']),
          keyWidth: 150,
          paddingtop: 10,
          paddingbottom: 10,
        ),
        Separate(),
        TableTitle(
            title: "common_vocabulary4".tr,
            require: true,
            fontSize: 16,
            center: true,
            size: 'normal'),
        ScanText(
          onKey: onKey,
          controller: step2NoController,
          placeholder: 'shelvingString5'.tr,
          onChange: (val) {
            checkButtonEnable();
          },
          onSubmitted: (value) {
            keyComplete();
          },
        ),
        TableTitle(
            title: "common_vocabulary6".tr,
            require: true,
            fontSize: 16,
            center: true,
            size: 'normal'),
        Container(
          width: 300.sp,
          color: MyColors.whiteColor,
          // padding: EdgeInsets.fromLTRB(10, 10, 10,10),
          child: MyStepper(
            value: QTYError.toDouble(),
            inputWidth: 100,
            min: 1,
            max: 1000,
            onChange: (val) {
              setState(() {
                QTYError = int.parse(val);
                print(QTYError.runtimeType.toString());
              });
            },
          ),
        ),
        TableTitle(
            title: "common_vocabulary2".tr,
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
    }
  }
  // 接口检验和新增
  void checkStep({postData, successfn, clickType}) {
    // mock
    if (clickType == 'cancle') {
      initData(stepData: 1);
    }
    if (step ==1) {
      if (clickType == 'destory') {
        return;
      } else if (clickType == 'step-next') {
        setState(() {
          step = step + 1;
        });
      } else if (clickType == 'step-error') {
        setState(() {
          step = 9;
          // 库位默认填写分配库位
          step2NoController.text = selectedItem['assignLocation']; 
        });
      }
    } else if (step == 2) {
      if (clickType == 'submit') {
        submit(
          success: (res) {
            showDialog(
              context: context,
              builder: (_) {
                return MyNDialog(
                  title: null,
                  message: 'shelvingDialog2'.tr,
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
        );
      }
    } else if (step == 9) {
      if (clickType == 'cancle') {
        initData(stepData: 1);
      } else if (clickType == 'submitError') {
        submitError(
          success: (res) {
            showDialog(
              context: context,
              builder: (_) {
                return MyNDialog(
                  title: null,
                  message: 'common_vocabulary32'.tr,
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
        );
      }
    }
  }
// 重置
  void initData({stepData = 1}) {
    if (stepData == 1) {
      setState(() {
        step = 1;
        step1NoController.text = "";
        step2NoController.text = "";
        step1ButtonEnable = true;
        step2ButtonEnable = true;
        step0ButtonEnable = true;
        QTY = 1;
        QTYError = 1;
        orderDetailListAll = [];
        orderDetailList = [];
        orderDetailSearchList = [];
        orderDetailListShow = [];
        selectedItem = {};
        selectedItemShow = {};
        warehouseArea = '';
        customeStatus = '';
      });
      getData();
    } else if (stepData == 2) {
      print('走了第二部');
      setState(() {
        step = 2;
        warehouseArea = '';
        QTY = 1;
      });
    }
  }

  // 上架提交
  submit({success, falseFn}) {
    print('${selectedItem} ----');
    Map postData = {
      "id": selectedItem['id'],
      "number": QTY,
      "realLocation": step2NoController.text,
      "stackingNumber": orderNo
    };
    // 打托上架 数量为分配数量
    if (selectedItem['containerNumber'] != null && selectedItem['containerNumber'] != '') {
      postData['number'] = selectedItem['assignStackNum'];
    }
    print(postData);
    InboundApi.stackingPutAway(postData).then((res){
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
  
  submitError({success, falseFn}) {
    Map postData = {
      "stackingNum": orderNo,
      "warehouseExceptionStackingDTOList": [
        {
          "goodsWydSku": selectedItem['wydSkuNo'],
          "wydContainerNumber": selectedItem['containerNumber'],
          "exceptionType": customeStatus,
          "exceptionNum": QTYError,
          "exceptionStackingId": selectedItem['id'],
          "warehouseLocationCode": step2NoController.text,
        }
      ]
    };
    InboundApi.addWarehouseExceptionStacking(postData).then((res){
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
  
  // 获取详情数据
  void getData() {
    Map<String, dynamic> postData = {
      "stackingNumber": orderNo,
    };
    InboundApi.findStackingDetailByStackingNumber(postData).then((resData) {
      // mock
     /* resData = {
        "code": "000000",
        "msg": "操作成功",
        "data": {
          "stackingNumber": "PWNJJW-221218-20003",
          "createTime": "2022-12-18 05:44:31",
          "customerCode": "kooook",
          "stackingStatus": 1,
          "stackingNum": "0",
          "allStackingNum": "50",
          "stackingDetailList": [
            {
              "id": "15050",
              "wydSkuNo": "kooook-11111",
              "containerNumber": "",
              "assignArea": "KUQUC",
              "assignLocation": "11-15-1",
              "assignStackNum": 10,
              "realArea": null,
              "realLocation": null,
              "realStackNum": 0
            },
            {
              "id": "15051",
              "wydSkuNo": "kooook-11111",
              "containerNumber": "PNJJW2212180002",
              "assignArea": "KUQUC",
              "assignLocation": "11-15-3",
              "assignStackNum": 10,
              "realArea": null,
              "realLocation": null,
              "realStackNum": 0
            },
            {
              "id": "15052",
              "wydSkuNo": "kooook-11111",
              "containerNumber": "PNJJW2212180003",
              "assignArea": "KUQUC",
              "assignLocation": "11-15-5",
              "assignStackNum": 10,
              "realArea": null,
              "realLocation": null,
              "realStackNum": 0
            },
            {
              "id": "15053",
              "wydSkuNo": "kooook-11111",
              "containerNumber": "PNJJW2212180004",
              "assignArea": "KUQUC",
              "assignLocation": "11-15-6",
              "assignStackNum": 10,
              "realArea": null,
              "realLocation": null,
              "realStackNum": 0
            },
            {
              "id": "15054",
              "wydSkuNo": "kooook-11111",
              "containerNumber": "PNJJW2212180005",
              "assignArea": "KUQUC",
              "assignLocation": "11-15-7",
              "assignStackNum": 10,
              "realArea": null,
              "realLocation": null,
              "realStackNum": 0
            }
          ]
        },
        "success": true
      };*/
      if (resData['success'] == true) {
        setState(() {
          customerCode = resData['data']['customerCode'] ?? null;
        });
        if (resData['data']['stackingDetailList'].length > 0) {
          setState(() {
            orderDetailListAll = [];
            orderDetailList = [];
            orderDetailListAll = resData['data']['stackingDetailList'];
            orderDetailListAll.forEach((element) {
              if (element['realLocation'] == null || element['realLocation'] == '') {
                var oneMap = {}
                  ..addAll(element)
                  ..addAll({
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
                  message: 'shelvingMessage1'.tr,
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
    }).catchError((e) {});
  }
  // 转化成展示列表数据
  orderDetailSearchListToorderDetailListShow() {
    List ListShow = [];
    if (orderDetailSearchList.length > 0) {
      orderDetailSearchList.forEach((element) {
        ListShow.add({
          "SKU": element['wydSkuNo'],
          "Pallet No": element['containerNumber'],
          "shelvingString6".tr: element['assignLocation'],
          "shelvingString7".tr: element['assignStackNum'],
        });
      });
    }
    return ListShow;
  }

  // 监听键盘点击事件
  void onKey(RawKeyEvent event) {}

  // sku模糊查询
  search() {
    setState(() {
      // 选择框都为空
      orderDetailSearchList.forEach((element) {
        element['isPress'] = false;
      });
      // 清空当前选择内容
      selectedItem= {};
      selectedItemShow = {};
      // 检查按钮是否可点击
      checkButtonEnable();
      orderDetailSearchList = orderDetailList.where((item) {
        if (item['wydSkuNo']!= null && item['wydSkuNo']!= "" && item['wydSkuNo']?.contains(step1NoController.text)) {
          return true;
        } else if (item['containerNumber']!= null && item['containerNumber']!= "" && item['containerNumber']?.contains(step1NoController.text)) {
          return true;
        } else {
          return false;
        }
       /* return (item['wydSkuNo']?.contains(step1NoController.text) || item['containerNumber']?.contains(step1NoController.text));*/
      }).toList();
      
      orderDetailListShow = orderDetailSearchListToorderDetailListShow();
      // 如果找出来只有单条, 可以直接帮操作人跳到下一步 , 业务部门要求
      if (step1NoController.text != null && step1NoController.text != '') {
        if (orderDetailSearchList.length == 1) {
          itemTap(
            index: 0,
            /*success: () {
              checkStep(
                clickType: 'step-next',
              );
            },*/
          );
        }
      }
      print(orderDetailSearchList.length);
     
    });
  }

  void keyComplete() {
    // step1
    if (step == 1) {
      search();
    } else if (step == 2 || step == 9) {
      // 上架或者上报异常
      // 检查button是否可点
      // 找库区
      findWarehouseCodeByLocation();
    }
    checkButtonEnable();
  }
  // 查找库位是否在系统内
  findWarehouseCodeByLocation({callback, success}) {
    var postData = {
      "warehouseLocation": step2NoController.text
    };
    InboundApi.checkWarehouseLocation(postData).then((res){
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
          Utils.toast('shelvingMessage2'.tr);
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
  // 检验是否可以下一步
  checkButtonEnable() {
    // print("selectedItem  ${selectedItem} ");
    if (selectedItem.isEmpty == true || selectedItem == null) {
      setState(() {
        step1ButtonEnable = true;
        step0ButtonEnable = true;
      });
    } else {
      setState(() {
        step1ButtonEnable = false;
        step0ButtonEnable = false;
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
    
    // step9  上报异常
    if (step2NoController.text != null && step2NoController.text != '' && customeStatus != '') {
      setState(() {
        steperrorButtonEnable = false;
      });
    } else {
      setState(() {
        steperrorButtonEnable = true;
      });
    }
    
  }

  goDetail(router, {arguments = const {}}) {
    Get.toNamed(router, arguments: arguments)?.then((res) {
      // getData();
    });
  }

  /**
   *  样式选择类
   */
  cardStyleWhite({pressed = false}) {
    return ParentStyle()
      ..border(all: 2, color: MyColors.whiteColor)
      ..margin(all: 10);
  }

  cardStyleBlack({pressed = false}) {
    return ParentStyle()
      ..border(all: 2, color: MyColors.themeColor)
      ..margin(all: 10);
  }
  getSelectedItemToshow() {
    if (selectedItem.isNotEmpty) {
      return {
        "Order NO": orderNo,
        "SKU": selectedItem['wydSkuNo'],
        "Pallet NO": selectedItem['containerNumber'],
        "shelvingString6".tr: selectedItem['assignLocation'],
        "shelvingString7".tr: selectedItem['assignStackNum'],
      };
    }
    
  }
  showGivenMap(Map dataInfo, {List keyList = const []}) {
    Map selectedItemFilter = {};
    if (dataInfo.isNotEmpty) {
      if (keyList.length == 0) {
        selectedItemFilter = dataInfo;
      } else {
        keyList.forEach((item)=>{
          selectedItemFilter[item] = dataInfo[item]
        });
      }
    } 
    return selectedItemFilter;
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
        if (element['id'] == orderDetailSearchList[index]['id']) {
          selectedItem = element;
          selectedItemShow = getSelectedItemToshow();
        }
      });
      // 检查按钮是否可点击
      checkButtonEnable();
      maxNUmber = selectedItem['returnNum'];
      print(selectedItem);
      success != null ? success() : null;
    });
  }
}

```


