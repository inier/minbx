import { IDerivation, trackDerivedFunction } from './derivation';
import { IObservable } from './observable';
import { globalState, endBatch, startBatch } from './globalstate';

export class Reaction implements IDerivation {
  observing: IObservable[] = [];
  newObserving: IObservable[] = [];
  runId = 0;

  constructor(private onInvalidate: () => void) {}

  onBecomeStale() {
    this.schedule();
  }

  schedule() {
    globalState.pendingReactions.push(this);
    runReactions();
  }

  runReaction() {
    startBatch();
    this.onInvalidate();
    endBatch();
  }

  track(fn: () => void) {
    startBatch();
    trackDerivedFunction(this, fn, undefined);
    endBatch();
  }
}

export function runReactions() {
  if (globalState.inBatch > 0) return;
  const allReactions = globalState.pendingReactions;

  while (allReactions.length > 0) {
    const remainingReactions = allReactions.splice(0);
    remainingReactions.forEach(rr => rr.runReaction());
  }
}
