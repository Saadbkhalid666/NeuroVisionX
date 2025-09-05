import App from "./App";
import { FaceDetection } from "./faceDetection";
import { HandDetection } from "./handDetection";
import {createBrowserRouter} from "react-router-dom"
export const router = createBrowserRouter ([
    {path:'/',element:<App   />},

    {path:'/facedetection',element:<FaceDetection   />},
    {path:'handdetection',element:<HandDetection   />}
])