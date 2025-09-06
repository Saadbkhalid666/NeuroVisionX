// Footer.jsx
export const Footer = () => {
  return (
    <div className="absolute     bottom-0 w-full ">

    <footer className="w-full   border-t border-purple-600/40 bg-gradient-to-br from-black via-gray-900 to-black text-gray-300 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo / Title */}
        <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-green-400 to-purple-600 drop-shadow-lg">
          NeuroVisionX
        </h2>

        {/* Copyright + Powered */}
        <div className="text-center sm:text-right text-sm space-y-1">
          <p>© {new Date().getFullYear()} NeuroVisionX. All rights reserved.</p>
          <p className="text-purple-400">
            🚀 Powered by <span className="font-semibold text-green-400">Saad.Dev</span>
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
};
