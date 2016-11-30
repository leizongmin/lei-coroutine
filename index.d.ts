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
    readonly __sourceLocation__: {
      readonly file: string;
      readonly line: number;
      columnreadonly : number;
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
    (genFn: IGeneratorFunction): IWrappedFunction;
    Promise: PromiseConstructorLike;
    readonly exec: IExec;
    readonly asCallback: IExecAsCallback;
    readonly wrap: IWrap;
    readonly delay: IDelay;
    readonly parallel: IParallel;
    readonly cb: ICallback;
  }

}

declare const c: Coroutine.C;

export = c;
