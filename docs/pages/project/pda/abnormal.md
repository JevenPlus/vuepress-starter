
#### 开发者
  郑凯力
#### 开发时间
  2022-12-26

### 上架异常与收货异常
设计稿链接:  <br> [https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1](https://pixso.cn/app/editor/Bt9nFlaohu549BxHoGZq7A?icon_type=1)
<br>接口文档地址: [http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E5%BC%82%E5%B8%B8%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/addWarehouseExceptionInboundUsingPOST](http://192.168.20.24:8881/api/pda/doc.html#/default_api/%E5%BC%82%E5%B8%B8%E5%8D%95%E6%8E%A7%E5%88%B6%E5%B1%82/addWarehouseExceptionInboundUsingPOST)

### 其中页面分为列表查询 - 详情 - 处理异常三个大模块

### 列表查询模块
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_easyrefresh/easy_refresh.dart';
import 'package:flutter_vant_kit/widgets/button.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/routers/inbound_router.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_cardLeftIconRightValue.dart';
import 'package:pda/widgets/common_no_data.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ErrorDataController extends GetxController {
  String pageType = Get.arguments['type'];
  getPageType() {
    pageType = Get.arguments['type']; // abnormalGoods 上架异常  abnormalShelving 入库异常
  }
  createTitle() {
    if (pageType == 'abnormalGoods') {
      return 'abnormal_abnormal'.tr;
    } else if (pageType == 'abnormalShelving') {
      return 'abnormal_shelving'.tr;
    }
  }
}


class AbnormalGoodsListPage extends StatelessWidget {
  const AbnormalGoodsListPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final ErrorDataController c = Get.put(ErrorDataController());
    
    
    return Scaffold(
        appBar: AppBar(
          title: Text('${c.createTitle()}'),
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
  final ErrorDataController c = Get.find();
  
  
  final step1NoController = TextEditingController();
  FocusNode _focusNode = FocusNode();
  late TabController _tabController;
  int changeType = 0; // 0全部  1 我的
  List tableList = [];
  late String status; // '待分配'  已分配  未开始  作业中 已过期 已完成
  int currentPage = 1;
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
            placeholder: 'common_vocabulary53'.tr,
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
                                text: tableList[i]['exceptionNo'],
                                icon: Row(
                                  children: [
                                    chooseIcon(changeStatus(tab0value: (tableList[i]['owmsAssignStatus']))),
                                    chooseIcon(changeStatus(tab1value: (tableList[i]['exceptionStatus']))),
                                  ],
                                ),
                              ),
                            ] else if (changeType == 1) ...[
                              TitleBar(
                                  text: tableList[i]['exceptionNo'], icon: chooseIcon(changeStatus(tab1value: (tableList[i]['exceptionStatus'])))),
                            ],
                            CardLeftIconRightValue(
                              showButton: false,
                              buttonText: 'details'.tr,
                              buttonClick: () {},
                              dataList: [
                                if (c.pageType == 'abnormalGoods') ...[
                                  // 收货异常
                                  {"icon": StaticIcons.TimeIcon, "value": tableList[i]['createTime']},
                                  // {"icon": StaticIcons.WarnIcon, "value": Utils.QTYHandle(left: tableList[i]['exceptionNum'], right: tableList[i]['exceptionNum'])}
                                  {"icon": StaticIcons.WarnIcon, "value": '${tableList[i]['exceptionNum']}'}
                                ] else if(c.pageType == 'abnormalShelving') ...[
                                  // 上架异常
                                  {"icon": StaticIcons.TimeIcon, "value": tableList[i]['createTime']},
                                  {"icon": StaticIcons.WarnIcon, "value": '${tableList[i]['exceptionNum']}'}
                                ],
                              ],
                              children: Column(
                                children: [
                                  if (changeType == 0) ...[
                                    chooseButton(
                                      status1: changeStatus(tab0value: (tableList[i]['owmsAssignStatus'])),
                                      item: tableList[i],
                                      status2: changeStatus(tab1value: (tableList[i]['exceptionStatus'])),
                                    )
                                  ] else if (changeType == 1) ...[
                                    chooseButton(
                                      status2: changeStatus(tab1value: (tableList[i]['exceptionStatus'])),
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
    currentPage = 1;
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
    // 这里只有已确认与处理中显示处理按钮
      case "0":
        // 待处理
        status = 'shelvingString9'.tr;
        break;
      case "1":
        // 待确认
        status = 'shelvingString9'.tr;
        break;
      case "2":
        // 已确认
        status = 'common_status19'.tr;
        break;
      case "3":
        // 处理中
        status = 'common_status20'.tr;
        break;
      case "4":
      // 处理完成
        status = 'common_status21'.tr;
        break;
      case "5":
      // 作废
        status = 'common_status22'.tr;
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
    if ((status1 == 'shelvingString13'.tr || status1 == '') && (status2 == 'common_status19'.tr || status2 == 'common_status20'.tr)) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          NButton(
              text: 'details'.tr,
              width: 150.sp,
              onClick: () {
                goDetail(InboundRouter.abnormalGoodsListDetail,arguments: {
                  "orderNo": item['exceptionNo'], 'status': status, 'type': c.pageType, 'exceptionId': item['exceptionId']
                } );
              }),
          NButton(
              color: MyColors.themeColor,
              text: 'common_vocabulary17'.tr,
              width: 150.sp,
              onClick: () {

                if (changeType == 0) {
                  // 全部里面点击上架
                  startOrder(item: item);
                } else {
                  goDetail(InboundRouter.abnormalGoodsHandle,arguments: {
                    "orderNo": item['exceptionNo'], 'status': status, 'type': c.pageType, 'exceptionId': item['exceptionId']
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
                goDetail(InboundRouter.abnormalGoodsListDetail,arguments: {
                  "orderNo": item['exceptionNo'], 'status': status, 'type': c.pageType, 'exceptionId': item['exceptionId']
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
              "exceptionId": item['exceptionId'],
            };
            InboundApi.warehouseExceptionClaim(postData).then((res){
              // mock
              /* res = {
                "success": true,
                "data": {

                },
                "msg": '领取成功',
              };*/
              if (res['success'] == true) {
                Utils.toast(res['msg']);
                goDetail(InboundRouter.abnormalGoodsHandle ,arguments: {
                  "orderNo": item['exceptionNo'], 'type': c.pageType, 'exceptionId': item['exceptionId']
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
    } else if (status == 'shelvingString9'.tr) {
      return Image.asset(StaticIcons.Status1Icon, width: 25.sp);
    } else if (status == 'common_status20'.tr) {
      return Image.asset(StaticIcons.Status2Icon, width: 25.sp);
    } else if (status == 'common_status22'.tr) {
      return Image.asset(StaticIcons.Status3Icon, width: 25.sp);
    } else if (status == 'common_status21'.tr) {
      return Image.asset(StaticIcons.Status4Icon, width: 25.sp);
    } else if( status == 'common_status19'.tr) {
      return Image.asset(StaticIcons.Status9Icon, width: 25.sp);
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

  void getData({currentPageData = 1}) {
    if (currentPageData == 1) {
      setState(() {
        tableList = [];
        currentPage = 1;
      });
    }
    String exceptionType = '';
    if (c.pageType == 'abnormalGoods'){
      exceptionType = '1';
    } else if (c.pageType == 'abnormalShelving') {
      exceptionType = '5';
    }
    var postData = {
      // 这里的参数不变, 后端不想调整  参数是relationNo关联单号  查询的是exceptionNo异常单号
      "relationNo": step1NoController.text,
      "current": currentPageData,
      "size": 10,
      "dataAttribution": changeType,
      "exceptionType": exceptionType,
    };
    InboundApi.queryWarehouseExceptionList(postData).then((res) {
      // mock
      if (res['success'] == true) {
        setState(() {
          tableList.addAll(res['data']['records']);
          // tableList = res['data'];
        });
        // print(res['data'][0]['id']);
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e) => {});
  }
}

```

### 详情页模块
```js
import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:flutter_vant_kit/main.dart';
import 'package:flutter_vant_kit/widgets/button.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/page/addedValue/components/body.dart';
import 'package:pda/page/inbound/abnormalGoods/mixData.dart';
import 'package:pda/page/return/page/mixinData.dart';
import 'package:pda/routers/inbound_router.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_table.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class AbnormalGoodsListDetail extends StatelessWidget {
  const AbnormalGoodsListDetail({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text('details'.tr),
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

class _ContentState extends State<ContentBox> with fliterData , abnormalMixin{
  List tableList = [];
  List shiftOrderDetailVOList = []; // 产品明细展示列表表格
  List shiftOrderDetailVOListAll = []; // 接口产品明细列表
  Map shiftOrderVO = {};
  // String status = '未开始'; // 未开始  作业中 已过期 已完成 
  final orderNo = Get.arguments['orderNo'] ?? '';
  // final orderNo = '123123';
  final status = Get.arguments['status'] ?? '';
  final pageType = Get.arguments['type'] ?? ''; // abnormalShelving 上架异常  abnormalGoods 收货异常
  final exceptionId = Get.arguments['exceptionId'] ?? ''; // abnormalShelving 上架异常  abnormalGoods 收货异常
  // final status = '';
  void initState() {
    getData();
    print(pageType);
    print("status ${status} ${pageType}");
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
      if (status == 'common_status19'.tr) ...[
        CommonBtn(
            text: 'shelvingDialog4'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            borderColor: MyColors.themeColor,
            onPressed: () {
              goDetail(InboundRouter.abnormalGoodsHandle,arguments: {
                "orderNo": orderNo, 'status': status,  'exceptionId': exceptionId,  'type': pageType,
              } );
            }
          // onPressed: null,
        ),
      ] else if (status == 'common_status20'.tr) ...[
        CommonBtn(
            text: 'shelvingDialog5'.tr,
            height: 60.0,
            backgroundColor: MyColors.themeColor,
            textColor: MyColors.whiteColor,
            borderColor: MyColors.themeColor,
            onPressed: () {
              goDetail(InboundRouter.abnormalGoodsHandle,arguments: {
                "orderNo": orderNo, 'status': status,  'exceptionId': exceptionId,  'type': pageType,
              } );
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
    String exceptionType = '';
    if (pageType == 'abnormalShelving') {
      exceptionType = '5';
    } else if (pageType == 'abnormalGoods') {
      exceptionType = '1';
    }
    Map<String, dynamic> postData = {
      "exceptionId": exceptionId,
      "exceptionType": exceptionType,
    };
    InboundApi.queryWarehouseExceptionDetailInfo(postData).then((resData){
      // mock
    /*  resData = {
        "code": "000000",
        "msg": "操作成功",
        "data": {
          "warehouseExceptionVO": {
            "exceptionId": "36ef55706b874ce1a9f8f965b122fdbc",
            "exceptionNo": "EO221226-00004",
            "relationNo": "PWCAJW-221226-20002",
            "serviceNo": null,
            "exceptionType": "5",
            "creator": "admin",
            "modifier": null,
            "createTime": "2022-12-26 00:40:57",
            "modifyTime": null,
            "customerCode": "313516",
            "warehouseCode": "CAJW",
            "clientPerson": "lhb",
            "warehousePerson": null,
            "assignPerson": "admin",
            "assignTime": "2022-12-26 00:40:57",
            "confirmationTime": null,
            "finshTime": null,
            "exceptionStatus": "3",
            "confirmationStatus": "0",
            "assignStatus": "1",
            "latestConfirmationTime": null,
            "owmsAssignPerson": null,
            "owmsAssignTime": null,
            "owmsAssignStatus": "0",
            "exceptionNum": 10
          },
          "warehouseExceptionInboundVOList": null,
          "warehouseExceptionStackingVOList": [
            {
              "exceptionStackingId": "560000eab6cd485c82653834938da733",
              "exceptionNo": "EO221226-00004",
              "goodsWydSku": "313516-LHB002",
              "goodsEnName": "aaatest",
              "wydContainerNumber": null,
              "assignStackNum": 60,
              "realStackNum": 60,
              "exceptionNum": 10,
              "checkNum": null,
              "exceptionType": "0,1,2",
              "treatmentResults": "0",
              "relationNo": "PWCAJW-221226-20002",
              "directNo": "PWCAJW-221226-20002",
              "exceptionOrderStatus": "1",
              "exceptionStatus": "3",
              "remarks": null,
              "dataBelong": "313516",
              "warehouseCode": "CAJW",
              "warehouseAreaCode": "CA0001",
              "warehouseLocationCode": "CA0001-0001",
              "inboundBatchNo": "IO313516-221226-2003",
              "omsSee": null,
              "omsAssign": null,
              "creator": "admin",
              "createTime": "2022-12-26 00:40:57",
              "sysFileInfoVOList": [{'src': 'http://owms.oss-cn-hangzhou.aliyuncs.com/image/微信图片_20201117173115-1672088185495.jpg'}],
              "pendingInstruction": ["10", '9'],
              "processedInstruction": ['0', '2']
            }
          ]
        },
        "success": true
      };*/
      if (resData['success'] == true) {
        List orderDetailList = [];
        if (pageType == 'abnormalShelving') {
          orderDetailList = ( resData['data']['warehouseExceptionStackingVOList'] != null) ? resData['data']['warehouseExceptionStackingVOList'] : [];
        } else if (pageType == 'abnormalGoods') {
          orderDetailList = ( resData['data']['warehouseExceptionInboundVOList'] != null) ? resData['data']['warehouseExceptionInboundVOList'] : [];
        }
        setState(() {
          
          shiftOrderVO['Order No'] = resData['data']['warehouseExceptionVO']['exceptionNo'];
          shiftOrderVO['Relation No'] = resData['data']['warehouseExceptionVO']['relationNo'];
          shiftOrderVO['Time'] = resData['data']['warehouseExceptionVO']['createTime'];
          shiftOrderVO['QTY'] = resData['data']['warehouseExceptionVO']['exceptionNum'];
         
          print(orderDetailList);
          for (var i = 0; i < orderDetailList.length; i++) {
            // mock图片
            List<Widget> imagesList = [];
            if (orderDetailList[i]['sysFileInfoVOList'].length > 0) {
              // mock图片
              orderDetailList[i]['sysFileInfoVOList'].forEach((item){
                imagesList.add(Image.network(item['src']));
              });
            }
            shiftOrderDetailVOListAll.add({
              'img': imagesList,
            });
            
            shiftOrderDetailVOList.add({
              // 打托和sku区分,
              'SKU': orderDetailList[i]['goodsWydSku'],
              // 'Pallet No': orderDetailList[i]['containerNumber'],
              'common_vocabulary2'.tr: exceptionTypeFilter(orderDetailList[i]['exceptionType']),
              'common_vocabulary6'.tr: orderDetailList[i]['exceptionNum'],
              'common_vocabulary38'.tr: orderDetailList[i]['remarks'],

          // 'green_拍照,清点'
              "common_vocabulary20".tr: instructionFilter(orderDetailList[i]['pendingInstruction']),
              "common_vocabulary21".tr: 'green_${instructionFilter(orderDetailList[i]['processedInstruction'])}',
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
    } else if (status == 'shelvingString9'.tr) {
      return Image.asset(StaticIcons.Status1Icon, width: 25.sp);
    } else if (status == 'common_status20'.tr) {
      return Image.asset(StaticIcons.Status2Icon, width: 25.sp);
    } else if (status == 'common_status22'.tr) {
      return Image.asset(StaticIcons.Status3Icon, width: 25.sp);
    } else if (status == 'common_status21'.tr) {
      return Image.asset(StaticIcons.Status4Icon, width: 25.sp);
    } else if( status == 'common_status19'.tr) {
      return Image.asset(StaticIcons.Status9Icon, width: 25.sp);
    } else {
      return Text('');
    }
  }

  goDetail( router, {arguments = const {}}) {
    Get.toNamed(router, arguments: arguments)?.then((res){
      // getData();
    });
  }
}

```

### 处理异常模块
```js



import 'package:division/division.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pda/http/inbound.dart';
import 'package:pda/page/inbound/abnormalGoods/mixData.dart';
import 'package:pda/utils/local_utils.dart';
import 'package:pda/utils/my_colors.dart';
import 'package:pda/utils/my_static_icons.dart';
import 'package:pda/widgets/commonStepDescribe.dart';
import 'package:pda/widgets/common_TitleBar.dart';
import 'package:pda/widgets/common_UI.dart';
import 'package:pda/widgets/common_btn.dart';
import 'package:pda/widgets/common_no_data.dart';
import 'package:pda/widgets/common_scanText.dart';
import 'package:pda/widgets/common_table.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:dio/dio.dart' as dioData;

class AbnormalGoodsHandle extends StatelessWidget {
  const AbnormalGoodsHandle({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: MyColors.whiteColor,
        appBar: AppBar(
          title: Text('common_vocabulary17'.tr),
          centerTitle: true,
          elevation: 0,
          actions: <Widget>[
           
          ],
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

class _ContentState extends State<ContentBox> with abnormalMixin{
  String step = "1"; // 1 选择列表  2 处理指令  submitImage 拍照  shelf 上架  count 清点 pallet
  Map step1Table = {}; // 首页单号展示
  Map step1TableAll = {}; // 首页单号全数据
  final exceptionId = Get.arguments['exceptionId'] ?? ''; // abnormalShelving 上架异常  abnormalGoods 收货异常
  final pageType = Get.arguments['type'] ?? ''; // abnormalShelving 上架异常  abnormalGoods 收货异常
  String exceptionType = ''; // (1:收货异常 2:Toc出库异常 3:Tob出库异常 4:库内异常 5:上架异常)

  
  
  List orderDetailSearchList = []; // 用未操作列表--搜索
  List orderDetailListShow = []; // 未操作列表--展示
  List orderDetailListAll = []; // 当前单子所有列表(包含已上报等信息)
  List orderDetailList = []; // 未操作列表(全)
  Map selectedItem = {}; // 选中的信息
  Map selectedItemShow = {}; // 选中的信息展示用
  // mock数据
  List threeTableData =  [
    // {"left": {"text": '拍照'}, "center": {"text": '5'}, "right": {"text": '上传图片'}},
    // {"left": {"text": '清点'}, "center": {"text": '4'}, "right": {"text": '清点'}},
    // {"left": {"text": '确认'}, "center": {"text": '5'}, "right": {"text": '确认'}},
    // {"left": {"text": '上架'}, "center": {"text": '5'}, "right": {"text": '上架'}},
    // {"left": {"text": '销毁'}, "center": {"text": '5'}, "right": {"text": '销毁'}},
    // {"left": {"text": '打托'}, "center": {"text": '5'}, "right": {"text": '打托'}},
  ];
  List threeTableDataAll = [];
  Map singleThreeTableData = {};
  
  final orderNo = Get.arguments['orderNo'] ?? '';
  final checkType = 0; // 0 收货异常  1 上架异常   
  bool stepCancleEnable = false; // 指令取消
  bool step1ButtonEnable = true; // step1处理
  bool step2ButtonEnable = false; // 关闭
  
  // 拍照
  bool stepSubmitImageEnable = false;
  List<String> imagesList = [
    'http://owms.oss-cn-hangzhou.aliyuncs.com/image/微信图片_20201117173115-1672104759742.jpg',
  ];
  
 
  // 清点
  bool stepCountEnable = true;
  num QTYCount = 1; // 清点数量
  
  // 打托
  bool stepPalletEnable = true; // 打托保存
  bool stepPalletSplitEnable = true; // 打托拆分
  num sumQTYPallet = 0; // 打托数量合计
  List palletList = []; // 打托列表

  // 上架
  bool stepShelfEnable = true; // 上架保存
  bool stepShelfSplitEnable = true; // 打托拆分
  List shelfList = []; // 上架数量列表
  List shelfRadioList = [
    // 按件 上架类型 (0：件 1：箱 2：托)
    {"label": 'common_vocabulary35'.tr, "value": '1'},
  ];
  String shelfRadio = '1';
  
  
  bool stepShelfLastoneEnable = true; // 上架-上一个
  bool stepShelfNextEnable = true; // 上架-下一个

  num shelfButtonNumber = 3; // 上架页按钮数量
  final stepShelfController = TextEditingController(); // 上架库位
  num QTYShelf= 1; // 上架数量
  num sumQTYShelf = 0; // 上架数量合计
  num activeShelf = 0; // 上架活动页index
 
  
  final step1NoController = TextEditingController(); // step 输入sku
  
  


 
  void initState() {
    if (pageType == 'abnormalShelving') {
      exceptionType = '5';
    } else if (pageType == 'abnormalGoods') {
      exceptionType = '1';
    }
    initData(stepData: "1");
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
          if (step == "1") ...[
            Row(
              children: [
                CommonBtn(
                  text: 'common_vocabulary17'.tr,
                  height: 60.0,
                  backgroundColor: MyColors.themeColor,
                  textColor: MyColors.whiteColor,
                  borderColor: MyColors.themeColor,
                  enable: step1ButtonEnable,
                  width: MediaQuery.of(context).size.width ,
                  onPressed: () {
                    checkStep(
                      clickType: 'step-next',
                    );
                  },
                ),
              ],
            ),
          ] else if(step == "2") ...[
            Row(
              children: [
                CommonBtn(
                  text: 'next_1'.tr,
                  height: 60.0,
                  backgroundColor: MyColors.themeColor,
                  textColor: MyColors.whiteColor,
                  borderColor: MyColors.themeColor,
                  enable: step2ButtonEnable,
                  width: MediaQuery.of(context).size.width,
                  disabledColor: MyColors.whiteColor,
                  disabledTextColor: MyColors.colorDisabled,
                  onPressed: () {
                    checkStep(
                      clickType: 'cancel',
                    );
                  },
                ),
             
              ],
            ),
          ] else if (step == "submitImage") ...[
            Row(
                children: [
                  CommonBtn(
                    text: 'cancel'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.whiteColor,
                    textColor: MyColors.themeColor,
                    borderColor: MyColors.themeColor,
                    enable: stepCancleEnable,
                    width: MediaQuery.of(context).size.width  / 2,
                    disabledColor: MyColors.whiteColor,
                    disabledTextColor: MyColors.colorDisabled,
                    onPressed: () {
                      checkStep(
                        clickType: 'toStep2',
                      );
                    },
                  ),
                  CommonBtn(
                    text: 'save'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    borderColor: MyColors.themeColor,
                    enable: stepSubmitImageEnable,
                    width: MediaQuery.of(context).size.width /2,
                    onPressed: () {
                      checkStep(
                        clickType: 'submit',
                      );
                    },
                  ),
                ]
            ),
          ] else if (step == "count") ...[
            Row(
                children: [
                  CommonBtn(
                    text: 'cancel'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.whiteColor,
                    textColor: MyColors.themeColor,
                    borderColor: MyColors.themeColor,
                    enable: stepCancleEnable,
                    width: MediaQuery.of(context).size.width  /2,
                    disabledColor: MyColors.whiteColor,
                    disabledTextColor: MyColors.colorDisabled,
                    onPressed: () {
                      checkStep(
                        clickType: 'toStep2',
                      );
                    },
                  ),
                  CommonBtn(
                    text: 'save'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    borderColor: MyColors.themeColor,
                    enable: stepCountEnable,
                    width: MediaQuery.of(context).size.width /2 ,
                    onPressed: () {
                      checkStep(
                        clickType: 'submit',
                      );
                    },
                  ),
                ]
            ),
          ] else if (step == "shelf") ...[
            Parent(style: ParentStyle()..background.color(MyColors.whiteColor)..boxShadow(color : Color(0x33000000), blur :10.0,)..padding(left:10,  right: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Txt('${'common_vocabulary39'.tr}: ${singleThreeTableData['center']['text']}'),
                  Txt("${'common_vocabulary40'.tr}: ${getSumQTY(type: 'shelf')}", style: numberColor(type: 'shelf'))
                ],
              ),),
            Row(
                children: [
                  CommonBtn(
                    text: 'cancel'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.whiteColor,
                    textColor: MyColors.themeColor,
                    borderColor: MyColors.themeColor,
                    enable: stepCancleEnable,
                    width: MediaQuery.of(context).size.width  /3,
                    disabledColor: MyColors.whiteColor,
                    disabledTextColor: MyColors.colorDisabled,
                    onPressed: () {
                      checkStep(
                        clickType: 'toStep2',
                      );
                    },
                  ),
                  CommonBtn(
                    text: 'common_vocabulary37'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    borderColor: MyColors.themeColor,
                    enable: stepShelfSplitEnable,
                    width: MediaQuery.of(context).size.width /3 ,
                    onPressed: () {
                      checkStep(
                        clickType: 'split',
                      );
                    },
                  ),
                  CommonBtn(
                    text: 'save'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    borderColor: MyColors.themeColor,
                    enable: stepShelfEnable,
                    width: MediaQuery.of(context).size.width /3 ,
                    onPressed: () {
                      checkStep(
                        clickType: 'submit',
                      );
                    },
                  ),
                ]
            ),
          ] else if (step == "pallet") ...[
            Parent(style: ParentStyle()..background.color(MyColors.whiteColor)..boxShadow(color : Color(0x33000000), blur :10.0,)..padding(left:10,  right: 10),
              child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Txt('${'common_vocabulary39'.tr}: ${singleThreeTableData['center']['text']}'),
                Txt("${'common_vocabulary40'.tr}: ${getSumQTY(type: 'pallet')}", style: numberColor(type: 'pallet'))
              ],
            ),),
            
            Row(
                children: [
                  CommonBtn(
                    text: 'cancel'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.whiteColor,
                    textColor: MyColors.themeColor,
                    borderColor: MyColors.themeColor,
                    enable: stepCancleEnable,
                    width: MediaQuery.of(context).size.width  /3,
                    disabledColor: MyColors.whiteColor,
                    disabledTextColor: MyColors.colorDisabled,
                    onPressed: () {
                      checkStep(
                        clickType: 'toStep2',
                      );
                    },
                  ),
                 
                  CommonBtn(
                    text: 'common_vocabulary37'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    borderColor: MyColors.themeColor,
                    enable: stepPalletSplitEnable,
                    width: MediaQuery.of(context).size.width /3 ,
                    onPressed: () {
                      checkStep(
                        clickType: 'split',
                      );
                    },
                  ),
                  CommonBtn(
                    text: 'save'.tr,
                    height: 60.0,
                    backgroundColor: MyColors.themeColor,
                    textColor: MyColors.whiteColor,
                    borderColor: MyColors.themeColor,
                    enable: stepPalletEnable,
                    width: MediaQuery.of(context).size.width /3 ,
                    onPressed: () {
                      checkStep(
                        clickType: 'submit',
                      );
                    },
                  ),
                ]
            ),
          ]
        ]));
  }

  _changeContent() {
    if (step == "1") {
      return Column(
        children: [
          StepTable(
            dataInfo: Utils.showGivenMap(step1Table),
            keyWidth: 150,
            paddingtop: 10,
            paddingbottom: 10,
          ),
          ScanText(
            onKey: onKey,
            controller: step1NoController,
            placeholder: 'common_vocabulary11'.tr,
            onChange: (val) {
              if (val == '') {
                search();
              }
            },
            onSubmitted: (value) {
              keyComplete();
            },
          ),
          Separate(),
          Container(
            height: MediaQuery.of(context).size.height - 320.sp,
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
        ],
      );
    } else if (step == "2") {
      return Column(
        children: [
          Container(
            height: MediaQuery.of(context).size.height - 140.sp,
            child: SingleChildScrollView(
              child: Column(
                children: [
                  if (threeTableData.length > 0) ...[
                    for (var i = 0; i < threeTableData.length; i++) ...[
                      Parent(
                        style:ParentStyle() ,
                        child: threeTableSingleLine(
                          dataInfo: threeTableData[i],
                          leftWidth: 90,
                          paddingtop: 15,
                          paddingbottom: 15,
                        ),
                        gesture: Gestures()..onTap(() => processingInstruction(index: i)),
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
        ]
      );
    } else if (step == "submitImage") {
     
      return Column(
        children: [
          TableTitle(
              title: 'common_vocabulary41'.tr,
              require: false,
              fontSize: 16,
              center: true,
              size: 'normal'),
          ImageWallData(
            images: imagesList,
            count: 10,
            onChange: (image) {
              // print('${image} ------>');
            },
            onUpload: (file) async {
              if (file != null) {
                // 这里get 和dio 冲突, 选用get方式弄formData
                dioData.FormData formData = dioData.FormData.fromMap({
                  "file": await dioData.MultipartFile.fromFile(
                    file.path,
                  )
                });
                var resdata = await InboundApi.uploadimg(formData);
                if (resdata['success'] == true) {
                  return resdata['data']['previewUrl'];
                } else {
                  return null;
                }
              }
            },
            onRemove: (val) {
            },
            imageFit: BoxFit.contain,
          )
        ],
      );
    } else if (step == "count") {
      return Column(
          children: [
            TableTitle(
                title: '${'common_vocabulary42'.tr}: ${singleThreeTableData['center']['text']}',
                require: false,
                fontSize: 16,
                center: true,
                size: 'normal'),
            Separate(height: 2),
            TableTitle(
                title: 'common_vocabulary43'.tr,
                require: true,
                fontSize: 16,
                center: true,
                size: 'normal'),
            Container(
              width: 300.sp,
              color: MyColors.whiteColor,
              // padding: EdgeInsets.fromLTRB(10, 10, 10,10),
              child: MyStepper(
                value: QTYCount.toDouble(),
                inputWidth: 100,
                min: 1,
                max: 1000,
                onChange: (val) {
                  setState(() {
                    QTYCount = int.parse(val);
                    // print(QTYCount.runtimeType.toString());
                  });
                },
              ),
            ),
          ],
      );
    } else if (step == "shelf") {
      return Column(children: [
        TableTitle(title: 'common_vocabulary44'.tr, require: true, fontSize: 16, center: true, size: 'normal'),
        RadioList(
          onChange: (val) {
            setState(() {
              if (val != null) {
                shelfRadio = val;
                // 按钮校验
              }
            });
          },
          listData: shelfRadioList,
          startValue: shelfRadio,
        ),
        Separate(),
        for (var i = 0; i < shelfList.length; i++) ...[
          Stack(children: [
            Parent(
              style: ParentStyle(),
              child: Column(
                children: [
                  TableTitle(title: 'common_vocabulary45'.tr, require: true, fontSize: 16, center: true, size: 'normal'),
                  ScanText(
                    onKey: onKey,
                    controller: shelfList[i]['Controller'],
                    placeholder: 'common_vocabulary9'.tr,
                    onChange: (val) {
                      // 更改数组中的数据
                      checkButtonEnable();
                    },
                    onSubmitted: (value) {
                      keyComplete(warehouseLocation: shelfList[i]['Controller'].text, index: i);
                    },
                  ),
                  TableTitle(title: 'common_vocabulary46'.tr, require: true, fontSize: 16, center: true, size: 'normal'),
                  Container(
                    width: 300.sp,
                    color: MyColors.whiteColor,
                    padding: EdgeInsets.fromLTRB(10, 10, 10,10),
                    child: MyStepper(
                      value: shelfList[i]['QTY'].toDouble(),
                      inputWidth: 100,
                      min: 1,
                      max: num.parse(singleThreeTableData['center']['text']).toDouble(),
                      onChange: (val) {
                        setState(() {
                          shelfList[i]['QTY'] = int.parse(val);
                        });
                        // 检查按钮是否可点击
                        checkButtonEnable();
                      },
                    ),
                  ),
                  Separate(),
                ],
              ),
            ),
            new Positioned(
              right: 10,
              top: 10,
              child: Parent(
                style: ParentStyle(),
                child: Image.asset('static/icons/icon_deletedata.png', width: 25.sp),
                gesture: Gestures()..onTap(() => deleteData(type: 'shelf', index: i)),
              ),
            ),
          ])
        ],
      ]);
    } else if (step == "pallet") {
      return Column(
          children: [
            for(var i = 0; i< palletList.length; i++)...[
              Stack(
                children: [
             
                  Parent(
                    style: ParentStyle(),
                    child: Column(
                      children: [
                        TableTitle(
                           // 托盘号
                            title: 'common_vocabulary47'.tr,
                            require: true,
                            fontSize: 16,
                            center: true,
                            size: 'normal'),
                        ScanText(
                          onKey: onKey,
                          controller: palletList[i]['Controller'],
                          placeholder: 'common_vocabulary36'.tr,
                          onChange: (val) {
                            // 更改数组中的数据
                          },
                          onSubmitted: (value) {
                            keyComplete();
                          },
                        ),
                        TableTitle(
                          // 上架数量
                            title: 'common_vocabulary46'.tr,
                            require: true,
                            fontSize: 16,
                            center: true,
                            size: 'normal'),
                        Container(
                          width: 300.sp,
                          color: MyColors.whiteColor,
                          padding: EdgeInsets.fromLTRB(10, 10, 10,10),
                          child: MyStepper(
                            value: palletList[i]['QTY'].toDouble(),
                            inputWidth: 100,
                            min: 1,
                            max: num.parse(singleThreeTableData['center']['text']).toDouble(),
                            onChange: (val) {
                              setState(() {
                                palletList[i]['QTY'] = int.parse(val);
                              });
                              // 检查按钮是否可点击
                              checkButtonEnable();
                            },
                          ),
                        ),
                        Separate(),
                      
                      ],
                    ),
                  ),
                
                  new Positioned(
                    right: 10,
                    top: 10,
                    child: Parent(
                      style: ParentStyle(),
                      child: Image.asset('static/icons/icon_deletedata.png', width: 25.sp),
                      gesture: Gestures()..onTap(() => deleteData(type: 'pallet', index: i)),
                    ),
                  ),
                  
            ],
              )
            ],
            
            
          ]
      );
    }
    
  }

  // 接口检验和新增
  void checkStep({postData, successfn, clickType}) {
    // mock
   
    if (step =="1") {
      if (clickType == 'step-next') {
        initData(stepData: "2");
       
      } 
    } else if (step == "2") {
      if (clickType == 'cancel') {
        initData(stepData: "1");
      }
   
    } else if (step == "submitImage") {
     
    } else if (step == "count") {
     
    } else if (step == "shelf") {
      if (clickType == 'split') {
        num sum = getSumQTY(type: 'shelf');
        // print('${sum} ${shelfList}----------');
        shelfList.add({
          'Controller': TextEditingController(),
          'QTY': (num.parse(singleThreeTableData['center']['text']) - sum) <= 0 ? 1 : (num.parse(singleThreeTableData['center']['text']) - sum),
          'warehouseArea': '', // 库区
        });
        setState(() {
          shelfList= shelfList;
        });
        checkButtonEnable();

      } 
    } else if (step == "pallet") {
      if (clickType == 'split') {
        
        num sum = getSumQTY(type: 'pallet');
        palletList.add({
          'Controller': TextEditingController(),
          'QTY': (num.parse(singleThreeTableData['center']['text']) - sum) <= 0 ? 1 : num.parse(singleThreeTableData['center']['text']) - sum,
        });
        setState(() {
          palletList= palletList;
        });
        checkButtonEnable();
      
      } 
    }
    // 回到指令页面
    if (clickType == 'toStep2') {
      initData(stepData: "2");
    } else if (clickType == 'submit') {
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
                  initData(stepData: 2);
                },
                onCancel: () {},
              );
            },
          );
        },
      );
    }
  }
  
  // 重置
  void initData({stepData = "1"}) {
    if (stepData == "1") {
      setState(() {
        step = "1";
        orderDetailSearchList = [];
        orderDetailListShow = [];
        orderDetailListAll = [];
        orderDetailList = [];
        selectedItem = {};
        selectedItemShow = {};
        step1ButtonEnable = true;
      });
      getData();
   
    } else if (stepData == "2") {
 
      setState(() {
        step = "2";
      });
      // 获取指令详情
      getInstructionData();
      
      
    } else if (stepData == "submitImage") {
      setState(() {
        step = "submitImage";
        imagesList= [];
      });
    } else if (stepData == "shelf") {
      setState(() {
        shelfList = [];
        step = "shelf";
        shelfList.add({
          'Controller': TextEditingController(),
          'QTY': num.parse(singleThreeTableData['center']['text']),
        });
      });
    } else if (stepData == "count") {
      setState(() {
        step = "count";
      });
    } else if (stepData == "pallet") {
      setState(() {
        palletList = [];
        step = "pallet";
        palletList.add({
          'Controller': TextEditingController(),
          'QTY': num.parse(singleThreeTableData['center']['text']),
        });
      });
    }
    // 检查按钮是否可点击
    checkButtonEnable();
  }

  // 获取详情数据
  void getData() {
    Map<String, dynamic> postData = {
      // "stackingNumber": orderNo,
      "exceptionId": exceptionId,
      "exceptionType": exceptionType,
    };
    InboundApi.queryWarehouseExceptionDetailInfo(postData).then((resData) {
      // mock
      
       /*resData = {
         "code": "000000",
         "msg": "操作成功",
         "data": {
           "warehouseExceptionVO": {
             "exceptionId": "0061198b3dee4f8c8a3f7f0264dacdec",
             "exceptionNo": "EO2022110310001",
             "relationNo": "IO313516-221103-2001",
             "serviceNo": null,
             "exceptionType": "1",
             "creator": "admin",
             "modifier": "lihanbin",
             "createTime": "2022-11-03 00:28:38",
             "modifyTime": "2022-11-03 00:38:01",
             "customerCode": "313516",
             "warehouseCode": "CAJW",
             "clientPerson": "lhb",
             "warehousePerson": "admin",
             "assignPerson": "admin",
             "assignTime": "2022-11-03 00:28:38",
             "confirmationTime": "2022-11-03 00:38:01",
             "finshTime": "2022-11-03 01:03:14",
             "exceptionStatus": "4",
             "confirmationStatus": "1",
             "assignStatus": "1",
             "latestConfirmationTime": null,
             "owmsAssignPerson": "admin",
             "owmsAssignTime": "2022-11-03 00:48:18",
             "owmsAssignStatus": "1",
             "exceptionNum": 100
           },
           "warehouseExceptionInboundVOList": [
             {
               "id": "757f8e37ad4c4d3280637bcccfb87a68",
               "exceptionNo": "EO2022110310001",
               "exceptionStatus": "4",
               "exceptionNum": 100,
               "exceptionOrderStatus": "2",
               "exceptionType": "2",
               "goodsWydSku": "313516-123",
               "goodsEnName": "jianshen",
               "inboundBatchNo": "IO313516-221103-2001",
               "dataBelong": "313516",
               "warehouseCode": "CAJW",
               "caseNo": null,
               "directNo": "IO313516-221103-2001",
               "orderNum": 100,
               "relGoodNum": 100,
               "omsEditRequire": null,
               "omsRequire": null,
               "relationNo": "IO313516-221103-2001",
               "remarks": "",
               "trackNo": null,
               "warehouseAreaCode": null,
               "warehouseLocationCode": null,
               "trayNo": null,
               "treatmentResults": "上架,CA0001,CA0001-0001,100",
               "usableNum": null,
               "unableUpdate": "0",
               "omsSee": "1",
               "omsAssign": null,
               "serialNo": "EO2022110310001",
               "creator": "admin",
               "createTime": "2022-11-03 00:28:38",
               "modifier": "admin",
               "modifyTime": "2022-11-03 01:03:14",
               "pictureInfos": null,
               "sysFileInfoVOList": [],
               "pendingInstruction": [
                 '1'
               ],
               "processedInstruction": [
                 "10"
               ]
             }
           ],
           "warehouseExceptionStackingVOList": null
         },
         "success": true
       };*/
       if (resData['success'] == true) {
         // setState(() {
         //   customerCode = resData['data']['customerCode'] ?? null;
         // });
         setState(() {
           step1TableAll= resData['data']['warehouseExceptionVO'];
           step1Table = getStep1Table();
         });
         List detailList = [];
         if (pageType == 'abnormalShelving') {
           detailList = ( resData['data']['warehouseExceptionStackingVOList'] != null) ? resData['data']['warehouseExceptionStackingVOList'] : [];
         } else if (pageType == 'abnormalGoods') {
           detailList = ( resData['data']['warehouseExceptionInboundVOList'] != null) ? resData['data']['warehouseExceptionInboundVOList'] : [];
         }
         
         
         if (detailList.length > 0) {
           setState(() {
             orderDetailListAll = [];
             orderDetailList = [];
             orderDetailListAll = detailList;
             orderDetailListAll.forEach((element) {
               // 未完成  complete 为mock字段, 后面根据实际字段进行替换
               if (element['pendingInstruction'].length > 0) {
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
       } else {
         Utils.toast(resData['msg']);
       }
    }).catchError((e) {});
  }

  getStep1Table() {
    String titleString1 = '';
    String titleString2 = '';
    if (checkType == 0) {
      titleString1 = 'common_vocabulary30'.tr;
      titleString2 = 'common_vocabulary31'.tr;
    }  else if (checkType == 1) {
      titleString1 = 'common_vocabulary30'.tr;
      titleString2 = 'common_vocabulary31'.tr;
    }
    return {
      // 关联单号
      titleString1: step1TableAll['relationNo'],
      // 异常单号
      titleString2: step1TableAll['exceptionNo'],
    };
  }

  void keyComplete({warehouseLocation, index}) {
    // step1
    if (step == "1") {
      search();
    } else if (step == 'shelf') {
      // 上架或者上报异常
      // 检查button是否可点
      // 找库区
      findWarehouseCodeByLocation(warehouseLocation: warehouseLocation, index: index );
    }
    checkButtonEnable();
  }

  // 查找库位是否在系统内
  findWarehouseCodeByLocation({callback, success, warehouseLocation, index}) {
    var postData = {
      "warehouseLocation": warehouseLocation
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
        String warehouseArea = '';
        if (res['data'] != null && res['data']['warehouseArea'] != null) {
          warehouseArea = res['data']['warehouseArea'];
          shelfList[index]['warehouseArea'] = warehouseArea;
          setState(() {
            shelfList = shelfList;
          });
          success != null ? success() : null;
          
        } else {
          Utils.toast('shelvingMessage2'.tr);
          shelfList[index]['warehouseArea'] = '';
          shelfList[index]['Controller'].text = '';
          setState(() {
            shelfList = shelfList;
          });
        }
      } else {
        Utils.toast(res['msg']);
      }
    }).catchError((e){

    });
  }
  
  // 检验按钮
  checkButtonEnable() {
    // print("selectedItem  ${selectedItem} ");
    if (step == "1") {
      if (selectedItem.isEmpty == true || selectedItem == null) {
        setState(() {
          step1ButtonEnable = true;
        });
      } else {
        setState(() {
          step1ButtonEnable = false;
        });
      }
    }
    if (step == "submitImage") {
      /*if (imagesList.isEmpty == true) {
        setState(() {
          stepSubmitImageEnable = true;
        });
      } else {
        setState(() {
          stepSubmitImageEnable = false;
        });
      }*/
    } else if (step == "count") {
      if (QTYCount <= 0) {
        setState(() {
          stepCountEnable = true;
        });
      } else {
        setState(() {
          stepCountEnable = false;
        });
      }
    } else if (step == "shelf") {
      // 上架
      num sum = getSumQTY(type: "shelf");
      bool allControlHaveData = shelfList.every((item) {
        return (item['Controller'].text != '') && item['Controller'].text != null;
      });
      if (sum == num.parse(singleThreeTableData['center']['text'])) {
        // 开启保存按钮, 关闭下一个按钮
        setState(() {
          if (allControlHaveData == true) {
            stepShelfEnable = false;
          }
          stepShelfSplitEnable = true;
        });
      } else if (sum < num.parse(singleThreeTableData['center']['text'])) {
        // 开启保存按钮, 关闭下一个按钮
        setState(() {
          stepShelfEnable = true;
          stepShelfSplitEnable = false;
        });
      } else {
        setState(() {
          stepShelfEnable = true;
          stepShelfSplitEnable = true;
        });
      }
      
    } else if (step == "pallet") {
      num sum = getSumQTY(type: "pallet");
      bool allControlHaveData = palletList.every((item) {
        return (item['Controller'].text != '') && item['Controller'].text != null;
      });
      

      if (sum == num.parse(singleThreeTableData['center']['text'])) {
        // 开启保存按钮, 关闭下一个按钮
        setState(() {
          if (allControlHaveData == true) {
            stepPalletEnable = false;
          }
          stepPalletSplitEnable = true;
        });
       
      } else if (sum < num.parse(singleThreeTableData['center']['text'])) {
        // 开启保存按钮, 关闭下一个按钮
        setState(() {
          stepPalletEnable = true;
          stepPalletSplitEnable = false;
        });
      } else {
        setState(() {
          stepPalletEnable = true;
          stepPalletSplitEnable = true;
        });
      }
    }
  
    
  }
  
  
  // 提交指令
  submit({success, falseFn}) {
    Map postData = {
      "exceptionType":exceptionType,
      'instructionCode': singleThreeTableData['optRequire'],
      "instructionId": singleThreeTableData['id'],
    };
    // 上传图片
    if (step == 'submitImage') {
      if (imagesList.length == 0) {
        // 请至少上传一张图片
        Utils.toast('common_vocabulary48'.tr);
        return false ;
      }
      List imagesListPostData = [];
      imagesList.forEach((item){
        imagesListPostData.add({
          'src': item,
          'type': '1',
        });
      });
      postData['fileInfos'] = imagesListPostData;
    } else if (step == 'count') {
      // 清点
      postData['checkNum'] = QTYCount;
    } else if (step == 'pallet') {
      // 检验提示
      bool allControlHaveData = palletList.every((item) {
        return (item['Controller'].text != '') && item['Controller'].text != null;
      });
      if (allControlHaveData == false) {
        // 托盘号必须填写
        Utils.toast('common_vocabulary49'.tr);
        return false;
      }
      List palletPostList = [];
      palletList.forEach((item){
        palletPostList.add({
          "number": item['QTY'],
          "palletNumber": item['Controller'].text,
        });
      });
      postData['palletReqs'] = palletPostList;
    } else if (step == 'shelf') {
      bool allControlHaveData = palletList.every((item) {
        return (item['Controller'].text != '') && item['Controller'].text != null;
      });
      if (allControlHaveData == false) {
        // 库位必须填写
        Utils.toast('common_vocabulary50'.tr);
        return false;
      }
      List shelfPostList = [];
      shelfList.forEach((item){
        shelfPostList.add({
          "realStackNum": item['QTY'],
          "realLocation": item['Controller'].text,
          'realArea': item['warehouseArea'],
        });
      });
      postData['serviceStackingInfoReq'] = {
        "necessaryNum": singleThreeTableData['center']['text'],
        'stackingDetailReqList': shelfPostList,
        'stackingType': shelfRadio
      };
    }
    InboundApi.operationHandle(postData).then((resData){
      if (resData['success'] == true) {
        // 回到第二页
        // 操作成功
        Utils.toast('common_vocabulary51'.tr);
        initData(stepData: "2");
      } else {
        Utils.toast(resData['msg']);
      }
    }).catchError((e) {});
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
        if (item['goodsWydSku']!= null && item['goodsWydSku']!= "" && item['goodsWydSku']?.contains(step1NoController.text)) {
          return true;
        }  else {
          return false;
        }
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
      // print(orderDetailSearchList.length);

    });
  }

  // 转化成展示列表数据
  orderDetailSearchListToorderDetailListShow() {
    List ListShow = [];
    if (orderDetailSearchList.length > 0) {
      orderDetailSearchList.forEach((element) {
        ListShow.add({
          "SKU": element['goodsWydSku'],
          // "Pallet No": element['containerNumber'],
          'common_vocabulary2'.tr: exceptionTypeFilter(element['exceptionType']),
          'common_vocabulary6'.tr: element['exceptionNum'],
          // "common_vocabulary19".tr: '短装',
          "common_vocabulary20".tr: instructionFilter(element['pendingInstruction']),
          "common_vocabulary21".tr:  'green_${instructionFilter(element['processedInstruction'])}',
        });
      });
    }
    return ListShow;
  }

  // 处理指令
  processingInstruction({index,success }) {
    singleThreeTableData = threeTableData[index];
    // print(singleThreeTableData);
    if (singleThreeTableData['status'].toString() == "1") {
      return false;
    }
    if (singleThreeTableData['optRequire'].toString()=='0') {
      // 拍照
      initData(stepData: "submitImage");
    } else if (singleThreeTableData['optRequire'].toString()=='4') {
      // 清点
      initData(stepData: "count");
    
    } else if (singleThreeTableData['optRequire'].toString()=='10') {
      // 上架
      initData(stepData: "shelf");
    } else if (singleThreeTableData['optRequire'].toString()=='5') {
      // 打托
      initData(stepData: "pallet");
    } else {
      // 进行上报
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
                  initData(stepData: 2);
                },
                onCancel: () {},
              );
            },
          );
        },
      );
    }
  }
  
  // 删除数据  上架与打托
  deleteData({type, index}) {
    if (type == 'pallet') {
      if (palletList.length == 1) {
        // 至少需要一组数组
        Utils.toast('common_vocabulary52'.tr);
      } else {
        if (index != null ) {
          setState(() {
            palletList.removeAt(index);
          });
          checkButtonEnable();
        }
      }
      
    } else if (type == 'shelf') {
      if (shelfList.length == 1) {
        // 至少需要一组数组
        Utils.toast('common_vocabulary52'.tr);
      } else {
        if (index != null ) {
          setState(() {
            shelfList.removeAt(index);
          });
          checkButtonEnable();
        }
      }
    }
  }
  // 获取合计值
  getSumQTY({type}) {
    num sum = 0;
    if (type == 'pallet') {
      palletList.forEach((item){
        sum = sum + item['QTY'];
      });
    } else if (type == 'shelf') {
     
      shelfList.forEach((item){
        sum = sum + item['QTY'];
      });
    }
    // print('${sum}---sum');
    return sum;
  }
  
  // 获取指令详情
  getInstructionData() {
    String exceptionType = '';
    String id = '';
    if (pageType == 'abnormalShelving') {
      exceptionType = '5';
      id = selectedItem['exceptionStackingId'];
    } else if (pageType == 'abnormalGoods') {
      exceptionType = '1';
      id = selectedItem['id'];
    }
    
    Map<String, dynamic> postData = {
      // "stackingNumber": orderNo,
      "exceptionId": id,
      "exceptionType": exceptionType,
    };
    // print(postData);
    InboundApi.queryAdviceByExceptionId(postData).then((resData) {
      // mock
     /* resData = {
        "code": "000000",
        "msg": "操作成功",
        "data": {
          "handleAdvice": "上架,拍照",
          "remark": "",
          "warehouseExceptionHandleVoList": [
            {
              "id": "d5a6b09fb1264ae99e14894f36bcea8d",
              "goodsWydSku": "313516-LHB002",
              "exceptionId": "560000eab6cd485c82653834938da733",
              "optRequire": "0",
              "batchNo": 1,
              "customerCode": "313516",
              "orderNum": 60,
              "relGoodNum": 60,
              "exceptionNum": 10,
              "warehouseCode": "CAJW",
              "createTime": "2022-12-26 00:43:16",
              "creatorRemark": null,
              "status": "1",
              "result": "已拍照",
              "stackingType": null
            },
            {
              "id": "69ca4b2c3b2e4eeca0b3ce6b7a74c530",
              "goodsWydSku": "313516-LHB002",
              "exceptionId": "560000eab6cd485c82653834938da733",
              "optRequire": "10",
              "batchNo": 1,
              "customerCode": "313516",
              "orderNum": 60,
              "relGoodNum": 60,
              "exceptionNum": 10,
              "warehouseCode": "CAJW",
              "createTime": "2022-12-26 00:43:16",
              "creatorRemark": null,
              "status": "0",
              "result": "上架",
              "stackingType": null,
              "endInstruction": '1',
            },
            {
              "id": "69ca4b2c3b2e4eeca0b3ce6b7a74c530",
              "goodsWydSku": "313516-LHB002",
              "exceptionId": "560000eab6cd485c82653834938da733",
              "optRequire": "4",
              "batchNo": 1,
              "customerCode": "313516",
              "orderNum": 60,
              "relGoodNum": 60,
              "exceptionNum": 10,
              "warehouseCode": "CAJW",
              "createTime": "2022-12-26 00:43:16",
              "creatorRemark": null,
              "status": "0",
              "result": "清点",
              "stackingType": null
            },
            {
              "id": "69ca4b2c3b2e4eeca0b3ce6b7a74c530",
              "goodsWydSku": "313516-LHB002",
              "exceptionId": "560000eab6cd485c82653834938da733",
              "optRequire": "5",
              "batchNo": 1,
              "customerCode": "313516",
              "orderNum": 60,
              "relGoodNum": 60,
              "exceptionNum": 10,
              "warehouseCode": "CAJW",
              "createTime": "2022-12-26 00:43:16",
              "creatorRemark": null,
              "status": "0",
              "result": "打托",
              "stackingType": null
            },
            {
              "id": "d5a6b09fb1264ae99e14894f36bcea8d",
              "goodsWydSku": "313516-LHB002",
              "exceptionId": "560000eab6cd485c82653834938da733",
              "optRequire": "12",
              "batchNo": 1,
              "customerCode": "313516",
              "orderNum": 60,
              "relGoodNum": 60,
              "exceptionNum": 10,
              "warehouseCode": "CAJW",
              "createTime": "2022-12-26 00:43:16",
              "creatorRemark": null,
              "status": "0",
              "result": "返库",
              "stackingType": null
            },
          ]
        },
        "success": true
      };*/
      if (resData['success'] == true) {
        List warehouseExceptionHandleVoList =  resData['data']['warehouseExceptionHandleVoList'];
        if (warehouseExceptionHandleVoList.length > 0) {
          warehouseExceptionHandleVoList.forEach((item){
            item['left'] = {
              'text': instructionFilter2(item),
            };
            item['center'] = {
              'text': item['exceptionNum'].toString(),
            };
            item['right'] = {
              'text': item['result'],
              'color': item['status'] == '0' ? 'blue' : 'green'
            };
          });
        }
        setState(() {
          threeTableData = warehouseExceptionHandleVoList;
        });
        
      }
    }).catchError((e) {
      print(e);
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
      // print(selectedItem);
      success != null ? success() : null;
    });
  }

  getSelectedItemToshow() {
    if (selectedItem.isNotEmpty) {
      return {
        "Order NO": orderNo,
        "SKU": selectedItem['goodsWydSku'],
        "Pallet NO": selectedItem['containerNumber'],
        "shelvingString6".tr: selectedItem['assignLocation'],
        "shelvingString7".tr: selectedItem['assignStackNum'],
      };
    }

  }

  numberColor({type}) {
    Color fontColor = Color.fromRGBO(86, 202, 86, 1);
    // String instructiontype = '';
    if (type == 'pallet' || type == 'shelf') {
      if (singleThreeTableData['center']['text'].toString() == getSumQTY(type: type).toString()) {
        fontColor = Color.fromRGBO(86, 202, 86, 1);
      } else {
        fontColor = Color.fromRGBO(255, 0, 0, 1);
      }
    }
    return TxtStyle()
      ..textColor(fontColor)
      ..margin(all: 10);
  }
}

```


