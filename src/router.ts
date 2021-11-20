import {
  Children,
  isValidElement,
  JSXElementConstructor,
  ReactNode
} from 'react';
import { deepForEach } from 'react-children-utilities';
import {
  Root as VKUIRoot,
  Epic as VKUIEpic,
  View as VKUIView
} from '@vkontakte/vkui';
import { ViewInfinite as VKUIViewInfinite } from '@vkontakte/vkui/unstable';

import bridge from '@vkontakte/vk-bridge';

import {
  Options,
  State,
  RootStructure,
  Subscriber,
  Unsubscriber,
  UnknownStructure,
  Mode,
  Meta,
  RouterEvent,
  Style
} from './types';
import { Root, Epic, View, ViewInfinite } from './components';
import { dev, defaultOptions, platformStyle } from './constants';

export class Router {
  public options: Options;

  public structure: RootStructure | null;
  public state: State;
  public history: State[];
  public list: State[];

  public swipebackHistory: string[];
  public isBack: boolean = false;

  public started: boolean = false;
  public locked: boolean = false;

  private subscribers: Subscriber[] = [];
  private shouldSkipPopstate: boolean = false;

  constructor(
    options: Partial<Options> = {},
    structure: RootStructure | null = null
  ) {
    this.options = { ...defaultOptions, ...options };
    this.structure = structure;
    this.state = this.structure
      ? this.parseNav(this.options.defaultRoute)!
      : this.createState(this.options.defaultRoute);
    this.history = [this.state];
    this.list = [this.state];
    this.swipebackHistory = [this.state.panel];

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.back = this.back.bind(this);
    this.go = this.go.bind(this);
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);
    this.isBackCheck = this.isBackCheck.bind(this);

    this.onPopstate = this.onPopstate.bind(this);
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

  private get shouldClose(): boolean {
    return bridge.supports('VKWebAppClose') && this.options.shouldClose;
  }

  public start(): void {
    if (this.started)
      return console.error('Роутер уже запущен, невозможно запустить снова.');
    if (this.structure) this.replace(this.options.defaultRoute);

    this.started = true;
    window.addEventListener('popstate', this.onPopstate);
  }

  public stop(): void {
    if (!this.started)
      return console.error(
        'Роутер уже остановлен, невозможно остановить снова.'
      );

    this.started = false;
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
    if (this.locked) return;

    const state: State | void = this.parseNav(path, meta);
    if (!state) return;

    state.id = this.getRandomId();

    this.isBack = false;
    history.pushState(state, path, this.getUrl(path));
    this.history.push(state);
    this.list.push(state);

    if (this.state.view === state.view) this.swipebackHistory.push(state.panel);
    else this.swipebackHistory = [state.panel];

    this.emit(RouterEvent.PUSH, state);
  }

  public replace(path: string, meta?: Meta): void {
    if (this.locked) return;

    const state: State | void = this.parseNav(path, meta);
    if (!state) return;

    state.id = this.state.id;

    this.isBack = false;
    history.replaceState(state, path, this.getUrl(path));
    this.history[this.history.length - 1] = state;
    this.list[this.list.length - 1] = state;

    if (this.state.view === state.view)
      this.swipebackHistory[this.swipebackHistory.length - 1] = state.panel;
    else this.swipebackHistory = [state.panel];

    this.emit(RouterEvent.REPLACE, state);
  }

  public back(): void {
    if (this.locked) return;

    history.back();
  }

  public forward(): void {
    if (this.locked) return;

    history.forward();
  }

  public go(delta: number): void {
    if (this.locked) return;

    history.go(delta);
  }

  public lock(): void {
    this.locked = true;
  }

  public unlock(): void {
    this.locked = false;
  }

  public isBackCheck(): boolean {
    console.log(this.isBack);
    return this.isBack;
  }

  private onPopstate({ state }: PopStateEvent): void {
    if (this.shouldSkipPopstate) {
      this.shouldSkipPopstate = false;
      return;
    }

    if (!state) return this.emit(RouterEvent.UPDATE, null);

    // Назад
    if (this.history.some((currentState) => currentState.id === state.id)) {
      if (this.locked) {
        this.shouldSkipPopstate = true;
        history.forward();

        return;
      }

      if (this.history.length === 1) this.closeApp();

      this.isBack = true;
      this.history.pop();
      this.swipebackHistory.pop();
      this.emit(RouterEvent.BACK, state);
    } else {
      if (this.locked) {
        this.shouldSkipPopstate = true;
        history.back();

        return;
      }

      this.isBack = false;
      this.history.push(state);

      if (this.state.view === state.view)
        this.swipebackHistory.push(state.panel);
      else this.swipebackHistory = [state.panel];

      this.emit(RouterEvent.PUSH, state);
    }
  }

  private emit(event: RouterEvent, state: State | null): void {
    if (state) this.state = state;

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

    const defaultState: State | void = this.parseNav(this.options.defaultRoute);
    if (defaultState)
      setTimeout(() => this.replace(this.options.defaultRoute, undefined), 0);
  }

  public getRandomId(): number {
    return Math.floor(Math.random() * 9999) + 1;
  }

  public closeApp(): void {
    if (this.shouldClose) bridge.send('VKWebAppClose', { status: 'success' });
  }

  private createState(path: string, meta?: Meta): State {
    return {
      path,

      view: '/',
      panel: '/',

      id: this.getRandomId(),

      meta: meta ?? {}
    };
  }

  private getUrl(path: string): string {
    const urls: Record<Mode, string> = {
      hash: '#' + path,
      none: '',
      path
    };

    return urls[this.options.mode];
  }

  private parseApp(app: ReactNode): RootStructure {
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
          if (dev)
            console.warn(
              'В структуре обнаружены Root/Epic/View, импортированные из VKUI. Роутер может работать некорректно, пожалуйста, импортируйте их из @cteamdev/router.'
            );
      }
    });

    return structure;
  }

  public parseNav(path: string, meta?: Meta): State | void {
    if (!this.structure) {
      if (dev)
        console.warn(
          'Не удалось распарсить переданный path, так как структура не определена.'
        );

      return;
    }

    const [nav] = path.split('?');

    const state: State = this.createState(path, meta);

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
