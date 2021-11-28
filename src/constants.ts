import { Options, Style } from './types';

export const defaultOptions: Options = {
  mode: 'hash',
  style: 'auto',
  defaultRoute: '/',
  shouldClose: true,
  debug: false
};

export const platformStyle: Record<string, Style> = {
  iphone: 'mobile',
  android: 'mobile',
  mobile_web: 'mobile',
  desktop_web: 'desktop'
};
