'use strict';

/**
 * lei-coroutine
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

/**
 * 检查是否为 Promise 对象
 *
 * @param {Object} p
 * @return {Boolean}
 */
function isPromise(p) {
  return typeof p.then === 'function' && typeof p.catch === 'function';
}

/**
 * 将 generator 函数转化为执行后返回 Promise 的函数
 *
 * @param {Function} genFn
 * @return {Function}
 */
function genFnToPromise(genFn) {
  return function () {
    return new Promise((resolve, reject) => {
      const gen = genFn.apply(null, arguments);
      function next(value) {
        const ret = gen.next(value);
        // 如果 done=true 则表示结束
        if (ret.done) return resolve(ret.value);
        // 如果是 promise 则执行
        if (isPromise(ret.value)) return ret.value.then(next).catch(reject);
        // 其他值则报错
        return reject(new TypeError(`you can only yield promise but got type ${ typeof ret.value }`));
      }
      // 开始执行
      next();
    });
  };
}

/**
 * coroutine 包装函数
 *
 * @param {Function} genFn
 * @return {Function}
 */
function wrap(genFn) {
  // 包装 generator 函数
  const fn = genFnToPromise(genFn);
  // 保留函数名和参数信息
  const info = genFn.toString().match(/function\s*\*\s*(.*\(.*\))/);
  const sign = info && info[1] ? info[1] : '()';
  const code =
`(function ${ sign } {
  return fn.apply(this, arguments);
})`;
  return eval(code);
}

/**
 * 执行 coroutine 函数
 *
 * @param {Function} genFn
 * @param {Mixed} param1
 * @param {Mixed} param2
 * @return {Promise}
 */
function exec(genFn) {
  return wrap(genFn).apply(this, Array.prototype.slice.call(arguments, 1));
}

/**
 * 暂停
 *
 * @param {Number} ms
 */
function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, ms);
  });
}

/**
 * 并行执行多个 Promise 任务
 *
 * @param {Array} list
 */
function parallel(list) {
  return new Promise((resolve, reject) => {
    const result = [];
    let finishCount = 0;
    list.forEach((p, i) => {
      p.then(ret => {
        result[i] = ret;
        finishCount += 1;
        if (finishCount >= list.length) {
          resolve(result);
        }
      }).catch(err => {
        return reject(err);
      });
    });
  });
}

module.exports = exports = exec;
exports.exec = exec;
exports.wrap = wrap;
exports.delay = delay;
exports.parallel = parallel;
