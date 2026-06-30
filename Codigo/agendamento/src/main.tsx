import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { ToastProvider } from './components/ui/Toast.tsx'
import { AppSettingsProvider } from './context/AppSettingsContext.tsx'
import { LanguageProvider } from './context/LanguageContext.tsx'

// Intercepta todas as requisições HTTP para direcionar ao backend do Railway em produção
const BACKEND_URL = import.meta.env.PROD 
  ? 'https://marcosmusic-production.up.railway.app' 
  : '';

const originalFetch = window.fetch;
window.fetch = function (input, init) {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  
  if (url.startsWith('/') && !url.startsWith('//')) {
    url = `${BACKEND_URL}${url}`;
  }
  
  if (typeof input === 'string') {
    return originalFetch(url, init);
  } else if (input instanceof URL) {
    return originalFetch(url, init);
  } else {
    const newRequest = new Request(url, input);
    return originalFetch(newRequest, init);
  }
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSettingsProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AppSettingsProvider>
  </StrictMode>,
)
