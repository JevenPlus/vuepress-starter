### 将字符串变为数字
 - 位运算符
``` js
let str = '2'
// 常规操作
console.log(Number(2))
// 位运算符
console.log(~~str)
```
**解析：**<br>
**JS中有~是按位取反运算，～～用来做双非按位取反运算**
~~的作用是去掉小数部分，对于正数，向下取整；对于负数，向上取整；与Math.floor()不同的是，他只是单纯的去掉小数部分，不论正负都不会改变整数部分。
``` js
~~null; // 0
~~undefined; // 0
~~NaN; // 0
~~0; // 0
~~{}; // 0
~~[]; // 0
~~(1/0); // 0
~~false; // 0
~~true; // 1
~~1.9; // 1
~~-1.9; // -1
```
 - 加减运算符
``` js
let str = '2';
console.log(+str); // 2
```
**解析：**<br>
**JS中的'+'号**
当用作单目操作运算符的时候，+操作符不会对Number类型产生影响。但是如果应用在字符串类型上，会将其转换为数字。
``` js
let a = 25;
a =+ a;
console.log(25); // 25
let b = '50';
console.log(typeof b); // String
b =+ b;
console.log(typeof b); // Number
```
通常使用+操作符可以快速地将字符串转换为数字。但是如果字符串字面量无法转化为数字的时候，结果会出人意料。
``` js
let a = "kangkang";
a =+ a;
console.log(a); // NaN
console.log(typeof a); // Number
let b = '';
b =+ b;
console.log(b); // 0
console.log(typeof b); // Number
```

### 数组扁平化
``` js
let arr = [1,2,[3,4,[5,6]]]
// 常规操作
function flatten(arr) {
  while(arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}
console.log(flatten(arr)); // [1,2,3,4,5,6]
// ES6语法
console.log(arr.flat(Infinity)); // [1,2,3,4,5,6]
```
**解析：**<br>
利用`ES6`中的`flat`方法来实现数组扁平化。`flat(depth)`，`depth`是需要传递的参数，表示传递数组的展开深度(默认不甜，为1)，即展开一层数组。如果层数不确定，参数可以传进`Infinity(无穷)`，代表不论多少层都要展开。

### 扩展运算符的使用
1. 数组去重

``` js
let arr = [3, 5, 2, 2, 5];
let setArr = new Set(arr); // 返回set数据结构Set(3) {3, 5, 2}
// es6 ... 结构
let unique1 = [...setArr]; // [3, 5, 2]
// Array.form() 解析类数组为数组
let unique2 = Array.from(setArr); // [3, 5, 2]
```

2. 字符串去重
``` js
let str = "35225";
let unique = [...new Set(str)].join(""); // 352
```

3. 实现并集，交集和差集
``` js
let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);
// 并集
let union = new Set([...a, ...b]); // {1, 2, 3, 4}
// 交集
let intersect = new Set([...a].filter(x => b.has(x))); // set{2, 3}
// 差集
let difference = new Set([...a].filter(x => !b.has(x))); // set{1}
```

4. 将伪数组变为数组
``` js
let nodeList = document.querySelectorAll("div");
console.log([...nodeList]);
```

5. 配合rest运算符使用
``` js
function sunRest(...m) {
  var total = 0;
  for(var i of m) {
    total += i;
  }
  return total;
}
console.log(sunRest(1, 2, 3)); // 6
```

6. 数组排序
``` js
const sortNUmbers = (...numbers) => numbers.sort();
```

### 如何写好函数
1. **默认参数-在你的函数中使用默认参数**<br>
避免在你的函数中使用短路或条件来保持更清洁。 更重要的是，请记住，你的函数只会为未定义的参数提供值， 默认值不会替换任何其他虚假值。
``` js
// bad
function createMicrobrewery(name) {
  const breweryName = name || "KangKang";
}
// good
function createMicrobrewery(name = 'kangkang') {
  const breweryName = name;
}
```
2. **参数不宜过多-明智的使用函数参数**<br>
尽量将函数参数的数量限制在2个或最多 3 个。如果它需要这么多参数，则可能是你的函数做的太多了。 但是，如果仍然需要它，请使用 JavaScript 对象作为参数。 为了使函数期望的属性变得明显，可以使用ES6解构语法。
``` js
// BAD
function createMenu(title, body, buttonText, cancellable) {  
  // ...
}
createMenu("Foo", "Bar", "Baz", true);
// GOOD 
function createMenu({ title, body, buttonText, cancellable }) {
  // ...
}
createMenu({ title: "Foo", body: "Bar", buttonText: "Baz", cancellable: true});
```
3. **单一职责原则-函数应该只做一件事**<br>
不要忘记函数的作用——为你的代码添加模块化。 每个只执行一项任务的较小函数将确保你的代码易于编写、测试和理解。 永远不要为单个功能设置多个目标。
``` js
// BAD
function emailClients(clients) {
  clients.forEach(client => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);    
    }
  });
}
// GOOD 
function emailActiveClients(clients) { 
  clients.filter(isActiveClient).forEach(email);
}
function isActiveClient(client) {
  const clientRecord = database.lookup(client);  return clientRecord.isActive();
}
```