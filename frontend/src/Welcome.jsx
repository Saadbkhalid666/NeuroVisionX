import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

export const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1200, // animation duration in ms
      once: true, // only animate once
      easing: "ease-in-out",
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 7000); // navigate after 7s
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">

      {/* Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>

      {/* Logo */}
      <img
        data-aos="fade-up"
        data-aos-easing="linear"
        data-aos-offset="200"
        data-aos-duration="1500"
        src="/images/neuro.png"
        alt="NeuroVisionX Logo"
        className="w-48 md:w-64 mb-8"
      />

      {/* Animated Text */}
      <p
        data-aos="fade-up"
        data-aos-easing="linear"
        data-aos-offset="200"
        data-aos-duration="1500"
        className="text-2xl md:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg text-center"
      >
        AI-powered project by Saad.dev
      </p>
    </div>
  );
};
