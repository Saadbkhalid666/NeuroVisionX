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
  const [gesture, setGesture] = useState("🤚 Waiting...");
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // --- 1️⃣ Initialize MediaPipe Hands (GPU delegate)
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
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
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, "#A020F0");
          gradient.addColorStop(1, "#00FFFF");

          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: gradient, lineWidth: 5 });

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

    // --- 2️⃣ Start Camera
    let camera = null;
    if (video) {
      camera = new Camera(video, {
        onFrame: async () => {
          if (hands) await hands.send({ image: video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    // --- 3️⃣ Initialize GestureRecognizer with GPU
    let gestureRecognizer = null;
    const initGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/gesture_recognizer.task",
          delegate: "GPU", // 🔥 GPU delegate
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      const detectGestures = async () => {
        if (video.readyState >= 2) {
          const results = await gestureRecognizer.recognizeForVideo(video, performance.now());
          if (results.gestures.length > 0) {
            const top = results.gestures[0][0];
            setGesture(`✋ ${top.categoryName}`);
            setConfidence(top.score);
          } else {
            setGesture("🤚 No Gesture Detected");
            setConfidence(0);
          }
        }
        requestAnimationFrame(detectGestures);
      };

      detectGestures();
    };

    initGestureRecognizer();

    return () => {
      if (hands) hands.close();
      if (camera) camera.stop();
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

      <div className="mb-4 text-3xl font-bold text-cyan-400 drop-shadow-lg text-center min-h-12">
        {gesture}
      </div>

      <div className="w-full max-w-md mb-6 rounded-none px-4">
        <ConfidenceBar confidence={confidence} />
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
      
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-8 mt-8">
        {/* Face Detection */}
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

        {/* Hand Detection */}
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
