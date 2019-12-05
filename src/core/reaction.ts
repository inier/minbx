import { IDerivation, trackDerivedFunction } from './derivation';
import { IObservable } from './observable';
import globalState, { endBatch, startBatch } from './globalstate';

export class Reaction implements IDerivation {
  observing: IObservable[] = [];
  newObserving: IObservable[] = [];

  constructor(private onInvalidate: () => void) {}

  onBecomeStale() {
    this.schedule();
  }

  schedule() {
    globalState.pendingReactions.push(this);
    runReactions();
  }

  runReaction() {
    // startBatch();
    this.onInvalidate();
    // endBatch();
  }

  track(fn: () => void) {
    trackDerivedFunction(this, fn, undefined);
  }
}

export function runReactions() {
  if (globalState.inBatch > 0) return;
  // globalState.isRunningReactions = true;
  const allReactions = globalState.pendingReactions;

  while (allReactions.length > 0) {
    const remainingReactions = allReactions.splice(0);
    remainingReactions.forEach(rr => rr.runReaction());
  }
  // globalState.isRunningReactions = false;
}
