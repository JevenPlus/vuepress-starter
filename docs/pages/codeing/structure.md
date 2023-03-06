### 缩进
**[强制]使用一个`tab`作为一个缩进层级，不允许使用`2`个空格或`4`个空格**
**[强制]`switch`下的`case`和`default`必须增加一个缩进层级**
``` js
switch (variable) {
  case '1':
    // do...
    break;
  case '2':
    // do...
    break;
  default:
    // do...
}

// bad
switch (variable) {
case '1':
  // do...
  break;
case '2':
  // do...
  break;
default:
  // do...
}
```

### 空格
**[强制]二元运算符两侧必须有一个空格，一元运算符与操作对象之间不允许有空格**
``` js
var a = !arr.length
a++;
a = b + c;
```
**[强制]用作代码块起始的左花括号 `{` 前必须有一个空格**
``` js
// good
if (condition) {
}

while (condition) {
}

function funcName() {
}

// bad
if (condition){
}

while (condition){
}

function funcName(){
}
```

**[强制] if / else / for / while / function / switch / do / try / catch / finally 关键字后，必须有一个空格**
``` js
// good
if (condition) {
}

while (condition) {
}

(function () {
})();

// bad
if(condition) {
}

while(condition) {
}

(function() {
})();
```

**[强制] 在对象创建时，属性中的 : 之后必须有空格，: 之前不允许有空格**
``` js
// good
var obj = {
  a: 1,
  b: 2,
  c: 3
};

// bad
var obj = {
  a : 1,
  b:2,
  c :3
};
```

**[强制] 在对象创建时，属性中的 : 之后必须有空格，: 之前不允许有空格**
``` js
// good
var obj = {
  a: 1,
  b: 2,
  c: 3
};

// bad
var obj = {
  a : 1,
  b:2,
  c :3
};
```

**[强制] 函数声明、具名函数表达式、函数调用中，函数名和 ( 之间不允许有空格**
``` js
// good
function funcName() {
}

var funcName = function funcName() {
};

funcName();

// bad
function funcName () {
}

var funcName = function funcName () {
};

funcName ();
```

**[强制] , 和 ; 前不允许有空格**
``` js
// good
callFunc(a, b);

// bad
callFunc(a , b) ;
```

**[强制] 在函数调用、函数声明、括号表达式、属性访问、if / for / while / switch / catch 等语句中，() 和 [] 内紧贴括号部分不允许有空格**
``` js
// good

callFunc(param1, param2, param3);

save(this.list[this.indexes[i]]);

needIncream && (variable += increament);

if(num > list.length) {
}

while(len--) {
}


// bad

callFunc( param1, param2, param3 );

save( this.list[ this.indexes[ i ] ] );

needIncreament && ( variable += increament );

if ( num > list.length ) {
}

while ( len-- ) {
}
```

**[强制] 单行声明的数组与对象，如果包含元素，{} 和 [] 内紧贴括号部分不允许包含空格**  

声明包含元素的数组与对象，只有当内部元素的形式较为简单时，才允许写在一行。元素复杂的情况，还是应该换行书写。
``` js
// good
var arr1 = [];
var arr2 = [1, 2, 3];
var obj1 = {};
var obj2 = {name: 'obj'};
var obj3 = {
  name: 'obj',
  age: 20,
  sex: 1
};

// bad
var arr1 = [ ];
var arr2 = [ 1, 2, 3 ];
var obj1 = { };
var obj2 = { name: 'obj' };
var obj3 = {name: 'obj', age: 20, sex: 1};
```
**[强制] 行尾不得有多余的空格**

### 换行
**[强制] 每个独立语句结束后必须换行**
``` js
// good
const b = 1;
const c = 2;

// bad
const b = 1; const c = 2;
```

**[强制] 在函数声明、函数表达式、函数调用、对象创建、数组创建、for语句等场景中，不允许在 , 或 ; 前换行**
``` js
// good
var obj = {
  a: 1,
  b: 2,
  c: 3
};
foo(aVeryVeryLongArgument, anotherVeryLongArgument, callback);

// bad
var obj = {
  a: 1
  , b: 2
  , c: 3
};
foo(
  aVeryVeryLongArgument
  , anotherVeryLongArgument
  , callback
);
```

**[建议]根据逻辑条件合理缩进**
``` js
// 按一定长度截断字符串，并使用 + 运算符进行连接。
// 分隔字符串尽量按语义进行，如不要在一个完整的名词中间断开。
// 特别的，对于HTML片段的拼接，通过缩进，保持和HTML相同的结构。
var html = '' // 此处用一个空字符串，以便整个HTML片段都在新行严格对齐
  + '<article>'
  +     '<h1>Title here</h1>'
  +     '<p>This is a paragraph</p>'
  +     '<footer>Complete</footer>'
  + '</article>';

// 也可使用数组来进行拼接，相对 + 更容易调整缩进。
var html = [
  '<article>',
      '<h1>Title here</h1>',
      '<p>This is a paragraph</p>',
      '<footer>Complete</footer>',
  '</article>'
];
html = html.join('');
```

### 语句
**[强制] 不得省略语句结束的分号**
**[强制] 在 if / else / for / do / while 语句中，即使只有一行，也不得省略块 {...}**
``` js
// good
if (condition) {
  callFunc();
}

// bad
if (condition) callFunc();
if (condition)
    callFunc();
```

**[强制] 函数定义结束不允许添加分号**
``` js
// good
function funcName() {
}

// bad
function funcName() {
};

// 如果是函数表达式，分号是不允许省略的。
var funcName = function () {
};
```

**[强制] IIFE 必须在函数表达式外添加 (，非 IIFE 不得在函数表达式外添加 (**
``` js
// good
var task = (function () {
  // Code
  return result;
})();

var func = function () {
};


// bad
var task = function () {
  // Code
  return result;
}();

var func = (function () {
});
```
