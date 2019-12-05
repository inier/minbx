import { asObservableObject } from '../types/observableobject';

export function decorator(..._args: any[]) {
  let decoratorArguments: any[];

  function _decorator(target: any, prop: string, descriptor: any) {
    console.log(prop, 'prop args:', decoratorArguments);
    asObservableObject(target).addObservableProp(prop, descriptor.value);
    return descriptor;
  }

  if (quacksLikeADecorator(arguments)) {
    decoratorArguments = [];
    return _decorator.apply(null, arguments);
  }

  decoratorArguments = [].slice.call(arguments);
  return _decorator;
}

function quacksLikeADecorator(args: IArguments): boolean {
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === 'string') ||
    (args.length === 4 && args[3] === true)
  );
}
