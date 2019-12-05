import {
  isObservableArray,
  isObservableObject,
  isObservable,
  $mobx,
} from '../utils';

export function set(obj: any, key: any, value?: any): void {
  if (arguments.length === 2) {
    const values = key;
    for (const k in values) set(obj, k, values[k]);
    return;
  }
  if (isObservableObject(obj)) {
    const adm = obj[$mobx];
    if (adm.values.get(key)) adm.write(key, value);
    else adm.addObservableProp(key, value);
  } else if (isObservableArray(obj)) {
    if (typeof key !== 'number') return;
    if (key >= obj.length) obj.length = key + 1;
    obj[key] = value;
  } else throw new Error('type error');
}

export function has(obj: any, key: any): boolean {
  if (isObservableObject(obj)) return obj[$mobx].has(key);
  else if (isObservableArray(obj)) return +key >= 0 && +key < obj.length;
  else throw new Error('type error');
}

export function get(obj: any, key: any) {
  if (!has(obj, key)) return;
  if (isObservable(obj)) return obj[key];
  else throw new Error('type error');
}
