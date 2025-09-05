import App from "./App";
import { Cam } from "./CameraInput";
import { HandDetection } from "./handDetection";
import {createBrowserRouter} from "react-router-dom"
export const router = createBrowserRouter ([
    {path:'/',element:<App   />},

    {path:'/facedetection',element:<Cam   />},
    {path:'handdetection',element:<HandDetection   />}
])