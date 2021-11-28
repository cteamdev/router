## Попауты
Чтобы использовать попауты окна, нужно импортировать компонент `PopoutRoot` из роутера:
```tsx
import { PopoutRoot } from '@cteamdev/router';

//...
<SplitLayout
  popout={
    <PopoutRoot>
      <MyPopout nav="my" />
      <ScreenSpinner id="loading" />
    </PopoutRoot>
  }
></SplitLayout>
```

Переход к попауту:
```tsx
push('/?popout=my');
```

Чтобы нельзя было закрыть и вернуться через кнопку вперёд:
```tsx
push('/?popout=loading');
lock();

// После загрузки
setTimeout(() => {
  unlock();
  replace('/');
}, 2000);
```
