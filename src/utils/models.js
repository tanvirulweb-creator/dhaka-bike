import * as THREE from 'three';

// Premium 3D Models for Dhaka City (Roblox / Stylized Voxel Aesthetic)
// Highly detailed sports bike, colorful Dhaka buildings, Bengali shopfronts & traffic

const createMat = (color, roughness = 0.35, metalness = 0.15) => {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    flatShading: true
  });
};

// 1. Redesigned Premium Dhaka Sports Bike (Yamaha R15 / Gixxer Style)
export function createPlayerBike() {
  const group = new THREE.Group();
  const bike = new THREE.Group();

  // Wheels (Sport Alloy Rims with Disc Brakes)
  const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16);
  const tireMat = createMat(0x1a1a1a, 0.9, 0.1);
  const rimMat = createMat(0xdcdde1, 0.2, 0.85); // Silver-gold alloy
  const discMat = createMat(0x718093, 0.1, 0.9);
  const caliperMat = createMat(0xf1c40f, 0.3, 0.7); // Gold brake caliper

  const makeSportWheel = (z) => {
    const wGroup = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.23, 10), rimMat);
    rim.rotation.z = Math.PI / 2;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.24, 12), discMat);
    disc.rotation.z = Math.PI / 2;
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.14), caliperMat);
    caliper.position.set(0.12, 0.16, 0);

    wGroup.add(tire, rim, disc, caliper);
    wGroup.position.set(0, 0.38, z);
    return wGroup;
  };

  const frontWheel = makeSportWheel(-0.95);
  const rearWheel = makeSportWheel(0.85);
  bike.add(frontWheel, rearWheel);

  // Aerodynamic Front Fairing & Windscreen
  const bodyColor = 0x0984e3; // Dhaka Electric Blue (Sports theme)
  const accentColor = 0xffffff; // White racing decal
  const bodyMat = createMat(bodyColor, 0.2, 0.3);
  const darkMat = createMat(0x1e272e, 0.5, 0.2);

  // Main Chassis & Engine block
  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.9), darkMat);
  engineBlock.position.set(0, 0.6, -0.05);
  bike.add(engineBlock);

  // Sleek Aerodynamic Front Cowl
  const frontCowl = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 0.7), bodyMat);
  frontCowl.position.set(0, 0.82, -0.75);
  frontCowl.rotation.x = -0.35; // aggressive slant forward
  bike.add(frontCowl);

  // Tinted Windscreen
  const windscreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.3, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true, opacity: 0.85, roughness: 0.1 })
  );
  windscreen.position.set(0, 1.1, -0.85);
  windscreen.rotation.x = -0.55;
  bike.add(windscreen);

  // Twin Projector Xenon LED Headlights (Glow beam)
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.06), headlightMat);
  hlLeft.position.set(-0.16, 0.78, -1.1);
  const hlRight = hlLeft.clone();
  hlRight.position.x = 0.16;
  bike.add(hlLeft, hlRight);

  // Dual Rearview Mirrors
  const mirrorMat = createMat(0x2f3640);
  const mirrorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.04), mirrorMat);
  mirrorLeft.position.set(-0.35, 1.05, -0.75);
  const mirrorRight = mirrorLeft.clone();
  mirrorRight.position.x = 0.35;
  bike.add(mirrorLeft, mirrorRight);

  // Muscular Sculpted Fuel Tank with Decal
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.65), bodyMat);
  tank.position.set(0, 0.95, -0.22);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.36, 0.66), createMat(accentColor));
  stripe.position.set(0, 0.95, -0.22);
  bike.add(tank, stripe);

  // Stepped Sport Seat (Two-Tier)
  const seatRider = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.45), darkMat);
  seatRider.position.set(0, 0.86, 0.22);
  const seatPillion = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.38), darkMat);
  seatPillion.position.set(0, 0.96, 0.6);
  bike.add(seatRider, seatPillion);

  // Upswept Tail Cowl
  const tailCowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.45), bodyMat);
  tailCowl.position.set(0, 0.92, 0.85);
  tailCowl.rotation.x = 0.2;
  bike.add(tailCowl);

  // LED Tail Light / Brake Light
  const tailLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.08, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xff0033 })
  );
  tailLight.position.set(0, 0.92, 1.08);
  bike.add(tailLight);

  // Sport Upswept Dual Chrome Exhaust
  const exhaustMat = createMat(0xdcdde1, 0.1, 0.9);
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 10), exhaustMat);
  exhaust.rotation.x = Math.PI / 2 + 0.28;
  exhaust.position.set(0.28, 0.45, 0.55);
  bike.add(exhaust);

  // --- Cool Roblox Biker Rider ---
  const rider = new THREE.Group();
  const jacketMat = createMat(0x111111); // Black leather biker jacket
  const vestMat = createMat(0x00b894); // BD Green accents
  const helmetMat = createMat(0x0984e3); // Matching Blue Helmet

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.3), jacketMat);
  torso.position.set(0, 1.28, 0.05);
  torso.rotation.x = 0.42;
  const patch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.04), vestMat);
  patch.position.set(0, 1.3, 0.2);
  patch.rotation.x = 0.42;
  rider.add(torso, patch);

  // Helmet with Chrome Iridescent Visor
  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), helmetMat);
  helmet.position.set(0, 1.72, -0.15);
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x00cec9, roughness: 0.1, metalness: 0.9 })
  );
  visor.position.set(0, 1.72, -0.38);
  rider.add(helmet, visor);

  // Clip-on Grip Arms
  const armLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.14), jacketMat);
  armLeft.position.set(-0.35, 1.15, -0.32);
  armLeft.rotation.x = -0.85;
  const armRight = armLeft.clone();
  armRight.position.x = 0.35;
  rider.add(armLeft, armRight);

  // Legs tucked on footpegs
  const legLeft = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.22), jacketMat);
  legLeft.position.set(-0.25, 0.72, 0.2);
  legLeft.rotation.x = 0.55;
  const legRight = legLeft.clone();
  legRight.position.x = 0.25;
  rider.add(legLeft, legRight);

  group.add(bike, rider);
  group.userData = { bike, rider, tailLight };
  return group;
}

// 2. Authentic Dhaka City Multi-Storey Buildings
export function createDhakaBuilding(type = 0) {
  const group = new THREE.Group();

  const buildingColors = [
    0xf5cd79, // Cream Yellow
    0xf8a5c2, // Dhaka Rose Pink
    0x78e08f, // Mint Green
    0x6a89cc, // Sky Blue
    0xe55039  // Red Brick
  ];
  const color = buildingColors[type % buildingColors.length];
  const bldgMat = createMat(color, 0.85, 0.05);
  const trimMat = createMat(0xffffff, 0.7, 0.05);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x2f3640, roughness: 0.2, metalness: 0.5 });

  const height = 14 + (type % 4) * 6;
  const width = 10;
  const depth = 12;

  const bldg = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bldgMat);
  bldg.position.set(0, height / 2, 0);
  bldg.castShadow = true;
  bldg.receiveShadow = true;
  group.add(bldg);

  const floors = Math.floor(height / 3.5);
  for (let f = 1; f < floors; f++) {
    const y = f * 3.5;
    for (let side = -1; side <= 1; side += 2) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.1), windowMat);
      win.position.set(side * 2.5, y, depth / 2 + 0.06);
      group.add(win);

      const balcony = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.8), trimMat);
      balcony.position.set(side * 2.5, y - 0.4, depth / 2 + 0.45);
      group.add(balcony);
    }
  }

  // Rooftop Details
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(width, 1.0, depth), trimMat);
  parapletPosition: parapet.position.set(0, height + 0.5, 0);
  group.add(parapet);

  // GAZI / RFL Water Tank
  const tankMat = createMat(0x0097e6);
  const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.0, 12), tankMat);
  waterTank.position.set(-2, height + 2.0, 1.5);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), trimMat);
  stand.position.set(-2, height + 0.5, 1.5);
  group.add(stand, waterTank);

  // Lift Machine Room
  const liftRoom = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.0, 3.5), bldgMat);
  liftRoom.position.set(1.5, height + 1.5, -1.5);
  group.add(liftRoom);

  return group;
}

// 3. Street-level Dhaka Shops
export function createDhakaShop(shopIdx = 0) {
  const group = new THREE.Group();

  const shops = [
    { title: 'ঢাকা টং ঘর', bg: 0xe67e22, sub: 'গরম চা ও বিস্কুট' },
    { title: 'হাজী বিরিয়ানি', bg: 0xc0392b, sub: 'পুরান ঢাকার আসল স্বাদ' },
    { title: 'মায়ের দোয়া ফার্মেসি', bg: 0x27ae60, sub: 'ঔষধ ও চিকিৎসা' },
    { title: 'বিকাশ ও নগদ', bg: 0xd63031, sub: 'ফ্লেক্সিলোড ও পেমেন্ট' }
  ];
  const s = shops[shopIdx % shops.length];

  const wallMat = createMat(0xecf0f1);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 3.5), wallMat);
  wall.position.set(0, 2, 0);

  const awningMat = createMat(s.bg);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.3, 1.8), awningMat);
  awning.position.set(0, 3.6, 1.8);
  awning.rotation.x = 0.25;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#' + s.bg.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(s.title, 256, 60);
  ctx.font = '24px sans-serif';
  ctx.fillText(s.sub, 256, 105);

  const signTex = new THREE.CanvasTexture(canvas);
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 1.2),
    new THREE.MeshBasicMaterial({ map: signTex })
  );
  signMesh.position.set(0, 3.3, 2.0);

  const counterMat = createMat(0x34495e);
  const counter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.1, 0.8), counterMat);
  counter.position.set(0, 0.55, 1.4);

  group.add(wall, awning, signMesh, counter);
  return group;
}

// 4. Overhead Dhaka Commercial Billboards
export function createDhakaBillboard(brandIdx = 0) {
  const group = new THREE.Group();

  const ads = [
    { title: 'যমুনা ফিউচার পার্ক', sub: 'দক্ষিণ এশিয়ার বৃহত্তম মল', bg: '#2c3e50', fg: '#f1c40f' },
    { title: 'বিকাশ পেমেন্ট', sub: 'যেকোনো শপিংয়ে ক্যাশব্যাক', bg: '#d63031', fg: '#ffffff' },
    { title: 'ঢাকা মেট্রো এক্সপ্রেস', sub: 'স্মার্ট যাত্রায় স্বাগতম', bg: '#27ae60', fg: '#ffffff' },
    { title: 'টংয়ের লাল চা', sub: 'মাত্র ৫ টাকায় ভরপুর এনার্জি', bg: '#d35400', fg: '#ffeaa7' }
  ];
  const ad = ads[brandIdx % ads.length];

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 512;
  bCanvas.height = 256;
  const bCtx = bCanvas.getContext('2d');
  bCtx.fillStyle = ad.bg;
  bCtx.fillRect(0, 0, 512, 256);
  bCtx.fillStyle = ad.fg;
  bCtx.font = 'bold 42px sans-serif';
  bCtx.textAlign = 'center';
  bCtx.fillText(ad.title, 256, 110);
  bCtx.font = 'bold 26px sans-serif';
  bCtx.fillStyle = '#ffffff';
  bCtx.fillText(ad.sub, 256, 175);

  const bTex = new THREE.CanvasTexture(bCanvas);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4, 0.4),
    new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.3 })
  );
  board.position.set(0, 11, 0);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 9, 8),
    createMat(0x718093, 0.2, 0.8)
  );
  pole.position.set(0, 4.5, 0);

  group.add(board, pole);
  return group;
}

// 5. Roadside Krishnachura Trees
export function createDhakaTree() {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 3.5, 8),
    createMat(0x53382c, 0.9, 0.05)
  );
  trunk.position.set(0, 1.75, 0);

  const leafMat = createMat(0x27ae60, 0.8);
  const redMat = createMat(0xe74c3c, 0.8);

  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), leafMat);
  crown.position.set(0, 4.2, 0);

  const flower1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), redMat);
  flower1.position.set(0.6, 4.8, 0.5);
  const flower2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 1), redMat);
  flower2.position.set(-0.7, 4.5, -0.6);

  group.add(trunk, crown, flower1, flower2);
  return group;
}

// 6. Iconic Dhaka Green CNG
export function createCNG() {
  const group = new THREE.Group();
  const greenMat = createMat(0x1b873a);
  const yellowRoofMat = createMat(0xf1c40f);
  const blackMat = createMat(0x222222);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x81ecec,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1
  });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 2.5), greenMat);
  chassis.position.set(0, 0.4, 0);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.7), greenMat);
  cabin.position.set(0, 1.1, 0.35);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.18, 2.3), yellowRoofMat);
  roof.position.set(0, 1.75, 0.05);
  const frontNose = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.9), greenMat);
  frontNose.position.set(0, 0.85, -0.9);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.08), glassMat);
  windshield.position.set(0, 1.35, -0.65);
  windshield.rotation.x = 0.25;
  group.add(chassis, cabin, roof, frontNose, windshield);

  const cageLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 1.1), blackMat);
  cageLeft.position.set(-0.76, 1.15, 0.3);
  const cageRight = cageLeft.clone();
  cageRight.position.x = 0.76;
  group.add(cageLeft, cageRight);

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

  const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.1), new THREE.MeshBasicMaterial({ color: 0xfff275 }));
  headlight.position.set(0, 0.85, -1.36);
  group.add(headlight);

  group.userData = { type: 'cng', length: 2.6, width: 1.6 };
  return group;
}

// 7. Dhaka Murir-Tin Local Bus
export function createBus(themeIndex = 0) {
  const group = new THREE.Group();

  const themes = [
    { body: 0xc0392b, stripe: 0xf1c40f, name: 'রাইদা পরিবহন' },
    { body: 0x2980b9, stripe: 0xffffff, name: 'অনাবিল স্পেশাল' },
    { body: 0x27ae60, stripe: 0xe67e22, name: 'তুরাগ এক্সপ্রেস' }
  ];
  const t = themes[themeIndex % themes.length];

  const bodyMat = createMat(t.body);
  const stripeMat = createMat(t.stripe);
  const darkMat = createMat(0x2c3e50);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.2, metalness: 0.3 });

  const busBody = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.2, 6.8), bodyMat);
  busBody.position.set(0, 1.5, 0);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.35, 6.75), stripeMat);
  stripe.position.set(0, 1.3, 0);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.1), windowMat);
  windshield.position.set(0, 1.8, -3.42);
  const windowRow = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.65, 5.2), windowMat);
  windowRow.position.set(0, 1.85, 0.4);
  group.add(busBody, stripe, windshield, windowRow);

  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 4.2), darkMat);
  rack.position.set(0, 2.7, 0.2);
  const bundle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 1.2), createMat(0xd35400));
  bundle.position.set(0, 2.95, 0);
  group.add(rack, bundle);

  const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 12);
  const wheelMat = createMat(0x111111);
  const makeWheel = (x, z) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.48, z);
    return w;
  };
  group.add(makeWheel(-1.1, -2.1), makeWheel(1.1, -2.1), makeWheel(-1.1, 2.1), makeWheel(1.1, 2.1));

  const lightGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff275 });
  const l1 = new THREE.Mesh(lightGeo, lightMat);
  l1.position.set(-0.8, 0.9, -3.42);
  const l2 = l1.clone();
  l2.position.x = 0.8;
  group.add(l1, l2);

  const banner = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.05), new THREE.MeshBasicMaterial({ color: 0xf39c12 }));
  banner.position.set(0, 0.9, 3.42);
  group.add(banner);

  group.userData = { type: 'bus', length: 7.0, width: 2.4, name: t.name };
  return group;
}

// 8. Traditional Rickshaw
export function createRickshaw() {
  const group = new THREE.Group();
  const woodMat = createMat(0xb53471);
  const metalMat = createMat(0x718093, 0.3, 0.7);
  const hoodMat = createMat(0x009432);

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

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.8), metalMat);
  frame.position.set(0, 0.5, -0.2);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.7), woodMat);
  seat.position.set(0, 0.85, 0.5);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.85, 0.75), hoodMat);
  hood.position.set(0, 1.35, 0.55);
  group.add(frame, seat, hood);

  const puller = new THREE.Group();
  const skin = createMat(0xd29054);
  const lungi = createMat(0x0652dd);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.25), skin);
  torso.position.set(0, 1.15, -0.25);
  const lungiMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.55, 0.3), lungi);
  lungiMesh.position.set(0, 0.7, -0.15);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), skin);
  head.position.set(0, 1.55, -0.32);
  puller.add(torso, lungiMesh, head);
  group.add(puller);

  group.userData = { type: 'rickshaw', length: 2.2, width: 1.4 };
  return group;
}

// 9. Golden Taka (৳) Coin
export function createCoin() {
  const group = new THREE.Group();
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, metalness: 0.85, roughness: 0.15 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), coinMat);
  coin.rotation.x = Math.PI / 2;
  group.add(coin);
  group.position.y = 0.9;
  group.userData = { type: 'coin' };
  return group;
}

// 10. Tong-er Cha (টংয়ের লাল চা)
export function createChaiCup() {
  const group = new THREE.Group();
  const cupMat = createMat(0xd35400, 0.8);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.45, 12), cupMat);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffeaa7, transparent: true, opacity: 0.5 })
  );
  group.add(cup, glow);
  group.position.y = 0.9;
  group.userData = { type: 'chai' };
  return group;
}

// 11. Airplane for Airport Stage
export function createAirplane() {
  const group = new THREE.Group();
  const planeMat = createMat(0xffffff);
  const tailMat = createMat(0x27ae60);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8.0, 10), planeMat);
  body.rotation.x = Math.PI / 2;
  const wings = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.15, 2.2), planeMat);
  wings.position.set(0, 0, 0.5);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 1.6), tailMat);
  tail.position.set(0, 1.1, 3.2);
  group.add(body, wings, tail);
  group.position.set(15, 18, -40);
  group.rotation.y = -0.3;
  return group;
}

// 12. Metro Rail Pillar
export function createMetroPillar() {
  const group = new THREE.Group();
  const concreteMat = createMat(0xbdc3c7, 0.8, 0.1);
  const greenTrackMat = createMat(0x27ae60, 0.5, 0.1);
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7.5, 1.6), concreteMat);
  pillar.position.set(0, 3.75, 0);
  const girder = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.4, 3.0), concreteMat);
  girder.position.set(0, 7.5, 0);
  const track = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.0, 16.0), greenTrackMat);
  track.position.set(0, 8.4, 0);
  group.add(pillar, girder, track);
  return group;
}
