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

/**
 * Компонент-обёртка над приложением для работы обновления и стилей
 */
export const Router: FC<RouterProps> = ({ children }) => {
  const [, setState] = useState(currentState);

  useEffect(
    () => subscribe((_, state) => setState(state ?? { ...currentState })),
    []
  );

  return (
    <>
      <style>{`
        .vkuiView__popout:empty, .vkuiPopoutRoot__popout:empty, .vkuiPopoutRoot--absolute:empty {
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

/**
 * Компонент-обёртка над структурой для автоматической генерации
 */
export const Structure: FC<StructureProps> = ({ children }) => {
  useEffect(() => initStructure(children), []);

  return children;
};

/**
 * Компонент-обёртка над ModalRoot из VKUI
 */
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

/**
 * Компонент-обёртка для работы попаутов
 */
export const PopoutRoot: FC = (props) => {
  const { popout = null } = useParams();
  console.log(popout);

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
export const Root: FC<Omit<RootProps, 'activeView'>> = (props) => (
  <VKUIRoot activeView={currentState?.view} {...props}>
    {props.children}
  </VKUIRoot>
);

/**
 * Компонент-обёртка над Epic из VKUI
 */
export const Epic: FC<Omit<EpicProps, 'activeStory'>> = (props) => (
  <VKUIEpic activeStory={currentState?.view} {...props}>
    {props.children}
  </VKUIEpic>
);

/**
 * Компонент-обёртка над View из VKUI
 */
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
 * Компонент-обёртка над ViewInfinite из VKUI. Нестабильный, как и оригинальный компонент
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
