'use strict';

/**
 * lei-coroutine tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const assert = require('assert');
const coroutine = require('../');

describe('lei-coroutine', function () {

  it('wrap - __generatorFunction__', function () {
    function* hello(world) {
      yield world;
      return `hello, ${ world }`;
    }
    const fn = coroutine.wrap(hello);
    console.log(fn);
    assert.equal(fn.__generatorFunction__, hello);
  });

  it('wrap - __sourceLocation__', function () {
    const fn = coroutine.wrap(function* hello(world) {
      yield world;
      return `hello, ${ world }`;
    });
    console.log(fn);
    assert.deepEqual(fn.__sourceLocation__, {
      file: __filename,
      line: 25,
      column: 26,
      info: `${ __filename }:25:26`,
    });
  });

  it('wrap', function () {
    const fn = coroutine.wrap(function* () {
      yield coroutine.delay(122);
      return yield coroutine.delay(125);
    });
    return fn().then(ret => {
      console.log(ret);
      assert.equal(ret, 125);
    });
  });

  it('exec', function () {
    return coroutine(function* () {
      yield coroutine.delay(111);
      return yield coroutine.delay(222);
    }).then(ret => {
      console.log(ret);
      assert.equal(ret, 222);
    });
  });

  it('exec - with args', function () {
    return coroutine(function* (a, b) {
      const c = yield coroutine.delay(a);
      const d = yield coroutine.delay(b);
      return [ c, d ];
    }, 123, 321).then(ret => {
      console.log(ret);
      assert.deepEqual(ret, [ 123, 321 ]);
    });
  });

  it('exec - error', function () {
    return coroutine(function* () {
      yield coroutine.delay(111);
      yield coroutine.delay(110);
      throw new Error('test');
    }).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      console.log(err);
      assert.equal(err.message, 'test');
    });
  });

  it('exec - try catch error', function () {
    return coroutine(function* () {
      try {
        yield coroutine.delay(111);
        yield coroutine.delay(110);
        throw new Error('test');
      } catch (err) {
        assert.equal(err.message, 'test');
        throw new Error('test2');
      }
    }).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      console.log(err);
      assert.equal(err.message, 'test2');
    });
  });

  it('exec - try catch error from yield', function () {
    const throwsError = coroutine.wrap(function* throwsError(msg) {
      yield coroutine.delay(10);
      throw new Error(msg);
    });
    return coroutine(function* () {
      try {
        yield throwsError('test3');
        throw new Error('test');
      } catch (err) {
        assert.equal(err.message, 'test3');
        throw new Error('test2');
      }
    }).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      console.log(err);
      assert.equal(err.message, 'test2');
    });
  });

  it('exec - can yield not a promise', function () {
    return coroutine(function* () {
      yield coroutine.delay(111);
      yield coroutine.delay(110);
      return yield 12345;
    }).then(ret => {
      console.log(ret);
      assert.equal(ret, 12345);
    });
  });

  it('exec - nest', function () {
    const test1 = coroutine.wrap(function* (a, b) {
      yield coroutine.delay(a);
      yield coroutine.delay(b);
      return [ a, b ];
    });
    const test2 = coroutine.wrap(function* (a, b) {
      yield coroutine.delay(a);
      yield coroutine.delay(b);
      return [ b, a ];
    });
    return coroutine(function* (a, b, c, d) {
      const ret1 = yield test1(a, b);
      const ret2 = yield test2(c, d);
      return [ ret1, ret2 ];
    }, 1, 2, 3, 4).then(ret => {
      assert.deepEqual(ret, [[ 1, 2 ], [ 4, 3 ]]);
    });
  });

  it('wrap - keep parameters info', function () {
    function firstLine(str) {
      return str.split('\n')[0];
    }
    {
      const fn = coroutine.wrap(function* () {});
      console.log(fn.toString());
      assert.equal(fn.length, 0);
      assert.equal(firstLine(fn.toString()), 'function () {');
    }
    {
      // eslint-disable-next-line
      const fn = coroutine.wrap(function* ( a, b ) {});
      console.log(fn.toString());
      assert.equal(fn.length, 2);
      assert.equal(firstLine(fn.toString()), 'function ( a, b ) {');
    }
    {
      const fn = coroutine.wrap(function* haha() {});
      console.log(fn.toString());
      assert.equal(fn.length, 0);
      assert.equal(firstLine(fn.toString()), 'function haha() {');
    }
    {
      const fn = coroutine.wrap(function* haha(a, b, c) {});
      console.log(fn.toString());
      assert.equal(fn.length, 3);
      assert.equal(firstLine(fn.toString()), 'function haha(a, b, c) {');
    }
  });

  it('parallel', function () {
    const test1 = coroutine.wrap(function* (a, b) {
      yield coroutine.delay(a);
      yield coroutine.delay(b);
      return [ a, b ];
    });
    const test2 = coroutine.wrap(function* (a, b) {
      yield coroutine.delay(a);
      yield coroutine.delay(b);
      return [ b, a ];
    });
    return coroutine(function* (a, b, c, d) {
      return yield coroutine.parallel([
        test1(a, b),
        test2(c, d),
      ]);
    }, 1, 2, 3, 4).then(ret => {
      assert.deepEqual(ret, [[ 1, 2 ], [ 4, 3 ]]);
    });
  });

  it('parallel - error', function () {
    const test1 = coroutine.wrap(function* (a, b) {
      yield coroutine.delay(a);
      yield coroutine.delay(b);
      throw new Error('test1');
    });
    const test2 = coroutine.wrap(function* (a, b) {
      yield coroutine.delay(a);
      yield coroutine.delay(b);
      throw new Error('test2');
    });
    return coroutine(function* (a, b, c, d) {
      return yield coroutine.parallel([
        test1(a, b),
        test2(c, d),
      ]);
    }, 1, 2, 3, 4).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      assert.equal(err.message, 'test1');
    });
  });

  it('verify generator function', function () {
    assert.throws(function () {
      coroutine.wrap(function hello() {});
    }, /not a generator function/);
    assert.throws(function () {
      coroutine.wrap();
    }, /not a generator function/);
    assert.throws(function () {
      coroutine.wrap(null);
    }, /not a generator function/);
    assert.throws(function () {
      coroutine.wrap('ok');
    }, /not a generator function/);
    assert.throws(function () {
      coroutine.wrap(123);
    }, /not a generator function/);
    assert.throws(function () {
      coroutine.wrap({});
    }, /not a generator function/);
  });

  it('cb(this, `method`, a, b)', function () {
    class Person {
      constructor() {
        this.time = Date.now();
      }
      getTime(a, b, callback) {
        setImmediate(() => {
          callback(null, `${ a }:${ b }:${ this.time }`);
        });
      }
    }
    const p = new Person();
    return coroutine.cb(p, 'getTime', 123, 456).then(ret => {
      console.log(ret);
      assert.equal(ret, `123:456:${ p.time }`);
    }).then(() => {
      return coroutine.cb(p, p.getTime, 456, 789);
    }).then(ret => {
      console.log(ret);
      assert.equal(ret, `456:789:${ p.time }`);
    });
  });

  it('cb(null, `method`, a, b) - throws error', function () {
    return coroutine.cb(null, 'getTime', 123, 456).then(ret => {
      console.log(ret);
      throw new Error(`must throws error`);
    }).catch(err => {
      console.log(err);
      assert.equal(err.message, `handler must be a function, but got type "string"`);
    });
  });

  it('cb(null, fn, a, b)', function () {
    const time = Date.now();
    function getTime(a, b, callback) {
      setImmediate(() => {
        callback(null, `${ a }:${ b }:${ time }`);
      });
    }
    return coroutine.cb(null, getTime, 123, 456).then(ret => {
      console.log(ret);
      assert.equal(ret, `123:456:${ time }`);
    });
  });

  it('cb(null, fn, a, b) - callback error', function () {
    const time = Date.now();
    function getTime(a, b, callback) {
      setImmediate(() => {
        callback(new Error(`${ a }:${ b }:${ time }`));
      });
    }
    return coroutine.cb(null, getTime, 123, 456).then(ret => {
      throw new Error(`must callback error`);
    }).catch(err => {
      console.log(err);
      assert.equal(err.message, `123:456:${ time }`);
    });
  });

});
