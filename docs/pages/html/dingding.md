#### 钉钉官网

``` html
<header>
  <h1>Header</h1>
</header>
<div class="container-wraper">
  <!--动画区域-->
  <div class="ani-container">
    <!--视口-->
    <ul class="list">
      <li order="0" class="item">A</li>
      <li order="1" class="item">B</li>
      <li order="2" class="item">C</li>
      <li order="3" class="item">D</li>
      <li order="2" class="item">E</li>
      <li order="1" class="item">F</li>
      <li order="0" class="item">G</li>
      <li order="0" class="item">G</li>
      <li order="1" class="item">F</li>
      <li order="2" class="item">E</li>
      <li order="3" class="item">D</li>
      <li order="2" class="item">C</li>
      <li order="1" class="item">B</li>
      <li order="0" class="item">A</li>
    </ul>
  </div>
</div>
<footer>
  <h1>Footer</h1>
</footer>
```

``` css
html,
body,
ul {
  margin: 0;
  padding: 0;
}

header h1,
footer h1 {
  line-height: 100vh;
  color: gray;
  text-align: center;
}

.container-wraper {
  height: 300vh;
  background-color: #000;
  position: relative;
}

.container-wraper .ani-container {
  height: 100vh;
  width: 100%;
  position: sticky;
  top: 0;
  left: 0;
  display: flex;
}

.container-wraper .ani-container .list {
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  width: 980px;
  position: relative;
}

.container-wraper .ani-container .list .item {
  width: 80px;
  height: 80px;
  margin: 60px 30px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.container-wraper .ani-container .list .item:nth-child(1) {
  background-color: #026EFF;
}

.container-wraper .ani-container .list .item:nth-child(2) {
  background-color: #00A445;
}

.container-wraper .ani-container .list .item:nth-child(3) {
  background-color: #FFB000;
}

.container-wraper .ani-container .list .item:nth-child(4) {
  background-color: #FF9300;
}

.container-wraper .ani-container .list .item:nth-child(5) {
  background-color: #FF8F00;
}

.container-wraper .ani-container .list .item:nth-child(6) {
  background-color: #FF662C;
}

.container-wraper .ani-container .list .item:nth-child(7) {
  background-color: #1B9AEE;
}

.container-wraper .ani-container .list .item:nth-child(8) {
  background-color: #C8EDFF;
}

.container-wraper .ani-container .list .item:nth-child(9) {
  background-color: #0C8CFF;
}

.container-wraper .ani-container .list .item:nth-child(10) {
  background-color: #0C8CFF;
}

.container-wraper .ani-container .list .item:nth-child(11) {
  background-color: #0C8CFF;
}

.container-wraper .ani-container .list .item:nth-child(12) {
  background-color: #0C8CFF;
}

.container-wraper .ani-container .list .item:nth-child(13) {
  background-color: #0C8CFF;
}

.container-wraper .ani-container .list .item:nth-child(14) {
  background-color: #0C8CFF;
}
```

``` js
const items = document.querySelectorAll('.item')
const containerWraper = document.querySelector('.container-wraper')
// 主要函数，类似函数f(x) = kx + b 得出最终的y
const list = document.querySelector('.list')
function fx(minX, maxX, minY, maxY) {
  return function (x) {
    if (x < minX) {
      return minY
    }
    if (x > maxX) {
      return maxY
    }
    // 类似函数y = kx + b
    return ((maxY - minY) / (maxX - minX)) * (x - minX) + minY
  }
}

// 节点以及对应的样式属性
// dom作为属性， 对象为值， 对象中 需要更新的样式属性名作为对象的属性名，结果作为值
const propObj = new Map()
// 辅助方法，生成每个节点应该更新的属性
function getDomStylePropValue(dom, minX, maxX) {

  // 添加顺序，不同的x决定y的变化
  minX = minX + dom.getAttribute('order') * 300
  const opacity = fx(minX, maxX, 0, 1)
  const scale = fx(minX, maxX, 0, 1)
  const tx = fx(minX, maxX, list.clientWidth / 2 - dom.offsetLeft - dom.clientWidth / 2, 0)
  const ty = fx(minX, maxX, list.clientHeight / 2 - dom.offsetTop - dom.clientHeight / 2, 0)
  const transform = function (x) {
    return `translate(${tx(x)}px, ${ty(x)}px) scale(${scale(x)})`
  }

  return {
    opacity,
    transform
  }
}

// 填充propObj
function fillPropToObj() {
  propObj.clear()
  // 获取容器位置以及几何信息
  const containerWraperRect = containerWraper.getBoundingClientRect()
  const minX = containerWraperRect.top + window.scrollY
  // 容器containerWraper触摸到顶部，开始有变化
  // 容器containerWraper底部触摸到可视窗口底部开始不再变化
  const maxX = containerWraperRect.bottom + window.scrollY - window.innerHeight

  items.forEach(dom => {
    propObj.set(dom, getDomStylePropValue(dom, minX, maxX))
  })
}

// 更新样式属性
function updateStyleAttr() {
  for (const [dom, value] of propObj) {
    Object.keys(value).forEach(prop => {
      dom.style[prop] = value[prop](window.scrollY)
      console.log(prop, value[prop](window.scrollY));
    })
  }
}

fillPropToObj()
updateStyleAttr()

window.addEventListener('scroll', updateStyleAttr)
```