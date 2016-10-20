'use strict';

/**
 * lei-coroutine tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const assert = require('assert');
const coroutine = require('../');

describe('lei-coroutine', function () {

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

  it('exec - cannot yield not a promise', function () {
    return coroutine(function* () {
      yield coroutine.delay(111);
      yield coroutine.delay(110);
      yield 12345;
    }).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      console.log(err);
      assert.equal(err.message, 'you can only yield promise but got type number');
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

});
