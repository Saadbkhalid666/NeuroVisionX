/* eslint-disable react-refresh/only-export-components */
import App from "./App";
import { Outlet } from "react-router-dom";
import { FaceDetection } from "./faceDetection";
import { HandDetection } from "./handDetection";
import {createBrowserRouter} from "react-router-dom"
import { Footer } from "./footer";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Layout wraps all pages
    children: [
      { index: true, element: <App /> },
      { path: "facedetection", element: <FaceDetection /> },
      { path: "handdetection", element: <HandDetection /> },
    ],
  },
]);

function Layout(){
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Main content */}
        <Outlet />

      {/* Footer */}
      <Footer />
    </div>
  );
};
