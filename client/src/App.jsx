import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/common/ToastContainer';
import AppRouter from './routes/AppRouter';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
