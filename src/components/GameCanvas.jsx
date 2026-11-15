import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createPlayerBike,
  createCNG,
  createBus,
  createRickshaw,
  createCoin,
  createChaiCup,
  createDhakaBuilding,
  createDhakaShop,
  createDhakaBillboard,
  createDhakaTree,
  createMetroPillar,
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
  gameState,
  onScoreUpdate,
  onStageChange,
  onGameOver,
  onVictory,
  onNearMiss,
  onHornHonk,
  mobileInputs
}) {
  const containerRef = useRef(null);

  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerPos: { x: 0, y: 0, z: 0 },
    playerVelX: 0,
    speed: 0,
    nitroActive: false,
    nitroTimeLeft: 0,
    distanceMeters: 0,
    currentStageIndex: 0,
    score: 0,
    coinsCollected: 0,
    keys: { left: false, right: false, up: false, down: false, horn: false },
    traffic: [],
    collectibles: [],
    roadChunks: [],
    cityObjects: [],
    airplane: null,
    lastTime: 0,
    animFrameId: null
  });

  // Keyboard Controls
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

  // Mobile Touch Inputs Sync
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

  // Horn Action
  const triggerHorn = () => {
    sounds.playHorn();
    if (onHornHonk) onHornHonk();

    const g = gameRef.current;
    g.traffic.forEach(item => {
      if (item.mesh.userData.type === 'rickshaw') {
        const dist = Math.abs(item.mesh.position.z - g.playerPos.z);
        if (dist < 32 && item.mesh.position.z < g.playerPos.z) {
          item.targetX = -5.0; // Rickshaw dodges to shoulder
          item.mesh.rotation.y = -0.2;
          setTimeout(() => {
            if (item.mesh) item.mesh.rotation.y = 0;
          }, 900);
        }
      }
    });
  };

  // Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x74b9ff); // Bright Dhaka morning sky
    scene.fog = new THREE.FogExp2(0x74b9ff, 0.009);

    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 350);
    camera.position.set(0, 4.4, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    sunLight.position.set(30, 50, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Player Bike
    const player = createPlayerBike();
    player.position.set(0, 0, 0);
    scene.add(player);

    // Road & Dhaka City Chunks
    const roadChunks = [];
    const cityObjects = [];
    const CHUNK_LEN = 60;
    const NUM_CHUNKS = 8;

    const roadGeo = new THREE.PlaneGeometry(13, CHUNK_LEN);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.8 });
    const sidewalkGeo = new THREE.BoxGeometry(3.5, 0.45, CHUNK_LEN);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.9 });

    for (let i = 0; i < NUM_CHUNKS; i++) {
      const chunkGroup = new THREE.Group();
      const zPos = -i * CHUNK_LEN;

      // Asphalt Road
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;

      // Dashed Lane Stripes (4 Lanes)
      for (let lane = -1.5; lane <= 1.5; lane += 1) {
        if (lane === 0) continue;
        const lx = lane * 2.8;
        for (let s = 0; s < 10; s++) {
          const dash = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 2.8),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(lx, 0.02, -CHUNK_LEN / 2 + s * 6 + 3);
          chunkGroup.add(dash);
        }
      }

      // Yellow Center Line
      for (let s = 0; s < 10; s++) {
        const yDash = new THREE.Mesh(
          new THREE.PlaneGeometry(0.24, 3.2),
          new THREE.MeshBasicMaterial({ color: 0xf1c40f })
        );
        yDash.rotation.x = -Math.PI / 2;
        yDash.position.set(0, 0.02, -CHUNK_LEN / 2 + s * 6 + 3);
        chunkGroup.add(yDash);
      }

      // Sidewalks
      const leftWalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      leftWalk.position.set(-8.25, 0.22, 0);
      const rightWalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
      rightWalk.position.set(8.25, 0.22, 0);
      chunkGroup.add(road, leftWalk, rightWalk);

      // --- DHAKA CITY BUILDINGS & SHOPS ON SIDES ---
      // Left side buildings
      const leftBldg = createDhakaBuilding(i % 5);
      leftBldg.position.set(-16, 0, -CHUNK_LEN / 4);
      leftBldg.rotation.y = Math.PI / 2;
      chunkGroup.add(leftBldg);

      // Right side buildings
      const rightBldg = createDhakaBuilding((i + 2) % 5);
      rightBldg.position.set(16, 0, CHUNK_LEN / 4);
      rightBldg.rotation.y = -Math.PI / 2;
      chunkGroup.add(rightBldg);

      // Street level shops
      const shopLeft = createDhakaShop(i % 4);
      shopLeft.position.set(-9.5, 0, CHUNK_LEN / 4);
      shopLeft.rotation.y = Math.PI / 2;
      chunkGroup.add(shopLeft);

      // Roadside Trees
      const treeRight = createDhakaTree();
      treeRight.position.set(9.0, 0, -CHUNK_LEN / 4);
      chunkGroup.add(treeRight);

      // Commercial Billboards (every other chunk)
      if (i % 2 === 0) {
        const billboard = createDhakaBillboard(i / 2);
        billboard.position.set(12.5, 0, 0);
        billboard.rotation.y = -Math.PI / 2;
        chunkGroup.add(billboard);
      }

      chunkGroup.position.set(0, 0, zPos);
      scene.add(chunkGroup);
      roadChunks.push(chunkGroup);
    }

    // Finish Arch at Uttara (at z = -2400 game units = 12,000 meters)
    const FINISH_Z = -2400;
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(1.4, 10, 1.4), pillarMat);
    pLeft.position.set(-7.5, 5.0, 0);
    const pRight = pLeft.clone();
    pRight.position.x = 7.5;

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(16, 2.0, 1.6), pillarMat);
    crossBeam.position.set(0, 9.5, 0);

    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 128;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = '#27ae60';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 44px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('উত্তরা হাউস বিল্ডিং 🏁', 256, 75);
    const bTex = new THREE.CanvasTexture(bCanvas);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.8), new THREE.MeshBasicMaterial({ map: bTex }));
    banner.position.set(0, 9.5, 0.82);

    archGroup.add(pLeft, pRight, crossBeam, banner);
    archGroup.position.set(0, 0, FINISH_Z);
    scene.add(archGroup);

    const g = gameRef.current;
    g.scene = scene;
    g.camera = camera;
    g.renderer = renderer;
    g.player = player;
    g.roadChunks = roadChunks;
    g.cityObjects = cityObjects;
    g.lastTime = performance.now();

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

  // Main Animation Loop
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

  // Update Game Logic & Physics
  const updateGame = (dt) => {
    const g = gameRef.current;
    const player = g.player;
    if (!player) return;

    // --- 1. BALANCED, RESPONSIVE SPEED CONTROLS ---
    // Comfortable baseline cruise speed = 28 km/h (easy to steer and react)
    let targetSpeed = 28;

    if (g.keys.up) {
      // Accelerating
      targetSpeed = 68; // Sport speed
    } else if (g.keys.down) {
      // Active Braking
      targetSpeed = 12; // Controlled crawl
      if (player.userData && player.userData.tailLight) {
        player.userData.tailLight.material.color.setHex(0xff3838);
      }
    } else {
      if (player.userData && player.userData.tailLight) {
        player.userData.tailLight.material.color.setHex(0xaa0022);
      }
    }

    // Nitro Boost override
    if (g.nitroActive) {
      targetSpeed = 110;
      g.nitroTimeLeft -= dt;
      if (g.nitroTimeLeft <= 0) {
        g.nitroActive = false;
      }
    }

    // Smooth physics acceleration/deceleration
    const accelRate = g.keys.down ? 4.5 : (g.keys.up ? 3.0 : 2.0);
    g.speed += (targetSpeed - g.speed) * dt * accelRate;

    // Forward displacement
    const forwardMovement = (g.speed * 1.4) * dt;
    g.playerPos.z -= forwardMovement;
    g.distanceMeters += forwardMovement * 5.0;

    sounds.updateEngine(g.speed / 110);

    // --- 2. SNAPPY, RESPONSIVE STEERING CONTROLS ---
    let steerInput = 0;
    if (g.keys.left) steerInput -= 1;
    if (g.keys.right) steerInput += 1;

    // Snappy responsiveness: player turns immediately without feeling slippery
    const steerAgility = 11.5;
    g.playerVelX += (steerInput * steerAgility - g.playerVelX) * dt * 10.0;
    g.playerPos.x += g.playerVelX * dt;

    // Clamp inside 4 road lanes
    g.playerPos.x = Math.max(-5.5, Math.min(5.5, g.playerPos.x));

    // Dynamic Leaning & Steering Angle
    player.position.set(g.playerPos.x, g.playerPos.y, g.playerPos.z);
    player.rotation.z = -g.playerVelX * 0.055; // Sport banking angle
    player.rotation.y = -g.playerVelX * 0.025; // Gentle handlebar turn

    // --- 3. DYNAMIC THIRD-PERSON CAMERA ---
    g.camera.position.x += (g.playerPos.x * 0.65 - g.camera.position.x) * dt * 6.0;
    g.camera.position.y = 4.3;
    g.camera.position.z = g.playerPos.z + 7.6;
    g.camera.lookAt(g.playerPos.x * 0.6, 1.4, g.playerPos.z - 12);

    // --- 4. INFINITE ROAD & CITY RECYCLING ---
    const CHUNK_LEN = 60;
    g.roadChunks.forEach(chunk => {
      if (chunk.position.z > g.playerPos.z + CHUNK_LEN) {
        chunk.position.z -= g.roadChunks.length * CHUNK_LEN;
      }
    });

    // --- 5. STAGE MANAGEMENT ---
    const currentStage = STAGES.find(
      s => g.distanceMeters >= s.startM && g.distanceMeters < s.endM
    ) || STAGES[STAGES.length - 1];

    if (currentStage.id !== g.currentStageIndex + 1) {
      g.currentStageIndex = currentStage.id - 1;
      sounds.playMilestone();
      if (onStageChange) onStageChange(currentStage);

      // Stage 4: Spawn Biman Bangladesh Airplane
      if (currentStage.id === 4 && !g.airplane) {
        const plane = createAirplane();
        g.scene.add(plane);
        g.airplane = plane;
      }

      // Stage 5: Spawn Metro Rail viaduct
      if (currentStage.id === 5) {
        for (let pz = g.playerPos.z - 30; pz > g.playerPos.z - 300; pz -= 45) {
          const pillar = createMetroPillar();
          pillar.position.set(0, 0, pz);
          g.scene.add(pillar);
        }
      }
    }

    if (g.airplane) {
      g.airplane.position.z = g.playerPos.z - 65;
      g.airplane.position.x -= dt * 12;
      g.airplane.position.y += dt * 1.2;
    }

    // --- 6. TRAFFIC & OBSTACLES ---
    manageTraffic(dt);

    // --- 7. COLLECTIBLES ---
    manageCollectibles(dt);

    // --- 8. SCORE ACCUMULATION ---
    g.score += Math.floor(g.speed * dt * 1.5);
    if (onScoreUpdate) {
      onScoreUpdate({
        score: g.score,
        speed: Math.round(g.speed),
        distanceM: Math.floor(g.distanceMeters),
        coins: g.coinsCollected,
        nitroActive: g.nitroActive,
        nitroTimeLeft: Math.ceil(g.nitroTimeLeft),
        playerLaneX: g.playerPos.x
      });
    }

    // --- 9. VICTORY CHECK ---
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

  // Manage Traffic
  const manageTraffic = (dt) => {
    const g = gameRef.current;

    if (g.traffic.length < 8) {
      const spawnZ = g.playerPos.z - (70 + Math.random() * 60);
      const rand = Math.random();
      let vehicleMesh;
      let vehicleSpeed = 18;

      if (rand < 0.38) {
        vehicleMesh = createCNG();
        vehicleSpeed = 22 + Math.random() * 12;
      } else if (rand < 0.76) {
        vehicleMesh = createBus(Math.floor(Math.random() * 3));
        vehicleSpeed = 25 + Math.random() * 15;
      } else {
        vehicleMesh = createRickshaw();
        vehicleSpeed = 8 + Math.random() * 6; // Rickshaws are slow
      }

      const lanes = [-4.2, -1.8, 1.8, 4.2];
      const laneX = (vehicleMesh.userData.type === 'rickshaw')
        ? (Math.random() < 0.75 ? -4.2 : 4.2)
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

    for (let i = g.traffic.length - 1; i >= 0; i--) {
      const item = g.traffic[i];
      const mesh = item.mesh;

      mesh.position.z -= item.speed * dt * 1.4;

      if (item.targetX !== undefined) {
        mesh.position.x += (item.targetX - mesh.position.x) * dt * 3.5;
      }

      const dx = Math.abs(mesh.position.x - g.playerPos.x);
      const dz = Math.abs(mesh.position.z - g.playerPos.z);
      const width = mesh.userData.width || 1.6;
      const length = mesh.userData.length || 2.5;

      // Near Miss Check
      if (!item.passed && dz < length * 0.8 && dx > width * 0.45 && dx < width * 0.95) {
        item.passed = true;
        sounds.playNearMiss();
        g.score += 250;
        if (onNearMiss) onNearMiss('🔥 ওস্তাদ এক ইঞ্চি বাঁচলেন! +250');
      }

      // Direct Crash Hit
      if (dx < (width * 0.42 + 0.28) && dz < (length * 0.45 + 0.45)) {
        if (g.nitroActive) {
          mesh.position.y += 3;
          mesh.rotation.x += 1;
          g.score += 500;
        } else {
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

      if (mesh.position.z > g.playerPos.z + 20) {
        g.scene.remove(mesh);
        g.traffic.splice(i, 1);
      }
    }
  };

  // Manage Collectibles
  const manageCollectibles = (dt) => {
    const g = gameRef.current;

    if (g.collectibles.length < 5) {
      const spawnZ = g.playerPos.z - (50 + Math.random() * 80);
      const lanes = [-3.8, -1.8, 1.8, 3.8];
      const laneX = lanes[Math.floor(Math.random() * lanes.length)];

      const isChai = Math.random() < 0.24;
      const itemMesh = isChai ? createChaiCup() : createCoin();
      itemMesh.position.set(laneX, 0.9, spawnZ);
      g.scene.add(itemMesh);

      g.collectibles.push({
        mesh: itemMesh,
        type: isChai ? 'chai' : 'coin'
      });
    }

    for (let i = g.collectibles.length - 1; i >= 0; i--) {
      const item = g.collectibles[i];
      const mesh = item.mesh;

      mesh.rotation.y += dt * 3.5;

      const dx = Math.abs(mesh.position.x - g.playerPos.x);
      const dz = Math.abs(mesh.position.z - g.playerPos.z);

      if (dx < 1.1 && dz < 1.3) {
        if (item.type === 'coin') {
          sounds.playCoin();
          g.coinsCollected += 1;
          g.score += 100;
        } else if (item.type === 'chai') {
          sounds.playNitro();
          g.nitroActive = true;
          g.nitroTimeLeft = 6.0;
          g.score += 300;
        }

        g.scene.remove(mesh);
        g.collectibles.splice(i, 1);
        continue;
      }

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
