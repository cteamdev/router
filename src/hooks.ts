import { useEffect } from 'react';
import { parse } from 'querystring';

import { Meta, Params, Mode, State } from './types';
import { currentHistory, currentState, currentList } from './history';
import { currentOptions } from './router';

export const useCurrentState = (): State => {
  return currentState ?? {};
};

export const useHistory = (): State[] => {
  return currentHistory ?? [];
};

export const useParams = <T extends Params>(): T => {
  const locationProp: Record<Mode, string> = {
    none: '',
    path: location.search.slice(1),
    hash: location.hash.split('?')[1]
  };
  const params: Params = parse(locationProp[currentOptions.mode]) as Params;

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      currentOptions.mode === 'none'
    )
      console.warn(
        'Параметры не могут быть получены, так как роутер работает в режиме без хранения страницы и параметров в адресной строке. Смените mode на path или hash, чтобы исправить.'
      );
  }, []);

  return (params ?? {}) as T;
};

export const useMeta = <T extends Meta>(id?: number | null): T => {
  const found: State | undefined = currentList.find(
    (currentState) => currentState.id === id
  );

  return (found ? found.meta ?? {} : currentState.meta ?? {}) as T;
};
