import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '@telegram-apps/sdk-react';

import { authAPI } from '../services/api';
import { LoginResponse } from '../types';
import '../App.css';

interface LoginPageProps {
  onLogin: (token: string, userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { user: telegramUser, webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in via Telegram, try to authenticate
    if (telegramUser && webApp) {
      handleTelegramLogin();
    }
  }, [telegramUser, webApp]);

  const handleTelegramLogin = async () => {
    if (!webApp) {
      if (webApp) {
        webApp.showAlert('Telegram WebApp not available');
      }
      return;
    }

    try {
      // Get Telegram init data
      const initData = webApp.initData;
      
      if (!initData) {
        if (webApp) {
          webApp.showAlert('Unable to get Telegram init data');
        }
        return;
      }

      // Call login API
      const response = await authAPI.login(initData);
      const data = response.data as LoginResponse;
      
      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        onLogin(data.data.token, data.data.user);
        navigate('/menu');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      if (webApp) {
        webApp.showAlert(`Login error: ${errorMessage}`);
      } else {
        alert(`Login error: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto',
        padding: '32px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px'
      }}>
        <h1 style={{ margin: '0 0 24px 0' }}>Restaurant App</h1>
        
        {telegramUser ? (
          <div>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--secondary-color)', 
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              {telegramUser.firstName?.charAt(0) || 'U'}
            </div>
            <h2>Welcome, {telegramUser.firstName}!</h2>
            <p style={{ marginBottom: '24px' }}>
              {telegramUser.lastName ? `${telegramUser.lastName}` : ''}
              {telegramUser.username ? ` (@${telegramUser.username})` : ''}
            </p>
            <button 
              className="button button-primary"
              onClick={handleTelegramLogin}
              style={{ width: '100%', padding: '16px' }}
            >
              Continue with Telegram
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--secondary-color)', 
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              🍽️
            </div>
            <h2>Login Required</h2>
            <p style={{ marginBottom: '24px' }}>
              Please open this app in Telegram to continue
            </p>
            <div style={{ 
              padding: '16px', 
              backgroundColor: 'var(--secondary-color)', 
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: '8px 0' }}>
                1. Open this link in Telegram
              </p>
              <p style={{ margin: '8px 0' }}>
                2. Tap on the "Start" button
              </p>
              <p style={{ margin: '8px 0' }}>
                3. You'll be automatically logged in
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;