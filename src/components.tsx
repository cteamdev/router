import type { FC, DetailedReactHTMLElement, ReactElement } from 'react';

import React, { Children, useEffect, useState, cloneElement } from 'react';
import {
  Root as VKUIRoot,
  Epic as VKUIEpic,
  View as VKUIView,
  RootProps,
  EpicProps,
  ViewProps
} from '@vkontakte/vkui';
import {
  ViewInfinite as VKUIViewInfinite,
  ViewInfiniteProps
} from '@vkontakte/vkui/unstable';

import { currentState, isBackCheck, swipebackHistory } from './history';
import { subscribe } from './listeners';
import { initStructure } from './structure';
import { back } from './router';

type RouterProps = {
  children: ReactElement;
};

export const Router: FC<RouterProps> = ({ children }: RouterProps) => {
  const [, setState] = useState(currentState);

  useEffect(
    () => subscribe((_, state) => setState(state ?? { ...currentState })),
    []
  );

  return (
    <>
      {Children.map(children, (child) =>
        cloneElement(child as DetailedReactHTMLElement<any, HTMLElement>, null)
      )}
    </>
  );
};

type StructureProps = {
  children: ReactElement;
};

export const Structure: FC<StructureProps> = ({ children }: StructureProps) => {
  useEffect(() => initStructure(children), []);

  return children;
};

export const Root = (props: Omit<RootProps, 'activeView'>) => (
  <VKUIRoot activeView={currentState?.view} {...props}>
    {props.children}
  </VKUIRoot>
);

export const Epic = (props: Omit<EpicProps, 'activeStory'>) => (
  <VKUIEpic activeStory={currentState?.view} {...props}>
    {props.children}
  </VKUIEpic>
);

export const View = (
  props: Omit<ViewProps, 'activePanel' | 'history' | 'onSwipeBack'>
) => (
  <VKUIView
    activePanel={currentState?.panel}
    history={swipebackHistory}
    onSwipeBack={back}
    {...props}
  >
    {props.children}
  </VKUIView>
);

/**
 * Как и компонент VKUI - нестабильный.
 */
export const ViewInfinite = (
  props: Omit<
    ViewInfiniteProps,
    'activePanel' | 'history' | 'onSwipeBack' | 'onBackCheck'
  >
) => (
  <VKUIViewInfinite
    activePanel={currentState?.panel}
    history={swipebackHistory}
    onSwipeBack={back}
    isBackCheck={isBackCheck}
    {...props}
  >
    {props.children}
  </VKUIViewInfinite>
);
