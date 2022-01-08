import { DispatchWithoutAction, useMemo, useReducer } from 'react';
import { parse } from 'querystring';

import { Meta, Params, State, Mode } from './types';
import { currentHistory, currentState, currentList } from './history';
import { currentOptions } from './router';

/**
 * Хук для обновления компонента
 */
export const useUpdate = (): DispatchWithoutAction => {
  return useReducer((x: number) => x + 1, 0)[1];
};

/**
 * Хук для использования текущего состояния роутера
 */
export const useCurrentState = (): State => {
  return currentState ?? ({} as State);
};

/**
 * Хук для использования истории переходов роутера
 */
export const useHistory = (): State[] => {
  return currentHistory ?? [];
};

/**
 * Хук для использования текущих параметров
 */
export const useParams = <T extends Params>(): T => {
  const params: Params = useMemo(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      currentOptions?.mode === Mode.NONE
    )
      console.warn(
        'Параметры не могут быть получены, так как роутер работает в режиме без хранения страницы и параметров в адресной строке. Смените mode на path или hash, чтобы исправить.'
      );

    return parse(
      {
        [Mode.NONE]: '',
        [Mode.PATH]: location.search.slice(1),
        [Mode.HASH]: location.hash.split('?')[1]
      }[currentOptions?.mode ?? Mode.NONE]
    ) as Params;
  }, [currentState?.path]);

  return (params ?? {}) as T;
};

/**
 * Хук для использования текущих метаданных
 */
export const useMeta = <T extends Meta>(id?: number | null): T => {
  const found: State | undefined = useMemo(
    () => currentList?.find((currentState) => currentState?.id === id),
    [currentState?.path]
  );

  return (found?.meta ?? currentState?.meta ?? {}) as T;
};
