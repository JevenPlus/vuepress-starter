### 主讲人：肖柢

### 分销功能

### 2022-12-15

### 需求

客户单位有分销公司或者平台帮忙一起卖货，OMS为主账号，需要分库存数量给分销，也可以对货物卖的慢的分销进行数量回收；
需要对出库单有道审核功能，以防恶意创建订单；

### 分销功能介绍

1.基础设置--分销管理 需要新增 分销管理 增加 修改 权限配置 充值密码操作

2.库内管理 -- 库存查询页面新增库存划拨按钮 客户通过库存划拨给分销账号分拨一些货物售卖 库存数量=可用量+待出库

3.tob toc订单管理页面展示分销账号创建的单子 分销账号创建的单子必须由客户进行审核

### Code

```html
<w-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange"
        max-height="490" :key="activeTab" :columns="columns" :total="totalCount" :current-page="checkForm.pageNo"
        :page-size="checkForm.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        null-text="--" :empty-text="emptyText">
        <template #orderNo="scope">
          <!-- v-has="'B157'" -->
          <el-button v-if="isShowDetailBtn('B157')"   @click="onDetail(scope.row)" type="text">{{ scope.row.deliveryNo }}</el-button>
          <el-button v-else   type="text">{{ scope.row.deliveryNo }}</el-button>
        </template>
        <template #deliveryType="scope">
          <span v-if="scope.row.deliveryType == '0'">
            {{ $t('page_toBOutboundOrder.dictionaryOutboundOrderType_normal') }}
          </span>
          <span v-else-if="scope.row.deliveryType == '1'">
            {{ $t('page_toBOutboundOrder.dictionaryOutboundOrderType_FBA') }}
          </span>
          <span v-else>
            {{ $t('page_toBOutboundOrder.dictionaryOutboundOrderType_rollover') }}
          </span>
        </template>
        <template #skuInfo="scope">
          <span>{{ scope.row.skuNum }}/{{ scope.row.totalVolume }}/{{ scope.row.totalWeight }}</span>
        </template>
        <!-- 提交人&&提交时间 -->
        <template #submitTimeInfo="scope">
          <div>{{scope.row.submitPeople || '--'}}</div>
          <div>{{scope.row.submitTime || '--'}}</div>
        </template>
        <!-- 创建人&&创建时间 -->
        <template #createTimeInfo="scope">
          <div>{{scope.row.creator || '--'}}</div>
          <div>{{scope.row.createTime || '--'}}</div>
        </template>
        <!--0--待提交 1--已提交 2--拣货 3--签出 4--已作废 5--异常出库单 6--派送-->
        <template #deliveryStatus="scope">
          <!-- 待提交下   masterCheckStatus 0 待提交 1 待审核  2 审核通过 3 审核驳回  4  主订单 待提交 -->
          <div v-if="scope.row.deliveryStatus == '0'">
            <!-- {{ $t('page_toBOutboundOrder.tab_toSubmit') }} -->
            <span v-if="scope.row.masterCheckStatus == '0'" 
            class="status-btn status-btn-notstart">{{$t('page_toBOutboundOrder.tab_toSubmit')}}</span>
            <span v-if="scope.row.masterCheckStatus == '1'" 
            class="status-btn status-btn-notstart">{{$t('page_toBOutboundOrder.dictionaryauditStatus_toAudit')}}</span>
            <span v-if="scope.row.masterCheckStatus == '2' " 
            class="status-btn status-btn-success">{{$t('page_toBOutboundOrder.dictionaryauditStatus_pass')}}</span>
            <span v-if="scope.row.masterCheckStatus == '4' " 
            class="status-btn status-btn-notstart">{{$t('page_toBOutboundOrder.tab_toSubmit')}}</span>
            <span v-if="scope.row.masterCheckStatus == '3'" 
            class="status-btn status-btn-error">{{$t('page_toBOutboundOrder.dictionaryauditStatus_reject')}}</span>

          </div>
          <div v-else-if="scope.row.deliveryStatus == '1'">
            <!--审核状态（0待审核1审核未通过2审核通过3库存处理中）-->
            <div v-if="scope.row.auditStatus == '0'" class="status-btn status-btn-notstart">
              {{ $t('page_toBOutboundOrder.dictionary_customer_waiting') }}
            </div>
            <div v-else-if="scope.row.auditStatus == '1'" class="status-btn status-btn-error">
              {{ $t('page_toBOutboundOrder.dictionary_customer_reject') }}
            </div>
            <div v-else class="status-btn status-btn-success">
              {{ $t('page_toBOutboundOrder.dictionary_customer_success') }}
            </div>
          </div>
          <div v-else-if="scope.row.deliveryStatus == '2'">
            <!--拣货状态(1--待拣货 2--拣货中 3--已拣货 4--拣货异常)-->
            <div v-if="scope.row.pickingStatus == '1'" class="status-btn status-btn-notstart">
              {{ $t('page_toBOutboundOrder.tab_option_unPicked') }}
            </div>
            <div v-else-if="scope.row.pickingStatus == '2'" class="status-btn status-btn-doing">
              {{ $t('page_toBOutboundOrder.tab_option_picking') }}
            </div>
            <div v-else-if="scope.row.pickingStatus == '3'" class="status-btn status-btn-success">
              {{ $t('page_toBOutboundOrder.tab_option_picked') }}
            </div>
            <div v-else class="status-btn status-btn-error">
              {{ $t('page_toBOutboundOrder.tab_option_pickingAbnormal') }}
            </div>
          </div>
          <div v-else-if="scope.row.deliveryStatus == '3'">
            <!--签出状态(0--代签出 1--签出中 2--已签出)-->
            <div v-if="scope.row.checkStatus == '0'" class="status-btn status-btn-notstart">
              {{ $t('page_toBOutboundOrder.tab_option_waitCheck') }}
            </div>
            <div v-else-if="scope.row.checkStatus == '1'" class="status-btn status-btn-doing">
              {{ $t('page_toBOutboundOrder.tab_option_checking') }}
            </div>
            <div v-else class="status-btn status-btn-success">
              {{ $t('page_toBOutboundOrder.tab_option_checked') }}
            </div>
          </div>
          <div v-else-if="scope.row.deliveryStatus == '4'" class="status-btn status-btn-destory">
            {{ $t('page_toBOutboundOrder.tab_abolished') }}
          </div>
          <div v-else-if="scope.row.deliveryStatus == '5'" class="status-btn status-btn-error">
            {{ $t('page_toBOutboundOrder.tab_abnormalOrders') }}</div>
          <div v-else class="status-btn status-btn-success">
            {{ $t('page_toBOutboundOrder.tab_hasBeenSent') }}
          </div>
        </template>
        <template #sourceOfDelivery="scope">
          <el-popover placement="bottom" trigger="hover" :visible-arrow="false">
            <div class="sourceOfDelivery-popover">
              <div>
                <span>{{ $t('page_toBOutboundOrder.table_basicInfo_inStorageNo') }}：</span>
                <span class="sourceOfDelivery-popover-inboundNo">
                  {{ scope.row.inboundNo || '--' }}
                </span>
              </div>
              <div>{{ $t('page_toBOutboundOrder.detail_string34') }}{{ scope.row.cabinetNum || '--' }}</div>
              <!-- <div>{{ $t('page_toBOutboundOrder.table_basicInfo_incomingStatus') }}：
                <span v-for="(item,key) in inboundStatusOptions" :key="key">
                  <span v-if="item.value == scope.row.inboundStatus">
                    {{ item.label }}
                  </span>
                </span>
              </div> -->
            </div>
            <span slot="reference">
              <!--0手工创建，1导入，2ERP导入，3FBA入库-->
              <span v-for="(item,key) in options_orderSource" :key="key">
                <span v-if="item.value == scope.row.sourceOfDelivery" class="sourceOfDelivery-popover-label">
                  {{ item.label }}
                </span>
              </span>
            </span>
          </el-popover>
        </template>
          <!-- 费用 -->
          <template #payInfo="scope">
            <span>{{ String(scope.row.pay) || '--' }}</span>
          </template>
        <!-- 货物流转 -->
        <template #goodsCirculationStatus="scope">
          <span>{{ scope.row.goodsCirculationStatus || '--' }}</span>
        </template>
      </w-table>
```


```js
//列出 不同条件下 操作选项展示的不同按钮
export function dictionaryColumns(Vue) {
  return [
    { type: `selection`, width: `50`, align: `center`, fixed: `left` },
    { label: Vue.$t('page_toBOutboundOrder.table_item_index'), type: `index`, width: `50`, fixed: `left` },
    { label: Vue.$t('page_toBOutboundOrder.table_basicInfo_orderNo'), slot: 'orderNo', width: `176`, fixed: `left` },
    { label: Vue.$t('page_toBOutboundOrder.table_logisticsInfo_warehouse'), prop: 'deliveryWarehouseCode', width: `96`, fixed: `left` },
    { label: Vue.$t('page_toBOutboundOrder.table_basicInfo_orderType'), slot: 'deliveryType', width: `96`, fixed: `left` },
    { label: Vue.$t('page_toBOutboundOrder.table_basicInfo_targetWarehouse'), prop: 'warehouseCode', width: `96` },
    { label: Vue.$t('page_toBOutboundOrder.table_logisticsInfo_ExpressType'), prop: 'deliveryStyle', width: `96`, list: Vue.options_expressDeliveryService },
    { label: Vue.$t('page_toBOutboundOrder.table_outboundOrderInfo_info'), slot: 'skuInfo', width: `176` },
    { label: Vue.$t('page_toBOutboundOrder.table_outboundOrderInfo_amount'), prop: 'goodNum', width: `76` },
    { label: Vue.$t('page_toBOutboundOrder.table_outboundOrderInfo_cost'), slot: 'payInfo', width: `76` },
    { label: Vue.$t('page_toBOutboundOrder.table_outboundOrderInfo_orderStatus'), slot: 'deliveryStatus', width: `120` },
    { label: Vue.$t('page_toBOutboundOrder.table_logisticsInfo_auditStatusArrZe'), slot: 'goodsCirculationStatus', width: `176` },
    { label: Vue.$t('page_toBOutboundOrder.table_basicInfo_orderSource'), slot: 'sourceOfDelivery', width: `96`, list: Vue.options_orderSource },
    { label: Vue.$t('page_toBOutboundOrder.table_operationTime_DeliveryTime'), prop: 'deliveryTime', width: `144` },
    { label: Vue.$t('page_toBOutboundOrder.table_operationTime_pickingTime'), prop: 'pickingTime', width: `144` },
    { label: Vue.$t('page_toBOutboundOrder.table_operationTime_submitTime'), slot: 'submitTimeInfo', width: `144` },
    { label: Vue.$t('page_toBOutboundOrder.table_operationTime_createTime'), slot: 'createTimeInfo', width: `144` },
    {
      label: Vue.$t('page_toBOutboundOrder.table_item_operate'), type: 'operate', width: `180`, fixed: 'right', align: 'right', fn: (scope) => {
        console.log('@accountType',Vue.accountType)
        let btnList=[];
        // 判断待提交下 主订单 与 分销订单不同逻辑
        if(scope.row.deliveryStatus=='0'){
          btnList=[
             // 分销账号 审核  
            {
              name: Vue.$t('page_toBOutboundOrder.btn_examine'),
              onClick: ()=>{},
              children:[
                // 审核通过
                {
                  name: Vue.$t('page_toBOutboundOrder.tab_option_reviewSuccess'),
                  onClick: () => Vue.approveOrder(scope.row,'2'),
                  show: true
                },
                    // 审核驳回
                {
                  name: Vue.$t('page_toBOutboundOrder.tab_option_reviewFail'),
                  onClick: () => Vue.approveOrder(scope.row,'3'),
                  show: true
                },
              ],
              show: scope.row.masterCheckStatus=='1' && Vue.accountType=='0' && Vue.$_has("B835")
              },
             // 提交
            {
              name: Vue.$t('page_toBOutboundOrder.btn_submit'),
              onClick: () => Vue.onSubmit(scope.$index, scope.row),
              // show:    Vue.$_has("B138")
              show:['0','1'].includes(Vue.accountType) ? scope.row.masterCheckStatus=='4'
                  && scope.row.orderAccountType=='0' && Vue.$_has("B138") :scope.row.masterCheckStatus=='0' && Vue.$_has("B138")   
            },
              //提交客服
              {
              name: Vue.$t('page_toBOutboundOrder.add_btn_service'),
              onClick: () => Vue.submitService(scope.row,[scope.row.deliveryNo]),
              show:Vue.accountType=='2' && scope.row.masterCheckStatus=='2' 
            },
             // 修改
            {
              name: Vue.$t('page_toBOutboundOrder.btn_modify'),
              onClick: () => Vue.onEdit(scope.$index, scope.row),
              // show: Vue.$_has("B139")
              show: ['0','1'].includes(Vue.accountType)? scope.row.masterCheckStatus=='4' 
              && scope.row.orderAccountType=='0' && Vue.$_has("B139") : ['0','3'].includes(scope.row.masterCheckStatus) && Vue.$_has("B139") 
            },
            // 复制
            {
              name: Vue.$t('page_toBOutboundOrder.btn_copy'),
              onClick: () => Vue.onCopy(scope.$index, scope.row),
              // show: scope.row.deliveryType != '1' && Vue.$_has("B154")
              show: ['0','1'].includes(Vue.accountType)? scope.row.deliveryType != '1'
              && scope.row.masterCheckStatus=='4' && scope.row.orderAccountType=='0' 
              && Vue.$_has("B154") :  true
            },
            // 上传附件
            {
              name: Vue.$t('page_toBOutboundOrder.add_btn_upload'),
              onClick: () => Vue.onUpload(scope.$index, scope.row),
              // show: Vue.$_has("B156")
              show: ['0','1'].includes(Vue.accountType)? scope.row.masterCheckStatus=='4' 
              && scope.row.orderAccountType=='0' && Vue.$_has("B156") : ['0','1','2','3'].includes(scope.row.masterCheckStatus) && Vue.$_has("B156")
            },
              // 截单
              {
                name: scope.row.deliveryStatus == '5' ? Vue.$t('page_toBOutboundOrder.btn_abolish') : Vue.$t('page_toBOutboundOrder.dialog_cutOrder_title'),
                onClick: () => Vue.onVoid(scope.$index, scope.row),
                // show: !['2', '5'].includes(scope.row.checkStatus) && !['1','2'].includes(scope.row.pickingStatus) && Vue.$_has("B151")
                show: ['0','1'].includes(Vue.accountType)?scope.row.masterCheckStatus=='4' 
                && scope.row.orderAccountType=='0' && Vue.$_has("B151") :  Vue.$_has("B151")

              },
          ]
        }else {
          // 主订单 对自己名下的分销订单没有操作权限
          if(Vue.accountType=='0' && scope.row.orderAccountType=='2'){
            btnList=[]
          }else {
              btnList= [
                // 提交
                {
                  name: Vue.$t('page_toBOutboundOrder.btn_submit'),
                  onClick: () => Vue.onSubmit(scope.$index, scope.row),
                  show: ['0', '5'].includes(scope.row.deliveryStatus) && !(scope.row.deliveryStatus=='5' &&(scope.row.deliveryType=='2'  || scope.row.deliveryStyle=='1')) 
                    && Vue.$_has("B138") || scope.row.deliveryStatus=='1' && scope.row.auditStatus=='1' && Vue.$_has("B138")
                },
                //提交客服
                {
                  name: Vue.$t('page_toBOutboundOrder.add_btn_service'),
                  onClick: () => Vue.submitService(scope.row,[]),
                  show:Vue.accountType=='2' && scope.row.deliveryStatus=='5' &&  scope.row.masterCheckStatus=='2' 
                },
                // 修改
                {
                  name: Vue.$t('page_toBOutboundOrder.btn_modify'),
                  onClick: () => Vue.onEdit(scope.$index, scope.row),
                  show: ['0', '5'].includes(scope.row.deliveryStatus) && !(scope.row.deliveryStatus=='5' && (scope.row.deliveryType=='2' ||  scope.row.deliveryStyle=='1')) 
                  && Vue.$_has("B139") || scope.row.deliveryStatus=='1' && scope.row.auditStatus=='1' && Vue.$_has("B139")
                },
                // 截单
                {
                  name: scope.row.deliveryStatus == '5' ? Vue.$t('page_toBOutboundOrder.btn_abolish') : Vue.$t('page_toBOutboundOrder.dialog_cutOrder_title'),
                  onClick: () => Vue.onVoid(scope.$index, scope.row),
                  show: !['2', '5'].includes(scope.row.checkStatus) && !['1','2'].includes(scope.row.pickingStatus) && Vue.$_has("B151") && scope.row.deliveryStatus!='4'
                },
                // 复制
                {
                  name: Vue.$t('page_toBOutboundOrder.btn_copy'),
                  onClick: () => Vue.onCopy(scope.$index, scope.row),
                  show: scope.row.deliveryType != '1' && Vue.$_has("B154")
                },
                // 上传附件
                {
                  name: Vue.$t('page_toBOutboundOrder.add_btn_upload'),
                  onClick: () => Vue.onUpload(scope.$index, scope.row),
                  show: Vue.$_has("B156") && scope.row.deliveryStatus!='4'
                },
              ]
          }
        }
        return btnList
      
      }
    },
  ]
}

```


### 学习心得

- 复杂的逻辑要做好标记、逻辑判断比较复杂时，将所有的条件梳理出来,提交后续的扩展性