import React, { useState, useEffect } from 'react';
import { initTelegram, useTelegram } from '@telegram-apps/sdk-react';
import { Viewport, WebApp, MainButton, BackButton } from '@telegram-apps/telegram-ui';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import './App.css';

// Initialize Telegram SDK
initTelegram();

const queryClient = new QueryClient();

function App() {
  const { user, webApp, theme } = useTelegram();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Fetch user data
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
      } else {
        // Token might be invalid, clear it
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUserData(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserData(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app" data-theme={theme}>
          <Viewport />
          {webApp && <WebApp webApp={webApp} />}
          <MainButton />
          <BackButton />
          
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/menu" /> : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/menu" /> : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/menu" 
              element={isAuthenticated ? <MenuPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/cart" 
              element={isAuthenticated ? <CartPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/order" 
              element={isAuthenticated ? <OrderPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;