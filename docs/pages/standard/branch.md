### 分支管理
#### 分支说明(以WMS项目为例)
 |分支|说明|
 |:-  |:-   |
 |develop|开发测试环境分支|
 |work|阿里测试测试环境分支|
 |updateWork|修复work bug分支|
 |release|海外仓测试环境分支|
 |updateRelease|修复release bug分支|
 |prod|海外仓正式环境分支|
 |updateProd|修复prod bug分支|

#### 分支管理
 1. 每个项目创建自己的分支
 2. 开发未完成的内容每日提交到自己的分支
 3. 开发、联调完成的内容提交到自己的分支，合并到`develop`分支
 4. develop环境自测完成，进行提测
 5. 提测，合并到`work`和`updateWork`分支
 6. 测试提出bug需在`updateWork`分支修改，修复后提交到`updateWork`分支，合并到`work`分支，需要将`updateWork`分支的代码`merge`到自己的分支
 7. 同理，海外仓环境、海外仓正式环境的bug提交参考第6条
 8. 每次更新需填写版本更新记录

#### 特殊说明
 1. 为给测试留时间进行需上线新需求的测试，及修复bug的回归验证，每周三，周四bug修复需在`updateWork`分支下修复，进行提交，合并
 2. 新需求仍然是在自己的分支进行开发
 3. 周三，周四`work`与`updateWork`环境下不再提交新内容