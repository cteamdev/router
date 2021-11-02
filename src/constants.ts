import { Options, Style } from './types';

export const dev: boolean =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (process.env.NODE_ENV || import.meta.env.MODE) === 'development';

export const defaultOptions: Options = {
  mode: 'hash',
  style: 'auto',
  defaultRoute: '/',
  shouldClose: true
};

export const platformStyle: Record<string, Style> = {
  iphone: 'mobile',
  android: 'mobile',
  mobile_web: 'mobile',
  desktop_web: 'desktop'
};
