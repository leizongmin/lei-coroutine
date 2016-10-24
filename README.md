# lei-coroutine
简单的 coroutine 库

## 为什么要造这个轮子

实际上已经有两个大家所熟知的库实现了类似的功能：`co`和`bluebird`。
相比而言，这两个库的功能更强大，而且都久经考验。
但是我觉得它们也有各自的不足，以下是我造此轮子的理由：

+ `async function / await`是未来的主流，尽管现在的主流 JavaScript 引擎还没有支持。
  但是我们要统一异步函数的格式：全部返回`Promise`。
+ `co`支持的功能太过强大，可以`yield`的类型实在太多，
  而有时候我们只想要一个可以简单替换`async function / await`语法的方式。
  过多的功能会让人忍不住去使用，而未来替换的时候就更麻烦。
+ 此轮子实际上更多参考自`babel`的`_asyncToGenerator`函数。
  无论是`bluebird`还是`co`，在生成的包装函数中，**都没有保留原函数的名字和参数列表等信息**，
  在调试的时候会造成一些困难。


## 特点

+ **保留原函数名字和参数列表信息**
+ **返回的包装函数中包含了定义函数时的文件名及行号信息**
+ **支持`try catch`捕捉错误，可以达到与`async function`一样的效果**
+ 自带两个常用的函数`delay`（延迟，类似`setTimeout()`）和`parallel`（并发执行，类似`Promise.all()`）


## 安装

```bash
$ npm install lei-coroutine --save
```


## 使用方法

```javascript
'use strict';

const coroutine = require('lei-routine');

// 包装 generator 函数
const fn = coroutine.wrap(function* (a) {
  // coroutine.delay() 是内置的一个等待函数，效果类似于 setTimeout
  yield coroutine.delay(a);
});
fn(100).then(ret => console.log(ret)).catch(err => console.error(err));

// 直接执行 generator 函数
coroutine(function* (a) {
  yield coroutine.delay(a);
}, 100).then(ret => console.log(ret)).catch(err => console.error(err));

// 并行执行多个任务的例子
coroutine(function* (a, b) {
  yield coroutine.parallel([
    coroutine.delay(a),
    coroutine.delay(b),
  ]);
}, 100, 120).then(ret => console.log(ret)).catch(err => console.error(err));
```

## 与 async function / await 的替换

```javascript
'use strict';

const coroutine = require('lei-routine');

// 声明函数
async function fn(a) {
  // coroutine.delay() 是内置的一个等待函数，效果类似于 setTimeout
  await coroutine.delay(a);
}
fn(100).then(ret => console.log(ret)).catch(err => console.error(err));

// 直接执行
(async function (a) {
  await coroutine.delay(a);
})(100).then(ret => console.log(ret)).catch(err => console.error(err));

// 并行执行多个任务的例子
(async function (a, b) {
  await coroutine.parallel([
    coroutine.delay(a),
    coroutine.delay(b),
  ]);
})(100, 120).then(ret => console.log(ret)).catch(err => console.error(err));
```


## License

```
MIT License

Copyright (c) 2016 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
