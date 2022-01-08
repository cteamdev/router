import {
  Meta,
  Options,
  RootStructure,
  RouterEvent,
  State,
  Lock,
  LockMode
} from './types';
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
  setState,
  setInternalPopstate,
  internalPopstate
} from './history';
import { closeApp, getRandomId } from './utils';
import { subscribe, emit } from './listeners';

export let currentOptions: Options | null = null;
export let currentLock: Lock | null = null;

/**
 * Инициализация и запуск роутера
 * @param options настройки роутера
 * @param structure структура навигации
 */
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

/**
 * Запуск роутера
 */
export function start(): void {
  if (currentOptions && currentStructure) replace(currentOptions.defaultRoute);

  // Даже если слушатель уже добавлен, он не будет вызываться дважды
  window.addEventListener('popstate', onPopstate);
}

/**
 * Остановка роутера
 */
export function stop(): void {
  window.removeEventListener('popstate', onPopstate);
}

/**
 * Блокировка навигации
 * @param mode режим блокировки
 */
export function lock(mode: LockMode): void {
  currentLock = mode;
}

/**
 * Разблокировка навигации
 */
export function unlock(): void {
  currentLock = null;
}

/**
 * Переход к следующей странице
 * @param path путь к странице
 * @param meta метаданные
 */
export function push<T extends Meta>(path: string, meta?: T): void {
  if (currentLock === LockMode.ALL) return;

  const state: State | undefined = parseRoute(path, meta);
  if (!state) return;

  state.id = getRandomId();

  setIsBack(false);

  history.pushState(state, path, getHistoryURL(path));
  currentHistory?.push(state);
  currentList?.push(state);

  if (currentState?.view === state.view) swipebackHistory?.push(state.panel);
  else setSwipebackHistory([state.panel]);

  setState(state);
  emit(RouterEvent.PUSH, state);
}

/**
 * Замена текущей страницы на следующую
 * @param path путь к странице
 * @param meta метаданные
 */
export function replace<T extends Meta>(path: string, meta?: T): void {
  if (currentLock === LockMode.ALL) return;

  const state: State | undefined = parseRoute(path, meta);
  if (!state) return;

  state.id = currentState?.id ?? getRandomId();

  setIsBack(false);

  history.replaceState(state, path, getHistoryURL(path));
  if (currentHistory) currentHistory[currentHistory.length - 1] = state;
  if (currentList) currentList[currentList.length - 1] = state;

  if (swipebackHistory && currentState?.view === state.view)
    swipebackHistory[swipebackHistory.length - 1] = state.panel;
  else setSwipebackHistory([state.panel]);

  setState(state);
  emit(RouterEvent.REPLACE, state);
}

/**
 * Переход назад
 */
export function back(): void {
  if (currentLock === LockMode.ALL) return;

  setInternalPopstate(true);
  history.back();
}

/**
 * Переход вперёд
 */
export function forward(): void {
  if (currentLock === LockMode.ALL) return;

  setInternalPopstate(true);
  history.forward();
}

/**
 * Переход на `delta` страниц назад/вперёд
 * @param delta количество страниц и направление
 */
export function go(delta: number): void {
  if (currentLock === LockMode.ALL) return;

  setInternalPopstate(true);
  history.go(delta);
}

/**
 * Обработчик события `popstate`
 */
export function onPopstate({ state }: PopStateEvent): void {
  const locked: boolean =
    currentLock === LockMode.ALL ||
    (currentLock === LockMode.POPSTATE && !internalPopstate);

  setInternalPopstate(false);

  if (shouldSkipPopstate) {
    setShouldSkipPopstate(false);

    return;
  }

  if (!state) return emit(RouterEvent.UPDATE, null);

  // Назад
  if (currentHistory?.some((currentState) => currentState.id === state.id)) {
    if (locked) {
      setShouldSkipPopstate(true);
      history.forward();

      return;
    }

    if (currentHistory?.length === 1) closeApp();

    currentHistory?.pop();
    swipebackHistory?.pop();

    setIsBack(true);
    setState(state);

    emit(RouterEvent.BACK, state);
  } else {
    if (locked) {
      setShouldSkipPopstate(true);
      history.back();

      return;
    }

    currentHistory?.push(state);

    if (currentState?.view === state.view) swipebackHistory?.push(state.panel);
    else setSwipebackHistory([state.panel]);

    setIsBack(false);
    setState(state);

    emit(RouterEvent.PUSH, state);
  }
}
