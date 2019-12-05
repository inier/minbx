import { IDerivation } from './derivation';
import globalState from './globalstate';

export interface IObservable {
  diffValue: number;
  observers: Set<IDerivation>;
  // lastAccessedBy: number;
}

export function reportObserved(observable: IObservable) {
  const derivation = globalState.trackingDerivation;
  if (derivation !== null) {
    // if (derivation.runId !== observable.lastAccessedBy) {
    // observable.lastAccessedBy = derivation.runId;
    derivation.newObserving.push(observable);
    // }
    return true;
  }
  return false;
}

export function propagateChanged(observable: IObservable) {
  observable.observers.forEach(d => {
    d.onBecomeStale();
  });
}
