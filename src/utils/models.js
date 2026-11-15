import * as THREE from 'three';

// Procedural Roblox-Style 3D Models for Dhaka City
// Lightweight, vibrant, blocky aesthetic optimized for 60 FPS in browsers

// Helper for shiny plastic / toy-like Roblox material
const createMat = (color, roughness = 0.4, metalness = 0.1) => {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    flatShading: true
  });
};

// 1. Roblox Rider on Bike
export function createPlayerBike() {
  const group = new THREE.Group();

  // Bike Group
  const bike = new THREE.Group();

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 12);
  const tireMat = createMat(0x1a1a1a, 0.9, 0.1);
  const rimMat = createMat(0xcccccc, 0.2, 0.8);

  const createWheel = () => {
    const wGroup = new THREE.Group();
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.24, 8), rimMat);
    rim.rotation.z = Math.PI / 2;
    wGroup.add(tire, rim);
    return wGroup;
  };

  const frontWheel = createWheel();
  frontWheel.position.set(0, 0.38, -0.9);
  const rearWheel = createWheel();
  rearWheel.position.set(0, 0.38, 0.8);
  bike.add(frontWheel, rearWheel);

  // Bike Chassis / Body (Sporty Red / Black)
  const bodyMat = createMat(0xe74c3c); // Sporty Dhaka Red
  const darkMat = createMat(0x2c3e50);

  const mainFrame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 1.2), bodyMat);
  mainFrame.position.set(0, 0.65, 0);
  bike.add(mainFrame);

  // Fuel Tank
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.6), bodyMat);
  tank.position.set(0, 0.88, -0.2);
  bike.add(tank);

  // Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.7), darkMat);
  seat.position.set(0, 0.82, 0.35);
  bike.add(seat);

  // Handlebars
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), darkMat);
  bar.position.set(0, 1.05, -0.65);
  bike.add(bar);

  // Headlight
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff275 });
  const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.1), headlightMat);
  headlight.position.set(0, 0.82, -1.02);
  bike.add(headlight);

  // Tail light
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const taillight = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.08), tailMat);
  taillight.position.set(0, 0.82, 0.98);
  bike.add(taillight);

  // Exhaust Pipe
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 8), rimMat);
  exhaust.rotation.x = Math.PI / 2 + 0.15;
  exhaust.position.set(0.28, 0.4, 0.5);
  bike.add(exhaust);

  // --- Roblox Rider Character ---
  const rider = new THREE.Group();
  const skinMat = createMat(0xe0ac69);
  const jacketMat = createMat(0x1e3799); // Royal Blue Jacket
  const pantMat = createMat(0x2f3640);
  const helmetMat = createMat(0xfbc531); // Yellow Dhaka Helmet

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.28), jacketMat);
  torso.position.set(0, 1.25, 0.1);
  torso.rotation.x = 0.25; // Leaning forward slightly
  rider.add(torso);

  // Head with Helmet
  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), helmetMat);
  helmet.position.set(0, 1.7, -0.05);
  // Visor
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.1), createMat(0x111111, 0.1, 0.9));
  visor.position.set(0, 1.7, -0.25);
  rider.add(helmet, visor);

  // Arms gripping handlebar
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), jacketMat);
  leftArm.position.set(-0.32, 1.15, -0.2);
  leftArm.rotation.x = -0.7;
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.32;
  rider.add(leftArm, rightArm);

  // Legs
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.2), pantMat);
  leftLeg.position.set(-0.25, 0.75, 0.2);
  leftLeg.rotation.x = 0.4;
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.25;
  rider.add(leftLeg, rightLeg);

  group.add(bike, rider);
  group.userData = { bike, rider };
  return group;
}

// 2. Iconic Dhaka Green CNG Auto-Rickshaw
export function createCNG() {
  const group = new THREE.Group();
  const greenMat = createMat(0x1b873a); // Dhaka CNG Green
  const yellowRoofMat = createMat(0xf1c40f); // Yellow Canvas Roof
  const blackMat = createMat(0x222222);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x81ecec,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1
  });

  // Base Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 2.5), greenMat);
  chassis.position.set(0, 0.4, 0);
  group.add(chassis);

  // Cabin Body (with side grill cutouts)
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.7), greenMat);
  cabin.position.set(0, 1.1, 0.35);
  group.add(cabin);

  // Yellow Canvas Roof (Slightly curved/beveled look)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.18, 2.3), yellowRoofMat);
  roof.position.set(0, 1.75, 0.05);
  group.add(roof);

  // Front Tapered Nose
  const frontNose = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.9), greenMat);
  frontNose.position.set(0, 0.85, -0.9);
  group.add(frontNose);

  // Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.08), glassMat);
  windshield.position.set(0, 1.35, -0.65);
  windshield.rotation.x = 0.25;
  group.add(windshield);

  // Black Safety Wire Grill (Quintessential Dhaka feature)
  const cageLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 1.1), blackMat);
  cageLeft.position.set(-0.76, 1.15, 0.3);
  const cageRight = cageLeft.clone();
  cageRight.position.x = 0.76;
  group.add(cageLeft, cageRight);

  // Wheels (3 wheels)
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 10);
  const frontWheel = new THREE.Mesh(wheelGeo, blackMat);
  frontWheel.rotation.z = Math.PI / 2;
  frontWheel.position.set(0, 0.3, -1.05);

  const rearLeft = new THREE.Mesh(wheelGeo, blackMat);
  rearLeft.rotation.z = Math.PI / 2;
  rearLeft.position.set(-0.75, 0.3, 0.7);

  const rearRight = rearLeft.clone();
  rearRight.position.x = 0.75;

  group.add(frontWheel, rearLeft, rearRight);

  // Headlight
  const headlight = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.25, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xfff275 })
  );
  headlight.position.set(0, 0.85, -1.36);
  group.add(headlight);

  // Number Plate (Green plate ঢাকা মেট্রো-থ)
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.2, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x006266 })
  );
  plate.position.set(0, 0.45, 1.28);
  group.add(plate);

  group.userData = { type: 'cng', length: 2.6, width: 1.6 };
  return group;
}

// 3. Dhaka Murir-Tin Local Bus (Raida, Anabil, Bihanga, etc.)
export function createBus(themeIndex = 0) {
  const group = new THREE.Group();

  const themes = [
    { body: 0xc0392b, stripe: 0xf1c40f, name: 'রাইদা পরিবহন' }, // Red & Yellow (Raida)
    { body: 0x2980b9, stripe: 0xffffff, name: 'অনাবিল স্পেশাল' }, // Blue & White (Anabil)
    { body: 0x27ae60, stripe: 0xe67e22, name: 'তুরাগ এক্সপ্রেস' } // Green & Orange (Turag)
  ];
  const t = themes[themeIndex % themes.length];

  const bodyMat = createMat(t.body);
  const stripeMat = createMat(t.stripe);
  const darkMat = createMat(0x2c3e50);
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x34495e,
    roughness: 0.2,
    metalness: 0.3
  });

  // Main Bus Body
  const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.2, 6.8), bodyMat);
  busBody.position.set(0, 1.5, 0);
  group.add(busBody);

  // Color Stripe across the middle
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.35, 6.75), stripeMat);
  stripe.position.set(0, 1.3, 0);
  group.add(stripe);

  // Front Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.1), windowMat);
  windshield.position.set(0, 1.8, -3.42);
  group.add(windshield);

  // Side Windows (Rows of rectangular windows)
  const windowRow = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.65, 5.2), windowMat);
  windowRow.position.set(0, 1.85, 0.4);
  group.add(windowRow);

  // Roof Luggage Rack (ছাদের ওপর মালপত্র ও তেরপাল)
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 4.2), darkMat);
  rack.position.set(0, 2.7, 0.2);
  // Luggage bundles
  const bundle1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 1.2), createMat(0x16a085));
  bundle1.position.set(-0.3, 2.95, -0.4);
  const bundle2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.9), createMat(0xd35400));
  bundle2.position.set(0.3, 2.92, 0.6);
  group.add(rack, bundle1, bundle2);

  // Wheels (4 big wheels)
  const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 12);
  const wheelMat = createMat(0x111111);

  const makeWheel = (x, z) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.48, z);
    return w;
  };

  group.add(
    makeWheel(-1.1, -2.1),
    makeWheel(1.1, -2.1),
    makeWheel(-1.1, 2.1),
    makeWheel(1.1, 2.1)
  );

  // Headlights
  const lightGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff275 });
  const l1 = new THREE.Mesh(lightGeo, lightMat);
  l1.position.set(-0.8, 0.9, -3.42);
  const l2 = l1.clone();
  l2.position.x = 0.8;
  group.add(l1, l2);

  // Rear Slogan Banner ("দূরত্ব বজায় রাখুন")
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.35, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xf39c12 })
  );
  banner.position.set(0, 0.9, 3.42);
  group.add(banner);

  group.userData = { type: 'bus', length: 7.0, width: 2.4, name: t.name };
  return group;
}

// 4. Traditional Dhaka Rickshaw with Puller
export function createRickshaw() {
  const group = new THREE.Group();

  const woodMat = createMat(0xb53471); // Colorful Pink/Magenta Rickshaw Art
  const metalMat = createMat(0x718093, 0.3, 0.7);
  const hoodMat = createMat(0x009432); // Traditional Green Hood

  // 3 Wheels (Large spoked wheels)
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 12);
  const wheelMat = createMat(0x2f3640);

  const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
  frontWheel.rotation.z = Math.PI / 2;
  frontWheel.position.set(0, 0.42, -1.0);

  const rearLeft = new THREE.Mesh(wheelGeo, wheelMat);
  rearLeft.rotation.z = Math.PI / 2;
  rearLeft.position.set(-0.65, 0.42, 0.6);

  const rearRight = rearLeft.clone();
  rearRight.position.x = 0.65;

  group.add(frontWheel, rearLeft, rearRight);

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.8), metalMat);
  frame.position.set(0, 0.5, -0.2);
  group.add(frame);

  // Passenger Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.7), woodMat);
  seat.position.set(0, 0.85, 0.5);
  group.add(seat);

  // Rickshaw Hood / Canopy
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.85, 0.75), hoodMat);
  hood.position.set(0, 1.35, 0.55);
  group.add(hood);

  // Rickshaw Puller (Roblox style with Lungi & Gamcha)
  const puller = new THREE.Group();
  const skin = createMat(0xd29054);
  const lungi = createMat(0x0652dd); // Blue check lungi
  const gamcha = createMat(0xe74c3c); // Red gamcha around neck

  // Body
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.25), skin);
  torso.position.set(0, 1.15, -0.25);
  torso.rotation.x = 0.2;

  // Lungi
  const lungiMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.3), lungi);
  lungiMesh.position.set(0, 0.7, -0.15);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), skin);
  head.position.set(0, 1.55, -0.32);

  // Gamcha
  const gamchaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.34), gamcha);
  gamchaMesh.position.set(0, 1.35, -0.28);

  puller.add(torso, lungiMesh, head, gamchaMesh);
  group.add(puller);

  group.userData = { type: 'rickshaw', length: 2.2, width: 1.4 };
  return group;
}

// 5. Golden Taka (৳) Coin
export function createCoin() {
  const group = new THREE.Group();
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xf1c40f,
    metalness: 0.85,
    roughness: 0.15
  });

  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), coinMat);
  coin.rotation.x = Math.PI / 2;
  group.add(coin);

  group.position.y = 0.9;
  group.userData = { type: 'coin', collected: false };
  return group;
}

// 6. Tong-er Cha (টংয়ের লাল চা) - Nitro Boost Cup
export function createChaiCup() {
  const group = new THREE.Group();

  // Clay Cup (মাটির ভাঁড়)
  const cupMat = createMat(0xd35400, 0.8);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.45, 12), cupMat);
  group.add(cup);

  // Red Tea inside
  const teaMat = new THREE.MeshBasicMaterial({ color: 0x962d00 });
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 12), teaMat);
  tea.position.y = 0.18;
  group.add(tea);

  // Steam glow
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffeaa7,
    transparent: true,
    opacity: 0.5
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), glowMat);
  group.add(glow);

  group.position.y = 0.9;
  group.userData = { type: 'chai', collected: false };
  return group;
}

// 7. WASA Road Pothole / Hazard Cone
export function createPothole() {
  const group = new THREE.Group();

  // Dark road crater
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 12), holeMat);
  hole.position.y = 0.02;
  group.add(hole);

  // Construction Cone
  const coneMat = createMat(0xe67e22);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 8), coneMat);
  cone.position.set(0.4, 0.35, 0);
  group.add(cone);

  group.userData = { type: 'pothole', length: 1.2, width: 1.2 };
  return group;
}

// 8. Overhead Metro Rail Pillar & Track (for Uttara & Farmgate stages)
export function createMetroPillar() {
  const group = new THREE.Group();
  const concreteMat = createMat(0xbdc3c7, 0.8, 0.1);
  const greenTrackMat = createMat(0x27ae60, 0.5, 0.1);

  // Massive Center Pillar
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 1.6), concreteMat);
  pillar.position.set(0, 3.75, 0);
  group.add(pillar);

  // Cross Girder (T-beam)
  const girder = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.4, 3.0), concreteMat);
  girder.position.set(0, 7.5, 0);
  group.add(girder);

  // Metro Rail Box Track
  const track = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.0, 16.0), greenTrackMat);
  track.position.set(0, 8.4, 0);
  group.add(track);

  return group;
}

// 9. Kuril Flyover Elevated Railing & Overpass
export function createFlyoverRailing() {
  const group = new THREE.Group();
  const railMat = createMat(0x3498db); // Iconic Blue Dhaka Guardrail
  const concreteMat = createMat(0x95a5a6);

  // Left & Right Barrier
  const barrierLeft = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 20.0), railMat);
  barrierLeft.position.set(-6.5, 0.6, 0);

  const barrierRight = barrierLeft.clone();
  barrierRight.position.x = 6.5;

  group.add(barrierLeft, barrierRight);
  return group;
}

// 10. Airplane Flying Overhead (for Airport Stage)
export function createAirplane() {
  const group = new THREE.Group();
  const planeMat = createMat(0xffffff);
  const tailMat = createMat(0x27ae60); // Biman Bangladesh Green/Red Tail

  // Fuselage
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8.0, 10), planeMat);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Wings
  const wings = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.15, 2.2), planeMat);
  wings.position.set(0, 0, 0.5);
  group.add(wings);

  // Tail Fin
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 1.6), tailMat);
  tail.position.set(0, 1.1, 3.2);
  group.add(tail);

  group.position.set(12, 16, -40);
  group.rotation.y = -0.3;
  return group;
}
