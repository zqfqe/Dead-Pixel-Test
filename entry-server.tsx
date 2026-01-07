import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { TestReportProvider } from './contexts/TestReportContext';
import App from './App';

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