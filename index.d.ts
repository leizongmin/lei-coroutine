declare namespace Coroutine {

  interface IFunction extends Function {
    /**
     * 函数
     */
    (...params: any[]): any;
  }

  interface IGeneratorFunction extends Function {
    /**
     * 生成器函数
     */
    (...params: any[]): IterableIterator<any>;
  }

  interface IWrappedFunction extends Function {
    /**
     * 包装后的函数
     */
    (...params: any[]): Promise<any>;
    readonly __generatorFunction__: IGeneratorFunction;
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

  interface ICallbackFunction extends Function {
    /**
     * 回调函数
     */
    (err: Error | null | undefined, ret?: any): void;
  }

  interface ICallback {
    /**
     * 执行回调函数
     */
    (thisArg: null | undefined, handler: IFunction, ...args: any[]): Promise<any>;
    /**
     * 执行回调函数
     */
    (thisArg: {}, handler: string | IFunction, ...args: any[]): Promise<any>;
  }

  interface IWrap {
    /**
     * 包装函数
     */
    (genFn: IGeneratorFunction): IWrappedFunction;
  }

  interface IExec {
    /**
     * 直接执行生成器函数，返回Promise
     */
    (genFn: IGeneratorFunction, ...params: any[]): Promise<any>
  }

  interface IExecAsCallback {
    /**
     * 之间执行生成器函数，并执行回调函数
     */
    (genFn: IGeneratorFunction, callback: ICallbackFunction): void;
    /**
     * 之间执行生成器函数，并执行回调函数
     */
    (genFn: IGeneratorFunction, ...params: any[]): void;
  }

  interface IDelay {
    /**
     * 延时
     */
    (ms: number): Promise<number>;
  }

  interface IParallel {
    /**
     * 并行执行多个Promise
     */
    (list: Promise<any>[]): Promise<any[]>;
  }

  interface C {
    /**
     * 直接执行生成器函数，返回Promise
     */
    (genFn: IGeneratorFunction): Promise<any>;
    Promise: PromiseConstructorLike;
    /**
     * 直接执行生成器函数，返回Promise
     */
    readonly exec: IExec;
    /**
     * 之间执行生成器函数，并执行回调函数
     */
    readonly asCallback: IExecAsCallback;
    /**
     * 包装函数
     */
    readonly wrap: IWrap;
    /**
     * 延时
     */
    readonly delay: IDelay;
    /**
     * 并行执行多个Promise
     */
    readonly parallel: IParallel;
    /**
     * 执行回调函数
     */
    readonly cb: ICallback;
  }

}

declare const c: Coroutine.C;

export = c;
