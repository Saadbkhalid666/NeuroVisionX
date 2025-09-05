import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import * as faceapi from "face-api.js";
import axios from "axios";
import { NavLink } from "react-router-dom";

export const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");
  const [gender, setGender] = useState("--");
  const [emotion, setEmotion] = useState("--");
  const [age, setAge] = useState("--");
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const ageBuffer = useRef([]);
  const smoothedAge = useRef(null);
  let camera = null;

  // Draw landmarks
  const drawFaceMesh = (ctx, landmarks) => {
    if (!landmarks) return;
    ctx.strokeStyle = "rgba(167,236,62,0.8)";
    ctx.lineWidth = 1.5;

    landmarks.forEach((point) => {
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.stroke();
    });
  };

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error("Error loading models:", error);
        setMessage("Failed to load AI models");
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  // Setup mediapipe
  useEffect(() => {
    if (!modelsLoaded) return;

    const videoElement = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    faceMesh.onResults(async (results) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.multiFaceLandmarks?.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawFaceMesh(ctx, landmarks);

        const detection = await faceapi
          .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withAgeAndGender()
          .withFaceExpressions();

        if (detection) {
          setGender(detection.gender);

          if (ageBuffer.current.length < 15) {
            ageBuffer.current.push(detection.age);
          } else {
            ageBuffer.current.shift();
            ageBuffer.current.push(detection.age);
          }

          const avgAge =
            ageBuffer.current.reduce((sum, val) => sum + val, 0) /
            ageBuffer.current.length;
          smoothedAge.current = Math.round(avgAge);
          setAge(smoothedAge.current);

          const expressions = detection.expressions;
          const maxEmotion = Object.entries(expressions).reduce(
            (max, [emotion, value]) =>
              value > max.value ? { emotion, value } : max,
            { emotion: "", value: 0 }
          );
          setEmotion(maxEmotion.emotion);

          ctx.fillStyle = "lime";
          ctx.font = "16px Orbitron, sans-serif";
          ctx.fillText(
            `${smoothedAge.current}y ${detection.gender} ${maxEmotion.emotion}`,
            landmarks[10].x * canvas.width,
            landmarks[10].y * canvas.height - 10
          );
        }
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    camera = new Camera(videoElement, {
      onFrame: async () => await faceMesh.send({ image: videoElement }),
      width: 640,
      height: 480,
    });
    camera.start();

    return () => camera && camera.stop();
  }, [modelsLoaded]);

  // Upload
  const captureAndUpload = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `face_capture_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const formData = new FormData();
      formData.append("file", file);
      try {
        setMessage("Uploading...");
        const res = await axios.post("/upload_image/", formData, {
          baseURL: "http://127.0.0.1:8000",
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage(res.data.message || "Upload successful!");
      } catch (err) {
        console.error("Upload error:", err);
        setMessage("Upload failed: " + (err.response?.data || err.message));
      }
    }, "image/jpeg", 0.8);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-purple-300 px-4">
        <div className="text-2xl font-semibold mb-6">Loading NeuroVisionX AI...</div>
        <div className="w-full max-w-sm h-3 bg-purple-900 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg mb-12">
        NeuroVisionX – Face Detection
      </h1>

      {/* Camera Box */}
      <div className="relative w-full max-w-lg rounded-2xl bg-black/40 backdrop-blur-lg shadow-[0_0_25px_rgba(147,51,234,0.6)] border border-purple-600 overflow-hidden">
        <video ref={videoRef} className="w-full h-auto rounded-2xl" playsInline muted />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      {/* Controls + Info */}
      <div className="mt-8 flex flex-col items-center space-y-6 w-full max-w-lg">
        <button
          onClick={captureAndUpload}
          disabled={!modelsLoaded}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-purple-500 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⚡ Capture & Upload
        </button>

        {message && (
          <p className={`text-center font-medium ${message.includes("failed") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </p>
        )}

        {/* Info Panel */}
        <div className="w-full bg-black/50 backdrop-blur-lg border border-purple-700 rounded-xl p-6 text-purple-300 shadow-inner">
          <p className="text-lg">
            Gender: <span className="text-purple-100 font-semibold">{gender}</span>
          </p>
          <p className="text-lg">
            Age: <span className="text-purple-100 font-semibold">{age}</span>{" "}
            <span className="text-yellow-400 text-sm">(AI estimate)</span>
          </p>
          <p className="text-lg">
            Emotion: <span className="text-purple-100 font-semibold">{emotion}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-row mt-10 gap-4">
      <NavLink
          to="/handdetection"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">✋ Hand Detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-green-600 opacity-0 hover:opacity-30 transition duration-500"></span>
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
