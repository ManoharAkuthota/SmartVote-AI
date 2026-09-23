import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Eye, CornerDownRight, SunMedium, ShieldCheck, VideoOff, Sparkles, Check, MoveHorizontal } from 'lucide-react';
import { loadFaceApiModels, detectFaceWithLiveness, checkLightingQuality, generateMockEmbedding } from '../services/faceApiLoader';
import { useLanguage } from '../context/LanguageContext';

export default function FaceScanner({
  mode = 'register', // 'register' or 'login'
  onSuccess,
  requireLiveness = true,
  isVerifying = false,
  externalError = null,
  onReset = null,
}) {
  const { t, speak, voiceEnabled } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const latestDescriptorRef = useRef(null);
  const latestScoreRef = useRef(0.96);

  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [lightingLevel, setLightingLevel] = useState(95);

  // Active Liveness Stages: 'ALIGN' -> 'BLINK' -> 'HEAD_TURN' -> 'VERIFIED'
  const [livenessStage, setLivenessStage] = useState(requireLiveness ? 'ALIGN' : 'VERIFIED');
  const [faceDetected, setFaceDetected] = useState(false);
  const [blinkPassed, setBlinkPassed] = useState(!requireLiveness);
  const [headTurnPassed, setHeadTurnPassed] = useState(!requireLiveness);
  const [multipleFacesAlert, setMultipleFacesAlert] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);

  // Stateful liveness tracking refs across render ticks
  const blinkStateRef = useRef({ sawClosed: false, closedTimestamp: 0 });
  const headTurnStateRef = useRef({ initialRatio: null });
  const autoCaptureTriggeredRef = useRef(false);

  const [completed, setCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState(null);

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
            if (voiceEnabled) speak("Camera active. Please look directly into the camera.");
          }
        } catch (err) {
          console.warn("Camera access unavailable:", err.message);
          if (mounted) {
            setCameraError("Camera unavailable or permission denied. You can switch to Demonstration Simulation mode.");
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

  // Reset camera and all challenge trackers when retrying
  const handleResetCamera = () => {
    setCompleted(false);
    setIsProcessing(false);
    setCapturedPhotoPreview(null);
    latestDescriptorRef.current = null;
    setCameraError(null);
    autoCaptureTriggeredRef.current = false;
    blinkStateRef.current = { sawClosed: false, closedTimestamp: 0 };
    headTurnStateRef.current = { initialRatio: null };
    setBlinkPassed(!requireLiveness);
    setHeadTurnPassed(!requireLiveness);
    setLivenessStage(requireLiveness ? 'ALIGN' : 'VERIFIED');
    if (onReset) {
      onReset();
    }
  };

  // Perform Real-Time Active Anti-Spoofing & Liveness Detection
  useEffect(() => {
    if (!streamActive || completed || simulatedMode) return;

    let intervalId = null;

    const runDetection = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const brightness = checkLightingQuality(videoRef.current);
        setLightingLevel(Math.round(brightness));

        const res = await detectFaceWithLiveness(videoRef.current);
        if (!res) return;

        if (res.status === 'MULTIPLE_FACES') {
          setMultipleFacesAlert(true);
          setFaceDetected(false);
          latestDescriptorRef.current = null;
          return;
        }

        setMultipleFacesAlert(false);

        if (res.status === 'NO_FACE') {
          setFaceDetected(false);
          latestDescriptorRef.current = null;
          return;
        }

        if (res.status === 'SUCCESS' && res.descriptor) {
          // Lock in real facial security descriptor
          latestDescriptorRef.current = res.descriptor;
          latestScoreRef.current = res.confidence || 0.96;
          setFaceDetected(true);
          setConfidenceScore(Math.round(res.confidence * 100));
          setCameraError(null);

          // Draw subtle outline on canvas
          if (canvasRef.current && videoRef.current) {
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            canvasRef.current.width = displaySize.width;
            canvasRef.current.height = displaySize.height;
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, displaySize.width, displaySize.height);

            const box = res.box;
            ctx.strokeStyle = (blinkPassed && headTurnPassed) ? '#10b981' : '#2563eb';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }

          if (!requireLiveness) {
            return;
          }

          // STAGE 1: ALIGNMENT -> BLINK CHALLENGE
          if (livenessStage === 'ALIGN' && res.isFacingCenter) {
            setLivenessStage('BLINK');
            if (voiceEnabled) speak("Face detected. Please blink your eyes naturally.");
            return;
          }

          // STAGE 2: EYE-BLINK CHALLENGE
          if (livenessStage === 'BLINK' && !blinkPassed) {
            // Track transition: OPEN -> CLOSED -> OPEN
            if (res.eyesClosed) {
              blinkStateRef.current.sawClosed = true;
              blinkStateRef.current.closedTimestamp = Date.now();
            } else if (blinkStateRef.current.sawClosed && res.eyesOpen) {
              const duration = Date.now() - blinkStateRef.current.closedTimestamp;
              // Genuine human blink takes between 80ms and 1800ms
              if (duration < 2500) {
                setBlinkPassed(true);
                headTurnStateRef.current.initialRatio = res.headTurnRatio || 1.0;
                setLivenessStage('HEAD_TURN');
                if (voiceEnabled) speak("Blink verified. Please turn your head slightly.");
              }
            }
            return;
          }

          // STAGE 3: HEAD MOVEMENT / 3D YAW CHALLENGE
          if (livenessStage === 'HEAD_TURN' && blinkPassed && !headTurnPassed) {
            const initial = headTurnStateRef.current.initialRatio || 1.0;
            const current = res.headTurnRatio || 1.0;
            const yawDelta = Math.abs(current - initial);

            // Valid 3D head movement: turned left, turned right, or yaw difference > 0.18
            if (res.isTurnedRight || res.isTurnedLeft || yawDelta > 0.18) {
              setHeadTurnPassed(true);
              setLivenessStage('VERIFIED');
              if (voiceEnabled) speak("Liveness confirmed. Real citizen verified.");
            }
            return;
          }

          // STAGE 4: ALL LIVENESS CHALLENGES PASSED! AUTO-CAPTURE IDENTITY
          if (livenessStage === 'VERIFIED' && blinkPassed && headTurnPassed && !autoCaptureTriggeredRef.current && !completed) {
            autoCaptureTriggeredRef.current = true;
            setTimeout(() => {
              handleQuickPhotoCapture();
            }, 450);
          }
        }
      } catch (err) {
        console.error("Facial security detection error:", err);
      }
    };

    intervalId = setInterval(runDetection, 200);
    return () => clearInterval(intervalId);
  }, [streamActive, completed, livenessStage, blinkPassed, headTurnPassed, simulatedMode, requireLiveness]);

  // CAPTURE VERIFIED PHOTO & SUBMIT BIOMETRIC DESCRIPTOR
  const handleQuickPhotoCapture = async () => {
    if (isProcessing || completed || isVerifying) return;

    // STRICT ANTI-SPOOFING ENFORCEMENT:
    if (requireLiveness && (!blinkPassed || !headTurnPassed)) {
      setCameraError("Anti-Spoofing Challenge Incomplete: Please blink your eyes and turn your head slightly to prove physical human presence.");
      return;
    }

    let descriptor = latestDescriptorRef.current;
    let score = latestScoreRef.current;

    // If descriptor is not cached yet, perform direct scan
    if (!descriptor && videoRef.current && videoRef.current.readyState >= 2) {
      setIsProcessing(true);
      try {
        const detection = await detectFaceWithLiveness(videoRef.current);
        if (detection && detection.descriptor) {
          descriptor = detection.descriptor;
          score = detection.confidence || 0.96;
          latestDescriptorRef.current = descriptor;
        }
      } catch (e) {
        console.warn("Direct facial scan failed:", e);
      }
    }

    if (!descriptor) {
      setIsProcessing(false);
      setCameraError("No face detected! Please position your face inside the oval guide.");
      return;
    }

    setIsProcessing(true);

    // Capture snapshot image from active video stream
    let faceImageUrl = '';
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = videoRef.current.videoWidth || 640;
      offCanvas.height = videoRef.current.videoHeight || 480;
      const ctx = offCanvas.getContext('2d');
      // Mirror image horizontally to match webcam preview
      ctx.translate(offCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, offCanvas.width, offCanvas.height);
      faceImageUrl = offCanvas.toDataURL('image/jpeg', 0.9);
    } else {
      faceImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    }

    setCapturedPhotoPreview(faceImageUrl);
    setConfidenceScore(Math.round(score * 100));
    setFaceDetected(true);
    setBlinkPassed(true);
    setHeadTurnPassed(true);
    setCompleted(true);

    if (voiceEnabled) speak("Photo captured. Authenticating live citizen against database photo.");

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
    }, 350);
  };

  const triggerSimulatedFace = () => {
    setIsProcessing(true);
    setFaceDetected(true);
    setBlinkPassed(true);
    setHeadTurnPassed(true);
    setLivenessStage('VERIFIED');
    setConfidenceScore(99);

    const mockDescriptor = generateMockEmbedding('voter_simulation_seed');
    const mockImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

    setCapturedPhotoPreview(mockImage);
    setCompleted(true);

    setTimeout(() => {
      if (voiceEnabled) speak("Demonstration facial security profile accepted.");
      onSuccess({
        faceImageUrl: mockImage,
        embedding: mockDescriptor,
        qualityScore: 0.99,
        livenessPassed: true,
        blinkDetected: true,
        headTurnDetected: true,
      });
      setIsProcessing(false);
    }, 350);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Official Camera Viewport */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl">
        {/* Video Stream */}
        {!simulatedMode ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-blue-400 p-6 text-center">
            <Sparkles className="w-12 h-12 text-blue-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Demonstration Face Security Mode Active</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Hardware webcam bypassed. Click below to proceed with demo profile.
            </p>
          </div>
        )}

        {/* Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20 scale-x-[-1]"
        />

        {/* Interactive Anti-Spoofing Oval Face Guide */}
        {!completed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className={`w-52 h-64 sm:w-60 sm:h-72 rounded-full border-2 ${
              externalError
                ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.45)]'
                : livenessStage === 'VERIFIED'
                ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-pulse'
                : livenessStage === 'HEAD_TURN'
                ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                : livenessStage === 'BLINK'
                ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-pulse'
                : faceDetected
                ? 'border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.35)]'
                : 'border-blue-500/70 border-dashed'
            } transition-all duration-300 flex items-end justify-center pb-4`}>
              <span className={`text-[10px] font-semibold px-3 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-1.5 ${
                externalError
                  ? 'bg-rose-950/95 text-rose-300 border border-rose-500/60'
                  : livenessStage === 'VERIFIED'
                  ? 'bg-emerald-950/95 text-emerald-300 border border-emerald-500/70'
                  : livenessStage === 'HEAD_TURN'
                  ? 'bg-cyan-950/95 text-cyan-300 border border-cyan-500/70'
                  : livenessStage === 'BLINK'
                  ? 'bg-amber-950/95 text-amber-300 border border-amber-500/70'
                  : faceDetected
                  ? 'bg-blue-950/95 text-blue-300 border border-blue-500/70'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700'
              }`}>
                {externalError ? (
                  <>⚠️ Face Mismatch - Retrying</>
                ) : livenessStage === 'VERIFIED' ? (
                  <>🛡️ Liveness Confirmed • Capturing</>
                ) : livenessStage === 'HEAD_TURN' ? (
                  <>↔️ Challenge 2: Turn Head Slightly</>
                ) : livenessStage === 'BLINK' ? (
                  <>👁️ Challenge 1: Please Blink Eyes</>
                ) : faceDetected ? (
                  <>✅ Face Centered • Starting Liveness</>
                ) : (
                  <>Center Face Inside Oval</>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-medium text-slate-200 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[11px]">ANTI-SPOOFING • ACTIVE LIVENESS</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300 backdrop-blur-md shadow-sm">
            <SunMedium className={`w-3.5 h-3.5 ${lightingLevel < 40 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>Lighting: {lightingLevel > 50 ? 'Good' : 'Low'}</span>
          </div>
        </div>

        {/* Real-Time Live Challenge HUD Banner */}
        {!completed && !simulatedMode && (
          <div className="absolute top-12 inset-x-4 z-30 pointer-events-none flex justify-center">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-slate-700 backdrop-blur-md flex items-center space-x-3 shadow-lg">
              {/* Step 1: Position */}
              <div className={`flex items-center space-x-1 text-[10px] font-mono ${
                faceDetected ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}>
                {faceDetected ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
                <span>1. Position</span>
              </div>

              <span className="text-slate-600 text-xs">•</span>

              {/* Step 2: Blink */}
              <div className={`flex items-center space-x-1 text-[10px] font-mono ${
                blinkPassed
                  ? 'text-emerald-400 font-bold'
                  : livenessStage === 'BLINK'
                  ? 'text-amber-400 font-bold animate-pulse'
                  : 'text-slate-500'
              }`}>
                {blinkPassed ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Eye className="w-3 h-3 text-amber-400" />
                )}
                <span>2. Blink</span>
              </div>

              <span className="text-slate-600 text-xs">•</span>

              {/* Step 3: Head Turn */}
              <div className={`flex items-center space-x-1 text-[10px] font-mono ${
                headTurnPassed
                  ? 'text-emerald-400 font-bold'
                  : livenessStage === 'HEAD_TURN'
                  ? 'text-cyan-400 font-bold animate-pulse'
                  : 'text-slate-500'
              }`}>
                {headTurnPassed ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <MoveHorizontal className="w-3 h-3 text-cyan-400" />
                )}
                <span>3. Movement</span>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Faces Alert */}
        {multipleFacesAlert && (
          <div className="absolute inset-x-4 top-16 p-2.5 bg-rose-950/90 border border-rose-500 rounded-xl flex items-center space-x-2 text-rose-200 text-xs z-40 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Multiple faces detected. Ensure only 1 citizen is in front of the camera.</span>
          </div>
        )}

        {/* Camera Warning / Error Alert */}
        {cameraError && !simulatedMode && (
          <div className="absolute inset-x-4 top-16 p-2.5 bg-rose-950/95 border border-rose-500 rounded-xl flex items-center justify-between text-rose-200 text-xs z-40 backdrop-blur-md shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{cameraError}</span>
            </div>
            <button
              type="button"
              onClick={() => setCameraError(null)}
              className="text-[10px] text-rose-300 hover:text-white underline ml-2 shrink-0 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Verification in Progress Spinner Overlay */}
        {isVerifying && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-3">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-white">Verifying Facial Security Profile</h3>
            <p className="text-xs text-slate-300 mt-1">Comparing live camera scan against enrolled database photo...</p>
          </div>
        )}
      </div>

      {/* PRIMARY ACTION BUTTONS */}
      <div className="w-full mt-4 space-y-3">
        {/* If verification failed, show clear Retake button */}
        {externalError ? (
          <button
            type="button"
            onClick={handleResetCamera}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition transform active:scale-98 cursor-pointer ring-2 ring-blue-400/40"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Verification & Try Again</span>
          </button>
        ) : isVerifying ? (
          <button
            type="button"
            disabled
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600/70 text-white font-bold text-sm shadow flex items-center justify-center space-x-2 cursor-wait"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying with Database Photo...</span>
          </button>
        ) : !simulatedMode ? (
          <button
            type="button"
            onClick={handleQuickPhotoCapture}
            disabled={isProcessing || !blinkPassed || !headTurnPassed}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center space-x-2.5 transition transform active:scale-98 ${
              blinkPassed && headTurnPassed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50 shadow-emerald-500/20 cursor-pointer animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-90'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>
              {isProcessing
                ? "Processing Snapshot..."
                : blinkPassed && headTurnPassed
                ? "📸 Capture Verified Identity"
                : livenessStage === 'HEAD_TURN'
                ? "↔️ Turn Head Slightly to Unlock Capture"
                : livenessStage === 'BLINK'
                ? "👁️ Blink Eyes to Unlock Capture"
                : "Center Face in Oval to Start Liveness"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={triggerSimulatedFace}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow flex items-center justify-center space-x-2 transition"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Confirm Demonstration Identity</span>
          </button>
        )}

        {/* Verification Checkpoint Indicators */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`p-2 rounded-lg border text-center transition ${
            faceDetected ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <div className="font-semibold text-[11px] flex items-center justify-center gap-1">
              {faceDetected && <Check className="w-3 h-3" />} Position
            </div>
            <div className="text-[10px] opacity-80">{faceDetected ? 'Centered' : 'Align Face'}</div>
          </div>

          <div className={`p-2 rounded-lg border text-center transition ${
            blinkPassed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <div className="font-semibold text-[11px] flex items-center justify-center gap-1">
              {blinkPassed && <Check className="w-3 h-3" />} Blink
            </div>
            <div className="text-[10px] opacity-80">{blinkPassed ? 'Verified' : 'Blink Eyes'}</div>
          </div>

          <div className={`p-2 rounded-lg border text-center transition ${
            headTurnPassed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <div className="font-semibold text-[11px] flex items-center justify-center gap-1">
              {headTurnPassed && <Check className="w-3 h-3" />} 3D Movement
            </div>
            <div className="text-[10px] opacity-80">{headTurnPassed ? 'Verified' : 'Turn Head'}</div>
          </div>
        </div>

        {/* Helpful Tips Display when an error occurs */}
        {externalError && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 text-left space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-blue-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tips for accurate facial verification:</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc list-inside">
              <li>Ensure good front lighting on your face (avoid strong window backlighting)</li>
              <li>Hold your camera straight at eye level</li>
              <li>Complete the natural eye blink and slight head turn challenges</li>
            </ul>
          </div>
        )}

        {/* Secondary Switch Mode */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setSimulatedMode(!simulatedMode)}
            className="text-xs text-slate-400 hover:text-blue-400 transition underline underline-offset-4"
          >
            {simulatedMode ? 'Switch to Physical Camera' : 'Switch to Demonstration Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
