import { observable } from '../api/observable';
import { IAtom, Atom } from './../core/atom';
import { addHiddenProp, $mobx } from '../utils';

export interface IObservableArray<T = any> extends Array<T> {
  spliceWithArray(index: number, deleteCount?: number, newItems?: T[]): T[];
  toJSON(): T[];
}

class ObservableArrayAdministration {
  values: any[] = [];
  atom: IAtom = new Atom();
  isObservableArray = true;

  getArrayLength() {
    this.atom.reportObserved();
    return this.values.length;
  }

  setArrayLength(newLength: number) {
    const len = this.values.length;
    if (typeof newLength !== 'number' || newLength < 0 || newLength === len)
      return;
    else if (newLength > len) {
      const newItems = Array.from({ length: newLength - len });
      this.spliceWithArray(len, 0, newItems);
    } else this.spliceWithArray(newLength, len - newLength);
  }

  spliceWithArray(
    index = 0,
    deleteCount?: number,
    newItems: any[] = [],
  ): any[] {
    const len = this.values.length;

    if (index > len) index = len;
    else if (index < 0) index = Math.max(0, len + index);

    if (arguments.length === 1) deleteCount = len - index;
    else if (deleteCount == null) deleteCount = 0;
    else deleteCount = Math.max(0, Math.min(deleteCount, len - index));

    newItems = newItems.length ? newItems.map(v => observable(v)) : newItems;
    const res = this.values.splice(index, deleteCount, ...newItems);
    if (deleteCount !== 0 || newItems.length !== 0) this.atom.reportChanged();
    return res;
  }
}

export function createObservableArray<T>(
  initialValues: any[] = [],
): IObservableArray<T> {
  const adm = new ObservableArrayAdministration();
  addHiddenProp(adm.values, $mobx, adm);
  const proxy = new Proxy(adm.values, arrayTraps);
  adm.spliceWithArray(0, 0, initialValues);
  return proxy;
}

const arrayTraps = {
  get(target: any, name: any) {
    if (name === 'length') return target[$mobx].getArrayLength();
    if (typeof name === 'number') return arrayExtensions.get.call(target, name);
    if (typeof name === 'string' && !isNaN(name as any))
      return arrayExtensions.get.call(target, +name);
    if (arrayExtensions.hasOwnProperty(name)) return arrayExtensions[name];

    return target[name];
  },
  set(target: any, name: any, value: any): boolean {
    if (name === 'length') target[$mobx].setArrayLength(value);
    if (typeof name === 'number') arrayExtensions.set.call(target, name, value);
    if (typeof name === 'symbol' || isNaN(name)) target[name] = value;
    else arrayExtensions.set.call(target, +name, value);

    return true;
  },
};

const arrayExtensions = {
  splice(index: number, deleteCount?: number, ...newItems: any[]) {
    const adm: ObservableArrayAdministration = this[$mobx];
    return adm.spliceWithArray(index, deleteCount, newItems);
  },
  push(...items: any[]) {
    const adm: ObservableArrayAdministration = this[$mobx];
    adm.spliceWithArray(adm.values.length, 0, items);
    return adm.values.length;
  },
  pop() {
    return this.splice(Math.max(this[$mobx].values.length - 1, 0), 1)[0];
  },
  shift() {
    return this.splice(0, 1)[0];
  },
  unshift(...items: any[]) {
    const adm = this[$mobx];
    adm.spliceWithArray(0, 0, items);
    return adm.values.length;
  },
  reverse(): any[] {
    const clone = (<any>this).slice();
    return clone.reverse.apply(clone, arguments);
  },
  sort(compareFn?: (a: any, b: any) => number): any[] {
    const clone = (<any>this).slice();
    return clone.sort.apply(clone, arguments);
  },
  toJSON(): any[] {
    return (this as any).slice();
  },
  get(index: number) {
    const adm: ObservableArrayAdministration = this[$mobx];
    if (adm && index < adm.values.length) {
      adm.atom.reportObserved();
      return adm.values[index];
    }
    return undefined;
  },
  set(index: number, newValue: any) {
    const adm: ObservableArrayAdministration = this[$mobx];
    const values = adm.values;
    if (index < values.length) {
      const oldValue = values[index];
      newValue = observable(newValue);
      const changed = newValue !== oldValue;
      if (changed) {
        values[index] = newValue;
        adm.atom.reportChanged();
      }
    } else if (index === values.length) {
      adm.spliceWithArray(index, 0, [newValue]);
    }
  },
};

[
  'concat',
  'every',
  'filter',
  'forEach',
  'indexOf',
  'join',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'toString',
  'toLocaleString',
].forEach(funcName => {
  arrayExtensions[funcName] = function() {
    const adm = this[$mobx];
    adm.atom.reportObserved();
    const res = adm.values;
    return res[funcName].apply(res, arguments);
  };
});
