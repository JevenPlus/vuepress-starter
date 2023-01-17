### 主讲人：郑凯力

### pda-上架异常与收货异常

### 2022-1-12

### 需求说明
#### 上架异常
仓库人员在收货过程中不仔细，没有发现异常，没有上报异常；

导致在上架过程中，存在异常情况的发生；需要异常上报；

目前上架过程中的异常先处理短装/溢装；短装点击“上架”自动上报，溢装点击“上报异常”手动上报；

#### 收货异常
收货异常类型：短装、溢装、潮湿破损、SKU无法识别、SKU与入库不符、其他（需要自行描述）；

需要对收货的异常进行处理


### 功能理解
目前分为异常列表 - 异常详情 - 处理指令三个部分

其中收货异常的操作指令为:
拍照、换包装、贴标、覆盖标签、打包、丈量、过磅、打托、清点、确认（终结指令）、上架（终结指令）、销毁（终结指令）

上架异常的操作指令: 
拍照、清点、确认（终）；对于溢装的指令：拍照、清点、确认、上架（终）、销毁（终）


### review 核心代码
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

### 心得体会
1. 多编写组件, 提高代码的复用性


