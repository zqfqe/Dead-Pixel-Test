import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  // If HTML is pre-rendered, hydrate it (make it interactive)
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  // Fallback for CSR dev mode
  ReactDOM.createRoot(rootElement).render(app);
}