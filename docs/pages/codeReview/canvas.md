### 主讲人：傅霓

### 面单绘制

### 2023-02-06

### 需求

前端绘制面单，高清晰度，可批量处理（100 张），内容可自适应宽高，在字数较多的时候缩小字体。

### 功能理解

- 实现方式的选择，手动画 vs html2canvas [github](https://github.com/niklasvh/html2canvas/blob/6020386bbe/src/index.ts)
- 是否需要上 web worker，是否可以上 web worker

### Code

```js
async printBill(canvasData) {
  let canvas = null

  switch (canvasData.printType) {
    case 'FEDEX_S':
      canvas = await renderBillS(canvasData)
      break
    case 'FEDEX_E':
      canvas = await renderBillE(canvasData)
      break
    case 'FEDEX_H':
      canvas = await renderBillH(canvasData)
      break
    case 'FEDEX_G':
      canvas = await renderBillG(canvasData)
      break
    case 'UPS_G':
      canvas = await renderBillUPS(canvasData)
      break
    case 'CANPAR_G':
      canvas = await renderBillCanpar(canvasData)
      break
    default:
      break
  }

  // for test
  // this.imgUrl.push(canvas.toDataURL('image/png')

  if (canvas) {
    printImgByBase64(
      [canvas.toDataURL('image/png')],
      [
        {
          printer: this.defaultPrint,
          printNum: 1
        }
      ]
    )
  }
}
```

```js
function init() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 288;
  const height = 432;
  const dpr = 4;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width * 2 + 'px';
  canvas.style.height = height * 2 + 'px';
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, Math.round(width * dpr), Math.round(height * dpr));

  return {
    canvas,
    ctx,
  };
}

function drawImage(ctx, url, x, y, w, h) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (w && h) {
        ctx.drawImage(img, x, y, w, h);
      } else {
        ctx.drawImage(img, x, y);
      }
      resolve();
    };
    img.src = url;
  });
}

/**
 * 绘制单行文本
 * @param {*} ctx
 * @param {*} text
 * @param {*} x
 * @param {*} y
 * @param {*} maxWidth
 */
function drawText(ctx, text, x, y, maxWidth) {
  let t = '';
  if (maxWidth) {
    const textWidth = ctx.measureText(text).width;
    if (textWidth > maxWidth) {
      let maxTextLetterCount =
        Math.floor((maxWidth / textWidth) * text.length) - 1;
      t = text.slice(0, maxTextLetterCount) + '...';
      while (ctx.measureText(t).width > maxWidth) {
        maxTextLetterCount--;
        t = text.slice(0, maxTextLetterCount) + '...';
      }
    } else {
      t = text;
    }
  } else {
    t = text;
  }
  ctx.fillText(t, x, y);
}

/**
 * 绘制多行文本
 * @param {*} ctx
 * @param {*} text
 * @param {*} x
 * @param {*} y
 * @param {*} w
 * @param {*} h
 * @param {*} fontSize
 * @param {*} lineHeight
 * @param {*} showEllipsis  是否展示省略号
 * @returns
 */
function drawRowsText(
  ctx,
  text,
  x,
  y,
  w,
  h,
  fontSize = 12,
  lineHeight = 14,
  showEllipsis = true
) {
  const textWidth = ctx.measureText(text).width;
  const inlinePaddingTop = Math.ceil((lineHeight - fontSize) / 2);

  // 不超过一行
  if (textWidth <= w) {
    ctx.fillText(text, x, y + inlinePaddingTop);
    return true;
  }
  const chars = text.split('');
  let _y = y;
  let line = '';
  for (const ch of chars) {
    const testLine = line + ch;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > w) {
      // 换行之后是否超过文本的高度
      if (_y + lineHeight * 2 > y + h) {
        if (showEllipsis) {
          // 不截断省略号
          while (ctx.measureText(line + '...').width > w) {
            line = line.slice(0, -1);
          }
          ctx.fillText(line + '...', x, _y + inlinePaddingTop);
        } else {
          ctx.clearRect(x, y, w, h);
          return false;
        }
      } else {
        ctx.fillText(line, x, _y + inlinePaddingTop);
        _y += lineHeight;
        line = ch;
      }
    } else {
      line = testLine;
    }
  }

  // 避免溢出
  if (_y + lineHeight <= y + h) {
    ctx.fillText(line, x, _y + inlinePaddingTop);
  }

  return true;
}

function generatorCode128(text, height) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, {
    height,
    margin: 0,
    displayValue: false,
  });
  return canvas.toDataURL('image/jpeg');
}

function generatorPdf417(text, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w * 2;
  canvas.height = h * 2;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  PDF417.draw(text, canvas, 2, 1);
  return canvas.toDataURL('image/png');
}
```
