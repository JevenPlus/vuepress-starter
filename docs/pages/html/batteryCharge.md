#### 充电动画

``` html
<div class="container">
  <div class="text">%</div>
  <div class="content-wraper">
    <div class="round"></div>
    <ul class="chassis">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</div>
```

``` css
html,
body {
  margin: 0;
  padding: 0;
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.container {
  width: 300px;
  height: 600px;
  margin: auto;
  position: relative;
}

.container .text {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  z-index: 999;
  font-weight: bold;
}

.container .content-wraper {
  background-color: #000;
  width: 300px;
  height: 600px;
  position: relative;
  overflow: hidden;
  filter: contrast(10) hue-rotate(0);
  animation: hueRotate 10s infinite linear;
}

.container .content-wraper .round {
  width: 300px;
  height: 300px;
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  filter: blur(8px);
}

.container .content-wraper .round::after {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #00ff2a;
  width: 200px;
  height: 200px;
  border-radius: 42% 38% 62% 49% / 45%;
  animation: rotate 10s infinite linear;
}

.container .content-wraper .round::before {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 175px;
  height: 175px;
  background-color: #000;
  z-index: 10;
  border-radius: 50%;
}

.container .content-wraper .chassis {
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  left: 50%;
  bottom: 0%;
  width: 120px;
  height: 40px;
  border-radius: 100px 100px 0 0;
  background-color: #00ff2a;
  transform: translate(-50%, 0);
  filter: blur(4px);
}

.container .content-wraper .chassis li {
  position: absolute;
  border-radius: 50%;
  background-color: #00ff2a;
}

.container .content-wraper .chassis li:nth-child(0) {
  left: 76px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  animation: toTop 3s ease-in-out -3.295s infinite;
}

.container .content-wraper .chassis li:nth-child(1) {
  left: 71px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 21px;
  height: 21px;
  animation: toTop 7s ease-in-out -3.619s infinite;
}

.container .content-wraper .chassis li:nth-child(2) {
  left: 84px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  animation: toTop 5s ease-in-out -3.855s infinite;
}

.container .content-wraper .chassis li:nth-child(3) {
  left: 18px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  animation: toTop 3s ease-in-out -3.889s infinite;
}

.container .content-wraper .chassis li:nth-child(4) {
  left: 56px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 17px;
  height: 17px;
  animation: toTop 6s ease-in-out -2.564s infinite;
}

.container .content-wraper .chassis li:nth-child(5) {
  left: 71px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 23px;
  height: 23px;
  animation: toTop 4s ease-in-out -3.518s infinite;
}

.container .content-wraper .chassis li:nth-child(6) {
  left: 63px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  animation: toTop 7s ease-in-out -1.623s infinite;
}

.container .content-wraper .chassis li:nth-child(7) {
  left: 53px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  animation: toTop 8s ease-in-out -2.118s infinite;
}

.container .content-wraper .chassis li:nth-child(8) {
  left: 17px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  animation: toTop 8s ease-in-out -3.261s infinite;
}

.container .content-wraper .chassis li:nth-child(9) {
  left: 71px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  animation: toTop 7s ease-in-out -3.621s infinite;
}

.container .content-wraper .chassis li:nth-child(10) {
  left: 80px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 19px;
  height: 19px;
  animation: toTop 8s ease-in-out -3.077s infinite;
}

.container .content-wraper .chassis li:nth-child(11) {
  left: 74px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  animation: toTop 3s ease-in-out -3.348s infinite;
}

.container .content-wraper .chassis li:nth-child(12) {
  left: 30px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  animation: toTop 3s ease-in-out -2.012s infinite;
}

.container .content-wraper .chassis li:nth-child(13) {
  left: 53px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 26px;
  height: 26px;
  animation: toTop 7s ease-in-out -3.428s infinite;
}

.container .content-wraper .chassis li:nth-child(14) {
  left: 28px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  animation: toTop 3s ease-in-out -2.212s infinite;
}

.container .content-wraper .chassis li:nth-child(15) {
  left: 73px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 17px;
  height: 17px;
  animation: toTop 3s ease-in-out -0.405s infinite;
}

.container .content-wraper .chassis li:nth-child(16) {
  left: 23px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 25px;
  height: 25px;
  animation: toTop 6s ease-in-out -1.762s infinite;
}

@keyframes hueRotate {
  100% {
    filter: contrast(15) hue-rotate(360deg);
  }
}

@keyframes rotate {
  50% {
    border-radius: 45% / 42% 38% 58% 49%;
  }

  100% {
    transform: translate(-50%, -50%) rotate(720deg);
  }
}

@keyframes toTop {
  80% {
    opacity: 1;
  }

  100% {
    opacity: 0.1;
    transform: translate(-50%, -280px);
  }
}
```

``` js
let precent = 0

const el = document.querySelector('.text')

let timer = null

clearInterval(timer)
timer = setInterval(() => {
  precent = +(precent + 0.1).toFixed(1)
  if (precent > 100) {
    clearInterval(timer)
    return
  }
  el.innerText = precent + '%'
}, 200)
```