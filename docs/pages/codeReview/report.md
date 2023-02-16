### 主讲人：朱雪萍

### 定制化报表

### 2023-02-16

### 需求
帆软作为创建报表插件使用，相关报表展示在定制化报表分析页面中，创建报表后可设置报表查看权限



### 功能理解
- WMS创建报表 -> 提交报表相关规则 -> 帆软制作报表（开发中） -> 报表开发完成（待设置权限） -> 权限设置完成（停用） -> 启用 -> 查看（报表详情）
- 报表名称，参数名称，编码不可重复
- 固定参数：用户，客户代码，仓库代码，开始时间，结束时间，显示系统，可添加自定义参数
- 参数传递方式：
    - 固定值传参：手动输入
    - 不传参：不传值
    - 系统传参：当前登陆用户，仓库，客户代码
    - api传参：接口配置
    - 时间类型传参：时间区间，自定义输入时间规则

### Code

```html
<!-- 新增报表 -->
<newAdd :dialogVisible="dialogVisible" :id="id" @handleClose="handleClose"></newAdd>
<!-- 权限设置 -->
<permissionConfigure :permissionVisible="permissionVisible" :permissionInfo="permissionInfo" :flag="flag"
    @permissionClose="permissionClose"></permissionConfigure>
<!-- 查看报表 -->
<iframe id="iframe" frameborder="0" width="100%" height="100vh" :src="iframeURL" ="iframe-box" :style="iframeStyle"></iframe>
```

```js
computed: {
    // 报表高度
    iframeStyle() {
      return 'height: calc(100vh - 80px)'
    }
  },
//   查看报表
async queryDetail() {
      let res = await this.$api.viewReportDetail({ id: this.$route.query.id })
      if (res.code === 200) {
        this.iframeURL = res.data.url
      } else {
        this.codeToMessage(res.code)
      }
    }

// 权限
methods: {
    // 查询组织架构
    async query() {
      var res = await this.$api.getOrganization({
        reportConfigId:
          this.flag == 0 && this.permissionInfo[0]
            ? this.permissionInfo[0].id
            : ''
      })
      if (res.code === 200) {
        this.list = res.data
        this.list.forEach((item) => {
          if (item.authType === 1) {
            this.$nextTick(() => {
              this.$refs.organizationTree.getNode(
                item.organizationCode
              ).indeterminate = true
            })
          } else if (item.authType === 2) {
            this.$nextTick(() => {
              this.$refs.organizationTree.getNode(
                item.organizationCode
              ).checked = true
            })
          }
          this.setGroup(item)
        })
        // 首次查询
        this.oriData = this.list[0]
        await this.queryPerson()
      } else {
        this.codeToMessage(res.code)
      }
    },

    // 递归
    setGroup(obj) {
      // 判断是不是对象，对象里面是否有children
      if (typeof obj != 'object' || obj === null || !obj.children) {
        return
      }
      // 循环children，获取authType != 0的对象
      obj.children.forEach((item) => {
        if (item.authType === 1) {
          this.$nextTick(() => {
            this.$refs.organizationTree.getNode(
              item.organizationCode
            ).indeterminate = true
          })
        } else if (item.authType === 2) {
          this.$nextTick(() => {
            this.$refs.organizationTree.getNode(
              item.organizationCode
            ).checked = true
          })
        }
        this.setGroup(item)
      })
    },
    // 点击树节点
    handleClick(data) {
      this.oriData = data
      this.queryPerson()
    },
    // 查询人员
    async queryPerson() {
      this.userData = []
      // 全选
      const arr = this.$refs.organizationTree
        ? this.$refs.organizationTree.getCheckedNodes().map((item) => {
            return item.organizationCode
          })
        : []
      const index = arr.indexOf(this.oriData.organizationCode)
      // 半选
      const list = this.$refs.organizationTree
        ? this.$refs.organizationTree.getHalfCheckedNodes().map((item) => {
            return item.organizationCode
          })
        : []
      const key = list.indexOf(this.oriData.organizationCode)
      this.emptyText = this.$t('common.table_loading_loading_text')
      var res = await this.$api.getUserByCode({
        reportConfigId:
          this.flag == 0 && this.permissionInfo[0]
            ? this.permissionInfo[0].id
            : '',
        orgCode: this.oriData.organizationCode,
        ...this.checkForm
      })
      if (res.code === 200) {
        // 已经选中的用户
        res.data.records.forEach((item) => {
          if (item.authType == 1) {
            item.authType = true
          } else {
            item.authType = false
          }
        })
        this.userData = res.data.records
        this.totalCount = res.data.total
        // 全选时的用户
        if (index != -1) {
          this.userData.forEach((val) => {
            val.authType = true
          })
        }
        // 半选中时的用户
        if (key != -1) {
          this.userData.forEach((e) => {
            this.userIds.forEach((el) => {
              if (e.employeeId === el) {
                e.authType = true
              }
            })
            this.deleUsers.forEach((v) => {
              if (e.employeeId === v) {
                e.authType = false
              }
            })
          })
        }
        if (index == -1 && key == -1) {
          this.userData.forEach((i) => {
            i.authType = false
          })
        }
      } else {
        this.codeToMessage(res.code)
      }
      this.emptyText = this.$t('common.table_loading_empty_text')
    },
    // 勾选树节点时
    handleCheckChange(val, checked, indeterminate) {
      if (val.organizationCode === this.oriData.organizationCode) {
        this.queryPerson()
      }
    },

    // 选择用户时
    handleDataChange(row) {
      this.organizationList = []
      const flag = this.userData.every((item) => {
        return item.authType == true
      }) // 是否全被选中
      const k = this.userData.every((val) => {
        return val.authType == false
      }) //是否全部没被选中
      const node = this.$refs.organizationTree.getNode(
        this.oriData.organizationCode
      )
      let employeeIdList = []
      let list = [] // 当前选择的数据s
      let arr = [] // 取消勾选的数据
      if (flag) {
        // 全部选中
        node.checked = true
        node.indeterminate = false
      } else if (!flag && !k) {
        // 部分选中
        node.checked = false
        node.indeterminate = true
        this.userData.forEach((el) => {
          if (el.authType == true) {
            employeeIdList.push(el.employeeId)
          } else {
            arr.push(el.employeeId)
          }
        })
        // 删除全选变半选的节点
        this.$refs.organizationTree.getCheckedNodes().forEach((i, index) => {
          if (node.data.organizationCode == i.organizationCode) {
            this.$refs.organizationTree.getCheckedNodes().splice(index, 1)
          }
        })
        this.deleUsers = [...new Set(this.deleUsers.concat(arr))]
        // 去重
        this.userIds = [...new Set(this.userIds.concat(employeeIdList))]
        this.deleUsers.forEach((i) => {
          var index = this.userIds.indexOf(i)
          if (index != -1) {
            this.userIds.splice(index, 1)
          }
        })
        list.push({
          organizationBelong: this.oriData.organizationCode,
          employeeIdList: employeeIdList
        })
        // 去重
        this.organizationList = module.uniqeList({
          dataList: this.organizationList.concat(list),
          checkInfo: ['organizationBelong']
        })
      } else {
        // 全部没被选中
        node.checked = false
        node.indeterminate = false
      }
    },
    // 权限设置
    permissionSave() {
      // 全选
      if (this.$refs.organizationTree.getCheckedNodes().length != 0) {
        this.$refs.organizationTree.getCheckedNodes().forEach((item) => {
          this.organizationList.push({
            employeeIdList: [],
            organizationBelong: item.organizationCode
          })
        })
      }

      // 判断是否未勾选组织架构
      if (
        this.$refs.organizationTree.getCheckedNodes().length == 0 &&
        this.$refs.organizationTree.getHalfCheckedNodes().length == 0
      ) {
        this.$confirm(
          this.$t('page_report.message_per'),
          this.$t('page_report.message_tip_per'),
          {
            cancelButtonText: this.$t('page_report.btn_cancel'),
            confirmButtonText: this.$t('page_report.btn_confirm'),
            type: 'warning'
          }
        )
          .then(async () => {
            this.organizationList = []
            await this.confirmPermission()
          })
          .catch(() => {
            this.query()
          })
      } else {
        this.confirmPermission()
      }
    },
    async confirmPermission() {
      // 单个设置权限
      if (this.flag == 0) {
        const res = await this.$api.permissionConfig({
          organizationList: this.organizationList,
          reportConfigId: this.permissionInfo[0].id
        })
        if (res.code === 200) {
          this.$message.success(this.$t('page_report.success_per_info'))
        } else {
          this.codeToMessage(res.code)
        }
      } else {
        // 批量设置权限
        const res = await this.$api.permissionBatchConfig({
          organizationList: this.organizationList,
          reportConfigIdList: this.permissionInfo.map((item) => {
            return item.id
          })
        })
        if (res.code === 200) {
          this.$message.success(this.$t('page_report.success_per_info'))
        } else {
          this.codeToMessage(res.code)
        }
      }
      this.permissionClose()
      this.query()
    },
    permissionClose() {
      this.$emit('permissionClose')
    },
    handleSizeChange(val) {
      this.checkForm.pageSize = val
      this.queryPerson()
    },
    handleCurrentChange(val) {
      this.checkForm.pageNum = val
      this.queryPerson()
    },
    // 修改table header的背景色
    tableHeaderColor
  }


```

### 学习心得

- 代码有点复杂，可以优化一下
