import { IDerivation } from './derivation';
import { Reaction, runReactions } from './reaction';

const globalState = {
  inBatch: 0,
  UNCHANGED: {},
  trackingDerivation: null as IDerivation,
  pendingReactions: [] as Reaction[],
};

export function startBatch() {
  globalState.inBatch++;
}

export function endBatch() {
  if (--globalState.inBatch === 0) {
    runReactions();
  }
}

export default globalState;
