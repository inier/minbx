import {
  memo,
  RefForwardingComponent,
  MemoExoticComponent,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  FunctionComponent,
  Ref,
} from 'react';
import { useObserver } from './useObserver';

export function observer<P extends object, TRef = {}>(
  baseComponent: RefForwardingComponent<TRef, P>,
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<TRef>>
>;
export function observer<P extends object>(
  baseComponent: FunctionComponent<P>,
): FunctionComponent<P>;
export function observer<P extends object, TRef = {}>(
  baseComponent: RefForwardingComponent<TRef, P>,
) {
  const wrappedComponent = (props: P, ref: Ref<TRef>) =>
    useObserver(() => baseComponent(props, ref));

  return memo(wrappedComponent);
}
