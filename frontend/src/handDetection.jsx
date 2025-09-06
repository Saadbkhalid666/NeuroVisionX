import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

export const HandDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [gestures, setGestures] = useState([" Loading...", " Loading..."]);
  const [confidences, setConfidences] = useState([0, 0]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    let gestureRecognizer;
    let rafId;

    const initGestureRecognizer = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("/wasm");

        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        setIsModelLoaded(true);
        startCamera();
      } catch (err) {
        console.error("GestureRecognizer init failed:", err);
        setError(" Failed to load gesture model");
      }
    };

    const startCamera = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const drawingUtils = new DrawingUtils(ctx);

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.play();

        const detect = async () => {
          if (video.readyState >= 2 && gestureRecognizer) {
            const results = await gestureRecognizer.recognizeForVideo(
              video,
              performance.now()
            );

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (results.landmarks) {
              results.landmarks.forEach((lm) => {
                drawingUtils.drawConnectors(
                  lm,
                  GestureRecognizer.HAND_CONNECTIONS,
                  { color: "#00FFFF", lineWidth: 3 }
                );
                drawingUtils.drawLandmarks(lm, { color: "#A020F0", radius: 5 });
              });
            }

            if (results.gestures && results.gestures.length > 0) {
              let leftGesture = " No Gesture";
              let rightGesture = " No Gesture";
              let leftConfidence = 0;
              let rightConfidence = 0;

              results.gestures.forEach((handGestures, i) => {
                const gesture = handGestures[0].categoryName;
                const confidence = handGestures[0].score;
                const handedness = results.handednesses[i][0].categoryName;

                if (handedness === "Left") {
                  leftGesture = ` ${gesture}`;
                  leftConfidence = confidence;
                } else if (handedness === "Right") {
                  rightGesture = ` ${gesture}`;
                  rightConfidence = confidence;
                }
              });

              setGestures([leftGesture, rightGesture]);
              setConfidences([leftConfidence, rightConfidence]);
            } else {
              setGestures([" No Hand", " No Hand"]);
              setConfidences([0, 0]);
            }
          }
          rafId = requestAnimationFrame(detect);
        };

        detect();
      });
    };

    initGestureRecognizer();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (gestureRecognizer) gestureRecognizer.close();
    };
  }, []);

  // Confidence Bar Component
  const ConfidenceBar = ({ confidence }) => {
    const width = `${confidence * 100}%`;
    let color = "bg-red-500";
    if (confidence > 0.7) color = "bg-green-500";
    else if (confidence > 0.4) color = "bg-yellow-500";

    return (
      <div className="w-full mt-2">
        <div className="flex justify-between text-xs sm:text-sm mb-1">
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
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden px-4 py-50 sm:py-24">
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg mb-6 text-center">
        NeuroVisionX – Gesture Recognition
      </h1>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-base sm:text-lg mb-4 p-3 bg-red-900/30 rounded-lg text-center">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="block mt-2 px-3 py-1 bg-red-600 rounded-md hover:bg-red-700 transition-colors mx-auto"
          >
            Reload
          </button>
        </div>
      )}

      {/* Loader */}
      {!isModelLoaded && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-purple-300 w-full">
          <div className="text-lg sm:text-2xl font-semibold mb-6">
            Loading NeuroVisionX AI...
          </div>
          <div className="w-full max-w-xs sm:max-w-sm h-3 bg-purple-900 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Gestures */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 text-lg sm:text-xl md:text-2xl font-bold text-cyan-400 drop-shadow-lg text-center">
        <div> Left Hand: {gestures[0]}</div>
        <div> Right Hand: {gestures[1]}</div>
      </div>

      {/* Confidence Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg sm:max-w-2xl mb-6">
        <ConfidenceBar confidence={confidences[0]} />
        <ConfidenceBar confidence={confidences[1]} />
      </div>
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


      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mt-8">
        <NavLink
          to="/facedetection"
          className="px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-purple-700 to-purple-500
            shadow-[0_0_25px_rgba(168,85,247,0.7)]
            hover:scale-105 transition-transform duration-300 text-center"
        >
          👁 Face Detection
        </NavLink>

        <NavLink
          to="/"
          className="px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300 text-center"
        >
          🏠 Home
        </NavLink>
      </div>
    </div>
  );
};
