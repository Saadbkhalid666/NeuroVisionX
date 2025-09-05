import { useEffect, useRef } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { NavLink } from "react-router-dom";

export const HandDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    function onResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      }
      canvasCtx.restore();
    }

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });
    camera.start();
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      <h1 className="text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg mb-12">
        NeuroVisionX – Hand Detection
      </h1>

      {/* Video & Canvas */}
     <div className="relative w-full max-w-lg rounded-2xl bg-black/40 backdrop-blur-lg shadow-[0_0_25px_rgba(147,51,234,0.6)] border border-purple-600 overflow-hidden">
        <video ref={videoRef} className="w-full h-auto rounded-2xl" playsInline muted />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>


      {/* Navigation */}
      <div className="flex flex-row mt-10 gap-4">
        <NavLink
          to="/facedetection"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">👁 Face Detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-green-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>

        <NavLink
          to="/"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">🏠 Home</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-green-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>
      </div>
    </div>
  );
};
