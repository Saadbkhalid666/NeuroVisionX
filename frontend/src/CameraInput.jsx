import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import * as faceapi from "face-api.js";
import axios from "axios";

export const Cam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");
  const [gender, setGender] = useState("--");
  const [emotion, setEmotion] = useState("--");
  const [age, setAge] = useState("--");
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const ageBuffer = useRef([]); // buffer for averaging age
  const smoothedAge = useRef(null); // final stable age
  let camera = null;

  // Draw MediaPipe landmarks in purple
  const drawFaceMesh = (ctx, landmarks) => {
    if (!landmarks) return;

    ctx.strokeStyle = "rgba(81, 44, 99,0.3)"; 
    ctx.lineWidth = 1.5;

    // draw points
    landmarks.forEach((point) => {
      const x = point.x * ctx.canvas.width;
      const y = point.y * ctx.canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // draw connections (subset)
    const connections = [
      [33, 133],
      [342, 243], // eyes
      [61, 291],
      [146, 78],
      [78, 308], // lips
      [1, 2],
      [2, 98],
      [98, 327], // nose
      [152, 148],
      [148, 176],
      [176, 149], // jaw
    ];

    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
        ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
        ctx.stroke();
      }
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

  // Setup MediaPipe FaceMesh
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

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawFaceMesh(ctx, landmarks);

        // crop the face region for more stable age/gender/emotion detection
        const detection = await faceapi
          .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
          .withAgeAndGender()
          .withFaceExpressions();

        if (detection) {
          setGender(detection.gender);

          // age smoothing: buffer last 15 frames
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

          // emotion
          const expressions = detection.expressions;
          const maxEmotion = Object.entries(expressions).reduce(
            (max, [emotion, value]) =>
              value > max.value ? { emotion, value } : max,
            { emotion: "", value: 0 }
          );
          setEmotion(maxEmotion.emotion);

          // draw text
          ctx.fillStyle = "lime";
          ctx.font = "16px Arial";
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

    return () => {
      if (camera) camera.stop();
    };
  }, [modelsLoaded]);

  // Capture & upload
  const captureAndUpload = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
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
      },
      "image/jpeg",
      0.8
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-purple-300 px-4">
        <div className="text-2xl font-semibold mb-6">Loading AI models...</div>
        <div className="w-full max-w-sm h-3 bg-purple-900 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h2 className="text-3xl text-purple-400 mb-6 font-bold tracking-wide text-center">
        FaceLense 
      </h2>

      <div className="relative w-full max-w-lg rounded-xl shadow-lg overflow-hidden border-2 border-purple-600">
        <video ref={videoRef} className="w-full h-auto" playsInline muted />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      <div className="mt-6 flex flex-col items-center space-y-5 w-full max-w-lg">
        <button
          onClick={captureAndUpload}
          disabled={!modelsLoaded}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-black font-semibold rounded-lg shadow-md hover:from-purple-500 hover:to-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          Capture & Upload
        </button>

        {message && (
          <p
            className={`text-center font-medium ${
              message.includes("failed") ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}

        <div className="w-full bg-purple-900 rounded-lg p-4 text-purple-300 shadow-inner">
          <p className="text-lg">
            Gender:{" "}
            <span className="text-purple-100 font-semibold">{gender}</span>
          </p>
          <p className="text-lg">
            Age: <span className="text-purple-100 font-semibold">{age}</span>{" "}
            <span className="text-yellow-400 text-sm">
              (AI estimate, may vary)
            </span>
          </p>
          <p className="text-lg">
            Emotion:{" "}
            <span className="text-purple-100 font-semibold">{emotion}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
