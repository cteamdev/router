import type { FC, ReactElement } from 'react';

import React, { Children, isValidElement, useEffect, useState } from 'react';
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
import { useUpdate, useParams } from './hooks';

type StructureProps = {
  autogen?: boolean;

  children: ReactElement;
};

/**
 * Компонент-обёртка над структурой для автоматической генерации
 */
export const Structure: FC<StructureProps> = ({ children, autogen = true }) => {
  const [, setState] = useState(currentState);

  useEffect(() => {
    if (autogen) initStructure(children);

    subscribe((_, state) => setState(state ?? { ...currentState! }));
  }, []);

  return (
    <>
      <style>{`
        .vkuiView__popout:empty,
        .vkuiPopoutRoot__popout:empty,
        .vkuiPopoutRoot--absolute:empty {
          display: none;
        }
      `}</style>

      {children}
    </>
  );
};

/**
 * Компонент-обёртка над ModalRoot из VKUI
 */
export const ModalRoot: FC<Omit<ModalRootProps, 'activeModal' | 'onClose'>> = (
  props
) => {
  const update = useUpdate();
  const { modal = null } = useParams();

  useEffect(() => {
    subscribe(update);
  }, []);

  return (
    <VKUIModalRoot activeModal={modal} onClose={back} {...props}>
      {props.children}
    </VKUIModalRoot>
  );
};

/**
 * Компонент-обёртка для работы попаутов
 */
export const PopoutRoot: FC = (props) => {
  const update = useUpdate();
  const { popout = null } = useParams();

  useEffect(() => {
    subscribe(update);
  }, []);

  const activePopout: ReactElement | undefined = popout
    ? (Children.toArray(props.children).find(
        (child) =>
          isValidElement(child) &&
          (child.props?.nav === popout || child.props?.id === popout)
      ) as ReactElement | undefined)
    : undefined;

  return activePopout ?? null;
};

/**
 * Компонент-обёртка над Root из VKUI
 */
export const Root: FC<Omit<RootProps, 'activeView'>> = (props) => {
  const update = useUpdate();

  useEffect(() => {
    subscribe(update);
  }, []);

  return (
    <VKUIRoot activeView={currentState?.view ?? '/'} {...props}>
      {props.children}
    </VKUIRoot>
  );
};

/**
 * Компонент-обёртка над Epic из VKUI
 */
export const Epic: FC<Omit<EpicProps, 'activeStory'>> = (props) => {
  const update = useUpdate();

  useEffect(() => {
    subscribe(update);
  }, []);

  return (
    <VKUIEpic activeStory={currentState?.view ?? '/'} {...props}>
      {props.children}
    </VKUIEpic>
  );
};

/**
 * Компонент-обёртка над View из VKUI
 */
export const View: FC<
  Omit<ViewProps, 'activePanel' | 'history' | 'onSwipeBack'>
> = (props) => {
  const update = useUpdate();

  useEffect(() => {
    subscribe(update);
  }, []);

  return (
    <VKUIView
      activePanel={currentState?.panel ?? '/'}
      history={swipebackHistory ?? []}
      onSwipeBack={back}
      {...props}
    >
      {props.children}
    </VKUIView>
  );
};

/**
 * Компонент-обёртка над ViewInfinite из VKUI. Нестабильный, как и оригинальный компонент
 */
export const ViewInfinite: FC<
  Omit<
    ViewInfiniteProps,
    'activePanel' | 'history' | 'onSwipeBack' | 'onBackCheck'
  >
> = (props) => {
  const update = useUpdate();

  useEffect(() => {
    subscribe(update);
  }, []);

  return (
    <VKUIViewInfinite
      activePanel={currentState?.panel ?? '/'}
      history={swipebackHistory ?? []}
      onSwipeBack={back}
      isBackCheck={isBackCheck}
      {...props}
    >
      {props.children}
    </VKUIViewInfinite>
  );
};
