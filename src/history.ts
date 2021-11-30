import { Meta, Mode, State, UnknownStructure } from './types';
import { currentOptions } from './router';
import { currentStructure } from './structure';
import { getRandomId } from './utils';

export let currentState: State;
export let currentHistory: State[];
export let currentList: State[];
export let swipebackHistory: string[];

export let isBack: boolean = false;
export let internalPopstate: boolean = false;
export let shouldSkipPopstate: boolean = false;

/**
 * Инициализация истории
 */
export function initHistory(): void {
  currentState = currentStructure
    ? (parseRoute(currentOptions.defaultRoute) as State)
    : createState(currentOptions.defaultRoute);
  currentHistory = [currentState];
  currentList = [currentState];
  swipebackHistory = [currentState.panel];
}

/**
 * Создание нового состояния
 * @param path путь к странице
 * @param meta метаданные
 */
export function createState(path: string, meta?: Meta): State {
  return {
    path,

    view: '/',
    panel: '/',

    id: getRandomId(),

    meta: meta ?? {}
  };
}

/**
 * Получение URL для History API
 * @param path путь к странице
 */
export function getHistoryURL(path: string): string {
  const urls: Record<Mode, string> = {
    [Mode.HASH]: '#' + path,
    [Mode.NONE]: '',
    [Mode.PATH]: path
  };

  return urls[currentOptions.mode];
}

/**
 * Направление анимации для ViewInfinite
 */
export function isBackCheck(): boolean {
  return isBack;
}

/**
 * Установка текущего состояния
 * @param value новое значение
 */
export function setState(value: State): void {
  currentState = value;
}

/**
 * Установка текущей истории свайпбэков
 * @param value новое значение
 */
export function setSwipebackHistory(value: string[]): void {
  swipebackHistory = value;
}

/**
 * Установка направления анимации для ViewInfinite
 * @param value новое значение
 */
export function setIsBack(value: boolean): void {
  isBack = value;
}

/**
 * Установка значения внутреннего перехода
 * @param value новое значение
 */
export function setInternalPopstate(value: boolean): void {
  internalPopstate = value;
}

/**
 * Установка значения для пропуска действий в событии `popstate`
 * @param value новое значение
 */
export function setShouldSkipPopstate(value: boolean): void {
  shouldSkipPopstate = value;
}

/**
 * Парсинг пути к странице в состояние
 * @param path путь к странице
 * @param meta метаданные
 */
export function parseRoute(path: string, meta?: Meta): State | undefined {
  if (!currentStructure) {
    if (process.env.NODE_ENV === 'development')
      console.warn(
        'Не удалось распарсить переданный path, так как структура не определена.'
      );

    return;
  }

  const [nav] = path.split('?');

  const state: State = createState(path, meta);

  let navIndex: number = 0;
  const navs: string[] = nav
    .split('/')
    .map((nav) => (nav.startsWith('/') ? nav : '/' + nav))
    .slice(1);

  const iterate = (structure: UnknownStructure): void => {
    if ('nav' in structure && structure.nav === navs[navIndex]) {
      state[structure.type] = structure.nav;
      navIndex++;
    }

    if ('children' in structure)
      for (const child of structure.children) iterate(child);
  };
  iterate(currentStructure);

  return state;
}
