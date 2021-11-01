import type { FC, DetailedReactHTMLElement } from 'react';

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

type RouterProps = {
  value: Router;
};

export const RouterProvider: FC<RouterProps> = ({ value, children }) => {
  const [, setState] = useState(value.state);

  useEffect(() => value.subscribe((_, state) => setState(state)), []);

  return (
    <RouterContext.Provider value={value}>
      {Children.map(children, (child) =>
        cloneElement(child as DetailedReactHTMLElement<any, HTMLElement>, null)
      )}
    </RouterContext.Provider>
  );
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
          history={router.viewHistory}
          onSwipeBack={router.back}
          {...props}
        >
          {props.children}
        </VKUIView>
      )
    }
  </RouterContext.Consumer>
);
