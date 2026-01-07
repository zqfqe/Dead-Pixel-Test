import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import * as HelmetAsync from 'react-helmet-async';
import { TestReportProvider } from './contexts/TestReportContext';
import App from './App';

// Robustly handle the import whether it's bundled as CJS or ESM to prevent build errors
const HelmetProvider = (HelmetAsync as any).HelmetProvider || (HelmetAsync as any).default?.HelmetProvider || HelmetAsync.HelmetProvider;

export function render(url: string) {
  const helmetContext: any = {};
  
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <TestReportProvider>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </TestReportProvider>
      </HelmetProvider>
    </React.StrictMode>
  );

  return { html, helmet: helmetContext.helmet };
}