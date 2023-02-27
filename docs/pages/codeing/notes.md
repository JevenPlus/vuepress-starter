### 注释

### 单行注释
**[强制] 必须独占一行。// 后跟一个空格，缩进与下一行被注释说明的代码一致**
``` js
// 获取表格数据
function getTableDataList() {
}
```

**[建议] 避免使用 /*...*/ 这样的多行注释。有多行注释内容时，使用多个单行注释**
``` js
// 如果 a == 1
// 创建一个变量 b 并赋值为2
if(a == 1) {
  let b = 2;
}
```

**[强制] 为了便于代码阅读和自文档化，以下内容必须包含以 /**...*/ 形式的块注释中**
1. 文件
2. namespace
3. 类
4. 函数或方法
6. 事件
9. AMD 模块  

**[强制] 文档注释前必须空一行**

### 函数/方法注释
**[强制] 函数/方法注释必须包含函数说明，有参数和返回值时必须使用注释标识**
**[强制] 参数和返回值注释必须包含类型信息和说明**
**[建议] 当函数是内部函数，外部不可访问时，可以使用 @inner 标识**
``` js
/**
 * @description 函数说明
 *
 * @param {string} p1 参数1的说明
 * @param {string} p2 参数2的说明，比较长
 *     那就换行了.
 * @param {number=} p3 参数3的说明（可选）
 * @return {Object} 返回值描述
 */
function foo(p1, p2, p3 = 10) {
  return {
    p1: p1,
    p2: p2,
    p3: p3
  };
}
```

**[建议] 重写父类方法时， 应当添加 @override 标识。如果重写的形参个数、类型、顺序和返回值类型均未发生变化，可省略 @param、@return，仅用 @override 标识，否则仍应作完整注释**  

简而言之，当子类重写的方法能直接套用父类的方法注释时可省略对参数与返回值的注释

### 类注释
**[建议] 使用 @class 标记类或构造函数**  

对于使用对象 constructor 属性来定义的构造函数，可以使用 @constructor 来标记

``` js
/**
 * @description 描述
 *
 * @class
 * @extends Developer
 */
function Fronteer() {
  Developer.call(this);
  // constructor body
}
util.inherits(Fronteer, Developer);
```

### 事件注释
**[强制] 必须使用 @event 标识事件，事件参数的标识与方法描述的参数标识相同**
``` js
/**
 * @description 描述
 *
 * @event
 * @param {Object} e e描述
 * @param {string} e.before before描述
 * @param {string} e.after after描述
 */
onchange: function (e) {
}
```

**[强制] 在会广播事件的函数前使用 @fires 标识广播的事件，在广播事件代码前使用 @event 标识事件**
**[建议] 对于事件对象的注释，使用 @param 标识，生成文档时可读性更好**
``` js
/**
 * @description 描述
 *
 * @fires Select#change
 * @private
 */
Select.prototype.clickHandler = function () {
  /**
   * 值变更时触发
   *
   * @event Select#change
   * @param {Object} e e描述
   * @param {string} e.before before描述
   * @param {string} e.after after描述
   */
  this.fire(
    'change',
    {
      before: 'foo',
      after: 'bar'
    }
  );
};
```

### 细节注释
对于内部实现、不容易理解的逻辑说明、摘要信息等，我们可能需要编写细节注释

**[建议] 细节注释遵循单行注释的格式。说明必须换行时，每行是一个单行注释的起始**
``` js
function foo(p1, p2) {
  // 这里对具体内部逻辑进行说明
  // 说明太长需要换行
  for (...) {
    ...
  }
}
```

**[强制] 有时我们会使用一些特殊标记进行说明。特殊标记必须使用单行注释的形式。下面列举了一些常用标记**
1. TODO: 有功能待实现。此时需要对将要实现的功能进行简单说明。
2. FIXME: 该处代码运行没问题，但可能由于时间赶或者其他原因，需要修正。此时需要对如何修正进行简单说明。
3. HACK: 为修正某些问题而写的不太好或者使用了某些诡异手段的代码。此时需要对思路或诡异手段进行描述。
4. XXX: 该处存在陷阱。此时需要对陷阱进行描述