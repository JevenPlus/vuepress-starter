### 主讲人：郑凯力

### 基础设置-黑白名单

### 2022-11-24

### 需求

设置一个特殊名单列表, 新进来的用户与名单中选中的用户为特殊名单, 其余为其他名单, 方便客服快速操作这个特殊名单

### 功能理解

这里不能被黑名单与白名单的概念迷惑, 可以理解为只是一个标签, 它既可以是黑名单, 也可以是白名单, 也可以叫红名单, 总是只是一个代号, 新增的用户与名单内的用户即为特殊名单, 客服可以为该特殊名单设置相应配置

### review 代码

```js
export default {
  data() {
    return {
      //黑白名单列表
      scustomerCodeList: [], // 特殊名单列表, 黑白属性有isEnabled 控制
      scustomerCodeListInit: [], // 初始特殊名单列表
      scustomerCodeListSearch: [], // 搜索项

      sunselectedCustomerCodeList: [], // 未填入特殊名单列表,  属性由isEnabled 控制, 取反
      sunselectedCustomerCodeListSearch: [],
      sunselectedCustomerCodeListInit: [],
      scustomerCodeListAll: [], // 全名单列表
      isEnabled: '2', // 默认白名单   1 黑名单 2 白名单
      isEnabledInit: '2',
    };
  },
  methods: {
    // 这里的k代指名单
    init_k() {
      this.scustomerCodeList = [];
      this.scustomerCodeListInit = [];
      this.scustomerCodeListSearch = [];
      this.sunselectedCustomerCodeList = [];
      this.sunselectedCustomerCodeListSearch = [];
      this.sunselectedCustomerCodeListInit = [];
      this.scustomerCodeListAll = [];
      this.isEnabled = '2';
    },
    getData_k({
      customerCodes = [],
      unselectedCustomerCodeList = [],
      isEnabled = '2',
    }) {
      /*zkl*/
      this.scustomerCodeList = customerCodes;
      this.scustomerCodeListInit = JSON.parse(JSON.stringify(customerCodes));
      this.scustomerCodeListSearch = customerCodes;
      this.sunselectedCustomerCodeList = unselectedCustomerCodeList;
      this.sunselectedCustomerCodeListSearch = unselectedCustomerCodeList;
      this.sunselectedCustomerCodeListInit = JSON.parse(
        JSON.stringify(unselectedCustomerCodeList)
      );
      this.scustomerCodeListAll = [
        ...customerCodes,
        ...unselectedCustomerCodeList,
      ];
      this.isEnabled = isEnabled;
      this.isEnabledInit = isEnabled;
    },
    // 打开设置名单弹窗
    setList() {
      this.dialogVisiable_setList = true;
    },
    // 查询客户信息
    queryDataBelongInfo() {
      /*zkl*/
      this.sunselectedCustomerCodeListSearch =
        this.sunselectedCustomerCodeList.filter(
          (item) =>
            item.customerCode &&
            item.customerCode.indexOf(this.setListForm.dataBelong.trim()) !== -1
        );
    },
    // 移除黑白名单
    onDeleteWhiteList(index, row) {
      /*zkl*/
      let deleteIndex = null;
      this.scustomerCodeList.forEach((item, index) => {
        if (item.customerCode == row.customerCode) {
          deleteIndex = index;
        }
      });
      if (deleteIndex != null) {
        this.scustomerCodeList.splice(deleteIndex, 1);
      }
      this.scustomerCodeListSearch = this.scustomerCodeList;
      this.setListForm.white = '';
      // 更新左边选择列表
      this.updatekcustomerCodeListHandleData();
    },
    // 更新左边数据
    updatekcustomerCodeListHandleData() {
      this.sunselectedCustomerCodeList = this.getkcustomerCodeListHandleData({
        blackWhite: this.scustomerCodeList,
        list: this.scustomerCodeListAll,
      });
      this.sunselectedCustomerCodeListSearch = this.sunselectedCustomerCodeList;
    },
    getkcustomerCodeListHandleData({ blackWhite = [], list = [] }) {
      // 移除白名单和黑名单
      list = this.listDelete({
        list: blackWhite,
        deleteList: list,
        condition: ['customerCode'],
      });
      return list;
    },
    // 删除数据
    listDelete({ list = [], deleteList = [], condition = ['customerCode'] }) {
      list = JSON.parse(JSON.stringify(list));
      deleteList = JSON.parse(JSON.stringify(deleteList));
      list.forEach((item, index) => {
        let deleteIndex = null;
        deleteList.forEach((item1, index1) => {
          if (condition.every((key) => item1[key] == item[key])) {
            deleteIndex = index1;
          }
        });
        if (deleteIndex != null) {
          deleteList.splice(deleteIndex, 1);
        }
      });
      return deleteList;
    },
    addList() {
      /* zkl*/
      if (this.multipleSelection_customer.length === 0) return;
      // 先删除黑名单与白名单的数据
      this.scustomerCodeList = this.listDelete({
        list: this.multipleSelection_customer,
        deleteList: this.scustomerCodeList,
        condition: ['customerCode'],
      });

      // 添加到白名单与黑名单中  比如放入到黑名单中, 如果已经在白名单中存在, 在移除白名单中的内容
      this.multipleSelection_customer.forEach((item) => {
        this.scustomerCodeList.unshift(item);
      });
      this.scustomerCodeListSearch = this.scustomerCodeList;
      this.setListForm.white = '';
      this.setListForm.dataBelong = '';
      // 更新左边选择列表
      this.updatekcustomerCodeListHandleData();
    },

    // 批量移除名单
    removeList() {
      /* zkl*/
      if (this.multipleSelection_list.length === 0) return;
      this.scustomerCodeList = this.listDelete({
        list: this.multipleSelection_list,
        deleteList: this.scustomerCodeList,
        condition: ['customerCode'],
      });
      this.scustomerCodeListSearch = this.scustomerCodeList;
      this.setListForm.white = '';

      // 更新左边选择列表
      setTimeout(() => {
        this.updatekcustomerCodeListHandleData();
      }, 200);
    },
    // 设置名单保存
    submitSetList() {
      /*zkl*/
      this.dialogVisiable_setList = false;
    },
    // 搜索黑白名单
    onWhiteListInput() {
      /* zkl*/
      this.scustomerCodeListSearch = this.scustomerCodeList.filter(
        (item) =>
          item.customerCode &&
          item.customerCode.indexOf(this.setListForm.white.trim()) !== -1
      );
    },
    // 重置黑白名单搜索
    resetWhiteList() {
      /*  zkl*/
      this.$set(this.setListForm, 'white', '');
      this.scustomerCodeList = JSON.parse(
        JSON.stringify(this.scustomerCodeListInit)
      );
      this.scustomerCodeListSearch = this.scustomerCodeList;
      // 重置isEnabled
      this.isEnabled = this.isEnabledInit;
      // 更新左边选择列表
      this.updatekcustomerCodeListHandleData();
    },
  },
};
```

### 重点代码

```js
  // 功能: 从A数组中删除AB重合的数据, 并返回删除后的数据   这里的A代指deleteList, B代指list,  条件筛选用的则是condition
    listDelete({list = [], deleteList = [], condition= ['customerCode']}) {
      list = JSON.parse(JSON.stringify(list))
      deleteList = JSON.parse(JSON.stringify(deleteList))
      list.forEach((item,index)=> {
        let deleteIndex = null
        deleteList.forEach((item1, index1)=> {
          if (condition.every((key)=> item1[key] == item[key])) {
            deleteIndex = index1;
          }
        })
        if (deleteIndex != null) {
          deleteList.splice(deleteIndex, 1)
        }
      })
      return deleteList
    }
```

### 心得体会

1. 页面尽量提高复用性, 即能提高效率也能减轻后期维护成本
2. 高频的操作应抽出来做一个公共方法, 并放到 common 里面, 方便小组成员查看与复用
