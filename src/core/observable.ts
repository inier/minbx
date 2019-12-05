import { IDerivationState, IDerivation } from './derivation';

export interface IObservable {
  name?: string;
  diffValue: number;
  lowestObserverState: IDerivationState;
  observers: Set<IDerivation>;
}
