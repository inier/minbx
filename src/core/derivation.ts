import { IObservable } from './observable';

export enum IDerivationState {
  NOT_TRACKING = -1,
  UP_TO_DATE = 0,
  STALE = 1,
}

export interface IDerivation {
  observing: IObservable[];
  dependenciesState: IDerivationState;
  unboundDepsCount: number;
  onBecomeStale: () => void;
}
