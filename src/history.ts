import { Meta, Mode, State, UnknownStructure } from './types';
import { dev } from './constants';
import { currentOptions } from './router';
import { currentStructure } from './structure';
import { getRandomId } from './utils';

export let currentState: State;
export let currentHistory: State[];
export let currentList: State[];
export let swipebackHistory: string[];

export let isBack: boolean = false;
export let shouldSkipPopstate: boolean = false;

export function initHistory(): void {
  currentState = currentStructure
    ? (parseRoute(currentOptions.defaultRoute) as State)
    : createState(currentOptions.defaultRoute);
  currentHistory = [currentState];
  currentList = [currentState];
  swipebackHistory = [currentState.panel];
}

export function createState(path: string, meta?: Meta): State {
  return {
    path,

    view: '/',
    panel: '/',

    id: getRandomId(),

    meta: meta ?? {}
  };
}

export function getHistoryURL(path: string): string {
  const urls: Record<Mode, string> = {
    hash: '#' + path,
    none: '',
    path
  };

  return urls[currentOptions.mode];
}

export function isBackCheck(): boolean {
  return isBack;
}

export function setState(value: State): void {
  currentState = value;
}

export function setSwipebackHistory(value: string[]): void {
  swipebackHistory = value;
}

export function setIsBack(value: boolean): void {
  isBack = value;
}

export function setShouldSkipPopstate(value: boolean): void {
  shouldSkipPopstate = value;
}

export function parseRoute(path: string, meta?: Meta): State | undefined {
  if (!currentStructure) {
    if (dev)
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
