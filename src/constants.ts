import { Options } from './types';

export const dev: boolean =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (process.env.NODE_ENV || import.meta.env.MODE) === 'development';

export const defaultOptions: Options = {
  mode: 'hash',
  defaultRoute: '/',
  shouldClose: true
};
