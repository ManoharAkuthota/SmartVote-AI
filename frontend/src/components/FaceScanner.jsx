import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Eye, CornerDownRight, SunMedium, ShieldCheck, Sparkles, VideoOff } from 'lucide-react';
import { loadFaceApiModels, detectFaceWithBiometrics, checkLightingQuality, generateMockEmbedding } from '../services/faceApiLoader';
import { useLanguage } from '../context/LanguageContext';

export default function FaceScanner({
  mode = 'register', // 'register' or 'login'
  onSuccess,
  requireLiveness = true,
}) {
  const { t, speak, voiceEnabled } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [lightingLevel, setLightingLevel] = useState(100);

  // Liveness States
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkPassed, setBlinkPassed] = useState(!requireLiveness);
  const [headTurnPassed, setHeadTurnPassed] = useState(!requireLiveness);
  const [multipleFacesAlert, setMultipleFacesAlert] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);

  const [completed, setCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedMode, setSimulatedMode] = useState(false);

  // Initialize camera & models
  useEffect(() => {
    let stream = null;
    let mounted = true;

    async function setup() {
      setIsLoadingModels(true);
      await loadFaceApiModels();
      if (!mounted) return;
      setIsLoadingModels(false);

      if (!simulatedMode) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
          if (videoRef.current && mounted) {
            videoRef.current.srcObject = stream;
            setStreamActive(true);
            setCameraError(null);
            if (voiceEnabled) speak("Camera active. Please look directly at the biometric sensor.");
          }
        } catch (err) {
          console.warn("Camera access denied or unavailable:", err.message);
          if (mounted) {
            setCameraError("Camera unavailable or permission denied. You can switch to Simulated Biometrics for testing.");
            setStreamActive(false);
          }
        }
      }
    }

    setup();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [simulatedMode]);

  // Detection loop
  useEffect(() => {
    if (!streamActive || completed || simulatedMode) return;

    let intervalId = null;

    const runDetection = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        // Lighting check
        const brightness = checkLightingQuality(videoRef.current);
        setLightingLevel(Math.round(brightness));

        // Biometrics detection
        const res = await detectFaceWithBiometrics(videoRef.current);
        if (!res) return;

        if (res.status === 'MULTIPLE_FACES') {
          setMultipleFacesAlert(true);
          setFaceDetected(false);
          return;
        }

        setMultipleFacesAlert(false);

        if (res.status === 'NO_FACE') {
          setFaceDetected(false);
          setConfidenceScore(0);
          return;
        }

        if (res.status === 'SUCCESS') {
          setFaceDetected(true);
          setConfidenceScore(Math.round(res.confidence * 100));

          // Draw landmarks on overlay canvas
          if (canvasRef.current) {
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            canvasRef.current.width = displaySize.width;
            canvasRef.current.height = displaySize.height;
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);

            // Draw bounding box
            const box = res.box;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Draw cyan biometric points
            ctx.fillStyle = '#00ffa3';
            res.landmarks.positions.forEach((pt) => {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 1.5, 0, 2 * Math.PI);
              ctx.fill();
            });
          }

          // Step 2: Blink Check
          if (!blinkPassed && res.isBlinking) {
            setBlinkPassed(true);
            if (voiceEnabled) speak("Blink confirmed. Now please turn your head slightly to the right.");
          }

          // Step 3: Head Turn Check
          if (blinkPassed && !headTurnPassed && res.isTurnedRight) {
            setHeadTurnPassed(true);
            if (voiceEnabled) speak("Head turn verified. Finalizing biometric seal.");
          }

          // If liveness passed (or not required), finalize capture!
          const livenessDone = !requireLiveness || (blinkPassed && headTurnPassed);

          if (livenessDone && !completed && !isProcessing) {
            handleCompleteCapture(res.descriptor, res.confidence);
          }
        }
      } catch (err) {
        console.error("Biometrics loop error:", err);
      }
    };

    intervalId = setInterval(runDetection, 180);
    return () => clearInterval(intervalId);
  }, [streamActive, completed, blinkPassed, headTurnPassed, requireLiveness, isProcessing, simulatedMode]);

  const handleCompleteCapture = useCallback(
    (descriptor, score = 0.95) => {
      setIsProcessing(true);
      setCompleted(true);

      // Snapshot image
      let faceImageUrl = '';
      if (videoRef.current) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = videoRef.current.videoWidth || 480;
        offCanvas.height = videoRef.current.videoHeight || 360;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, offCanvas.width, offCanvas.height);
        faceImageUrl = offCanvas.toDataURL('image/jpeg', 0.85);
      } else {
        faceImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      }

      if (voiceEnabled) speak(t('face_verified'));

      setTimeout(() => {
        onSuccess({
          faceImageUrl,
          embedding: descriptor,
          qualityScore: score,
          livenessPassed: true,
          blinkDetected: true,
          headTurnDetected: true,
        });
        setIsProcessing(false);
      }, 700);
    },
    [onSuccess, speak, voiceEnabled, t]
  );

  const triggerSimulatedBiometrics = () => {
    setIsProcessing(true);
    setFaceDetected(true);
    setBlinkPassed(true);
    setHeadTurnPassed(true);
    setConfidenceScore(98);

    const mockDescriptor = generateMockEmbedding('voter_simulation_seed');
    const mockImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

    setTimeout(() => {
      setCompleted(true);
      if (voiceEnabled) speak("Simulated biometric profile accepted.");
      onSuccess({
        faceImageUrl: mockImage,
        embedding: mockDescriptor,
        qualityScore: 0.98,
        livenessPassed: true,
        blinkDetected: true,
        headTurnDetected: true,
      });
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* HUD Video Viewport */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10">
        {/* Holographic Laser Scan Line */}
        {!completed && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-scan z-30 pointer-events-none" />
        )}

        {/* Video Element */}
        {!simulatedMode ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-cyan-400 p-6 text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse mb-3" />
            <h4 className="text-base font-bold text-white">Simulated Biometric Sensor Active</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Hardware webcam bypassed. Using synthetic 128-D neural embeddings for automated simulation.
            </p>
          </div>
        )}

        {/* Biometrics Landmark Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20 scale-x-[-1]"
        />

        {/* HUD Target Corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400 z-20" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400 z-20" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400 z-20" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400 z-20" />

        {/* Top Status Banner */}
        <div className="absolute top-3 inset-x-4 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[11px] text-cyan-300 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Face-api.js Client Neural Net</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[11px] text-slate-300 backdrop-blur-md">
            <SunMedium className={`w-3.5 h-3.5 ${lightingLevel < 40 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>Light: {lightingLevel}%</span>
          </div>
        </div>

        {/* Multiple Faces Alert */}
        {multipleFacesAlert && (
          <div className="absolute inset-x-4 top-14 p-2.5 bg-rose-950/90 border border-rose-500 rounded-xl flex items-center space-x-2 text-rose-200 text-xs z-40 backdrop-blur-md animate-bounce">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Multiple faces detected! For election integrity, only 1 voter allowed.</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingModels && !simulatedMode && (
          <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center z-40">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-xs text-slate-300 font-medium tracking-wide">Loading Face Recognition Neural Weights...</p>
          </div>
        )}

        {/* Camera Error Modal */}
        {cameraError && !simulatedMode && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-40">
            <VideoOff className="w-10 h-10 text-amber-400 mb-3" />
            <h4 className="text-sm font-semibold text-white">Camera Access Notice</h4>
            <p className="text-xs text-slate-400 mt-2 max-w-sm">{cameraError}</p>
            <button
              type="button"
              onClick={() => setSimulatedMode(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-xs rounded-xl shadow-neon-cyan hover:opacity-95"
            >
              Switch to Biometric Simulation Mode
            </button>
          </div>
        )}

        {/* Completion Seal Overlay */}
        {completed && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-40">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_30px_#00ffa3]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">Biometric Signature Verified</h3>
            <span className="text-xs text-emerald-300 font-mono mt-1">128-D Vector Match: {confidenceScore || 98}%</span>
          </div>
        )}
      </div>

      {/* Liveness Verification Checkpoints Stepper */}
      {requireLiveness && (
        <div className="w-full mt-4 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Anti-Spoof Liveness Protocol</span>
            <span className="text-cyan-400 font-mono">{confidenceScore}% match</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2 rounded-lg border flex items-center space-x-2 transition ${
              faceDetected ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <Camera className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Align Face</div>
                <div className="text-[9px] text-slate-400">{faceDetected ? 'Centered' : 'Look Straight'}</div>
              </div>
            </div>

            <div className={`p-2 rounded-lg border flex items-center space-x-2 transition ${
              blinkPassed ? 'bg-purple-950/40 border-purple-500/40 text-purple-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <Eye className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Blink Eyes</div>
                <div className="text-[9px] text-slate-400">{blinkPassed ? 'Verified' : 'Blink naturally'}</div>
              </div>
            </div>

            <div className={`p-2 rounded-lg border flex items-center space-x-2 transition ${
              headTurnPassed ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              <CornerDownRight className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-[11px]">Turn Head</div>
                <div className="text-[9px] text-slate-400">{headTurnPassed ? 'Verified' : 'Turn slightly right'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual / Simulation Trigger Controls */}
      <div className="flex items-center justify-between w-full mt-3">
        <button
          type="button"
          onClick={() => setSimulatedMode(!simulatedMode)}
          className="text-xs text-slate-400 hover:text-cyan-400 transition underline underline-offset-4"
        >
          {simulatedMode ? 'Switch to Physical Camera' : 'Switch to Biometric Simulation'}
        </button>

        {simulatedMode && (
          <button
            type="button"
            onClick={triggerSimulatedBiometrics}
            disabled={isProcessing || completed}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-xs shadow-neon-cyan hover:opacity-90 disabled:opacity-50"
          >
            {isProcessing ? 'Verifying...' : 'Authenticate Simulated Face'}
          </button>
        )}
      </div>
    </div>
  );
}
