'use strict';

/**
 * lei-coroutine
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

// Generator 函数原型
const GeneratorFunction = (function* () {}).constructor;

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
 * 检查是否为 Generator 函数
 *
 * @param {Function} genFn
 * @return {Boolean}
 */
function isGeneratorFunction(genFn) {
  return genFn instanceof GeneratorFunction;
}

/**
 * 获取源文件的位置信息
 *
 * @param {Number} offset
 * @return {Object}
 */
function getSourceLocation(offset) {
  const lines = new Error().stack.split(/\n/);
  const line = lines[offset] || '';
  const ret = line.match(/at (.*):(\d+):(\d+)/);
  if (!ret) {
    return { file: '', line: 0, column: 0, info: '' };
  }
  let file = ret[1];
  const ret2 = file.match(/\((.*)/);
  if (ret2) {
    file = ret2[1];
  }
  const lineNum = Number(ret[2] || 0);
  const column = Number(ret[3] || 0);
  return {
    file,
    line: lineNum,
    column,
    info: `${ file }:${ lineNum }:${ column }`,
  };
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
  if (!isGeneratorFunction(genFn)) {
    throw new TypeError(`not a generator function`);
  }
  // 包装 generator 函数
  const fn = genFnToPromise(genFn);
  // 保留函数名和参数信息
  const info = genFn.toString().match(/function\s*\*\s*(.*\(.*\))/);
  const sign = info && info[1] ? info[1] : '()';
  const code =
`(function ${ sign } {
  return fn.apply(this, arguments);
})`;
  const ret = eval(code);
  ret.__generatorFunction__ = genFn;
  ret.__sourceLocation__ = getSourceLocation(3);
  return ret;
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
 * @return {Promise}
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
 * @return {Promise}
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
