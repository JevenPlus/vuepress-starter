### 命名
**[强制] 变量 使用 Camel命名法**
``` js
var loadingModules = {};
```

**[强制] 常量 使用 全部字母大写，单词间下划线分隔 的命名方式**
``` js
var HTML_ENTITY = {};
```

**[强制] 函数 使用 Camel命名法**
``` js
function stringFormat(source) {
}
```

**[强制] 函数的 参数 使用 Camel命名法**
``` js
function hear(theBells) {
}
```

**[强制] 类 使用 Pascal命名法**
``` js
class TextNode() {
}
```

**[强制] 类的 方法 / 属性 使用 Camel命名法**
``` js
function TextNode(value, engine) {
  this.value = value;
  this.engine = engine;
}

TextNode.prototype.clone = function () {
  return this;
};
```

**[强制] 命名空间 使用 Camel命名法**
``` js
equipments.heavyWeapons = {};
```

**强制] 由多个单词组成的缩写词，在命名中，根据当前命名法和出现的位置，所有字母的大小写与首字母的大小写保持一致**
``` js
function XMLParser() {
}

function insertHTML(element, html) {
}

var httpRequest = new HTTPRequest();
```

**[建议] boolean 类型的变量使用 is 或 has 开头**
``` js
var isReady = false;
var hasMoreCommands = false;
```
