## Блокировка навигации
Например, вам нужно не выпускать пользователя из игры. С этой задачей отлично справится блокировка:
```tsx
type Props = {
  nav: string;
};

const Game: FC<Props> = ({ nav }) => {
  const { back, lock, unlock } = useRouter();

  useEffect(lock, []);

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
