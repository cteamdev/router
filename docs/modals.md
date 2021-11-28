## Модальные окна
Чтобы использовать модальные окна, нужно импортировать компонент `ModalRoot` из роутера и использовать его вместо стандартного:
```tsx
import { ModalRoot } from '@cteamdev/router';

//...
<SplitLayout
  modal={
    <ModalRoot>
      <MyModal nav="my" />
    </ModalRoot>
  }
></SplitLayout>
```

Переход к модальному окну:
```tsx
push('/?modal=my');
```
