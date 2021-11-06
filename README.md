# @cteamdev/router
🔪 Многофункциональный роутер для веб-приложений на React и VKUI

- Плюсы
- Когда-нибудь
- Они
- Тут
- Будут

## Установка
```bash
npm install --save @cteamdev/router
```
```bash
yarn add @cteamdev/router
```

## Подключение
1. Создаём экземпляр класса `Router`:
```typescript
const router = new Router(options?, structure?);
```
### `options`
Необязательно. Настройки роутера.
| Ключ | По умолчанию | Описание |
|------|--------------|----------|
| `mode` | `hash` | Место хранения текущей локации в адресной строке. Принимает значения `none`, `path` и `hash`. |
| `style` | `auto` | Стиль навигации. Принимает значения `auto`, `mobile` и `desktop`. |
| `defaultRoute` | `/` | Страница по умолчанию. Не рекомендуется использовать при автоопределении структуры или не пустом экране на странице `/`. |
| `shouldClose` | `true`, если доступен `vk-bridge` | Нужно ли закрывать приложение при нажатии кнопки *Назад* и отсутствии элементов в истории. |
### `structure`
Необязательно. Структура навигации, если не указана - генерируется автоматически.

2. Если не указали структуру на предыдущем шаге и хотим автогенерацию, то оборачиваем всю навигацию в компонент `Structure`:
```tsx
<Structure>
  <Root>
    ...
  </Root>
</Structure>
```

3. Оборачиваем приложение в компонент `RouterProvider` (важно это делать над `Structure`!) и передаём объект роутера в проп `value`:
```tsx
<RouterProvider value={router}>
  <App />
</RouterProvider>
```

4. Все `Root`, `Epic` и `View` из `VKUI` заменяем на аналогичные компоненты из роутера:
```tsx
// Верно:
import { Root, Epic, View } from '@cteamdev/router';

// Не верно:
import { Root, Epic, View } from '@vkontakte/vkui';
```

## Методы
| Метод | Параметры | Описание |
|-------|-----------|----------|
| `push(path: string, meta?: Meta)` | - `path` - путь к странице. <br/>- `meta` - метаданные, которые нужно передать. | Перейти к следующей странице. |
| `replace(path: string, meta?: Meta)` | - `path` - путь к странице. <br/>- `meta` - метаданные, которые нужно передать. | Заменить текущую страницу на переданную. |
| `back()` | - | Вернуться к предыдущей странице. |
| `go(delta: number)` | - `delta` - количество шагов. | Перейти на `delta` шагов вперёд/назад. |
| `subscribe(subscriber: Subscriber): Unsubcriber` | - `subscriber` - обработчик событий. | Подписаться на события роутера. |

## Пропы
| Проп | Описание |
|------|----------|
| `structure` | Структура. |
| `state` | Текущее состояние. |
| `history` | История переходов. |
| `swipebackHistory` | История переходов в конкретном `View`. Используется для Swipeback'ов. |
| `style` | Стиль навигации. |


## Параметры и метаданные
Параметры - это данные, которые хранятся в адресной строке. Передаются в методах `push` и `replace` вместе с `path`:
```typescript
push('/persik?mode=default');
replace('/persik?mode=gray');
```
Помните, что параметры всегда имеют тип `string`.

Метаданные - это данные, которые передаются с одной панели к другой. Передаются в методах `push` и `replace` в аргументе `meta`:
```typescript
push('/persik', {
  url: 'https://cdn.pavgro.world/persik/'
});
replace('/persik', {
  url: 'https://cdn.pavgro.world/cat/'
});
```

Получить параметры и метаданные можно с помощью хуков `useParams()` и `useMeta()`:
```tsx
type Props = {
  nav: string;
};
type P = {
  mode?: string;
}
type M = {
  url?: string;
};

const Persik: FC<Props> = ({ nav }) => {
  const { mode } = useParams<P>();
  const { url } = useMeta<M>();

  return (
    <Panel nav={nav}>
      <PanelHeader>Персик</PanelHeader>

      <Div>
        <img src={url ? url + (mode ?? 'default') : 'https://persik.pavgro.world/'} />
      </Div>

      <Div>
        <Button
          size="l"
          onClick={() => back()}
        >
          Перейти назад
        </Button>
      </Div>
    </Panel>
  );
};
```

### Экспериментальная функция
Как вы могли заметить, параметры и метаданные меняют своё состояние во время анимации (например, смены панели). Для параметров это нормальное поведение, а для метаданных - не совсем. В экспериментальном режиме сейчас можно это исправить:
1. Получаем состояние роутера:
```tsx
const { state } = useRouter();
```
2. Делаем реф на текущее состояние роутера:
```tsx
const refId = useRef(state.id);
```
3. Прокидываем текущее значение рефа в первый аргумент хука `useMeta`:
```tsx
const meta = useMeta(refId.current);
```
Просьба сообщать о всех багах в issue - https://github.com/cteamdev/router/issues/new.

## Подписка на события
Переход к следующей/предыдущей странице, смена хэша в адресной строке - это всё события. Чтобы подписаться на них, нужно вызвать метод `subscribe`, который возвращает функцию для отписки:
```tsx
const App: FC = () => {
  const { subscribe } = useRouter();

  useEffect(() => {
    const handler = (event: RouterEvent, state: State | null) => {
      console.log('Новое событие:', event, 'Состояние: ', state);

      if (event === RouterEvent.PUSH) {
        console.log('Переход к следующей панели', state?.panel);
      }
    };

    return subscribe(handler);
  }, []);

  return (
    ...
  );
};
```

## Пример
```tsx
// panels/home.tsx
type Props = {
  nav: string;
};

const Home: FC<Props> = ({ nav }) => {
  const { push } = useRouter();

  return (
    <Panel nav={nav}>
      <PanelHeader>Главная</PanelHeader>

      <Div>
        <Button
          size="l"
          onClick={() => push('/persik?mode=default', { url: 'none' })}
        >
          Перейти ко второй панели
        </Button>
      </Div>
    </Panel>
  );
};

// panels/persik.tsx
type Props = {
  nav: string;
};

const Persik: FC<Props> = ({ nav }) => {
  const { back } = useRouter();

  const params = useParams();
  const meta = useMeta();

  return (
    <Panel nav={nav}>
      <PanelHeader>Персик</PanelHeader>

      <Div>
        <Text>
          Параметры: {JSON.stringify(params)}
          Метаданные: {JSON.stringify(meta)}
        </Text>
        <Button
          size="l"
          onClick={() => back()}
        >
          Перейти назад
        </Button>
      </Div>
    </Panel>
  );
};

// App.tsx
const App: FC = () => {
  return (
    <Structure>
      <Root>
        <View nav="/">
          <Home nav="/" />
          <Persik nav="/persik" />
        </View>
      </Root>
    </Structure>
  );
};

// index.tsx
const router = new Router();
router.start();

ReactDOM.render(
  <RouterProvider value={router}>
    <App />
  </RouterProvider>,
  document.getElementById('root')
);
```