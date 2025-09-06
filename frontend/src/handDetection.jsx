import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { Hands } from "@mediapipe/hands";

export const HandDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gestures, setGestures] = useState(["🤚 Loading...", "🤚 Loading..."]);
  const [confidences, setConfidences] = useState([0, 0]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let camera = null;
    let hands = null;
    let gestureRecognizer = null;
    let rafId = null;

    // Initialize MediaPipe Hands
    const initHands = async () => {
      try {
        hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks) {
            results.multiHandLandmarks.forEach((landmarks) => {
              const gradient = ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
              );
              gradient.addColorStop(0, "#A020F0");
              gradient.addColorStop(1, "#00FFFF");

              drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: gradient,
                lineWidth: 5,
              });

              landmarks.forEach((lm) => {
                const x = lm.x * canvas.width;
                const y = lm.y * canvas.height;
                const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, 16);
                dotGradient.addColorStop(0, "#00FFFF");
                dotGradient.addColorStop(1, "#A020F0");

                ctx.beginPath();
                ctx.arc(x, y, 6.5, 0, 2 * Math.PI);
                ctx.fillStyle = dotGradient;
                ctx.fill();
              });
            });
          }
        });

        await hands.initialize();
        return true;
      } catch (err) {
        console.error("Failed to initialize hands:", err);
        setError("Failed to initialize hand detection");
        return false;
      }
    };

    // Load Gesture Recognizer
    const initGestureRecognizer = async () => {
      try {
        setGestures(["⚡ Loading model...", "⚡ Loading model..."]);
        
        // Use a different approach to load the vision tasks
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        return true;
      } catch (error) {
        console.error("Failed to initialize gesture recognizer:", error);
        setError("Failed to load gesture model");
        return false;
      }
    };

    // Start camera after models are loaded
    const startCamera = () => {
      if (video) {
        camera = new Camera(video, {
          onFrame: async () => {
            if (hands) await hands.send({ image: video });
          },
          width: 640,
          height: 480,
        });
        camera.start();
        return true;
      }
      return false;
    };

    // Start gesture detection
    const startGestureDetection = () => {
      const detectGestures = async () => {
        if (video.readyState >= 2 && gestureRecognizer) {
          try {
            const results = await gestureRecognizer.recognizeForVideo(
              video,
              performance.now()
            );

            if (results.gestures && results.gestures.length > 0) {
              // Collect gestures for each hand
              const detectedGestures = results.gestures.map(
                (handGestures) => `✋ ${handGestures[0].categoryName}`
              );
              const detectedConfidences = results.gestures.map(
                (handGestures) => handGestures[0].score
              );

              // Ensure both hands are always represented (fill missing)
              setGestures([
                detectedGestures[0] || "🤚 No Gesture",
                detectedGestures[1] || "🤚 No Gesture",
              ]);
              setConfidences([
                detectedConfidences[0] || 0,
                detectedConfidences[1] || 0,
              ]);
            } else {
              setGestures(["🤚 No Hand", "🤚 No Hand"]);
              setConfidences([0, 0]);
            }
          } catch (error) {
            console.error("Gesture recognition error:", error);
          }
        }
        rafId = requestAnimationFrame(detectGestures);
      };

      detectGestures();
    };

    // Initialize everything in sequence with delays to avoid conflicts
    const initializeAll = async () => {
      try {
        // First initialize hands
        const handsInitialized = await initHands();
        if (!handsInitialized) return;
        
        // Add a small delay before initializing gesture recognizer
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Then initialize gesture recognizer
        const gestureInitialized = await initGestureRecognizer();
        if (!gestureInitialized) return;
        
        // Start camera
        const cameraStarted = startCamera();
        if (!cameraStarted) return;
        
        // Add another small delay before starting gesture detection
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Start gesture detection
        startGestureDetection();
        
        setIsModelLoaded(true);
        setError(null);
      } catch (error) {
        console.error("Initialization error:", error);
        setError("Failed to initialize. Please refresh the page.");
      }
    };

    initializeAll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (camera) camera.stop();
      if (hands) hands.close();
      if (gestureRecognizer) gestureRecognizer.close();
    };
  }, []);

  // --- Confidence Bar
  const ConfidenceBar = ({ confidence }) => {
    const width = `${confidence * 100}%`;
    let color = "bg-red-500";
    if (confidence > 0.7) color = "bg-green-500";
    else if (confidence > 0.4) color = "bg-yellow-500";

    return (
      <div className="w-full mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Confidence:</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className={`${color} h-2.5 rounded-full transition-all duration-300`}
            style={{ width }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden p-4">
      <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg mb-6 text-center">
        NeuroVisionX – Hand Detection
      </h1>

      {/* Error message */}
      {error && (
        <div className="text-red-400 text-lg mb-4 p-3 bg-red-900/30 rounded-lg">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Reload
          </button>
        </div>
      )}

      {/* Status indicator */}
      {!isModelLoaded && !error && (
        <div className="text-yellow-400 text-lg mb-4 animate-pulse">
          Loading models, please wait...
        </div>
      )}

      {/* Both hands */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 text-2xl font-bold text-cyan-400 drop-shadow-lg text-center">
        <div> Left Hand: {gestures[0]}</div>
        <div> Right Hand: {gestures[1]}</div>
      </div>

      {/* Confidence Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-6">
        <ConfidenceBar confidence={confidences[0]} />
        <ConfidenceBar confidence={confidences[1]} />
      </div>

      {/* Video */}
      <div className="relative w-full max-w-lg rounded-2xl bg-black/40 backdrop-blur-lg shadow-lg border border-purple-600 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-2xl transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-8 mt-8">
        <NavLink
          to="/facedetection"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-purple-700 to-purple-500
            shadow-[0_0_25px_rgba(168,85,247,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">👁 Face Detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>

        <NavLink
          to="/"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">Home</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-green-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>
      </div>
    </div>
  );
};