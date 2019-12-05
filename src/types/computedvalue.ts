import {
  IObservable,
  reportObserved,
  propagateChanged,
} from '../core/observable';
import { IDerivation, trackDerivedFunction } from '../core/derivation';
import { startBatch, endBatch } from '../core/globalstate';

export interface IComputedValue<T> {
  get(): T;
}

export interface IComputedValueOptions<T> {
  get?: () => T;
  context?: any;
}

export class ComputedValue<T>
  implements IObservable, IComputedValue<T>, IDerivation {
  observing: IObservable[] = [];
  newObserving: IObservable[] = [];
  diffValue = 0;
  observers = new Set<IDerivation>();
  protected value: T | undefined;
  derivation: () => T;
  scope: any;

  constructor(options: IComputedValueOptions<T>) {
    this.derivation = options.get;
    this.scope = options.context;
  }

  onBecomeStale() {
    propagateChanged(this);
  }

  get(): T {
    if (this.observers.size === 0) {
      // startBatch();
      this.value = this.derivation.call(this.scope);
      // endBatch();
    } else {
      reportObserved(this);
      const newValue = trackDerivedFunction(this, this.derivation, this.scope);
      !Object.is(this.value, newValue) && this.onBecomeStale();
    }
    return this.value;
  }

  toJSON() {
    return this.get();
  }
}
