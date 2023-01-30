### 项目介绍
`CRM`为"客户关系管理系统"。CRM是现代信息技术，经营思想的结合体。以"客户为中心"是CRM的核心所在。

### CRM原型图
[原型图地址](https://axhub.im/pro/10ca83e4bf92612b/#g=1&p=0_0%E7%99%BB%E5%BD%95)

### 项目框架
该项目使用**flutter + get**技术栈。具体版本号见**新人须知->前端框架**。

### 程序运行
查看该项目的Readme.md文件

### 项目文件介绍
 - android Android工程文件
 - build 项目的构建输出目录
 - fonts 系统字体配置
 - ios IOS工程文件
 - static 静态文件(图片等)
 - pubspec.yaml 项目依赖配置文件
 - lib 代码编写区
    - database 本地数据库(sqlLite)
    - http 网络请求
    - page 项目目录
      - customer 客户管理模块
      - home 首页模块
      - index 导航栏模块
      - mine 我的模块
      - schedule 日程模块
      - work 工作模块
      - forget_password.dart 忘记密码页
      - login.dart 登录页
      - register.dart 注册页
      - splash.dart 加载页
    - routers 项目模块路由
    - utils 项目公共方法
    - widgets 项目共用组件
    - application.dart 入口程序基类文件
    - main.dart 程序主入口
    - routes.dart 项目路由主文件

### 项目模块介绍
#### 首页
该模块包含一些快捷入口，消息提示，及该用户的当月目标，季度目标，年目标及完成进度。主要方便用户查看自己的目标及完成进度。
#### 客户
该模块为客户管理。列表中只显示属于该用户的客户。可以新增，修改客户信息。
#### 工作
该模块为管理销售的业绩及工作安排等。用户可以在这里实时查看自己设立的月目标，季度目标，年目标，及当前的进度。
#### 日程
该模块为方便用户方便查看自己的日程安排。用户可以添加自己的日程，到时间后在首页会显示该日程。
#### 我的
该模块主要包含我的个人信息，业绩目标等模块。
