import React from 'react';
import { STAGES } from './GameCanvas';
import { sounds } from '../utils/audio';

export default function UIOverlay({
  gameState,
  onStartGame,
  onRestartGame,
  hudData,
  stageNotification,
  nearMissNotification,
  isMuted,
  onToggleMute,
  setMobileInputs
}) {
  const { score, speed, distanceM, coins, nitroActive, nitroTimeLeft } = hudData;

  // Calculate route progress (0% to 100% across 12,000 meters)
  const progressPercent = Math.min(100, Math.max(0, (distanceM / 12000) * 100));

  return (
    <div style={styles.overlayContainer}>
      {/* 1. HUD during gameplay */}
      {gameState === 'PLAYING' && (
        <>
          {/* Top GPS Corridor Progress Tracker */}
          <div style={styles.gpsTracker}>
            <div style={styles.gpsHeader}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1c40f' }}>
                📍 ঢাকা জিপিএস রুট (১২ কিমি)
              </span>
              <span style={{ fontSize: '12px', color: '#ecf0f1' }}>
                {Math.floor(distanceM)} মি / ১২,০০০ মি
              </span>
            </div>

            <div style={styles.progressBarBg}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: `${progressPercent}%`
                }}
              />
              {/* Bike Icon at Current Progress */}
              <div
                style={{
                  ...styles.bikeProgressIcon,
                  left: `calc(${progressPercent}% - 12px)`
                }}
              >
                🏍️
              </div>
            </div>

            {/* Stage Milestone Names */}
            <div style={styles.milestoneLabels}>
              {STAGES.map((s, idx) => {
                const isPassed = distanceM >= s.startM;
                const isCurrent = distanceM >= s.startM && distanceM < s.endM;
                return (
                  <span
                    key={s.id}
                    style={{
                      fontSize: '11px',
                      color: isCurrent ? '#f1c40f' : isPassed ? '#2ecc71' : '#7f8c8d',
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      textShadow: isCurrent ? '0 0 8px rgba(241,196,15,0.8)' : 'none'
                    }}
                  >
                    {s.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Top Status Badges (Speed, Score, Coins) */}
          <div style={styles.topBadgesRow}>
            {/* Speedometer */}
            <div style={{ ...styles.badge, borderColor: speed > 80 ? '#e74c3c' : '#3498db' }}>
              <span style={{ fontSize: '11px', color: '#bdc3c7' }}>গতি</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'Teko, sans-serif' }}>
                {speed} <span style={{ fontSize: '13px' }}>KM/H</span>
              </span>
            </div>

            {/* Score */}
            <div style={styles.badge}>
              <span style={{ fontSize: '11px', color: '#bdc3c7' }}>স্কোর</span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f1c40f' }}>
                {score.toLocaleString()}
              </span>
            </div>

            {/* Taka Coins */}
            <div style={{ ...styles.badge, borderColor: '#f39c12' }}>
              <span style={{ fontSize: '11px', color: '#bdc3c7' }}>টাকা</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>
                ৳ {coins}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              style={styles.soundBtn}
              title="সাউন্ড অন/অফ"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Nitro / Tong-er Cha Meter */}
          {nitroActive && (
            <div style={styles.nitroBanner}>
              🔥 <strong>টংয়ের লাল চা বুস্ট!</strong> স্পিড ১২০ কিমি/ঘণ্টা ({nitroTimeLeft}s)
            </div>
          )}

          {/* Near Miss Bonus Popup */}
          {nearMissNotification && (
            <div style={styles.nearMissPopup}>
              {nearMissNotification}
            </div>
          )}

          {/* Stage Arrival Popup Banner */}
          {stageNotification && (
            <div style={styles.stagePopup}>
              <div style={{ fontSize: '14px', color: '#f1c40f', fontWeight: 'bold' }}>
                📍 নতুন মাইলস্টোন
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                {stageNotification.name}
              </div>
              <div style={{ fontSize: '13px', color: '#ecf0f1' }}>
                {stageNotification.subtitle}
              </div>
            </div>
          )}

          {/* Mobile On-Screen Controls */}
          <div style={styles.mobileControls}>
            {/* Left / Right Steering */}
            <div style={styles.steerCluster}>
              <button
                style={styles.controlBtn}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, left: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, left: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, left: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, left: false }))}
              >
                ◀
              </button>
              <button
                style={styles.controlBtn}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, right: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, right: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, right: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, right: false }))}
              >
                ▶
              </button>
            </div>

            {/* Action Buttons: Horn & Gas */}
            <div style={styles.actionCluster}>
              <button
                style={{ ...styles.controlBtn, background: 'rgba(230, 126, 34, 0.85)' }}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, horn: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, horn: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, horn: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, horn: false }))}
              >
                📢 হর্ন
              </button>
              <button
                style={{ ...styles.controlBtn, background: 'rgba(39, 174, 96, 0.85)' }}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, up: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, up: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, up: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, up: false }))}
              >
                🚀 এক্সিলারেটর
              </button>
            </div>
          </div>
        </>
      )}

      {/* 2. START SCREEN */}
      {gameState === 'START' && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: '44px', marginBottom: '6px' }}>🏍️💨</div>
            <h1 style={styles.title}>ঢাকা বাইক রাশ ৩ডি</h1>
            <h2 style={styles.subtitle}>
              যাত্রাবাড়ী ➔ প্রগতি সরণি ➔ কুড়িল ফ্লাইওভার ➔ উত্তরা হাউস বিল্ডিং
            </h2>

            <div style={styles.featureGrid}>
              <div style={styles.featureItem}>🛺 <strong>সিএনজি:</strong> হুটহাট লেন বদলাবে</div>
              <div style={styles.featureItem}>🚌 <strong>লোকাল বাস:</strong> ওভারটেক করা কঠিন</div>
              <div style={styles.featureItem}>🚲 <strong>রিকশা:</strong> হর্ন বাজালে সাইড দেবে</div>
              <div style={styles.featureItem}>☕ <strong>টংয়ের চা:</strong> সুপার স্পিড নাইট্রো!</div>
            </div>

            <div style={styles.instructions}>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#ecf0f1' }}>
                🎮 <strong>কন্ট্রোল:</strong> ⬅️ / ➡️ বা <strong>A / D</strong> দিয়ে লেন পরিবর্তন করুন |
                <strong> Space / H</strong> দিয়ে হর্ন বাজান | ⬆️ / <strong>W</strong> দিয়ে গতি বাড়ান
              </p>
            </div>

            <button style={styles.primaryBtn} onClick={onStartGame}>
              রাইড শুরু করুন 🚀
            </button>
          </div>
        </div>
      )}

      {/* 3. GAME OVER SCREEN */}
      {gameState === 'GAMEOVER' && (
        <div style={styles.modalBackdrop}>
          <div style={{ ...styles.modalBox, borderColor: '#e74c3c' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>💥</div>
            <h1 style={{ ...styles.title, color: '#e74c3c' }}>মামা দেইখা চালান!</h1>
            <p style={{ color: '#bdc3c7', fontSize: '15px', marginTop: 0 }}>
              দুর্ঘটনায় বাইক ক্র্যাশ করেছে!
            </p>

            <div style={styles.statsCard}>
              <div style={styles.statRow}>
                <span>পৌঁছেছিলেন:</span>
                <strong style={{ color: '#3498db' }}>{Math.floor(distanceM)} মিটার</strong>
              </div>
              <div style={styles.statRow}>
                <span>সর্বমোট স্কোর:</span>
                <strong style={{ color: '#f1c40f' }}>{score.toLocaleString()}</strong>
              </div>
              <div style={styles.statRow}>
                <span>টাকা কালেক্টেড:</span>
                <strong style={{ color: '#2ecc71' }}>৳ {coins}</strong>
              </div>
            </div>

            <button style={styles.primaryBtn} onClick={onRestartGame}>
              আবার চেষ্টা করুন 🔄
            </button>
          </div>
        </div>
      )}

      {/* 4. VICTORY SCREEN */}
      {gameState === 'VICTORY' && (
        <div style={styles.modalBackdrop}>
          <div style={{ ...styles.modalBox, borderColor: '#2ecc71' }}>
            <div style={{ fontSize: '52px', marginBottom: '8px' }}>🏆🏁</div>
            <h1 style={{ ...styles.title, color: '#2ecc71' }}>অভিনন্দন!</h1>
            <h2 style={styles.subtitle}>
              আপনি নিরাপদে উত্তরা হাউস বিল্ডিং পৌঁছেছেন!
            </h2>
            <p style={{ color: '#ecf0f1', fontSize: '14px' }}>
              যাত্রাবাড়ী থেকে উত্তরা পর্যন্ত পুরো ১২ কিলোমিটার সফলভাবে ড্রাইভ সম্পন্ন হয়েছে!
            </p>

            <div style={styles.statsCard}>
              <div style={styles.statRow}>
                <span>ফাইনাল স্কোর:</span>
                <strong style={{ color: '#f1c40f', fontSize: '20px' }}>{score.toLocaleString()}</strong>
              </div>
              <div style={styles.statRow}>
                <span>মোট টাকা:</span>
                <strong style={{ color: '#2ecc71', fontSize: '18px' }}>৳ {coins}</strong>
              </div>
            </div>

            <button style={{ ...styles.primaryBtn, background: '#27ae60' }} onClick={onRestartGame}>
              আবার নতুন রাইড শুরু করুন 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    fontFamily: "'Hind Siliguri', sans-serif",
    userSelect: 'none'
  },
  gpsTracker: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '92%',
    maxWidth: '680px',
    background: 'rgba(18, 24, 38, 0.88)',
    borderRadius: '12px',
    padding: '10px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)'
  },
  gpsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  progressBarBg: {
    position: 'relative',
    height: '8px',
    background: '#34495e',
    borderRadius: '6px',
    overflow: 'visible',
    marginBottom: '6px'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e67e22, #f1c40f, #2ecc71)',
    borderRadius: '6px',
    transition: 'width 0.1s linear'
  },
  bikeProgressIcon: {
    position: 'absolute',
    top: '-9px',
    fontSize: '18px',
    transition: 'left 0.1s linear'
  },
  milestoneLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 4px'
  },
  topBadgesRow: {
    position: 'absolute',
    top: '88px',
    left: '16px',
    right: '16px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    pointerEvents: 'auto'
  },
  badge: {
    background: 'rgba(18, 24, 38, 0.85)',
    padding: '6px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(6px)'
  },
  soundBtn: {
    marginLeft: 'auto',
    background: 'rgba(18, 24, 38, 0.85)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '18px',
    padding: '8px 12px',
    cursor: 'pointer'
  },
  nitroBanner: {
    position: 'absolute',
    top: '155px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(90deg, #e67e22, #d35400)',
    color: '#fff',
    padding: '8px 24px',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(230, 126, 34, 0.8)',
    animation: 'pulse 1s infinite alternate'
  },
  nearMissPopup: {
    position: 'absolute',
    top: '210px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(231, 76, 60, 0.95)',
    color: '#ffffff',
    padding: '8px 22px',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    border: '2px solid #fff'
  },
  stagePopup: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(18, 24, 38, 0.92)',
    border: '2px solid #f1c40f',
    borderRadius: '16px',
    padding: '20px 36px',
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
    backdropFilter: 'blur(10px)'
  },
  mobileControls: {
    position: 'absolute',
    bottom: '24px',
    left: '16px',
    right: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'auto'
  },
  steerCluster: {
    display: 'flex',
    gap: '12px'
  },
  actionCluster: {
    display: 'flex',
    gap: '12px'
  },
  controlBtn: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(18, 24, 38, 0.85)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    touchAction: 'manipulation',
    boxShadow: '0 6px 18px rgba(0,0,0,0.4)'
  },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.78)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    backdropFilter: 'blur(6px)'
  },
  modalBox: {
    background: '#1a202c',
    border: '2px solid #3498db',
    borderRadius: '18px',
    padding: '30px',
    width: '90%',
    maxWidth: '520px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
  },
  title: {
    margin: '0 0 6px 0',
    color: '#ffffff',
    fontSize: '30px',
    fontWeight: 700
  },
  subtitle: {
    margin: '0 0 16px 0',
    color: '#f1c40f',
    fontSize: '15px',
    fontWeight: 600
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '16px',
    textAlign: 'left',
    background: 'rgba(255,255,255,0.05)',
    padding: '12px',
    borderRadius: '10px'
  },
  featureItem: {
    fontSize: '13px',
    color: '#ecf0f1'
  },
  instructions: {
    background: 'rgba(0,0,0,0.3)',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '14px 38px',
    borderRadius: '30px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(52, 152, 219, 0.5)',
    transition: 'transform 0.1s ease'
  },
  statsCard: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '14px 18px',
    margin: '16px 0 24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    color: '#ecf0f1'
  }
};
