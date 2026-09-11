import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

export default function SplashScreen() {
  const setAppPhase = useStore(s => s.setAppPhase);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Loading Music Library...");

  useEffect(() => {
    const steps = [
      { progress: 20, status: "Checking Internet Connection..." },
      { progress: 45, status: "Initializing Audio Engine..." },
      { progress: 75, status: "Loading Music Library..." },
      { progress: 100, status: "System Ready." }
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setAppPhase('login'), 600);
        return;
      }
      setProgress(steps[i].progress);
      setStatus(steps[i].status);
      i++;
    }, 700);
    return () => clearInterval(interval);
  }, [setAppPhase]);

  return (
    <div className="splash-overlay" style={{ opacity: progress >= 100 ? 0 : 1, transition: 'opacity 0.5s' }}>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <div className="splash-box">
        <div className="splash-logo-area">
          <img className="splash-logo" src="/favicon.svg" alt="MyJukeBox" />
          <div className="splash-title">MyJukeBox</div>
        </div>
        <div className="splash-loader-container">
          <div className="splash-status-text">{status}</div>
          <div className="xp-progress-bar">
            <div className="xp-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="splash-version">Version 1.0.0 (Build XP)</div>
      </div>
    </div>
  );
}