import React from 'react';
import { initTelegram, useTelegram } from '@telegram-apps/sdk-react';
import { Viewport, WebApp, MainButton, BackButton } from '@telegram-apps/telegram-ui';
import './App.css';

// Initialize Telegram SDK
initTelegram();

function App() {
  const { user, webApp, theme } = useTelegram();

  return (
    <div className="app" data-theme={theme}>
      <Viewport />
      {webApp && <WebApp webApp={webApp} />}
      <MainButton />
      <BackButton />
    </div>
  );
}

export default App;