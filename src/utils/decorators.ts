export type PropertyCreator = (
  instance: any,
  propertyName: PropertyKey,
  descriptor: any,
  decoratorArgs: any[],
) => any;

export function createPropDecorator(propertyCreator: PropertyCreator) {
  return function decoratorFactory(...args: any[]) {
    let decoratorArguments: any[];

    function decorator(target: any, prop: string, descriptor: any) {
      const res = propertyCreator(target, prop, descriptor, decoratorArguments);
      return {}; // bind in addObservableProp or addComputedProp
    }

    // @decorator
    if (quacksLikeADecorator(args)) {
      decoratorArguments = [];
      return decorator.apply(null, args);
    }
    // @decorator(args)
    decoratorArguments = args;
    return decorator;
  };
}

function quacksLikeADecorator(args: any[]): boolean {
  // 类：1
  // 属性：2
  // 方法：3
  // 方法参数：3
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === 'string') ||
    (args.length === 4 && args[3] === true)
  );
}
