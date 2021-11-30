import bridge from '@vkontakte/vk-bridge';

import { Style } from './types';
import { currentOptions } from './router';

/**
 * Получение случайного числа
 */
export function getRandomId(): number {
  return Math.floor(Math.random() * 9999) + 1;
}

/**
 * Определение стиля навигации
 */
export function getStyle(): Style {
  if (bridge.isEmbedded()) {
    const params: URLSearchParams = new URLSearchParams(location.search);
    const platform: string | null = params.get('vk_platform') ?? 'desktop_web';

    return (
      {
        iphone: Style.MOBILE,
        android: Style.MOBILE,
        mobile_web: Style.MOBILE,
        desktop_web: Style.DESKTOP
      }[platform] ?? Style.MOBILE
    );
  }

  return Style.DESKTOP;
}

/**
 * Должно ли приложение закрыться при отсутствии элементов в истории переходов
 */
export function shouldClose(): boolean {
  return bridge.supports('VKWebAppClose') && currentOptions.shouldClose;
}

/**
 * Закрытие приложения
 */
export function closeApp(): void {
  if (shouldClose()) bridge.send('VKWebAppClose', { status: 'success' });
}
