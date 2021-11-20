import { useContext, useEffect } from 'react';
import { parse } from 'querystring';

import { RouterContext } from './context';
import { Meta, Params, Mode, State } from './types';
import { dev } from './constants';

export const useRouter = () => useContext(RouterContext)!;

export const useCurrentState = (): State => {
  const router = useRouter();

  return router.state;
};

export const useHistory = (): State[] => {
  const router = useRouter();

  return router.history;
};

export const useParams = <T extends Params>(): T => {
  const router = useRouter();

  const locationProp: Record<Mode, string> = {
    none: '',
    path: location.search.slice(1),
    hash: location.hash.split('?')[1]
  };
  const params: Params = parse(locationProp[router.options.mode]) as Params;

  useEffect(() => {
    if (router.options.mode === 'none' && dev)
      console.warn(
        'Параметры не могут быть получены, так как роутер работает в режиме без хранения страницы и параметров в адресной строке. Смените mode на path или hash, чтобы исправить.'
      );
  }, []);

  return (params as T) ?? {};
};

export const useMeta = <T extends Meta>(id?: number | null): T => {
  const router = useRouter();

  const found: State | undefined = router.list.find(
    (currentState) => currentState.id === id
  );

  return found ? (found.meta as T) ?? {} : (router.state.meta as T) ?? {};
};
