export type Mode = 'none' | 'path' | 'hash';
export type Style = 'auto' | 'mobile' | 'desktop';

export type Options = {
  mode: Mode;
  style: Style;
  defaultRoute: string;
  shouldClose: boolean;
};

export type Params = Record<string, string>;
export type Meta = Record<string, unknown>;

export type State = {
  view: string;
  panel: string;

  id: number | null;

  meta: Meta;
};

export enum RouterEvent {
  BACK,
  PUSH,
  REPLACE,
  UPDATE
}
export type Unsubscriber = () => void;
export type Subscriber = (event: RouterEvent, state: State | null) => void;

export type RootStructure = {
  type: 'epic' | 'root';
  children: ViewStructure[];
};

export type ViewStructure = {
  type: 'view';
  nav: string;
  children: PanelStructure[];
};

export type PanelStructure = {
  type: 'panel';
  nav: string;
};

export type UnknownStructure = RootStructure | ViewStructure | PanelStructure;
