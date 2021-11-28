import { useMemo } from 'react';
import { parse } from 'querystring';

import { Meta, Params, State } from './types';
import { currentHistory, currentState, currentList } from './history';
import { currentOptions } from './router';

export const useCurrentState = (): State => {
  return currentState ?? {};
};

export const useHistory = (): State[] => {
  return currentHistory ?? [];
};

export const useParams = <T extends Params>(): T => {
  const params: Params = useMemo(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      currentOptions.mode === 'none'
    )
      console.warn(
        'Параметры не могут быть получены, так как роутер работает в режиме без хранения страницы и параметров в адресной строке. Смените mode на path или hash, чтобы исправить.'
      );

    return parse(
      {
        none: '',
        path: location.search.slice(1),
        hash: location.hash.split('?')[1]
      }[currentOptions.mode]
    ) as Params;
  }, [currentState?.id]);

  return (params ?? {}) as T;
};

export const useMeta = <T extends Meta>(id?: number | null): T => {
  const found: State | undefined = useMemo(
    () => currentList.find((currentState) => currentState?.id === id),
    [currentState?.id]
  );

  return (found?.meta ?? currentState?.meta ?? {}) as T;
};
