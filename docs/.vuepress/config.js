module.exports = {
  title: '无忧达',
  description: '知识库',
  base: '/vuepress-starter/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }] // 这个是标签页 logo
  ],
  markdown: {
    lineNumbers: true
  },
  //下面涉及到的md文件和其他文件的路径下一步再详细解释
  themeConfig: {
    logo: '/img/blob.png',  //网页顶端导航栏左上角的图标
    //顶部导航栏
    nav: [
      { text: 'HTML+CSS', link: '/pages/html/html.md' },
      //格式一：直接跳转，'/'为不添加路由，跳转至首页
      {
        text: 'JavaScript',  //默认显示
        ariaLabel: 'JavaScript',   //用于识别的label
        items: [
          { text: 'JavaScript', link: '/pages/JavaScript/basic.md' },
          //点击标签会跳转至link的markdown文件生成的页面
          { text: 'TypeScript', link: '/pages/TypeScript/BasicType.md' },
        ]
      },
      { text: 'Vue', link: '/pages/vue/Vue.md' },
      { text: 'React', link: '/pages/react/React.md' },
      { text: 'Flutter', link: '/pages/flutter/dart-grammar.md' },
      //格式二：添加下拉菜单，link指向的文件路径
      {
        text: 'Node',  //默认显示
        ariaLabel: 'Node',   //用于识别的label
        items: [
          { text: 'Express', link: '/pages/node/express/express.md' },
          //点击标签会跳转至link的markdown文件生成的页面
          { text: 'Nest', link: '/pages/node/nest/nest.md' },
        ]
      },
      { text: 'CodeReview', link: '/pages/codeReview/picking.md' },
      { text: 'Bug', link: '/pages/Bug/vueBug.md' },
    ],

    //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
    sidebar: {
      '/pages/html/': [
        {
          title: 'HTML',   // 一级菜单名称
          collapsable: false, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 1,    //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
          children: [
            ['html.md', 'Html'],  //菜单名称为'子菜单1'，跳转至/pages/folder1/test1.md
          ]
        },
        {
          title: 'Css',
          collapsable: false,
          children: [
            ['css.md', 'Css']
          ]
        }
      ],
      '/pages/JavaScript/': [
        {
          title: 'JavaScript',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['basic.md', '基础语法']
          ]
        }
      ],
      '/pages/TypeScript/': [
        {
          title: 'TypeScript',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['BasicType.md', '基础语法']
          ]
        }
      ],
      '/pages/vue/': [
        {
          title: 'Vue',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['Vue.md', 'Vue']
          ]
        },
      ],
      '/pages/react/': [
        {
          title: 'React',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['React.md', 'React']
          ]
        }
      ],
      '/pages/flutter/': [
        {
          title: 'Dart',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['dart-grammar.md', 'Dart'],
          ]
        },
        {
          title: 'Flutter',
          collapsable: false,
          children: [
            ['flutter-components.md', 'Flutter']
          ]
        }
      ],
      '/pages/node/express/': [
        {
          title: 'Express',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['express.md', '入门&上手'],
          ]
        },
      ],
      '/pages/node/nest/': [
        {
          title: 'Nest',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['nest.md', 'Nest']
          ]
        },
      ],
      '/pages/codeReview/': [
        {
          title: 'CodeReview',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['picking.md', '2022-11-10-肖柢'],
            ['basicsetBlackAndWhite.md', '2022-11-24-郑恺力'],
            ['receipt.md', '2022-12-01-刘宁刚'],
          ]
        },
      ],
      '/pages/Bug/': [
        {
          title: 'Bug',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['vueBug.md', 'Vue']
          ]
        },
      ]
    },
  }
}

