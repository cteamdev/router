import { useContext } from 'react';

import { RouterContext } from './context';
import { Meta, Params } from './types';

export const useRouter = () => useContext(RouterContext)!;

// TODO: Смена параметров при анимации
export const useParams = <T extends Params>(): T => {
  const router = useRouter();

  return (router.state.params as T) ?? {};
};

export const useMeta = <T extends Meta>(): T => {
  const router = useRouter();

  return (router.state.meta as T) ?? {};
};
