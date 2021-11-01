import { parse } from 'querystring';

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

export class Router {
  public state: State = this.parse(this.options.defaultRoute);

  public history: State[] = [this.state];
  public subscribers: Subscriber[] = [];

  constructor(
    public readonly structure: RootStructure,
    public readonly options: Options
  ) {
    history.replaceState(
      this.state,
      this.options.defaultRoute,
      this.getUrl(this.options.defaultRoute)
    );

    window.onpopstate = this.onPopState.bind(this);
  }

  public get viewHistory(): string[] {
    const view: string = this.state.view;

    return this.history
      .filter((state) => state.view === view)
      .map((state) => state.panel);
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
    const state: State = this.parse(path, meta);
    state.id = Math.floor(Math.random() * 9999) + 1;

    history.pushState(state, path, this.getUrl(path));
    this.history.push(state);

    this.emit(RouterEvent.PUSH, state);
  }

  public back(): void {
    history.back();
  }

  public go(delta: number): void {
    history.go(delta);
  }

  public onPopState({ state }: PopStateEvent): void {
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

  public parse(path: string, meta?: Meta): State {
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
