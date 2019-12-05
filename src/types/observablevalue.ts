import { observable } from '../api/observable';
import { Atom } from '../core/atom';
import globalState from '../core/globalstate';

export interface IObservableValue<T> {
  get(): T;
  set(value: T): void;
}

export class ObservableValue<T> extends Atom implements IObservableValue<T> {
  constructor(private value: T) {
    super();
    this.value = observable(value);
  }

  get() {
    this.reportObserved();
    return this.value;
  }

  set(newValue: T) {
    newValue = this.prepareNewValue(newValue) as any;
    if (newValue !== globalState.UNCHANGED) {
      const oldValue = this.value;
      this.setNewValue(newValue);
    }
  }

  private prepareNewValue(newValue: T) {
    newValue = observable(newValue);
    return Object.is(newValue, this.value) ? globalState.UNCHANGED : newValue;
  }

  setNewValue(newValue: T) {
    this.value = newValue;
    this.reportChanged();
  }

  toJSON() {
    return this.get();
  }
}