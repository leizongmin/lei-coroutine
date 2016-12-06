/**
 * lei-coroutine
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

interface NormalFunction extends Function {
  /**
   * 函数
   */
  (...params: any[]): any;
}

interface GeneratorFunction extends Function {
  /**
   * 生成器函数
   */
  (...params: any[]): IterableIterator<any>;
}

interface WrappedFunction<T> extends Function {
  /**
   * 包装后的函数
   */
  (...params: any[]): Promise<T>;
  readonly __generatorFunction__: GeneratorFunction;
  /**
   * 源函数位置信息
   */
  readonly __sourceLocation__: {
    /**
     * 文件名
     */
    readonly file: string;
    /**
     * 行
     */
    readonly line: number;
    /**
     * 列
     */
    readonly column : number;
    /**
     * 位置信息
     */
    readonly info: string;
  };
}

interface CallbackFunction<T> extends Function {
  /**
   * 回调函数
   */
  (err: Error | null | undefined, ret?: T): void;
}

interface Coroutine {

  /**
   * 直接执行生成器函数，返回Promise
   */
  <T>(genFn: GeneratorFunction): Promise<T>;

  /**
   * 自定义 Promise 对象
   */
  Promise: PromiseConstructorLike;

  /**
   * 直接执行生成器函数，返回Promise
   */
  exec<T>(genFn: GeneratorFunction, ...params: any[]): Promise<T>;

  asCallback: {
    /**
     * 直接执行生成器函数，并执行回调函数
     */
    <T>(genFn: GeneratorFunction, callback: CallbackFunction<T>): void;
    /**
     * 直接执行生成器函数，并执行回调函数
     */
    (genFn: GeneratorFunction, ...params: any[]): void;
  }

  /**
   * 执行回调函数
   */
  cb<T>(thisArg: any, handler: NormalFunction | string, ...args: any[]): Promise<T>;

  /**
   * 包装函数
   */
  wrap<T>(genFn: GeneratorFunction): WrappedFunction<T>;

  /**
   * 延时
   */
  delay(ms: number): Promise<number>;

  /**
   * 并行执行多个Promise
   */
  parallel(list: Promise<any>[]): Promise<any[]>;

}

declare const coroutine: Coroutine;
export = coroutine;
