import React from 'react';
import ReactDOM from 'react-dom/client';
// HashRouter: deep links (e.g. /test/start/<token>) work on ANY static host
// without server-side SPA rewriting — the path after "#" never hits the server.
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import App from './App';
import './styles/tailwind.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
    <AuthProvider>
        <App />
    </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);

