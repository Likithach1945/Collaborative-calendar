import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Import timezone testing utilities in development mode
if (import.meta.env.DEV) {
  import('./utils/timezoneTest.js');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service worker disabled to prevent fetch errors during development
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch((error) => {
//       console.log('SW registration failed:', error);
//     });
//   });
// }
