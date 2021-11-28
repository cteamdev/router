## ViewInfinite
Нестабильный компонент VKUI. Использование точно такое же, как и с обычным `View` - направлением анимации и историей занимается роутер.
```tsx
const App: FC = () => {
  return (
    <Structure>
      <Root>
        <ViewInfinite nav="/">
          <Panel nav="/">
            <PanelHeader
              left={
                history.length > 1 && (
                  <PanelHeaderBack onClick={back} />
                )
              }
            >
              Панель 1
            </PanelHeader>

            <Button onClick={() => push('/2')}>К панели 2</Button>
          </Panel>

          <Panel nav="/2">
            <PanelHeader
              left={<PanelHeaderBack onClick={back} />}
            >
              Панель 2
            </PanelHeader>

            <Button onClick={() => push('/')}>К панели 1</Button>
          </Panel>
        </ViewInfinite>
      </Root>
    </Structure>
  );
};
```
