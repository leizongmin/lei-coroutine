'use strict';

/**
 * lei-coroutine tests
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const expect = require('chai').expect;
const bluebird = require('bluebird');
const coroutine = require('../');

describe('lei-coroutine', function () {

  it('wrap - __generatorFunction__', function () {
    function* hello(world) {
      yield world;
      return `hello, ${ world }`;
    }
    const fn = coroutine.wrap(hello);
    // console.log(fn);
    expect(fn.__generatorFunction__).to.equal(hello);
  });

  it('wrap - __sourceLocation__', function () {
    const fn = coroutine.wrap(function* hello(world) {
      yield world;
      return `hello, ${ world }`;
    });
    // console.log(fn);
    expect(fn.__sourceLocation__).to.deep.equal({
      file: __filename,
      line: 26,
      column: 26,
      info: `${ __filename }:26:26`,
    });
  });

  it('wrap', function () {
    const fn = coroutine.wrap(function* () {
      yield coroutine.delay(122);
      return yield coroutine.delay(125);
    });
    return fn().then(ret => {
      // console.log(ret);
      expect(ret).to.equal(125);
    });
  });

  it('exec', function () {
    return coroutine(function* () {
      yield coroutine.delay(111);
      return yield coroutine.delay(222);
    }).then(ret => {
      // console.log(ret);
      expect(ret).to.equal(222);
    });
  });

  it('exec - with args', function () {
    return coroutine(function* (a, b) {
      const c = yield coroutine.delay(a);
      const d = yield coroutine.delay(b);
      return [ c, d ];
    }, 123, 321).then(ret => {
      // console.log(ret);
      expect(ret).to.deep.equal([ 123, 321 ]);
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
      // console.log(err);
      expect(err.message).to.equal('test');
    });
  });

  it('exec - try catch error', function () {
    return coroutine(function* () {
      try {
        yield coroutine.delay(111);
        yield coroutine.delay(110);
        throw new Error('test');
      } catch (err) {
        expect(err.message).to.equal('test');
        throw new Error('test2');
      }
    }).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      // console.log(err);
      expect(err.message).to.equal('test2');
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
        expect(err.message).to.equal('test3');
        throw new Error('test2');
      }
    }).then(ret => {
      throw new Error('must throws error');
    }).catch(err => {
      // console.log(err);
      expect(err.message).to.equal('test2');
    });
  });

  it('exec - can yield not a promise', function () {
    return coroutine(function* () {
      yield coroutine.delay(111);
      yield coroutine.delay(110);
      return yield 12345;
    }).then(ret => {
      // console.log(ret);
      expect(ret).to.equal(12345);
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
      expect(ret).to.deep.equal([[ 1, 2 ], [ 4, 3 ]]);
    });
  });

  it('asCallback', function (done) {
    coroutine.asCallback(function* () {
      yield coroutine.delay(111);
      return yield coroutine.delay(222);
    }, (err, ret) => {
      if (err) return done(err);
      expect(ret).to.equal(222);
      done();
    });
  });

  it('asCallback - with args', function (done) {
    coroutine.asCallback(function* (a, b) {
      const c = yield coroutine.delay(a);
      const d = yield coroutine.delay(b);
      return [ c, d ];
    }, 123, 321, (err, ret) => {
      if (err) return done(err);
      expect(ret).to.deep.equal([ 123, 321 ]);
      done();
    });
  });

  it('asCallback - error', function (done) {
    coroutine.asCallback(function* () {
      yield coroutine.delay(111);
      yield coroutine.delay(110);
      throw new Error('test');
    }, (err, ret) => {
      if (!err) return done(new Error('must throws error'));
      expect(err.message).to.equal('test');
      done();
    });
  });

  it('wrap - keep parameters info', function () {
    function firstLine(str) {
      return str.split('\n')[0];
    }
    {
      const fn = coroutine.wrap(function* () {});
      // console.log(fn.toString());
      expect(fn.length).to.equal(0);
      expect(firstLine(fn.toString())).to.equal('function () {');
    }
    {
      // eslint-disable-next-line
      const fn = coroutine.wrap(function* ( a, b ) {});
      // console.log(fn.toString());
      expect(fn.length).to.equal(2);
      expect(firstLine(fn.toString())).to.equal('function ( a, b ) {');
    }
    {
      const fn = coroutine.wrap(function* haha() {});
      // console.log(fn.toString());
      expect(fn.length).to.equal(0);
      expect(firstLine(fn.toString())).to.equal('function haha() {');
    }
    {
      const fn = coroutine.wrap(function* haha(a, b, c) {});
      // console.log(fn.toString());
      expect(fn.length).to.equal(3);
      expect(firstLine(fn.toString())).to.equal('function haha(a, b, c) {');
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
      expect(ret).to.deep.equal([[ 1, 2 ], [ 4, 3 ]]);
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
      expect(err.message).to.equal('test1');
    });
  });

  it('verify generator function', function () {
    expect(function () {
      coroutine.wrap(function hello() {});
    }).to.throw(/not a generator function/);
    expect(function () {
      coroutine.wrap();
    }).to.throw(/not a generator function/);
    expect(function () {
      coroutine.wrap(null);
    }).to.throw(/not a generator function/);
    expect(function () {
      coroutine.wrap('ok');
    }).to.throw(/not a generator function/);
    expect(function () {
      coroutine.wrap(123);
    }).to.throw(/not a generator function/);
    expect(function () {
      coroutine.wrap({});
    }).to.throw(/not a generator function/);
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
      // console.log(ret);
      expect(ret).to.equal(`123:456:${ p.time }`);
    }).then(() => {
      return coroutine.cb(p, p.getTime, 456, 789);
    }).then(ret => {
      // console.log(ret);
      expect(ret).to.equal(`456:789:${ p.time }`);
    });
  });

  it('cb(null, `method`, a, b) - throws error', function () {
    return coroutine.cb(null, 'getTime', 123, 456).then(ret => {
      // console.log(ret);
      throw new Error(`must throws error`);
    }).catch(err => {
      // console.log(err);
      expect(err.message).to.equal(`handler must be a function, but got type "string"`);
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
      // console.log(ret);
      expect(ret).to.equal(`123:456:${ time }`);
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
      // console.log(err);
      expect(err.message).to.equal(`123:456:${ time }`);
    });
  });

  it('cb(this, `method`, a, b) - method is not a function', function () {
    return coroutine.cb(this, `OOXXXXOO`, 123, 456).then(ret => {
      throw new Error(`must callback error`);
    }).catch(err => {
      // console.log(err);
      expect(err.message).to.equal(`handler "OOXXXXOO" must be a function, but got type "string"`);
    });
  });

  it('custom Promise', function (done) {
    const originPromise = coroutine.Promise;
    coroutine.Promise = bluebird;
    coroutine(function* () {
      yield coroutine.delay(50);
      return 12345;
    }).asCallback((err, ret) => {
      expect(err).to.be.null;
      expect(ret).to.equal(12345);
      done();
    });
    coroutine.Promise = originPromise;
  });

});
