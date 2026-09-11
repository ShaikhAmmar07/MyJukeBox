import { useState } from 'react';
import useStore from '../store/useStore';

const playStartSound = () => {
  try {
    const startAudio = new Audio('/sounds/Start.mp3');
    startAudio.volume = 0.5;
    const isMuted = localStorage.getItem('xp_sounds_muted') === 'true';
    if (!isMuted) {
      startAudio.play().catch(e => console.log('Start sound play failed:', e));
    }
  } catch (error) {
    console.error('Error playing start sound:', error);
  }
};

export default function LoginScreen() {
  const login = useStore(s => s.login);

  const handleEnter = () => {
    playStartSound();
    setTimeout(() => {
      if (window.playXPSound) {
        window.playXPSound('Start.mp3');
      }
    }, 500);
    login();
  };

  return (
    <div className="login-overlay">
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <div className="xp-window login-window">
        <div className="xp-titlebar">
          <span className="xp-titlebar-text">
            <img className="xp-window-icon" src="/favicon.svg" alt="MyJukeBox" />
            MyJukeBox Login
          </span>
          <div className="xp-titlebar-controls">
            <button className="xp-btn-close" disabled>&times;</button>
          </div>
        </div>
        <div className="xp-window-body login-body">
          <div className="login-header">
            <img className="login-logo" src="/favicon.svg" alt="MyJukeBox" />
            <h2>MyJukeBox</h2>
            <p>Your personal MP3 space.</p>
          </div>
          <div className="login-actions">
            <button type="button" className="xp-button primary" onClick={handleEnter}>Enter MyJukeBox</button>
          </div>
        </div>
      </div>
    </div>
  );
}