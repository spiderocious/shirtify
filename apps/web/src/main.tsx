import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { configureApiClient } from '@repo/api';

// Shirtify type stack (self-hosted via @fontsource):
// Archivo Black shouts, Space Grotesk works, JetBrains Mono keeps the record.
import '@fontsource/archivo-black';
import '@fontsource/archivo/700.css';
import '@fontsource/archivo/800.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';

import { App } from './app.tsx';
import './styles.css';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';
configureApiClient(baseUrl);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
