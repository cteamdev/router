import { currentOptions } from './router';
import { Listener, RemoveListener, RouterEvent, State } from './types';

export let listeners: Listener[] = [];

export function subscribe(listener: Listener): RemoveListener {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter(
      (currentListener) => currentListener !== listener
    );
  };
}

export function emit(event: RouterEvent, state: State | null): void {
  listeners.forEach((listener) => listener(event, state));
}
