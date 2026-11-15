import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createPlayerBike,
  createCNG,
  createBus,
  createRickshaw,
  createCoin,
  createChaiCup,
  createPothole,
  createMetroPillar,
  createFlyoverRailing,
  createAirplane
} from '../utils/models';
import { sounds } from '../utils/audio';

export const STAGES = [
  { id: 1, name: 'যাত্রাবাড়ী', subtitle: 'Jatrabari Bus Terminal', startM: 0, endM: 2500, color: '#e67e22' },
  { id: 2, name: 'প্রগতি সরণি', subtitle: 'Progoti Saroni (Badda/JFP)', startM: 2500, endM: 5500, color: '#9b59b6' },
  { id: 3, name: 'কুড়িল ফ্লাইওভার', subtitle: 'Kuril Flyover Expressway', startM: 5500, endM: 8000, color: '#3498db' },
  { id: 4, name: 'বিমানবন্দর সড়ক', subtitle: 'Airport Road Highway', startM: 8000, endM: 10500, color: '#1abc9c' },
  { id: 5, name: 'উত্তরা হাউস বিল্ডিং', subtitle: 'Uttara House Building (Finish)', startM: 10500, endM: 12000, color: '#2ecc71' }
];

export default function GameCanvas({
  gameState, // 'START', 'PLAYING', 'GAMEOVER', 'VICTORY'
  onScoreUpdate,
  onStageChange,
  onGameOver,
  onVictory,
  onNearMiss,
  onHornHonk,
  mobileInputs
}) {
  const containerRef = useRef(null);

  // Internal game engine references
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerPos: { x: 0, y: 0, z: 0 },
    playerVelX: 0,
    speed: 0,
    maxSpeed: 55, // normal max km/h
    nitroActive: false,
    nitroTimeLeft: 0,
    distanceMeters: 0,
    currentStageIndex: 0,
    score: 0,
    coinsCollected: 0,
    keys: { left: false, right: false, up: false, down: false, horn: false, nitro: false },
    traffic: [],
    collectibles: [],
    roadChunks: [],
    decorations: [],
    airplane: null,
    finishArch: null,
    lastTime: 0,
    animFrameId: null
  });

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const g = gameRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') g.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') g.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') g.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') g.keys.down = true;
      if (e.key === ' ' || e.key === 'h' || e.key === 'H') {
        if (!g.keys.horn) triggerHorn();
        g.keys.horn = true;
      }
    };

    const handleKeyUp = (e) => {
      const g = gameRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') g.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') g.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') g.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') g.keys.down = false;
      if (e.key === ' ' || e.key === 'h' || e.key === 'H') g.keys.horn = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update mobile inputs into game keys
  useEffect(() => {
    if (mobileInputs) {
      const g = gameRef.current;
      g.keys.left = mobileInputs.left;
      g.keys.right = mobileInputs.right;
      g.keys.up = mobileInputs.up;
      g.keys.down = mobileInputs.down;
      if (mobileInputs.horn && !g.keys.horn) {
        triggerHorn();
      }
      g.keys.horn = mobileInputs.horn;
    }
  }, [mobileInputs]);

  // Horn action
  const triggerHorn = () => {
    sounds.playHorn();
    if (onHornHonk) onHornHonk();

    // Make nearby rickshaws move to the side!
    const g = gameRef.current;
    g.traffic.forEach(item => {
      if (item.mesh.userData.type === 'rickshaw') {
        const dist = Math.abs(item.mesh.position.z - g.playerPos.z);
        if (dist < 28 && item.mesh.position.z < g.playerPos.z) {
          // Move to the left shoulder!
          item.targetX = -4.8;
          item.mesh.rotation.y = -0.15;
          setTimeout(() => {
            if (item.mesh) item.mesh.rotation.y = 0;
          }, 800);
        }
      }
    });
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Dhaka daylight sky
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
    camera.position.set(0, 4.2, 7.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 5. Player Bike
    const player = createPlayerBike();
    player.position.set(0, 0, 0);
    scene.add(player);

    // 6. Build Initial Road Chunks
    const roadChunks = [];
    const CHUNK_LENGTH = 50;
    const TOTAL_CHUNKS = 8;

    const roadGeo = new THREE.PlaneGeometry(12, CHUNK_LENGTH);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });

    const sidewalkGeo = new THREE.BoxGeometry(2.5, 0.4, CHUNK_LENGTH);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.9 });

    for (let i = 0; i < TOTAL_CHUNKS; i++) {
      const chunkGroup = new THREE.Group();
      const zPos = -i * CHUNK_LENGTH;

      // Asphalt Road
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0, 0);
      road.receiveShadow = true;

      // Dashed Lane Markings
      for (let lane = -1; lane <= 1; lane++) {
        const laneX = lane * 2.8;
        for (let stripe = 0; stripe < 8; stripe++) {
          const dash = new THREE.Mesh(
            new THREE.PlaneGeometry(0.18, 2.5),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(laneX, 0.02, -CHUNK_LENGTH / 2 + stripe * 6 + 3);
          chunkGroup.add(dash);
        }
      }

      // Sidewalks
      const leftWalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      leftWalk.position.set(-7.25, 0.2, 0);
      const rightWalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      rightWalk.position.set(7.25, 0.2, 0);
      chunkGroup.add(road, leftWalk, rightWalk);

      // Roadside roadside trees / lamps
      for (let s = -CHUNK_LENGTH / 2; s < CHUNK_LENGTH / 2; s += 16) {
        // Lamp post
        const lamp = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.1, 4.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x7f8c8d })
        );
        lamp.position.set(-6.8, 2.25, s);
        chunkGroup.add(lamp);
      }

      chunkGroup.position.set(0, 0, zPos);
      scene.add(chunkGroup);
      roadChunks.push(chunkGroup);
    }

    // 7. Finish Line Archway at Uttara (at z = -12000 scaled down for game feel)
    // In game units, 12,000 meters = 2,400 game Z units (5 meters per unit)
    const FINISH_Z = -2400;
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), pillarMat);
    pLeft.position.set(-6.5, 4.5, 0);
    const pRight = pLeft.clone();
    pRight.position.x = 6.5;

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 1.4), pillarMat);
    crossBeam.position.set(0, 8.5, 0);

    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bCtx = bannerCanvas.getContext('2d');
    bCtx.fillStyle = '#27ae60';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 42px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('উত্তরা হাউস বিল্ডিং 🏁', 256, 75);
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 1.6),
      new THREE.MeshBasicMaterial({ map: bannerTex })
    );
    bannerMesh.position.set(0, 8.5, 0.72);
    archGroup.add(pLeft, pRight, crossBeam, bannerMesh);
    archGroup.position.set(0, 0, FINISH_Z);
    scene.add(archGroup);

    // Save references to gameRef
    const g = gameRef.current;
    g.scene = scene;
    g.camera = camera;
    g.renderer = renderer;
    g.player = player;
    g.roadChunks = roadChunks;
    g.finishArch = archGroup;
    g.lastTime = performance.now();

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !g.renderer || !g.camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      g.camera.aspect = w / h;
      g.camera.updateProjectionMatrix();
      g.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (g.animFrameId) cancelAnimationFrame(g.animFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sounds.stopEngine();
    };
  }, []);

  // Main Game Loop
  useEffect(() => {
    const g = gameRef.current;

    if (gameState === 'PLAYING') {
      sounds.startEngine();
    } else {
      sounds.stopEngine();
    }

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - g.lastTime) / 1000, 0.1);
      g.lastTime = currentTime;

      if (gameState === 'PLAYING') {
        updateGame(dt);
      }

      if (g.renderer && g.scene && g.camera) {
        g.renderer.render(g.scene, g.camera);
      }

      g.animFrameId = requestAnimationFrame(loop);
    };

    g.animFrameId = requestAnimationFrame(loop);
    return () => {
      if (g.animFrameId) cancelAnimationFrame(g.animFrameId);
    };
  }, [gameState]);

  // Update Game Physics & Logic
  const updateGame = (dt) => {
    const g = gameRef.current;
    const player = g.player;
    if (!player) return;

    // 1. Acceleration & Speed
    let targetSpeed = 45; // default cruise speed
    if (g.keys.up) targetSpeed = 80;
    if (g.keys.down) targetSpeed = 20;

    // Nitro boost override
    if (g.nitroActive) {
      targetSpeed = 120;
      g.nitroTimeLeft -= dt;
      if (g.nitroTimeLeft <= 0) {
        g.nitroActive = false;
      }
    }

    g.speed += (targetSpeed - g.speed) * dt * 2.5;
    const forwardMovement = (g.speed * 1.6) * dt; // speed to game units
    g.playerPos.z -= forwardMovement;
    g.distanceMeters += forwardMovement * 5.0; // 5 meters per unit

    // Sound engine modulation
    sounds.updateEngine(g.speed / 120);

    // 2. Steering Left / Right
    let steerInput = 0;
    if (g.keys.left) steerInput -= 1;
    if (g.keys.right) steerInput += 1;

    const steerSpeed = 8.5;
    g.playerVelX += (steerInput * steerSpeed - g.playerVelX) * dt * 8.0;
    g.playerPos.x += g.playerVelX * dt;

    // Road boundaries
    g.playerPos.x = Math.max(-5.2, Math.min(5.2, g.playerPos.x));

    // Update Player Mesh Position & Leaning
    player.position.set(g.playerPos.x, g.playerPos.y, g.playerPos.z);
    player.rotation.z = -g.playerVelX * 0.045; // leaning when turning

    // 3. Camera Follow
    g.camera.position.x += (g.playerPos.x * 0.55 - g.camera.position.x) * dt * 5.0;
    g.camera.position.y = 4.2 + (g.speed > 80 ? 0.3 : 0);
    g.camera.position.z = g.playerPos.z + 7.2;
    g.camera.lookAt(g.playerPos.x * 0.6, 1.4, g.playerPos.z - 12);

    // 4. Infinite Road Recycling
    const CHUNK_LENGTH = 50;
    g.roadChunks.forEach(chunk => {
      if (chunk.position.z > g.playerPos.z + CHUNK_LENGTH) {
        chunk.position.z -= g.roadChunks.length * CHUNK_LENGTH;
      }
    });

    // 5. Stage Progress & Environment Shifts
    const currentStage = STAGES.find(
      s => g.distanceMeters >= s.startM && g.distanceMeters < s.endM
    ) || STAGES[STAGES.length - 1];

    if (currentStage.id !== g.currentStageIndex + 1) {
      g.currentStageIndex = currentStage.id - 1;
      sounds.playMilestone();
      if (onStageChange) onStageChange(currentStage);

      // Stage 4 (Airport Road): Spawn Airplane in sky
      if (currentStage.id === 4 && !g.airplane) {
        const plane = createAirplane();
        g.scene.add(plane);
        g.airplane = plane;
      }

      // Stage 5 (Uttara): Spawn overhead Metro Rail pillars
      if (currentStage.id === 5) {
        for (let pz = g.playerPos.z - 30; pz > g.playerPos.z - 300; pz -= 45) {
          const pillar = createMetroPillar();
          pillar.position.set(0, 0, pz);
          g.scene.add(pillar);
          g.decorations.push(pillar);
        }
      }
    }

    // Animate airplane if active
    if (g.airplane) {
      g.airplane.position.z = g.playerPos.z - 60;
      g.airplane.position.x -= dt * 14;
      g.airplane.position.y += dt * 1.5;
    }

    // 6. Traffic Spawning & Moving
    manageTraffic(dt);

    // 7. Collectibles (Coins & Tong-er Cha)
    manageCollectibles(dt);

    // 8. Score accumulation
    g.score += Math.floor(g.speed * dt * 1.5);
    if (onScoreUpdate) {
      onScoreUpdate({
        score: g.score,
        speed: Math.round(g.speed),
        distanceM: Math.floor(g.distanceMeters),
        coins: g.coinsCollected,
        nitroActive: g.nitroActive,
        nitroTimeLeft: Math.ceil(g.nitroTimeLeft)
      });
    }

    // 9. Victory Condition (Uttara House Building reached!)
    if (g.distanceMeters >= 12000) {
      sounds.playVictory();
      if (onVictory) {
        onVictory({
          score: g.score,
          distanceM: 12000,
          coins: g.coinsCollected
        });
      }
    }
  };

  // Manage Road Traffic
  const manageTraffic = (dt) => {
    const g = gameRef.current;

    // Spawn new traffic ahead
    if (g.traffic.length < 9) {
      const spawnZ = g.playerPos.z - (70 + Math.random() * 60);

      // Select vehicle type
      const rand = Math.random();
      let vehicleMesh;
      let vehicleSpeed = 20;

      if (rand < 0.35) {
        vehicleMesh = createCNG();
        vehicleSpeed = 28 + Math.random() * 15;
      } else if (rand < 0.70) {
        vehicleMesh = createBus(Math.floor(Math.random() * 3));
        vehicleSpeed = 32 + Math.random() * 20;
      } else if (rand < 0.90) {
        vehicleMesh = createRickshaw();
        vehicleSpeed = 10 + Math.random() * 6; // Rickshaws are slow
      } else {
        vehicleMesh = createPothole();
        vehicleSpeed = 0; // Stationary road hazard
      }

      // Pick lane: -4.0, -1.8, 1.8, 4.0
      const lanes = [-4.0, -1.8, 1.8, 4.0];
      // Rickshaws prefer the slow outer lanes
      const laneX = (vehicleMesh.userData.type === 'rickshaw')
        ? (Math.random() < 0.7 ? -4.0 : 4.0)
        : lanes[Math.floor(Math.random() * lanes.length)];

      vehicleMesh.position.set(laneX, 0, spawnZ);
      g.scene.add(vehicleMesh);

      g.traffic.push({
        mesh: vehicleMesh,
        speed: vehicleSpeed,
        targetX: laneX,
        passed: false
      });
    }

    // Update traffic positions & check collisions
    for (let i = g.traffic.length - 1; i >= 0; i--) {
      const item = g.traffic[i];
      const mesh = item.mesh;

      // Move forward along road
      mesh.position.z -= item.speed * dt * 1.6;

      // Smooth lane shifts for vehicle dodging
      if (item.targetX !== undefined) {
        mesh.position.x += (item.targetX - mesh.position.x) * dt * 3.0;
      }

      // Collision Detection with Player
      const dx = Math.abs(mesh.position.x - g.playerPos.x);
      const dz = Math.abs(mesh.position.z - g.playerPos.z);
      const width = mesh.userData.width || 1.6;
      const length = mesh.userData.length || 2.5;

      // Near Miss Check (Reward close overtaking!)
      if (!item.passed && dz < length * 0.8 && dx > width * 0.45 && dx < width * 0.85) {
        item.passed = true;
        sounds.playNearMiss();
        g.score += 250;
        if (onNearMiss) onNearMiss('🔥 ওস্তাদ এক ইঞ্চি বাঁচলেন! +250');
      }

      // Direct Crash Hit
      if (dx < (width * 0.42 + 0.3) && dz < (length * 0.45 + 0.5)) {
        if (g.nitroActive) {
          // In Nitro mode: destroy / knock away obstacle!
          mesh.position.y += 3;
          mesh.rotation.x += 1;
          g.score += 500;
        } else {
          // Crash!
          sounds.playCrash();
          if (onGameOver) {
            onGameOver({
              score: g.score,
              distanceM: Math.floor(g.distanceMeters),
              coins: g.coinsCollected,
              cause: mesh.userData.name || mesh.userData.type || 'রোড ট্র্যাফিক'
            });
          }
          return;
        }
      }

      // Despawn traffic when behind player
      if (mesh.position.z > g.playerPos.z + 20) {
        g.scene.remove(mesh);
        g.traffic.splice(i, 1);
      }
    }
  };

  // Manage Collectibles (Coins & Chai)
  const manageCollectibles = (dt) => {
    const g = gameRef.current;

    // Spawn collectibles
    if (g.collectibles.length < 6) {
      const spawnZ = g.playerPos.z - (50 + Math.random() * 80);
      const lanes = [-3.8, -1.8, 1.8, 3.8];
      const laneX = lanes[Math.floor(Math.random() * lanes.length)];

      const isChai = Math.random() < 0.22; // 22% chance of Tong-er Cha
      const itemMesh = isChai ? createChaiCup() : createCoin();
      itemMesh.position.set(laneX, 0.9, spawnZ);
      g.scene.add(itemMesh);

      g.collectibles.push({
        mesh: itemMesh,
        type: isChai ? 'chai' : 'coin'
      });
    }

    // Update & check collection
    for (let i = g.collectibles.length - 1; i >= 0; i--) {
      const item = g.collectibles[i];
      const mesh = item.mesh;

      // Rotate continuously
      mesh.rotation.y += dt * 3.5;

      const dx = Math.abs(mesh.position.x - g.playerPos.x);
      const dz = Math.abs(mesh.position.z - g.playerPos.z);

      if (dx < 1.1 && dz < 1.3) {
        // Collected!
        if (item.type === 'coin') {
          sounds.playCoin();
          g.coinsCollected += 1;
          g.score += 100;
        } else if (item.type === 'chai') {
          sounds.playNitro();
          g.nitroActive = true;
          g.nitroTimeLeft = 6.0; // 6 seconds of Nitro!
          g.score += 300;
        }

        g.scene.remove(mesh);
        g.collectibles.splice(i, 1);
        continue;
      }

      // Despawn behind player
      if (mesh.position.z > g.playerPos.z + 15) {
        g.scene.remove(mesh);
        g.collectibles.splice(i, 1);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}
    />
  );
}
