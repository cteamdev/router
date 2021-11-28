import type { FC, DetailedReactHTMLElement, ReactElement } from 'react';

import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState
} from 'react';
import {
  Root as VKUIRoot,
  Epic as VKUIEpic,
  View as VKUIView,
  ModalRoot as VKUIModalRoot,
  RootProps,
  EpicProps,
  ViewProps,
  ModalRootProps
} from '@vkontakte/vkui';
import {
  ViewInfinite as VKUIViewInfinite,
  ViewInfiniteProps
} from '@vkontakte/vkui/unstable';

import { back } from './router';
import { initStructure } from './structure';
import { currentState, isBackCheck, swipebackHistory } from './history';
import { subscribe } from './listeners';
import { useParams } from './hooks';

type RouterProps = {
  children: ReactElement;
};

export const Router: FC<RouterProps> = ({ children }) => {
  const [, setState] = useState(currentState);

  useEffect(
    () => subscribe((_, state) => setState(state ?? { ...currentState })),
    []
  );

  return (
    <>
      <style>{`
        .vkuiView__popout:empty {
          display: none;
        }
      `}</style>

      {Children.map(children, (child) =>
        cloneElement(child as DetailedReactHTMLElement<any, HTMLElement>, null)
      )}
    </>
  );
};

type StructureProps = {
  children: ReactElement;
};

export const Structure: FC<StructureProps> = ({ children }) => {
  useEffect(() => initStructure(children), []);

  return children;
};

export const ModalRoot: FC<Omit<ModalRootProps, 'activeModal' | 'onClose'>> = (
  props
) => {
  const { modal = null } = useParams();

  return (
    <VKUIModalRoot activeModal={modal} onClose={back} {...props}>
      {props.children}
    </VKUIModalRoot>
  );
};

export const PopoutRoot: FC = (props) => {
  const { popout = null } = useParams();

  const activePopout: ReactElement | undefined = popout
    ? (Children.toArray(props.children).find(
        (child) =>
          isValidElement(child) &&
          (child.props?.nav === popout || child.props?.id === popout)
      ) as ReactElement | undefined)
    : undefined;

  return activePopout ?? null;
};

export const Root: FC<Omit<RootProps, 'activeView'>> = (props) => (
  <VKUIRoot activeView={currentState?.view} {...props}>
    {props.children}
  </VKUIRoot>
);

export const Epic: FC<Omit<EpicProps, 'activeStory'>> = (props) => (
  <VKUIEpic activeStory={currentState?.view} {...props}>
    {props.children}
  </VKUIEpic>
);

export const View: FC<
  Omit<ViewProps, 'activePanel' | 'history' | 'onSwipeBack'>
> = (props) => (
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
export const ViewInfinite: FC<
  Omit<
    ViewInfiniteProps,
    'activePanel' | 'history' | 'onSwipeBack' | 'onBackCheck'
  >
> = (props) => (
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
