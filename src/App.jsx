import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { sounds } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState('START');
  const [hudData, setHudData] = useState({
    score: 0,
    speed: 0,
    distanceM: 0,
    coins: 0,
    nitroActive: false,
    nitroTimeLeft: 0
  });

  const [stageNotification, setStageNotification] = useState(null);
  const [nearMissNotification, setNearMissNotification] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [mobileInputs, setMobileInputs] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
    horn: false
  });

  const handleStartGame = () => {
    sounds.init();
    setHudData({
      score: 0,
      speed: 0,
      distanceM: 0,
      coins: 0,
      nitroActive: false,
      nitroTimeLeft: 0
    });
    setStageNotification(null);
    setNearMissNotification(null);
    setGameState('PLAYING');
  };

  const handleRestartGame = () => {
    handleStartGame();
  };

  const handleScoreUpdate = (data) => {
    setHudData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleStageChange = (stage) => {
    setStageNotification(stage);
    setTimeout(() => {
      setStageNotification(null);
    }, 3500);
  };

  const handleNearMiss = (text) => {
    setNearMissNotification(text);
    setTimeout(() => {
      setNearMissNotification(null);
    }, 1800);
  };

  const handleGameOver = () => {
    setGameState('GAMEOVER');
  };

  const handleVictory = () => {
    setGameState('VICTORY');
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <GameCanvas
        gameState={gameState}
        onScoreUpdate={handleScoreUpdate}
        onStageChange={handleStageChange}
        onGameOver={handleGameOver}
        onVictory={handleVictory}
        onNearMiss={handleNearMiss}
        mobileInputs={mobileInputs}
      />
      <UIOverlay
        gameState={gameState}
        onStartGame={handleStartGame}
        onRestartGame={handleRestartGame}
        hudData={hudData}
        stageNotification={stageNotification}
        nearMissNotification={nearMissNotification}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        setMobileInputs={setMobileInputs}
      />
    </div>
  );
}
