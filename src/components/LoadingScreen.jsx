import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const { progress, active } = useProgress();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (progress === 100 && !active) {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => onComplete(), 800);
      }, 500);
    }
  }, [progress, active, onComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-ring"></div>
          <div className="logo-ring"></div>
          <div className="logo-ring"></div>
          <span className="logo-text">TCT</span>
        </div>
        
        <h1 className="loading-title">
          Building <span className="gradient-text">Nairobi</span>
        </h1>
        
        <div className="loading-bar-container">
          <div className="loading-bar">
            <div className="loading-fill" style={{ width: `${progress}%` }}></div>
            <div className="loading-glow" style={{ left: `${progress}%` }}></div>
          </div>
          <span className="loading-percent">{Math.round(progress)}%</span>
        </div>
        
        <p className="loading-subtitle">Loading 3D assets...</p>
      </div>
      
      <div className="loading-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{ '--delay': `${i * 0.1}s` }}></div>
        ))}
      </div>
    </div>
  );
}
