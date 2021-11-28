import bridge from '@vkontakte/vk-bridge';

import { Style } from './types';
import { platformStyle } from './constants';
import { currentOptions } from './router';

export function getRandomId(): number {
  return Math.floor(Math.random() * 9999) + 1;
}

export function getStyle(): Style {
  if (bridge.isEmbedded()) {
    const params: URLSearchParams = new URLSearchParams(location.search);
    const platform: string | null = params.get('vk_platform') ?? 'desktop_web';

    return platformStyle[platform] ?? 'mobile';
  }

  return 'desktop';
}

export function shouldClose(): boolean {
  return bridge.supports('VKWebAppClose') && currentOptions.shouldClose;
}

export function closeApp(): void {
  if (shouldClose()) bridge.send('VKWebAppClose', { status: 'success' });
}
