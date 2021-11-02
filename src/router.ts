import { isValidElement, JSXElementConstructor, ReactNode } from 'react';
import { parse } from 'querystring';
import { deepForEach } from 'react-children-utilities';
import {
  Root as VKUIRoot,
  Epic as VKUIEpic,
  View as VKUIView
} from '@vkontakte/vkui';

import bridge from '@vkontakte/vk-bridge';

import {
  Options,
  State,
  RootStructure,
  Subscriber,
  Unsubscriber,
  UnknownStructure,
  Mode,
  Params,
  Meta,
  RouterEvent,
  Style
} from './types';
import { Root, Epic, View } from './components';
import { dev, defaultOptions, platformStyle } from './constants';

export class Router {
  private options: Options;
  private subscribers: Subscriber[] = [];

  public structure: RootStructure | null;
  public state: State;
  public history: State[];

  constructor(
    options: Partial<Options>,
    structure: RootStructure | null = null
  ) {
    this.options = { ...defaultOptions, ...options };
    this.structure = structure;
    this.state = this.structure
      ? this.parsePath(this.options.defaultRoute)!
      : this.createState();
    this.history = [this.state];

    this.onPopstate = this.onPopstate.bind(this);
  }

  public get viewHistory(): string[] {
    const view: string = this.state.view;

    return this.history
      .filter((state) => state.view === view)
      .map((state) => state.panel);
  }

  public get shouldClose(): boolean {
    return bridge.supports('VKWebAppClose') && this.options.shouldClose;
  }

  public get style(): Style {
    if (bridge.isEmbedded()) {
      const params: URLSearchParams = new URLSearchParams(location.search);
      const platform: string | null =
        params.get('vk_platform') ?? 'desktop_web';

      return platformStyle[platform] ?? 'mobile';
    }

    return 'desktop';
  }

  public start(): void {
    if (this.structure) this.replace(this.options.defaultRoute);

    window.addEventListener('popstate', this.onPopstate);
  }

  public stop(): void {
    window.removeEventListener('popstate', this.onPopstate);
  }

  public subscribe(subscriber: Subscriber): Unsubscriber {
    this.subscribers.push(subscriber);

    return () => {
      this.subscribers = this.subscribers.filter(
        (currentSubscriber) => currentSubscriber !== subscriber
      );
    };
  }

  public push(path: string, meta?: Meta): void {
    const state: State | void = this.parsePath(path, meta);
    if (!state) return;

    state.id = Math.floor(Math.random() * 9999) + 1;

    /* if (
      this.structure?.type === 'epic' &&
      this.style === 'desktop' &&
      this.state.view !== state.view
    ) {
      const foundIndex: number = this.history
        .slice()
        .reverse()
        .findIndex((currentState) => currentState.view === state.view);
      const found: State | undefined =
        this.history[this.history.length - foundIndex - 1];

      console.log(JSON.stringify(found, null, 2));
      console.log(JSON.stringify(this.history, null, 2));

      if (
        found &&
        found.panel !==
          this.structure.children.find((view) => view.nav === state.view)
            ?.children[0].nav
      ) {
        history.go(-foundIndex);

        return;
      }
    } */

    history.pushState(state, path, this.getUrl(path));
    this.history.push(state);

    this.emit(RouterEvent.PUSH, state);
  }

  public replace(path: string, meta?: Meta): void {
    const state: State | void = this.parsePath(path, meta);
    if (!state) return;

    state.id = Math.floor(Math.random() * 9999) + 1;

    history.replaceState(state, path, this.getUrl(path));
    this.history[this.history.length - 1] = state;

    this.emit(RouterEvent.REPLACE, state);
  }

  public back(): void {
    history.back();
  }

  public go(delta: number): void {
    history.go(delta);
  }

  public onPopstate({ state }: PopStateEvent): void {
    if (this.history.some((currentState) => currentState.id === state.id)) {
      if (this.history.length === 1) this.closeApp();

      this.history.pop();
      this.emit(RouterEvent.BACK, state);
    } else {
      this.history.push(state);
      this.emit(RouterEvent.PUSH, state);
    }
  }

  public emit(event: RouterEvent, state: State): void {
    this.state = state;
    this.subscribers.forEach((subscriber) => subscriber(event, state));
  }

  public initStructure(app: ReactNode): void {
    if (this.structure) {
      if (dev)
        console.warn(
          'Пропускаем автоматическую инициализацию структуры, так как она уже определена.'
        );

      return;
    }

    this.structure = this.parseApp(app);

    const defaultState: State | void = this.parsePath(
      this.options.defaultRoute
    );
    if (
      defaultState &&
      (defaultState.view !== this.state.view ||
        defaultState.panel !== this.state.panel ||
        defaultState.params !== this.state.params)
    )
      setTimeout(() => this.replace(this.options.defaultRoute), 0);
  }

  public closeApp(): void {
    if (this.shouldClose) bridge.send('VKWebAppClose', { status: 'success' });
  }

  public createState(params?: Params, meta?: Meta): State {
    return {
      view: '/',
      panel: '/',

      id: 0,

      meta: meta ?? {},
      params: params ?? {}
    };
  }

  public getUrl(path: string): string {
    const urls: Record<Mode, string> = {
      hash: '#' + path,
      none: '',
      path
    };

    return urls[this.options.mode];
  }

  public parseApp(app: ReactNode): RootStructure {
    const structure: RootStructure = {
      type: 'root',
      children: []
    };

    deepForEach(app, (child: ReactNode) => {
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
          const children: ReactNode[] = child.props.children || [];

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
          if (dev)
            console.warn(
              'В структуре обнаружены Root/Epic/View, импортированные из VKUI. Роутер может работать некорректно, пожалуйста, импортируйте их из @cteamdev/router.'
            );
      }
    });

    return structure;
  }

  public parsePath(path: string, meta?: Meta): State | void {
    if (!this.structure) {
      if (dev)
        console.warn(
          'Не удалось распарсить переданный path, так как структура не определена.'
        );

      return;
    }

    const [nav, params] = path.split('?');

    const state: State = this.createState(
      params ? (parse(params) as Params) : undefined,
      meta
    );

    let navIndex: number = 0;
    const navs: string[] = nav
      .split('/')
      .map((nav) => (nav.startsWith('/') ? nav : '/' + nav))
      .slice(1);

    const iterate = (structure: UnknownStructure): void => {
      if ('nav' in structure && structure.nav === navs[navIndex]) {
        state[structure.type] = structure.nav;
        navIndex++;
      }

      if ('children' in structure)
        for (const child of structure.children) iterate(child);
    };
    iterate(this.structure);

    return state;
  }
}
