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

import { Router } from './router';
import { RouterContext } from './context';
import { useRouter } from './hooks';

type RouterProps = {
  value: Router;
};

export const RouterProvider: FC<RouterProps> = ({
  value: router,
  children
}) => {
  const [, setState] = useState(router.state);

  useEffect(
    () =>
      router.subscribe((_, state) => setState(state ?? { ...router.state })),
    []
  );

  return (
    <RouterContext.Provider value={router}>
      {Children.map(children, (child) =>
        cloneElement(child as DetailedReactHTMLElement<any, HTMLElement>, null)
      )}
    </RouterContext.Provider>
  );
};

type StructureProps = {
  children: ReactElement;
};

export const Structure: FC<StructureProps> = ({ children }: StructureProps) => {
  const router = useRouter();

  useEffect(() => router.initStructure(children), []);

  return children;
};

export const Root = (props: Omit<RootProps, 'activeView'>) => (
  <RouterContext.Consumer>
    {(router) =>
      router && (
        <VKUIRoot activeView={router.state.view} {...props}>
          {props.children}
        </VKUIRoot>
      )
    }
  </RouterContext.Consumer>
);

export const Epic = (props: Omit<EpicProps, 'activeStory'>) => (
  <RouterContext.Consumer>
    {(router) =>
      router && (
        <VKUIEpic activeStory={router.state.view} {...props}>
          {props.children}
        </VKUIEpic>
      )
    }
  </RouterContext.Consumer>
);

export const View = (
  props: Omit<ViewProps, 'activePanel' | 'history' | 'onSwipeBack'>
) => (
  <RouterContext.Consumer>
    {(router) =>
      router && (
        <VKUIView
          activePanel={router.state.panel}
          history={router.swipebackHistory}
          onSwipeBack={router.back}
          {...props}
        >
          {props.children}
        </VKUIView>
      )
    }
  </RouterContext.Consumer>
);
