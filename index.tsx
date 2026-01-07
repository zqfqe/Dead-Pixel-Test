import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TestReportProvider } from './contexts/TestReportContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <TestReportProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TestReportProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <TestReportProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TestReportProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}