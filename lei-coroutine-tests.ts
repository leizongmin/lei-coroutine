import coroutine = require('./');

coroutine(function* () {
  yield 123;
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
