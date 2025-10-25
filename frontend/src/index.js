import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline'; // <-- Import CssBaseline
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CssBaseline /> {/* <-- Add CssBaseline here */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);