import { Options, Mode, Style } from './types';

/**
 * Стандартные настройки роутера
 */
export const defaultOptions: Options = {
  mode: Mode.HASH,
  style: Style.AUTO,
  defaultRoute: '/',
  shouldClose: true,
  debug: false
};
