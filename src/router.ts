import { isValidElement, JSXElementConstructor, ReactNode } from 'react';
import { parse } from 'querystring';
import { deepForEach } from 'react-children-utilities';
import {
  Root as VKUIRoot,
  Epic as VKUIEpic,
  View as VKUIView
} from '@vkontakte/vkui';

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
  RouterEvent
} from './types';
import { Root, Epic, View } from './components';

export class Router {
  public state: State = this.structure
    ? this.parsePath(this.options.defaultRoute)!
    : this.createState();
  public history: State[] = [this.state];

  public dev: boolean =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (process.env.NODE_ENV || import.meta.env.MODE) === 'development';
  public subscribers: Subscriber[] = [];

  constructor(
    public options: Options,
    public structure: RootStructure | null = null
  ) {}

  public get viewHistory(): string[] {
    const view: string = this.state.view;

    return this.history
      .filter((state) => state.view === view)
      .map((state) => state.panel);
  }

  public start(): void {
    history.replaceState(
      this.state,
      this.options.defaultRoute,
      this.getUrl(this.options.defaultRoute)
    );

    window.addEventListener('popstate', this.onPopstate.bind(this));
  }

  public stop(): void {
    window.removeEventListener('popstate', this.onPopstate.bind(this));
  }

  public initStructure(app: ReactNode): void {
    if (this.structure) {
      if (this.dev)
        console.warn(
          'Пропускаем автоматическую инициализацию структуры, так как она уже определена.'
        );

      return;
    }

    this.structure = this.parseApp(app);
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
      this.history.pop();
      this.emit(RouterEvent.BACK, state);
    } else {
      this.history.push(state);
      this.emit(RouterEvent.PUSH, state);
    }
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

  public emit(event: RouterEvent, state: State): void {
    this.state = state;
    this.subscribers.forEach((subscriber) => subscriber(event, state));
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
          if (this.dev)
            console.warn(
              'В структуре обнаружены Root/Epic/View, импортированные из VKUI. Роутер может работать некорректно, пожалуйста, импортируйте их из @cteamdev/router.'
            );
      }
    });

    return structure;
  }

  public parsePath(path: string, meta?: Meta): State | void {
    if (!this.structure) {
      if (this.dev)
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
