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
> Известный баг: ломается при использовании свайпбэка - https://github.com/cteamdev/router/issues/6.
