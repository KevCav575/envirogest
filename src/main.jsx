import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

console.log(
  "%c ENVIROGEST MX %c by BIOIMPACT ",
  "background: #000000; color: #34D399; font-size: 14px; font-weight: 900; padding: 4px; border: 2px solid #000;",
  "background: #34D399; color: #000000; font-size: 14px; font-weight: 900; padding: 4px; border: 2px solid #000;"
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);