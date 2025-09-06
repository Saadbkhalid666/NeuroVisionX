import { createContext, useContext, useEffect, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

const MediaPipeContext = createContext();
export const useMediaPipe = () => useContext(MediaPipeContext);

export const MediaPipeProvider = ({ children }) => {
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let recognizerInstance;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("/wasm");
        recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/gesture_recognizer.task", delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 2,
        });

        setGestureRecognizer(recognizerInstance);
        setLoading(false);
      } catch (err) {
        console.error("GestureRecognizer init failed:", err);
        setError("Failed to load gesture model");
        setLoading(false);
      }
    };

    init();

    return () => {
      if (recognizerInstance) recognizerInstance.close();
    };
  }, []);

  return (
    <MediaPipeContext.Provider value={{ gestureRecognizer, loading, error }}>
      {children}
    </MediaPipeContext.Provider>
  );
};
