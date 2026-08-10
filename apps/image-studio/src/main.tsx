import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from './app/app-providers';
import { AppRouter } from './app/app-router';
import './styles.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Unable to find the application root.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
