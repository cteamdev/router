export enum Mode {
  /**
   * Текущая страница и параметры не хранятся в адресной строке. Хук `useParams` не доступен
   */
  NONE,

  /**
   * Текущая страница и параметры хранятся в хэше
   */
  PATH,

  /**
   * Текущая страница и параметры хранятся как при стандартной навигации
   */
  HASH
}

export enum Style {
  /**
   * Автоматическое определение стиля навигации
   */
  AUTO,

  /**
   * Мобильный стиль навигации
   */
  MOBILE,

  /**
   * Настольный стиль навигации
   */
  DESKTOP
}

export type Options = {
  mode: Mode;
  style: Style;
  defaultRoute: string;
  shouldClose: boolean;
  debug: boolean;
};

export type Params = Record<string, string>;
export type Meta = Record<string, unknown>;

export type State = {
  path: string;

  view: string;
  panel: string;

  id: number | null;

  meta: Meta;
};

export enum RouterEvent {
  /**
   * Событие `назад`
   */
  BACK,

  /**
   * Событие `вперёд`
   */
  PUSH,

  /**
   * Событие `вперёд` с заменой
   */
  REPLACE,

  /**
   * Событие загрузки страницы и изменения хэша
   */
  UPDATE
}
export type RemoveListener = () => void;
export type Listener = (event: RouterEvent, state: State | null) => void;

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

export type Lock = LockMode | null;
export enum LockMode {
  /**
   * Полная блокировка - игнорируются все функции навигации
   */
  ALL,

  /**
   * Блокировка события `popstate` - игнорируются нажатия кнопок назад и вперёд.
   * Работает очень нестабильно, имеются баги!
   */
  POPSTATE
}
