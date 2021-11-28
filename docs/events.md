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
