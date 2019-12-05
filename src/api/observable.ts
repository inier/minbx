import { ObservableValue } from './../types/observablevalue';
import {
  createObservableArray,
  IObservableArray,
} from '../types/observablearray';
import { createObservableObject } from '../types/observableobject';
import { isPlainObject, isObservable, decorator } from '../utils';

export interface IObservableFactory {
  // observable overloads
  (value: number | string | null | undefined | boolean): never; // Nope, not supported, use box
  (
    target: Object,
    key: string | symbol,
    baseDescriptor?: PropertyDescriptor,
  ): any; // decorator
  <T = any>(value: T[]): IObservableArray<T>;
  <T extends Object>(value: T): T;
}

const observableFactories = {
  box<T = any>(value?: T) {
    return new ObservableValue<T>(value);
  },
  array<T = any>(initialValues?: T[]) {
    return createObservableArray<T>(initialValues);
  },
  object<T = any>(props: T): T {
    return createObservableObject<T>(props);
  },
};

function createObservable(v: any) {
  // @observable someProp;
  if (typeof arguments[1] === 'string') return decorator.apply(null, arguments);

  if (isObservable(v)) return v;
  if (Array.isArray(v)) return observable.array(v);
  if (isPlainObject(v)) return observable.object(v);
  return v;
}

export const observable: IObservableFactory &
  typeof observableFactories = createObservable as any;

Object.keys(observableFactories).forEach(
  name => (observable[name] = observableFactories[name]),
);
