import { Cam } from "./CameraInput";
import { HandDetection } from "./handDetection";
import {createBrowserRouter} from "react-router-dom"
export const router = createBrowserRouter ([
    {path:'/facedetection',element:<Cam   />},
    {path:'handdetection',element:<HandDetection   />}
])