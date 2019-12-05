import { ObservableValue } from './observablevalue';
import globalState from '../core/globalstate';
import { Atom, IAtom } from '../core/atom';
import { addHiddenProp, $mobx, isPropertyKey, decorator } from '../utils';
import { set } from '../api/object-api';

export class ObservableObjectAdministration {
  atom: IAtom = new Atom();
  isObservableObject = true;

  constructor(
    public target: any,
    public values = new Map<PropertyKey, ObservableValue<any>>(),
  ) {}

  read(key: PropertyKey) {
    return this.values.get(key).get();
  }

  write(key: PropertyKey, newValue: any) {
    const observable = this.values.get(key);
    newValue = (observable as any).prepareNewValue(newValue);
    if (newValue !== globalState.UNCHANGED) {
      observable.setNewValue(newValue);
    }
  }

  addObservableProp(propName: PropertyKey, newValue: any) {
    const observable = new ObservableValue(newValue);
    this.values.set(propName, observable);
    newValue = (observable as any).value;
    Object.defineProperty(this.target, propName, generateConfig(propName));
    this.atom.reportChanged();
  }

  has(key: PropertyKey) {
    this.values.has(key);
  }
}

export function asObservableObject(target: any) {
  const adm = new ObservableObjectAdministration(target, new Map());
  addHiddenProp(target, $mobx, adm);
  return adm;
}

function generateConfig(propName: PropertyKey) {
  return {
    configurable: true,
    enumerable: true,
    get() {
      return this[$mobx].read(propName);
    },
    set(v: any) {
      this[$mobx].write(propName, v);
    },
  };
}

export function createObservableObject<T>(props: T): T {
  const proxy = new Proxy({}, objectProxyTraps);
  return extendObject(proxy, props);
}

const objectProxyTraps: ProxyHandler<any> = {
  get(target: any, name: PropertyKey) {
    const o = target[$mobx].values.get(name);
    if (o instanceof Atom) return (o as any).get();
    return target[name];
  },
  set(target: any, name: PropertyKey, value: any) {
    if (!isPropertyKey(name)) return false;
    set(target, name, value);
    return true;
  },
};

function extendObject(target: any, properties: any) {
  Object.keys(properties).forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(properties, key);
    const resultDescriptor = decorator(target, key, descriptor);
    Object.defineProperty(target, key, resultDescriptor);
  });
  return target;
}
