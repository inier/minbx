import { IObservable, propagateChanged, reportObserved } from './observable';
import { IDerivation } from './derivation';
import { startBatch, endBatch } from './globalstate';

export interface IAtom extends IObservable {
  reportObserved(): boolean;
  reportChanged(): void;
}

export class Atom implements IAtom {
  observers = new Set<IDerivation>();
  diffValue = 0;

  reportObserved() {
    return reportObserved(this);
  }
  reportChanged() {
    propagateChanged(this);
  }
}
