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
  createDhakaTree,
  createAirplane,
  createMetroPillar
} from '../utils/models';
import {
  dhakaSpline,
  SPLINE_LENGTH,
  TOTAL_ROUTE_DISTANCE_METERS,
  getRoadFrame
} from '../utils/dhakaMapRoute';
import { sounds } from '../utils/audio';

export const STAGES = [
  { id: 1, name: 'যাত্রাবাড়ী', subtitle: 'Jatrabari Interchange & Terminal', startM: 0, endM: 2500, color: '#e67e22' },
  { id: 2, name: 'প্রগতি সরণি', subtitle: 'Rampura ➔ Badda ➔ Progoti Saroni', startM: 2500, endM: 5500, color: '#9b59b6' },
  { id: 3, name: 'কুড়িল ফ্লাইওভার', subtitle: 'Kuril Flyover Elevated Swoop (14m High)', startM: 5500, endM: 8000, color: '#3498db' },
  { id: 4, name: 'বিমানবন্দর সড়ক', subtitle: 'Khilkhet ➔ Airport Runway Boulevard', startM: 8000, endM: 10500, color: '#1abc9c' },
  { id: 5, name: 'উত্তরা হাউস বিল্ডিং', subtitle: 'Uttara Sector 3/7 ➔ House Building 🏁', startM: 10500, endM: 12000, color: '#2ecc71' }
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
    // Real Spline Position Tracking
    playerDist: 0, // distance along spline in game units (0 to SPLINE_LENGTH)
    laneX: 0,      // lateral offset from road center (-5.2 to +5.2)
    velLaneX: 0,
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
    roadMeshGroup: null,
    roadRibbonMesh: null,
    guardrailsGroup: null,
    pillarsGroup: null,
    sceneryGroup: null,
    airplane: null,
    finishArch: null,
    lastTime: 0,
    animFrameId: null
  });

  // Controls Listener
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

  // Mobile Controls Sync
  useEffect(() => {
    if (mobileInputs) {
      const g = gameRef.current;
      g.keys.left = mobileInputs.left;
      g.keys.right = mobileInputs.right;
      g.keys.up = mobileInputs.up;
      g.keys.down = mobileInputs.down;
      if (mobileInputs.horn && !g.keys.horn) triggerHorn();
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
        const distDiff = item.dist - g.playerDist;
        if (distDiff > 0 && distDiff < 45) {
          item.targetLaneX = -5.0; // Rickshaw dodges to shoulder
        }
      }
    });
  };

  // Build Curving 3D Road Mesh along the Real Map Spline
  const buildCurvingRoadMesh = (scene) => {
    const roadGroup = new THREE.Group();
    const guardrailsGroup = new THREE.Group();
    const pillarsGroup = new THREE.Group();
    const sceneryGroup = new THREE.Group();

    // Sample the real map spline at high resolution (every 3 game units)
    const totalSamples = Math.floor(SPLINE_LENGTH / 3.0);
    const roadWidth = 13.0;
    const halfWidth = roadWidth / 2;
    const sidewalkWidth = 3.2;

    const roadPositions = [];
    const roadNormals = [];
    const roadUvs = [];
    const roadIndices = [];

    const sidewalkPositions = [];
    const sidewalkIndices = [];

    let vertexIdx = 0;
    let walkVertexIdx = 0;

    for (let i = 0; i <= totalSamples; i++) {
      const t = i / totalSamples;
      const { point, tangent, normal, binormal } = getRoadFrame(t);

      // Left and right edges of asphalt road
      const pLeft = new THREE.Vector3().copy(point).sub(new THREE.Vector3().copy(normal).multiplyScalar(halfWidth));
      const pRight = new THREE.Vector3().copy(point).add(new THREE.Vector3().copy(normal).multiplyScalar(halfWidth));

      // Slightly elevate road surface
      pLeft.add(new THREE.Vector3().copy(binormal).multiplyScalar(0.05));
      pRight.add(new THREE.Vector3().copy(binormal).multiplyScalar(0.05));

      roadPositions.push(pLeft.x, pLeft.y, pLeft.z);
      roadPositions.push(pRight.x, pRight.y, pRight.z);

      roadNormals.push(binormal.x, binormal.y, binormal.z);
      roadNormals.push(binormal.x, binormal.y, binormal.z);

      roadUvs.push(0, i * 0.4);
      roadUvs.push(1, i * 0.4);

      if (i < totalSamples) {
        const row1 = vertexIdx;
        const row2 = vertexIdx + 2;
        roadIndices.push(row1, row1 + 1, row2);
        roadIndices.push(row1 + 1, row2 + 1, row2);
      }
      vertexIdx += 2;

      // Sidewalks
      const pLeftOuter = new THREE.Vector3().copy(pLeft).sub(new THREE.Vector3().copy(normal).multiplyScalar(sidewalkWidth));
      const pRightOuter = new THREE.Vector3().copy(pRight).add(new THREE.Vector3().copy(normal).multiplyScalar(sidewalkWidth));

      // Left Sidewalk
      sidewalkPositions.push(pLeftOuter.x, pLeftOuter.y + 0.25, pLeftOuter.z);
      sidewalkPositions.push(pLeft.x, pLeft.y + 0.25, pLeft.z);
      // Right Sidewalk
      sidewalkPositions.push(pRight.x, pRight.y + 0.25, pRight.z);
      sidewalkPositions.push(pRightOuter.x, pRightOuter.y + 0.25, pRightOuter.z);

      if (i < totalSamples) {
        const w1 = walkVertexIdx;
        const w2 = walkVertexIdx + 4;
        // Left walk quad
        sidewalkIndices.push(w1, w1 + 1, w2);
        sidewalkIndices.push(w1 + 1, w2 + 1, w2);
        // Right walk quad
        sidewalkIndices.push(w1 + 2, w1 + 3, w2 + 2);
        sidewalkIndices.push(w1 + 3, w2 + 3, w2 + 2);
      }
      walkVertexIdx += 4;

      // Flyover Pillars & Guardrails (When elevated in Kuril Flyover stage: Y > 2.0)
      if (point.y > 2.0) {
        // Concrete support pillars down to ground
        if (i % 8 === 0) {
          const pillarGeo = new THREE.CylinderGeometry(1.6, 1.8, point.y, 10);
          const pillarMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, roughness: 0.9 });
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(point.x, point.y / 2, point.z);
          pillarsGroup.add(pillar);
        }

        // Blue Kuril Flyover Steel Guardrails
        if (i % 3 === 0) {
          const railMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.3, metalness: 0.7 });
          const railL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 4.5), railMat);
          railL.position.copy(pLeftOuter);
          railL.position.y += 0.8;
          railL.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);

          const railR = railL.clone();
          railR.position.copy(pRightOuter);
          railR.position.y += 0.8;
          guardrailsGroup.add(railL, railR);
        }
      } else {
        // Ground road: Spawn Dhaka buildings, shops, and trees along the road curve!
        if (i % 12 === 0 && i > 4 && i < totalSamples - 10) {
          // Left side Building
          const bldgL = createDhakaBuilding(i % 5);
          bldgL.position.copy(point).sub(new THREE.Vector3().copy(normal).multiplyScalar(17));
          bldgL.position.y = 0;
          bldgL.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
          sceneryGroup.add(bldgL);

          // Right side Building / Shop
          if (i % 24 === 0) {
            const bldgR = createDhakaBuilding((i + 2) % 5);
            bldgR.position.copy(point).add(new THREE.Vector3().copy(normal).multiplyScalar(17));
            bldgR.position.y = 0;
            bldgR.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
            sceneryGroup.add(bldgR);
          } else {
            const shopR = createDhakaShop(i % 4);
            shopR.position.copy(point).add(new THREE.Vector3().copy(normal).multiplyScalar(11.5));
            shopR.position.y = 0;
            shopR.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
            sceneryGroup.add(shopR);
          }

          // Trees
          const tree = createDhakaTree();
          tree.position.copy(point).sub(new THREE.Vector3().copy(normal).multiplyScalar(10.5));
          tree.position.y = 0;
          sceneryGroup.add(tree);
        }
      }
    }

    // Build Asphalt Mesh
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x222f3e,
      roughness: 0.85,
      metalness: 0.1
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Build Sidewalk Mesh
    const sidewalkGeo = new THREE.BufferGeometry();
    sidewalkGeo.setAttribute('position', new THREE.Float32BufferAttribute(sidewalkPositions, 3));
    sidewalkGeo.setIndex(sidewalkIndices);
    sidewalkGeo.computeVertexNormals();

    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x8395a7, roughness: 0.9 });
    const sidewalkMesh = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalkMesh.receiveShadow = true;
    roadGroup.add(sidewalkMesh);

    scene.add(roadGroup, guardrailsGroup, pillarsGroup, sceneryGroup);
    return { roadGroup, guardrailsGroup, pillarsGroup, sceneryGroup };
  };

  // Initialize Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x74b9ff);
    scene.fog = new THREE.FogExp2(0x74b9ff, 0.007);

    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 450);
    camera.position.set(0, 4.4, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xfffaed, 0.95);
    sun.position.set(80, 120, 60);
    sun.castShadow = true;
    scene.add(sun);

    // Build Ground Plane (Dhaka Landscape)
    const groundGeo = new THREE.PlaneGeometry(3000, 7000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x10ac84, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(-60, -0.2, -2900);
    scene.add(ground);

    // Build Real Curving Road along Dhaka Spline
    buildCurvingRoadMesh(scene);

    // Player Bike
    const player = createPlayerBike();
    scene.add(player);

    // Finish Line Arch at Uttara (End of Spline)
    const finishFrame = getRoadFrame(0.998);
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x10ac84 });
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 11, 1.6), pillarMat);
    pLeft.position.set(-8.0, 5.5, 0);
    const pRight = pLeft.clone();
    pRight.position.x = 8.0;

    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(18, 2.2, 1.8), pillarMat);
    crossBeam.position.set(0, 10.5, 0);

    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 128;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = '#10ac84';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 44px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('উত্তরা হাউস বিল্ডিং 🏁', 256, 75);
    const bTex = new THREE.CanvasTexture(bCanvas);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.0), new THREE.MeshBasicMaterial({ map: bTex }));
    banner.position.set(0, 10.5, 0.92);

    archGroup.add(pLeft, pRight, crossBeam, banner);
    archGroup.position.copy(finishFrame.point);
    archGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), finishFrame.tangent);
    scene.add(archGroup);

    const g = gameRef.current;
    g.scene = scene;
    g.camera = camera;
    g.renderer = renderer;
    g.player = player;
    g.finishArch = archGroup;
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

  // Main Loop
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

  // Update Game Logic along Real Map Spline
  const updateGame = (dt) => {
    const g = gameRef.current;
    const player = g.player;
    if (!player) return;

    // 1. Controllable speed curve
    let targetSpeed = 28; // comfortable cruise
    if (g.keys.up) targetSpeed = 68; // sport speed
    if (g.keys.down) targetSpeed = 12; // active brake
    if (g.nitroActive) {
      targetSpeed = 110;
      g.nitroTimeLeft -= dt;
      if (g.nitroTimeLeft <= 0) g.nitroActive = false;
    }

    const accelRate = g.keys.down ? 4.5 : (g.keys.up ? 3.0 : 2.0);
    g.speed += (targetSpeed - g.speed) * dt * accelRate;

    // Forward progress along the real map spline
    const forwardStep = (g.speed * 1.35) * dt;
    g.playerDist += forwardStep;
    g.distanceMeters = Math.min(TOTAL_ROUTE_DISTANCE_METERS, (g.playerDist / SPLINE_LENGTH) * TOTAL_ROUTE_DISTANCE_METERS);

    sounds.updateEngine(g.speed / 110);

    // 2. Responsive Lane Steering
    let steerInput = 0;
    if (g.keys.left) steerInput -= 1;
    if (g.keys.right) steerInput += 1;

    const steerAgility = 11.5;
    g.velLaneX += (steerInput * steerAgility - g.velLaneX) * dt * 10.0;
    g.laneX += g.velLaneX * dt;
    g.laneX = Math.max(-5.2, Math.min(5.2, g.laneX));

    // 3. Position Player along Real Spline Curve
    const currentT = Math.min(1.0, g.playerDist / SPLINE_LENGTH);
    const { point, tangent, normal, binormal } = getRoadFrame(currentT);

    // Exact 3D Position on the curving road
    const playerPos = new THREE.Vector3().copy(point)
      .add(new THREE.Vector3().copy(normal).multiplyScalar(g.laneX))
      .add(new THREE.Vector3().copy(binormal).multiplyScalar(0.08));

    player.position.copy(playerPos);

    // Orient player along road tangent + lean into turns
    const forwardQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
    // Apply banking roll around tangent
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(tangent, -g.velLaneX * 0.055);
    player.quaternion.copy(forwardQuat).multiply(rollQuat);

    // 4. Dynamic Camera Following the Real Curving Road
    // Look ahead along the curve
    const lookT = Math.min(1.0, currentT + 22.0 / SPLINE_LENGTH);
    const lookFrame = getRoadFrame(lookT);
    const lookTarget = new THREE.Vector3().copy(lookFrame.point)
      .add(new THREE.Vector3().copy(lookFrame.normal).multiplyScalar(g.laneX * 0.4))
      .add(new THREE.Vector3().copy(lookFrame.binormal).multiplyScalar(1.5));

    // Camera placed behind player along negative tangent + elevated
    const targetCamPos = new THREE.Vector3().copy(point)
      .sub(new THREE.Vector3().copy(tangent).multiplyScalar(8.2))
      .add(new THREE.Vector3().copy(binormal).multiplyScalar(4.4))
      .add(new THREE.Vector3().copy(normal).multiplyScalar(g.laneX * 0.5));

    g.camera.position.lerp(targetCamPos, dt * 6.0);
    g.camera.lookAt(lookTarget);

    // 5. Stage Progress Tracking
    const currentStage = STAGES.find(
      s => g.distanceMeters >= s.startM && g.distanceMeters < s.endM
    ) || STAGES[STAGES.length - 1];

    if (currentStage.id !== g.currentStageIndex + 1) {
      g.currentStageIndex = currentStage.id - 1;
      sounds.playMilestone();
      if (onStageChange) onStageChange(currentStage);

      // Airplane in Airport Stage (Stage 4)
      if (currentStage.id === 4 && !g.airplane) {
        const plane = createAirplane();
        g.scene.add(plane);
        g.airplane = plane;
      }
    }

    if (g.airplane) {
      g.airplane.position.copy(point).add(new THREE.Vector3(15, 22, -60));
    }

    // 6. Traffic along Real Spline
    manageSplineTraffic(dt);

    // 7. Collectibles along Real Spline
    manageSplineCollectibles(dt);

    // 8. Score accumulation & HUD update
    g.score += Math.floor(g.speed * dt * 1.5);
    if (onScoreUpdate) {
      onScoreUpdate({
        score: g.score,
        speed: Math.round(g.speed),
        distanceM: Math.floor(g.distanceMeters),
        coins: g.coinsCollected,
        nitroActive: g.nitroActive,
        nitroTimeLeft: Math.ceil(g.nitroTimeLeft),
        splineT: currentT,
        roadCurveX: point.x,
        roadCurveZ: point.z
      });
    }

    // 9. Victory Check
    if (g.distanceMeters >= TOTAL_ROUTE_DISTANCE_METERS || currentT >= 0.996) {
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

  // Manage Traffic along the Curving Spline
  const manageSplineTraffic = (dt) => {
    const g = gameRef.current;

    // Spawn traffic ahead along spline
    if (g.traffic.length < 8 && g.playerDist < SPLINE_LENGTH - 100) {
      const spawnDist = g.playerDist + 70 + Math.random() * 80;
      if (spawnDist < SPLINE_LENGTH) {
        const rand = Math.random();
        let vehicleMesh;
        let vSpeed = 18;

        if (rand < 0.38) {
          vehicleMesh = createCNG();
          vSpeed = 22 + Math.random() * 12;
        } else if (rand < 0.76) {
          vehicleMesh = createBus(Math.floor(Math.random() * 3));
          vSpeed = 25 + Math.random() * 15;
        } else {
          vehicleMesh = createRickshaw();
          vSpeed = 8 + Math.random() * 6;
        }

        const lanes = [-4.0, -1.8, 1.8, 4.0];
        const laneX = (vehicleMesh.userData.type === 'rickshaw')
          ? (Math.random() < 0.75 ? -4.0 : 4.0)
          : lanes[Math.floor(Math.random() * lanes.length)];

        g.scene.add(vehicleMesh);
        g.traffic.push({
          mesh: vehicleMesh,
          dist: spawnDist,
          laneX: laneX,
          targetLaneX: laneX,
          speed: vSpeed,
          passed: false
        });
      }
    }

    // Update traffic along spline
    for (let i = g.traffic.length - 1; i >= 0; i--) {
      const item = g.traffic[i];
      item.dist += (item.speed * 1.35) * dt;

      // Smooth lane shifts
      if (item.targetLaneX !== undefined) {
        item.laneX += (item.targetLaneX - item.laneX) * dt * 3.5;
      }

      const t = item.dist / SPLINE_LENGTH;
      if (t >= 0.999 || item.dist < g.playerDist - 25) {
        g.scene.remove(item.mesh);
        g.traffic.splice(i, 1);
        continue;
      }

      const { point, tangent, normal, binormal } = getRoadFrame(t);
      const vPos = new THREE.Vector3().copy(point)
        .add(new THREE.Vector3().copy(normal).multiplyScalar(item.laneX))
        .add(new THREE.Vector3().copy(binormal).multiplyScalar(0.08));

      item.mesh.position.copy(vPos);
      item.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);

      // Collision Check
      const distDiff = Math.abs(item.dist - g.playerDist);
      const laneDiff = Math.abs(item.laneX - g.laneX);
      const width = item.mesh.userData.width || 1.6;
      const length = item.mesh.userData.length || 2.5;

      // Near miss
      if (!item.passed && distDiff < length * 0.8 && laneDiff > width * 0.45 && laneDiff < width * 0.95) {
        item.passed = true;
        sounds.playNearMiss();
        g.score += 250;
        if (onNearMiss) onNearMiss('🔥 ওস্তাদ এক ইঞ্চি বাঁচলেন! +250');
      }

      // Hit
      if (distDiff < (length * 0.45 + 0.45) && laneDiff < (width * 0.42 + 0.28)) {
        if (g.nitroActive) {
          item.mesh.position.y += 3;
          g.score += 500;
        } else {
          sounds.playCrash();
          if (onGameOver) {
            onGameOver({
              score: g.score,
              distanceM: Math.floor(g.distanceMeters),
              coins: g.coinsCollected,
              cause: item.mesh.userData.name || item.mesh.userData.type || 'রোড ট্র্যাফিক'
            });
          }
          return;
        }
      }
    }
  };

  // Manage Collectibles along Spline
  const manageSplineCollectibles = (dt) => {
    const g = gameRef.current;

    if (g.collectibles.length < 5 && g.playerDist < SPLINE_LENGTH - 60) {
      const spawnDist = g.playerDist + 50 + Math.random() * 80;
      const lanes = [-3.8, -1.8, 1.8, 3.8];
      const laneX = lanes[Math.floor(Math.random() * lanes.length)];
      const isChai = Math.random() < 0.24;
      const itemMesh = isChai ? createChaiCup() : createCoin();

      g.scene.add(itemMesh);
      g.collectibles.push({
        mesh: itemMesh,
        dist: spawnDist,
        laneX: laneX,
        type: isChai ? 'chai' : 'coin'
      });
    }

    for (let i = g.collectibles.length - 1; i >= 0; i--) {
      const item = g.collectibles[i];
      const t = item.dist / SPLINE_LENGTH;

      if (t >= 0.999 || item.dist < g.playerDist - 15) {
        g.scene.remove(item.mesh);
        g.collectibles.splice(i, 1);
        continue;
      }

      const { point, normal, binormal } = getRoadFrame(t);
      const cPos = new THREE.Vector3().copy(point)
        .add(new THREE.Vector3().copy(normal).multiplyScalar(item.laneX))
        .add(new THREE.Vector3().copy(binormal).multiplyScalar(0.9));

      item.mesh.position.copy(cPos);
      item.mesh.rotation.y += dt * 3.5;

      const distDiff = Math.abs(item.dist - g.playerDist);
      const laneDiff = Math.abs(item.laneX - g.laneX);

      if (distDiff < 1.4 && laneDiff < 1.1) {
        if (item.type === 'coin') {
          sounds.playCoin();
          g.coinsCollected += 1;
          g.score += 100;
        } else {
          sounds.playNitro();
          g.nitroActive = true;
          g.nitroTimeLeft = 6.0;
          g.score += 300;
        }

        g.scene.remove(item.mesh);
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
