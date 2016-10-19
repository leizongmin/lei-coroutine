# lei-coroutine
Simple coroutine library

## Installation

```bash
$ npm install lei-coroutine --save
```

## Usage

```javascript
'use strict';

const coroutine = require('lei-routine');

// wrap
const fn = coroutine.wrap(function* (a) {
  yield coroutine.delay(a);
});
fn(100).then(ret => console.log(ret)).catch(err => console.error(err));

// exec
coroutine(function* (a) {
  yield coroutine.delay(a);
}, 100).then(ret => console.log(ret)).catch(err => console.error(err));

// parallel
coroutine(function* (a, b) {
  yield coroutine.parallel(
    coroutine.delay(a),
    coroutine.delay(b)
  );
}, 100, 120).then(ret => console.log(ret)).catch(err => console.error(err));
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
