module.exports = {
  title: "无忧达",
  description: "知识库",
  base: "/vuepress-starter/",
  // base: "./",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }], // 这个是标签页 logo
  ],
  markdown: {
    // 显示行号
    lineNumbers: false,
  },
  // theme: "vuepress-theme-onen",
  themeConfig: {
    lastUpdated: "上次更新",
    logo: "/img/blob.png", //网页顶端导航栏左上角的图标
    // 顶部导航栏
    nav: [
      {
        text: "前端三剑客",
        ariaLabel: "basic",
        items: [
          { text: "HTML+Css", link: "/pages/html/html.md" },
          { text: "JavaScript", link: "/pages/JavaScript/basic.md" },
          { text: "TypeScript", link: "/pages/TypeScript/BasicType.md" },
        ],
      },
      {
        text: "框架",
        ariaLabel: "frame",
        items: [
          { text: "Vue", link: "/pages/vue/columnMerge.md" },
          { text: "React", link: "/pages/react/React.md" },
          { text: "Flutter", link: "/pages/flutter/dart-grammar.md" },
        ],
      },
      {
        text: "Node",
        ariaLabel: "Node",
        items: [
          { text: "Express", link: "/pages/node/express/express.md" },
          { text: "Nest", link: "/pages/node/nest/nest.md" },
        ],
      },
      {
        text: "项目",
        ariaLabel: "project",
        items: [
          { text: "公司系统", link: "/pages/project/auth/jurisdiction.md" },
          { text: "WMS", link: "/pages/project/wms/wms.md" },
          { text: "PDA", link: "/pages/project/pda/abnormal.md" },
          { text: "CRM", link: "/pages/project/crm/framework.md" },
          { text: "供应商考核", link: "/pages/project/supplier/supplier.md" },
        ],
      },
      { text: "规范", link: "/pages/standard/git.md" },
      { text: "CodeReview", link: "/pages/codeReview/picking.md" },
      { text: "新人须知", link: "/pages/newcomers/newcomers.md" },
      { text: "JavaScript编码规范", link: "/pages/codeing/structure.md" },
    ],

    //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
    sidebar: {
      "/pages/html/": [
        {
          title: "HTML", // 一级菜单名称
          collapsable: false, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 1, //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
          children: [
            ["html.md", "Html"], //菜单名称为'子菜单1'，跳转至/pages/folder1/test1.md
          ],
        },
        {
          title: "Css",
          collapsable: false,
          children: [["css.md", "Css"]],
        },
      ],
      "/pages/JavaScript/": [
        {
          title: "JavaScript",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["basic.md", "基础语法"],
            ["skill.md", "技巧"],
            ["performance.md", "性能"],
          ],
        },
      ],
      "/pages/TypeScript/": [
        {
          title: "TypeScript",
          collapsable: false,
          sidebarDepth: 1,
          children: [["BasicType.md", "基础语法"]],
        },
      ],
      "/pages/vue/": [
        {
          title: "Vue",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["basic.md", "Vue的理解"],
            ["columnMerge.md", "el-table表格合并"],
          ],
        },
      ],
      "/pages/react/": [
        {
          title: "React",
          collapsable: false,
          sidebarDepth: 1,
          children: [["React.md", "React"]],
        },
      ],
      "/pages/flutter/": [
        {
          title: "Dart",
          collapsable: false,
          sidebarDepth: 1,
          children: [["dart-grammar.md", "Dart"]],
        },
        {
          title: "Flutter",
          collapsable: false,
          children: [["flutter-components.md", "Flutter"]],
        },
      ],
      "/pages/node/express/": [
        {
          title: "Express",
          collapsable: false,
          sidebarDepth: 1,
          children: [["express.md", "入门&上手"]],
        },
      ],
      "/pages/node/nest/": [
        {
          title: "Nest",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["nest.md", "Nest"],
            ["loginRegisterExample.md", "简单登录注册示例"],
          ],
        },
      ],
      "/pages/project/developManage/": [
        {
          title: "开发管理系统",
          collapsable: false,
          sidebarDepth: 1,
          children: [],
        },
      ],
      "/pages/project/auth/": [
        {
          title: "公司系统",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["jurisdiction.md", "权限管理系统"],
            ["development.md", "开发管理系统"],
          ],
        },
      ],
      "/pages/project/wms/": [
        {
          title: "WMS",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["wms.md", "WMS"],
            ["quotation.md", "报价单"],
            ["bill.md", "账单"],
          ],
        },
      ],
      "/pages/project/pda/": [
        {
          title: "PDA",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["abnormal.md", "上架异常与收货异常"],
            ["putaway.md", "入库-上架"],
            ["return.md", "退件单"],
            ["inventory.md", "盘点单"],
            ["shiftSheet.md", "移位单"],
            ["issue.md", "出库"],
            ["warehouse.md", "库内"],
            ["second.md", "pda第二版"],
          ],
        },
      ],
      "/pages/project/supplier/": [
        {
          title: "海运KPI",
          collapsable: false,
          sidebarDepth: 1,
          children: [["supplier.md", "海运KPI"]],
        },
      ],
      "/pages/project/crm/": [
        {
          title: "PDA",
          collapsable: false,
          sidebarDepth: 1,
          children: [["framework.md", "项目架构"]],
        },
      ],
      "/pages/standard/": [
        {
          title: "规范",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["git.md", "Git"],
            ["eslint.md", "ESlint"],
            ["process.md", "开发流程"],
            ["branch.md", "分支管理"],
            ["edition.md", "版本管理"],
          ],
        },
      ],
      "/pages/codeReview/": [
        {
          title: "CodeReview",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["picking.md", "2022-11-10-肖柢"],
            ["basicsetBlackAndWhite.md", "2022-11-24-郑凯力"],
            ["receipt.md", "2022-12-01-刘宁刚"],
            ["adjustment.md", "2022-12-08-朱雪萍"],
            ["distribution.md", "2022-12-15-肖柢"],
            ["inventory.md", "2023-01-05-朱雪萍"],
            ["pda_abnormalGoods.md", "2023-01-12-郑凯力"],
            ["canvas.md", "2023-02-06-傅霓"],
            ["report.md", "2023-02-16-朱雪萍"],
            ["inboundPDA.md", "2023-03-09-郑凯力"],
            ["mergeTable.md", "2023-03-23-缪靖森"],
            ["pdaPallet.md", "2023-04-14-朱雪萍"],
          ],
        },
      ],
      "/pages/newcomers/": [
        {
          title: "新人须知",
          collapsable: false,
          sidebarDepth: 1,
          children: [["newcomers.md", "新人须知"]],
        },
      ],
      "/pages/codeing/": [
        {
          title: "JavaScript编码规范",
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ["structure.md", "结构"],
            ["name.md", "命名"],
            ["notes.md", "注释"],
          ],
        },
      ],
      // "/pages/Bug/": [
      //   {
      //     title: "Bug",
      //     collapsable: false,
      //     sidebarDepth: 1,
      //     children: [["vueBug.md", "Vue"]],
      //   },
      // ],
    },
  },
};

