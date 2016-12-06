import coroutine = require('./');

coroutine<void>(function* () {
  yield 123;
});

coroutine<number>(function* () {
  yield 123;
  return 456;
})
  .then((ret) => {
    console.log(ret.toFixed(2));
  })
  .catch((err: Error) => {
    console.log(err);
  });

coroutine.exec(function* () {
  yield 123;
});

coroutine.wrap(function* () {
  yield coroutine.delay(10);
})().then(ret => console.log(ret));

coroutine.asCallback(function* () {
  yield coroutine.parallel([
    coroutine.delay(10),
    coroutine.delay(12),
  ]);
  return 10;
}, (err: Error, ret: any) => {
  console.log(err, ret);
});

coroutine.cb(null, "123").then(ret => console.log(ret));
coroutine.cb(this, function () {}, 1, 2, "aaa").catch(err => console.log(err));

const fn = coroutine.wrap(function* () {
  yield 123;
});
fn.__generatorFunction__;
fn.__sourceLocation__.column;
fn.__sourceLocation__.file;
fn.__sourceLocation__.info;
fn.__sourceLocation__.line;
fn(1, 2, 3).catch(err => console.log(err));

const wrapped = coroutine.wrap<string>(function* (a: number, b: number) {
  return yield "aaa";
});
wrapped(123, 456).then(ret => {
  console.log(ret.toUpperCase());
});
