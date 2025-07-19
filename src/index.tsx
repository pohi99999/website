import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Létrehozunk egy külön App komponenst
import './index.css'; // A CSS importálása közvetlenül

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
