import React from 'react';
import { STAGES } from './GameCanvas';

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
  const { score, speed, distanceM, coins, nitroActive, nitroTimeLeft, splineT = 0 } = hudData;

  const progressPercent = Math.min(100, Math.round((distanceM / 12000) * 100));

  const currentStage = STAGES.find(s => distanceM >= s.startM && distanceM < s.endM) || STAGES[STAGES.length - 1];
  const nextStage = STAGES.find(s => distanceM < s.startM) || null;
  const distToNext = nextStage ? (nextStage.startM - distanceM) : 0;

  // Real Dhaka Polyline Map coordinates for SVG ViewBox (0 0 140 160)
  // Matching real waypoints: Jatrabari ➔ Sayedabad ➔ Rampura ➔ Badda ➔ Kuril ➔ Airport ➔ Uttara
  const svgPathD = "M 95 145 C 105 130, 75 120, 80 108 C 95 95, 115 88, 70 72 C 45 60, 85 45, 50 32 C 38 25, 42 18, 38 12";

  // Calculate live GPS marker position along the SVG path
  // Approximate path sampling for smooth GPS marker placement
  const t = Math.min(1.0, Math.max(0.0, splineT || (distanceM / 12000)));
  const mapY = 145 - t * 133;
  // Sinusoidal spline shape to match the exact curve
  const mapX = 95 - t * 57 + Math.sin(t * Math.PI * 2.8) * 18;

  return (
    <div style={styles.overlayContainer}>
      {gameState === 'PLAYING' && (
        <>
          {/* 1. VISIBLE REAL-MAP GPS MINI-MAP HUD (Top-Right) */}
          <div style={styles.gpsMiniMapCard}>
            <div style={styles.miniMapHeader}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#00f0ff' }}>
                📡 ঢাকা রিয়েল ম্যাপ
              </span>
              <span style={{ fontSize: '11px', color: '#2ecc71', fontWeight: 'bold' }}>
                {progressPercent}%
              </span>
            </div>

            <div style={styles.miniMapCanvas}>
              <svg width="100%" height="150" viewBox="0 0 140 160">
                <defs>
                  <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="140" height="160" fill="url(#grid)" rx="8" />

                {/* Real Curving Dhaka Corridor Route */}
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#34495e"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Active Driven Glowing Segment */}
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#00d2d3"
                  strokeWidth="4"
                  strokeDasharray="180"
                  strokeDashoffset={180 - t * 180}
                  strokeLinecap="round"
                />

                {/* Key Landmark Waypoints on Real Map */}
                <circle cx="95" cy="145" r="3.5" fill="#e67e22" />
                <text x="50" y="148" fill="#ecf0f1" fontSize="8" fontWeight="bold">যাত্রাবাড়ী</text>

                <circle cx="85" cy="100" r="3.5" fill="#9b59b6" />
                <text x="25" y="103" fill="#ecf0f1" fontSize="8">রামপুরা / বাড্ডা</text>

                <circle cx="68" cy="62" r="4.0" fill="#3498db" />
                <text x="15" y="65" fill="#f1c40f" fontSize="8" fontWeight="bold">কুড়িল ফ্লাইওভার</text>

                <circle cx="50" cy="32" r="3.5" fill="#1abc9c" />
                <text x="5" y="35" fill="#ecf0f1" fontSize="8">এয়ারপোর্ট</text>

                <circle cx="38" cy="12" r="4.5" fill="#2ecc71" />
                <text x="46" y="15" fill="#2ecc71" fontSize="8" fontWeight="bold">উত্তরা 🏁</text>

                {/* Pulsing Live Bike GPS Pin */}
                <circle cx={mapX} cy={mapY} r="7" fill="rgba(0, 240, 255, 0.3)" />
                <circle cx={mapX} cy={mapY} r="4" fill="#00f0ff" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>

            <div style={styles.miniMapFooter}>
              {nextStage ? (
                <span>পরবর্তী: <strong>{nextStage.name}</strong> ({distToNext}মি)</span>
              ) : (
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>উত্তরা ফিনিশ লাইন সামনে!</span>
              )}
            </div>
          </div>

          {/* 2. Top-Left Status Bar */}
          <div style={styles.topStatusCluster}>
            <div style={{ ...styles.badge, borderColor: speed > 70 ? '#e74c3c' : (speed > 40 ? '#00d2d3' : '#2ecc71') }}>
              <span style={{ fontSize: '10px', color: '#bdc3c7' }}>গতি</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                {speed} <span style={{ fontSize: '12px', color: '#bdc3c7' }}>KM/H</span>
              </span>
            </div>

            <div style={styles.badge}>
              <span style={{ fontSize: '10px', color: '#bdc3c7' }}>স্কোর</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
                {score.toLocaleString()}
              </span>
            </div>

            <div style={{ ...styles.badge, borderColor: '#f39c12' }}>
              <span style={{ fontSize: '10px', color: '#bdc3c7' }}>টাকা</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>
                ৳ {coins}
              </span>
            </div>

            <button onClick={onToggleMute} style={styles.soundBtn} title="সাউন্ড অন/অফ">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Nitro Banner */}
          {nitroActive && (
            <div style={styles.nitroBanner}>
              🔥 <strong>টংয়ের লাল চা বুস্ট!</strong> স্পিড ১১০ কিমি/ঘণ্টা ({nitroTimeLeft}s)
            </div>
          )}

          {/* Near Miss Alert */}
          {nearMissNotification && (
            <div style={styles.nearMissPopup}>
              {nearMissNotification}
            </div>
          )}

          {/* Stage Arrival Popup Banner */}
          {stageNotification && (
            <div style={styles.stagePopup}>
              <div style={{ fontSize: '13px', color: '#00f0ff', fontWeight: 'bold' }}>
                📍 নতুন মাইলস্টোন
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#ffffff' }}>
                {stageNotification.name}
              </div>
              <div style={{ fontSize: '13px', color: '#ecf0f1' }}>
                {stageNotification.subtitle}
              </div>
            </div>
          )}

          {/* 3. Mobile Touch Controls */}
          <div style={styles.mobileControls}>
            <div style={styles.steerCluster}>
              <button
                style={styles.steerBtn}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, left: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, left: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, left: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, left: false }))}
              >
                ◀ বামে
              </button>
              <button
                style={styles.steerBtn}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, right: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, right: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, right: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, right: false }))}
              >
                ডানে ▶
              </button>
            </div>

            <div style={styles.actionCluster}>
              <button
                style={{ ...styles.actionBtn, background: '#e67e22' }}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, horn: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, horn: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, horn: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, horn: false }))}
              >
                📢 হর্ন
              </button>
              <button
                style={{ ...styles.actionBtn, background: '#c0392b' }}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, down: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, down: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, down: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, down: false }))}
              >
                🛑 ব্রেক
              </button>
              <button
                style={{ ...styles.actionBtn, background: '#27ae60' }}
                onTouchStart={() => setMobileInputs(prev => ({ ...prev, up: true }))}
                onTouchEnd={() => setMobileInputs(prev => ({ ...prev, up: false }))}
                onMouseDown={() => setMobileInputs(prev => ({ ...prev, up: true }))}
                onMouseUp={() => setMobileInputs(prev => ({ ...prev, up: false }))}
              >
                🚀 গতি
              </button>
            </div>
          </div>
        </>
      )}

      {/* START SCREEN */}
      {gameState === 'START' && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: '46px', marginBottom: '4px' }}>🏍️💨</div>
            <h1 style={styles.title}>ঢাকা বাইক রাশ ৩ডি</h1>
            <h2 style={styles.subtitle}>
              আসল ম্যাপে: যাত্রাবাড়ী ➔ রামপুরা ➔ কুড়িল ফ্লাইওভার ➔ উত্তরা (১২ কিমি)
            </h2>

            <div style={styles.featureGrid}>
              <div style={styles.featureItem}>🗺️ <strong>রিয়েল ম্যাপ রোড:</strong> বাঁকা রাস্তা ও ফ্লাইওভার লুপ</div>
              <div style={styles.featureItem}>🌉 <strong>কুড়িল ফ্লাইওভার:</strong> আকাশে ১৪ মিটার উঁচুতে ড্রাইভ</div>
              <div style={styles.featureItem}>🏢 <strong>আসল ঢাকা:</strong> বাড়ি, টং দোকান, বিরিয়ানি শপ</div>
              <div style={styles.featureItem}>📢 <strong>হর্ন মেকানিক্স:</strong> রিকশা সাইড দিয়ে সরে যাবে</div>
            </div>

            <div style={styles.instructions}>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#ecf0f1' }}>
                🎮 <strong>কন্ট্রোল:</strong> ⬅️ / ➡️ ডানে-বামে স্টিয়ারিং | <strong>⬆️ / W</strong> গতি বাড়ানো | <strong>⬇️ / S</strong> ব্রেক | <strong>Space / H</strong> হর্ন
              </p>
            </div>

            <button style={styles.primaryBtn} onClick={onStartGame}>
              রাইড শুরু করুন 🚀
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'GAMEOVER' && (
        <div style={styles.modalBackdrop}>
          <div style={{ ...styles.modalBox, borderColor: '#e74c3c' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>💥</div>
            <h1 style={{ ...styles.title, color: '#e74c3c' }}>মামা দেইখা চালান!</h1>
            <p style={{ color: '#bdc3c7', fontSize: '14px', marginTop: 0 }}>
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

      {/* VICTORY SCREEN */}
      {gameState === 'VICTORY' && (
        <div style={styles.modalBackdrop}>
          <div style={{ ...styles.modalBox, borderColor: '#2ecc71' }}>
            <div style={{ fontSize: '52px', marginBottom: '8px' }}>🏆🏁</div>
            <h1 style={{ ...styles.title, color: '#2ecc71' }}>অভিনন্দন!</h1>
            <h2 style={styles.subtitle}>
              আপনি নিরাপদে উত্তরা হাউস বিল্ডিং পৌঁছেছেন!
            </h2>
            <p style={{ color: '#ecf0f1', fontSize: '14px' }}>
              যাত্রাবাড়ী থেকে কুড়িল ফ্লাইওভার হয়ে উত্তরা পুরো ১২ কিমি সফলভাবে সম্পন্ন হয়েছে!
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
              আবার ড্রাইভ করুন 🚀
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
  gpsMiniMapCard: {
    position: 'absolute',
    top: '14px',
    right: '16px',
    width: '170px',
    background: 'rgba(15, 23, 42, 0.92)',
    borderRadius: '14px',
    padding: '10px',
    border: '1.5px solid rgba(0, 240, 255, 0.4)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    pointerEvents: 'auto'
  },
  miniMapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  miniMapCanvas: {
    width: '100%',
    height: '150px',
    background: 'rgba(0, 0, 0, 0.45)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative'
  },
  miniMapFooter: {
    marginTop: '6px',
    fontSize: '11px',
    color: '#cbd5e1',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  topStatusCluster: {
    position: 'absolute',
    top: '14px',
    left: '16px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    pointerEvents: 'auto'
  },
  badge: {
    background: 'rgba(15, 23, 42, 0.88)',
    padding: '6px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(6px)'
  },
  soundBtn: {
    background: 'rgba(15, 23, 42, 0.88)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '18px',
    padding: '8px 12px',
    cursor: 'pointer'
  },
  nitroBanner: {
    position: 'absolute',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(90deg, #e67e22, #d35400)',
    color: '#fff',
    padding: '8px 24px',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(230, 126, 34, 0.8)'
  },
  nearMissPopup: {
    position: 'absolute',
    top: '130px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(231, 76, 60, 0.95)',
    color: '#ffffff',
    padding: '8px 22px',
    borderRadius: '20px',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    border: '2px solid #fff'
  },
  stagePopup: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(15, 23, 42, 0.94)',
    border: '2px solid #00f0ff',
    borderRadius: '16px',
    padding: '20px 36px',
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
    backdropFilter: 'blur(10px)'
  },
  mobileControls: {
    position: 'absolute',
    bottom: '22px',
    left: '16px',
    right: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'auto'
  },
  steerCluster: {
    display: 'flex',
    gap: '10px'
  },
  actionCluster: {
    display: 'flex',
    gap: '10px'
  },
  steerBtn: {
    width: '68px',
    height: '62px',
    borderRadius: '14px',
    background: 'rgba(15, 23, 42, 0.85)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    touchAction: 'manipulation'
  },
  actionBtn: {
    width: '68px',
    height: '62px',
    borderRadius: '14px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    touchAction: 'manipulation'
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
    border: '2px solid #00f0ff',
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
    background: 'rgba(255,255,255,0.06)',
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
    background: 'linear-gradient(135deg, #0984e3, #00cec9)',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '14px 40px',
    borderRadius: '30px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 206, 201, 0.4)'
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
