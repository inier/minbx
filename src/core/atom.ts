import { IObservable } from './observable';
import { IDerivation, IDerivationState } from './derivation';

export interface IAtom extends IObservable {
  reportObserved: () => boolean;
  reportChanged: () => void;
}

export class Atom implements IAtom {
  lowestObserverState: IDerivationState;
  observers = new Set<IDerivation>();
  diffValue = 0;

  reportObserved() {
    // console.log('reportObserved');
    return true;
  }
  reportChanged() {
    // console.log('reportChanged');
  }
}
