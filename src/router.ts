import { Meta, Options, RootStructure, RouterEvent, State } from './types';
import { defaultOptions } from './constants';
import { currentStructure, initStructure } from './structure';
import {
  currentHistory,
  currentState,
  getHistoryURL,
  currentList,
  parseRoute,
  setIsBack,
  setShouldSkipPopstate,
  setSwipebackHistory,
  shouldSkipPopstate,
  swipebackHistory,
  setState
} from './history';
import { closeApp, getRandomId } from './utils';
import { subscribe, emit } from './listeners';

export let currentOptions: Options;
export let started: boolean = false;
export let locked: boolean = false;

export function init(
  options?: Partial<Options>,
  structure?: RootStructure
): void {
  if (structure) initStructure(structure);

  currentOptions = { ...defaultOptions, ...(options ?? {}) };
  if (currentOptions.debug)
    subscribe((e, state) => {
      console.log('DEBUG:', RouterEvent[e], 'event, state:', state);
    });

  start();
}

export function start(): void {
  if (started)
    return console.error('Роутер уже запущен, невозможно запустить снова.');

  if (currentStructure) replace(currentOptions.defaultRoute);

  started = true;
  window.addEventListener('popstate', onPopstate);
}

export function stop(): void {
  if (!started)
    return console.error('Роутер уже остановлен, невозможно остановить снова.');

  started = false;
  window.removeEventListener('popstate', onPopstate);
}

export function lock(): void {
  locked = true;
}

export function unlock(): void {
  locked = false;
}

export function push(path: string, meta?: Meta): void {
  if (locked) return;

  const state: State | undefined = parseRoute(path, meta);
  if (!state) return;

  state.id = getRandomId();

  history.pushState(state, path, getHistoryURL(path));
  currentHistory.push(state);
  currentList.push(state);

  if (currentState.view === state.view) swipebackHistory.push(state.panel);
  else setSwipebackHistory([state.panel]);

  setIsBack(false);
  setState(state);

  emit(RouterEvent.PUSH, state);
}

export function replace(path: string, meta?: Meta): void {
  if (locked) return;

  const state: State | undefined = parseRoute(path, meta);
  if (!state) return;

  state.id = currentState.id;

  history.replaceState(state, path, getHistoryURL(path));
  currentHistory[currentHistory.length - 1] = state;
  currentList[currentList.length - 1] = state;

  if (currentState.view === state.view)
    swipebackHistory[swipebackHistory.length - 1] = state.panel;
  else setSwipebackHistory([state.panel]);

  setIsBack(false);
  setState(state);

  emit(RouterEvent.REPLACE, state);
}

export function back(): void {
  if (locked) return;

  history.back();
}

export function forward(): void {
  if (locked) return;

  history.forward();
}

export function go(delta: number): void {
  if (locked) return;

  history.go(delta);
}

export function onPopstate({ state }: PopStateEvent): void {
  if (shouldSkipPopstate) {
    setShouldSkipPopstate(false);

    return;
  }

  if (!state) return emit(RouterEvent.UPDATE, null);

  const isBack: boolean = currentHistory.some(
    (currentState) => currentState.id === state.id
  );

  // Назад
  if (isBack) {
    if (locked) {
      setShouldSkipPopstate(true);
      history.forward();

      return;
    }

    if (currentHistory.length === 1) closeApp();

    currentHistory.pop();
    swipebackHistory.pop();

    setIsBack(true);
    setState(state);

    emit(RouterEvent.BACK, state);
  } else {
    if (locked) {
      setShouldSkipPopstate(true);
      history.back();

      return;
    }

    currentHistory.push(state);

    if (currentState.view === state.view) swipebackHistory.push(state.panel);
    else setSwipebackHistory([state.panel]);

    setIsBack(false);
    setState(state);

    emit(RouterEvent.PUSH, state);
  }
}
