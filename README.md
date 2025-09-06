# NeuroVisionX

[![Website](https://img.shields.io/badge/Website-Live-brightgreen)](https://neurovisionx.vercel.app)  
[![GitHub Repo](https://img.shields.io/badge/GitHub-Source-blue)](https://github.com/Saadbkhalid666/NeuroVisionX)

---

## Overview

**NeuroVisionX** is a cutting-edge web application that leverages AI-powered computer vision to provide **real-time face and hand detection**. Built with **ReactJS** for frontend development and **TailwindCSS** for responsive styling, this project demonstrates advanced capabilities of modern AI frameworks integrated directly into the browser.

The platform features:

- **Face Detection** – Detects detailed facial features including eyes, eyebrows, iris, lips, etc., and predicts age, gender, and emotion.  
- **Hand Detection** – Recognizes hand gestures using WebAssembly (WASM) and provides confidence levels for predictions.

---

## Features

### Face Detection

- Detects **faces** in real-time with high accuracy.  
- Predicts **age** and **gender** using `age_gender_model`.  
- Recognizes **emotions** (happy, sad, etc.) via `face_expression_model`.  
- Generates **68 facial landmarks** using `face_landmark_68_model`.  
- Detects faces efficiently with `tiny_face_detector`.  
- Built using **@mediapipe/tasks-vision** for landmark and model implementation.

### Hand Detection

- Recognizes **gestures** using `gesture_recognizer.task`.  
- Predicts the **confidence level** of gestures.  
- Implements **landmarks and connectors** via **@mediapipe/tasks-vision**.  
- Optimized with **WebAssembly (WASM)** for fast and smooth performance in the browser.

---

## Tech Stack

- **Frontend:** ReactJS  
- **Styling & Responsiveness:** TailwindCSS  
- **AI / Computer Vision:** Mediapipe, WASM, @mediapipe/tasks-vision  

---

## Live Demo

Check out the live website here: [https://neurovisionx.vercel.app](https://neurovisionx.vercel.app)

---

 
 
## Installation

1. Clone the repository:

```bash
git clone https://github.com/Saadbkhalid666/NeuroVisionX.git
cd NeuroVisionX

## Installation

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm start
```

Open your browser at:

```
http://localhost:3000
```

---

## Usage

* Navigate to the **Face Detection** or **Hand Detection** page.
* Allow the browser to access your camera.
* See real-time detection and predictions on your face or hand gestures.
* Explore emotion, age, gender, and gesture confidence metrics.

---

## Contribution

Contributions, feedback, and suggestions are always welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m "Description"`)
5. Push to the branch (`git push origin feature-name`)
6. Open a pull request

---

## License

This project is **open-source** and available under the [MIT License](LICENSE).

---

**NeuroVisionX** – bridging the world of AI, computer vision, and the web, one detection at a time. 🌐🤖
