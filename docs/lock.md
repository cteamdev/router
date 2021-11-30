## Блокировка навигации
Например, вам нужно не выпускать пользователя из игры: с этой задачей отлично справится блокировка. Есть два типа блокировки:
- `LockMode.ALL` - блокирует абсолютно все методы навигации
- `LockMode.POPSTATE` - блокирует только попытки навигации пользователем с помощью кнопок "Назад" и "Вперёд" в браузере. Работает очень нестабильно

Пример:
```tsx
type Props = {
  nav: string;
};

const Game: FC<Props> = ({ nav }) => {
  const { back, lock, unlock } = useRouter();

  useEffect(() => lock(LockMode.ALL), []);

  return (
    <Panel nav={nav}>
      <PanelHeader
        left={<PanelHeaderBack onClick={back} />}
      >
        Игра
      </PanelHeader>

      <Div>
        {/* Вжух, гонки! */}
      </Div>

      <Div>
        <Button
          size="l"
          onClick={unlock}
        >
          Разблокировать
        </Button>
      </Div>
    </Panel>
  );
};
```
