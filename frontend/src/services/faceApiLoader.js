import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise = null;

const MODEL_URLS = [
  '/models',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
];

export async function loadFaceApiModels() {
  if (modelsLoaded) return true;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    for (const url of MODEL_URLS) {
      try {
        console.log(`Attempting to load face-api models from: ${url}`);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(url),
          faceapi.nets.faceLandmark68Net.loadFromUri(url),
          faceapi.nets.faceRecognitionNet.loadFromUri(url),
        ]);
        modelsLoaded = true;
        console.log(`Face-api models successfully loaded from: ${url}`);
        return true;
      } catch (err) {
        console.warn(`Could not load models from ${url}:`, err.message);
      }
    }
    console.warn('Face-api models could not be loaded from remote/local paths. Enabling fallback mode.');
    return false;
  })();

  return loadingPromise;
}

/**
 * Calculates Eye Aspect Ratio (EAR) to detect eye blinking.
 * Landmarks:
 * Left eye: 36, 37, 38, 39, 40, 41
 * Right eye: 42, 43, 44, 45, 46, 47
 */
export function calculateEyeAspectRatio(eyePoints) {
  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  // Vertical distances
  const a = dist(eyePoints[1], eyePoints[5]);
  const b = dist(eyePoints[2], eyePoints[4]);
  // Horizontal distance
  const c = dist(eyePoints[0], eyePoints[3]);
  return (a + b) / (2.0 * c);
}

/**
 * Calculates head yaw/turn ratio using nose tip relative to eye corners.
 * Returns value: < 0.7 = turned right, > 1.4 = turned left, ~1.0 = looking straight
 */
export function calculateHeadTurnRatio(landmarks) {
  const points = landmarks.positions;
  const leftEyeOuter = points[36];
  const rightEyeOuter = points[45];
  const noseTip = points[30];

  const distToLeft = Math.hypot(noseTip.x - leftEyeOuter.x, noseTip.y - leftEyeOuter.y);
  const distToRight = Math.hypot(noseTip.x - rightEyeOuter.x, noseTip.y - rightEyeOuter.y);

  if (distToRight === 0) return 1.0;
  return distToLeft / distToRight;
}

/**
 * Analyzes video frame brightness (0-255).
 */
export function checkLightingQuality(videoEl) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, 64, 64);
  const data = ctx.getImageData(0, 0, 64, 64).data;
  let totalBrightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    totalBrightness += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return totalBrightness / (64 * 64);
}

/**
 * Detects single face with landmarks and 128-d descriptor.
 */
export async function detectFaceWithLiveness(videoEl) {
  if (!modelsLoaded) {
    const loaded = await loadFaceApiModels();
    if (!loaded) return null;
  }

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
  const detections = await faceapi.detectAllFaces(videoEl, options)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections || detections.length === 0) {
    return { status: 'NO_FACE' };
  }

  if (detections.length > 1) {
    return { status: 'MULTIPLE_FACES', count: detections.length };
  }

  const singleDetection = detections[0];
  const landmarks = singleDetection.landmarks;

  // Liveness measures
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const leftEAR = calculateEyeAspectRatio(leftEye);
  const rightEAR = calculateEyeAspectRatio(rightEye);
  const avgEAR = (leftEAR + rightEAR) / 2;

  const headTurnRatio = calculateHeadTurnRatio(landmarks);
  const descriptor = Array.from(singleDetection.descriptor);

  return {
    status: 'SUCCESS',
    detection: singleDetection,
    box: singleDetection.detection.box,
    landmarks: singleDetection.landmarks,
    ear: avgEAR,
    isBlinking: avgEAR < 0.22,
    eyesClosed: avgEAR < 0.22,
    eyesOpen: avgEAR >= 0.25,
    headTurnRatio,
    isFacingCenter: headTurnRatio >= 0.82 && headTurnRatio <= 1.20,
    isTurnedRight: headTurnRatio < 0.75,
    isTurnedLeft: headTurnRatio > 1.35,
    noseTip: landmarks.positions[30],
    descriptor,
    confidence: singleDetection.detection.score
  };
}

export const detectFaceWithFacialSecurity = detectFaceWithLiveness;

/**
 * Generates a mock 128-d embedding for offline/fallback demo testing.
 */
export function generateMockEmbedding(seed = 'voter') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    const val = Math.sin(hash + i * 1.5) * 0.5 + 0.5;
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  return vec.map(v => v / norm);
}
