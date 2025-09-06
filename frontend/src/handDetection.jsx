import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { DrawingUtils, GestureRecognizer } from "@mediapipe/tasks-vision";
import { useMediaPipe } from "./MediaPipeContext";

export const HandDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { gestureRecognizer, loading, error } = useMediaPipe();

  const [gestures, setGestures] = useState(["Loading...", "Loading..."]);
  const [confidences, setConfidences] = useState([0, 0]);

  useEffect(() => {
    if (!gestureRecognizer || loading || error) return;

    let videoStream;

    const startCamera = async () => {
      const video = videoRef.current;
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = videoStream;
      await video.play();

      const detect = async () => {
        if (video.readyState >= 2) {
          const results = await gestureRecognizer.recognizeForVideo(
            video,
            performance.now()
          );
          const ctx = canvasRef.current.getContext("2d");
          const drawingUtils = new DrawingUtils(ctx);

          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

          // Mirror the canvas
          ctx.save();
          ctx.translate(canvasRef.current.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(
            video,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

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
            let leftGesture = "No Gesture";
            let rightGesture = "No Gesture";
            let leftConfidence = 0;
            let rightConfidence = 0;

            results.gestures.forEach((handGestures, i) => {
              const gesture = handGestures[0].categoryName;
              const confidence = handGestures[0].score;
              const handedness = results.handednesses[i][0].categoryName;

              // Swap due to mirroring
              if (handedness === "Left") {
                rightGesture = gesture;
                rightConfidence = confidence;
              } else if (handedness === "Right") {
                leftGesture = gesture;
                leftConfidence = confidence;
              }
            });

            setGestures([leftGesture, rightGesture]);
            setConfidences([leftConfidence, rightConfidence]);
          } else {
            setGestures(["No Hand", "No Hand"]);
            setConfidences([0, 0]);
          }

          ctx.restore();
        }

        rafRef.current = requestAnimationFrame(detect);
      };

      detect();
    };

    startCamera();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    };
  }, [gestureRecognizer, loading, error]);

  // Confidence bar component (same as your original)
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
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden pb-46 sm:pb-38 px-14">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-72 sm:w-[400px] h-72 sm:h-[400px] bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg mb-8 sm:mb-12 text-center">
        NeuroVisionX – Face Detection
      </h1>

      <div className="flex gap-6 mb-6 text-cyan-400 text-xl font-bold">
        <div>Left Hand: {gestures[1]}</div>
        <div>Right Hand: {gestures[0]}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-6">
        <ConfidenceBar confidence={confidences[1]} />
        <ConfidenceBar confidence={confidences[0]} />
      </div>

      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-purple-600">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 w-full h-full transform scale-x-[1]"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <NavLink
          to="/facedetection"
          className="px-10 py-3 text-lg font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-purple-700 to-purple-500
            shadow-[0_0_25px_rgba(168,85,247,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10"> Face Detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>
        <NavLink
          to="/"
          className="flex-1 px-10 py-3 text-lg sm:text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300 text-center"
        >
          <span className="relative z-10"> Home</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-green-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>
      </div>
    </div>
  );
};
