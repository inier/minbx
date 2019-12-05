export * from './decorators';

export const $mobx = Symbol('mobx administration');

export function addHiddenProp(object: any, propName: PropertyKey, value: any) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value,
  });
}

export function isPlainObject(value: any) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isObservable(value: any) {
  if (value == null) return false;
  return !!value[$mobx];
}

export function isObservableObject(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableObject;
}

export function isObservableArray(thing: any) {
  return isObservable(thing) && thing[$mobx].isObservableArray;
}

export function isPropertyKey(val: any) {
  return ['string', 'number', 'symbol'].includes(typeof val);
}
