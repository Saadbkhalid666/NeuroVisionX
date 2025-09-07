import { NavLink } from "react-router-dom";
import { Welcome } from "./Welcome";

function App() {
  return (
    <>
    
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      {/* App Title */}
      <h1 className="text-3xl md:text-4xl  font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg mb-16">
        NeuroVisionX
      </h1>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Face Detection */}
        <NavLink
          to="/facedetection"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-purple-700 to-purple-500
            shadow-[0_0_25px_rgba(168,85,247,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10">Face Detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-purple-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>

        {/* Hand Detection */}
        <NavLink
          to="/handdetection"
          className="px-10 py-5 text-2xl font-semibold rounded-2xl relative overflow-hidden
            bg-gradient-to-r from-green-600 to-lime-400
            shadow-[0_0_25px_rgba(34,197,94,0.7)]
            hover:scale-105 transition-transform duration-300"
        >
          <span className="relative z-10"> Hand Detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-green-600 opacity-0 hover:opacity-30 transition duration-500"></span>
        </NavLink>
      </div>
    </div>
            </>
  );
}

export default App;
