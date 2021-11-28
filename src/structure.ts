import type { JSXElementConstructor, ReactNode } from 'react';

import { isValidElement, Children } from 'react';
import { deepForEach } from 'react-children-utilities';
import {
  Root as VKUIRoot,
  Epic as VKUIEpic,
  View as VKUIView
} from '@vkontakte/vkui';
import { ViewInfinite as VKUIViewInfinite } from '@vkontakte/vkui/unstable';

import { Epic, Root, View, ViewInfinite } from './components';
import { RootStructure, State } from './types';
import { currentOptions, replace } from './router';
import { initHistory, parseRoute } from './history';

export let currentStructure: RootStructure | null;

export function initStructure(root: ReactNode | RootStructure): void {
  if (isStructure(root)) {
    if (currentStructure) {
      if (process.env.NODE_ENV === 'development')
        console.error(
          'Невозможно изменить структуру, так как она уже определена.'
        );

      return;
    }

    currentStructure = root;
  } else {
    if (currentStructure) {
      if (process.env.NODE_ENV === 'development')
        console.warn(
          'Пропускаем автоматическую инициализацию структуры, так как она уже определена.'
        );

      return;
    }

    currentStructure = parseRoot(root);
  }

  initHistory();

  const defaultState: State | void = parseRoute(currentOptions.defaultRoute);
  if (defaultState)
    setTimeout(() => replace(currentOptions.defaultRoute, undefined), 0);
}

export function parseRoot(root: ReactNode): RootStructure {
  const structure: RootStructure = {
    type: 'root',
    children: []
  };

  deepForEach(root, (child: ReactNode) => {
    if (!isValidElement(child)) return child;

    const type: string | JSXElementConstructor<any> = child.type;
    const nav: string = child.props.nav;

    switch (type) {
      case Root:
        structure.type = 'root';
        break;

      case Epic:
        structure.type = 'epic';
        break;

      case View:
      case ViewInfinite:
        const children: ReactNode[] = Children.toArray(child.props.children);

        structure.children.push({
          type: 'view',
          nav,
          children: children
            .filter((child) => isValidElement(child) && child.props?.nav)
            .map((child) => ({
              type: 'panel',
              nav: isValidElement(child) && child.props.nav
            }))
        });
        break;

      case VKUIRoot:
      case VKUIEpic:
      case VKUIView:
      case VKUIViewInfinite:
        if (process.env.NODE_ENV === 'development')
          console.warn(
            'В структуре обнаружены Root/Epic/View, импортированные из VKUI. Роутер может работать некорректно, пожалуйста, импортируйте их из @cteamdev/router.'
          );
    }
  });

  return structure;
}

export const isStructure = <T>(
  root: T | RootStructure
): root is RootStructure =>
  root &&
  (root as RootStructure).type &&
  ['epic', 'root'].includes((root as RootStructure).type);
