import { createContext } from 'react';

import { Router } from './router';

export const RouterContext = createContext<Router | null>(null);
