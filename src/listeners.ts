import { Listener, RemoveListener, RouterEvent, State } from './types';

export let listeners: Listener[] = [];

/**
 * Подписка на события роутера
 * @param listener слушатель событий
 */
export function subscribe(listener: Listener): RemoveListener {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter(
      (currentListener) => currentListener !== listener
    );
  };
}

/**
 * Вызвать новое событие роутера
 * @param event тип события
 * @param state состояние
 */
export function emit(event: RouterEvent, state: State | null): void {
  listeners.forEach((listener) => listener(event, state));
}
