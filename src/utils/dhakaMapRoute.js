import * as THREE from 'three';

// Real Map Waypoints for Dhaka City Transport Corridor:
// Jatrabari ➔ Sayedabad ➔ Rampura ➔ Badda (Progoti Saroni) ➔ Kuril Flyover ➔ Airport Road ➔ Uttara House Building
export const ROUTE_WAYPOINTS = [
  new THREE.Vector3(0, 0, 0),         // 0: যাত্রাবাড়ী (Jatrabari Start)
  new THREE.Vector3(15, 0, -250),     // 1: সায়েদাবাদ বাস টার্মিনাল (Sayedabad)
  new THREE.Vector3(-15, 0, -600),    // 2: মুগদা / মানিকনগর (Mugdha)
  new THREE.Vector3(35, 0, -1050),    // 3: রামপুরা ব্রিজ / হাতিরঝিল মোড় (Rampura Canal curve)
  new THREE.Vector3(-45, 0, -1600),   // 4: বাড্ডা / মধ্য বাড্ডা (Badda curve)
  new THREE.Vector3(-18, 0, -2150),   // 5: নতুন বাজার / যমুনা ফিউচার পার্ক (Progoti Saroni)
  new THREE.Vector3(25, 7, -2650),    // 6: কুড়িল ফ্লাইওভার এপ্রোচ (Ramp climbing UP into air!)
  new THREE.Vector3(-35, 14, -3150),  // 7: কুড়িল ফ্লাইওভার লুপ (Elevated curve 14m high!)
  new THREE.Vector3(-85, 4, -3600),   // 8: কুড়িল থেকে নামার র্যাম্প (Descending down to highway)
  new THREE.Vector3(-115, 0, -4100),  // 9: খিলক্ষেত / বিমানবন্দর সড়ক (Airport Highway straight)
  new THREE.Vector3(-125, 0, -4650),  // 10: হজরত শাহজালাল বিমানবন্দর (Airport Terminal stretch)
  new THREE.Vector3(-128, 0, -5200),  // 11: উত্তরা জসীমউদ্দীন / সেক্টর ৩ (Uttara Sector 3)
  new THREE.Vector3(-130, 0, -5800)   // 12: উত্তরা হাউস বিল্ডিং ফিনিশ লাইন (Uttara House Building 🏁)
];

// Continuous Smooth 3D Spline Curve along the real Dhaka map
export const dhakaSpline = new THREE.CatmullRomCurve3(ROUTE_WAYPOINTS, false, 'catmullrom', 0.5);
export const TOTAL_ROUTE_DISTANCE_METERS = 12000; // 12 KM
export const SPLINE_LENGTH = dhakaSpline.getLength(); // in game units (~5800)

// Helper: Get road frame (Position, Tangent, Normal, Binormal) at ratio t (0.0 to 1.0)
export function getRoadFrame(t) {
  const clampedT = Math.max(0, Math.min(1, t));
  const point = dhakaSpline.getPointAt(clampedT);
  const tangent = dhakaSpline.getTangentAt(clampedT).normalize();

  // World Up
  const up = new THREE.Vector3(0, 1, 0);

  // Normal vector pointing perpendicular to road direction (Sideways X)
  const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();

  // Road true up vector
  const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

  return { point, tangent, normal, binormal };
}
