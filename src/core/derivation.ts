import { IObservable, removeObserver, addObserver } from './observable';
import globalState from './globalstate';

export interface IDerivation {
  observing: IObservable[];
  newObserving: IObservable[];
  onBecomeStale(): void;
}

export function trackDerivedFunction<T>(
  derivation: IDerivation,
  f: () => T,
  context: any,
) {
  // derivation.runId = ++globalState.runId;
  const prevTracking = globalState.trackingDerivation;
  globalState.trackingDerivation = derivation;
  const result = f.call(context);
  globalState.trackingDerivation = prevTracking;
  bindDependencies(derivation);
  return result;
}

function bindDependencies(derivation: IDerivation) {
  const prevObserving = derivation.observing;
  const observing = (derivation.observing = [
    ...new Set(derivation.newObserving),
  ]);

  // 新依赖置为 1
  observing.forEach(dep => dep.diffValue === 0 && (dep.diffValue = 1));
  derivation.newObserving = [];

  // 旧依赖 remove
  prevObserving.forEach(
    dep => dep.diffValue === 0 && dep.observers.delete(derivation),
  );

  // 新依赖未监听 add
  observing.forEach(dep => {
    if (dep.diffValue === 1) {
      dep.diffValue = 0;
      dep.observers.add(derivation);
    }
  });
}
