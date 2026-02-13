import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import WorldLoader from "./components/WorldLoader"; // Import the new loader

export default async function HomePage() {
  const { userId } = await auth();

  // ✅ IF LOGGED IN: Show the "Loading Terrain" screen
  if (userId) {
    return <WorldLoader />;
  }

  // 🧱 Button Styles
  const btnBase = "relative inline-flex items-center justify-center w-48 py-3 text-xl text-white border-2 border-b-4 active:border-b-2 active:translate-y-1 transition-all font-minecraft shadow-sm";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#87CEEB] text-white p-8 text-center font-sans relative overflow-hidden">
      
      {/* ☁️ Clouds (Pixelated) */}
      <div className="absolute top-10 left-10 w-32 h-12 bg-white/80 opacity-80 hidden md:block"></div>
      <div className="absolute top-24 right-20 w-48 h-16 bg-white/80 opacity-60 hidden md:block"></div>

      <div className="relative z-10 mb-20">
        <h1 className="text-7xl font-minecraft mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
          MC <span className="text-[#5b8731] text-shadow-sm">PLANS</span>
        </h1>
        <p className="text-2xl text-white/90 max-w-lg mb-12 font-minecraft drop-shadow-md">
          Minecraft planning made simple.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/sign-in">
            <button className={`${btnBase} bg-[#a07449] border-t-[#bc986e] border-l-[#bc986e] border-r-[#5e3f22] border-b-[#422d1a] hover:bg-[#8f663d]`}>
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className={`${btnBase} bg-[#5b8731] border-t-[#7ecb46] border-l-[#7ecb46] border-r-[#3e6826] border-b-[#2f4f1d] hover:bg-[#4a6e28]`}>
              Get Started
            </button>
          </Link>
        </div>
      </div>
      
      {/* 🌸 THE GROUND LAYER */}
      <div className="fixed bottom-0 w-full flex flex-col items-center">
        
        {/* Flower Row */}
        <div className="flex justify-center gap-16 w-full max-w-4xl px-10 items-end">
          
          {/* 🌹 POPPY */}
          <svg width="48" height="48" viewBox="0 0 16 16" shapeRendering="crispEdges" className="-mb-1">
            <rect x="7" y="10" width="2" height="6" fill="#3e6826" />
            <rect x="6" y="11" width="1" height="1" fill="#3e6826" />
            <rect x="9" y="12" width="1" height="2" fill="#3e6826" />
            <rect x="5" y="6" width="6" height="5" fill="#e01e1e" />
            <rect x="4" y="7" width="1" height="3" fill="#e01e1e" />
            <rect x="11" y="7" width="1" height="3" fill="#e01e1e" />
            <rect x="7" y="8" width="2" height="2" fill="#2d2d2d" />
          </svg>

          {/* 🌼 DANDELION */}
          <svg width="48" height="48" viewBox="0 0 16 16" shapeRendering="crispEdges" className="-mb-1">
            <rect x="7" y="10" width="2" height="6" fill="#3e6826" />
            <rect x="5" y="12" width="2" height="1" fill="#3e6826" />
            <rect x="6" y="6" width="4" height="4" fill="#ffeb3b" />
            <rect x="5" y="7" width="1" height="2" fill="#ffeb3b" />
            <rect x="10" y="7" width="1" height="2" fill="#ffeb3b" />
            <rect x="7" y="5" width="2" height="1" fill="#ffeb3b" />
          </svg>

          {/* 🌾 TALL GRASS */}
          <svg width="48" height="48" viewBox="0 0 16 16" shapeRendering="crispEdges" className="-mb-1 hidden sm:block">
            <rect x="8" y="6" width="1" height="10" fill="#3e6826" />
            <rect x="6" y="9" width="1" height="7" fill="#3e6826" />
            <rect x="10" y="10" width="1" height="6" fill="#3e6826" />
          </svg>

           {/* 🌹 ANOTHER POPPY */}
           <svg width="48" height="48" viewBox="0 0 16 16" shapeRendering="crispEdges" className="-mb-1 hidden sm:block">
            <rect x="7" y="10" width="2" height="6" fill="#3e6826" />
            <rect x="5" y="6" width="6" height="5" fill="#e01e1e" />
            <rect x="4" y="7" width="1" height="3" fill="#e01e1e" />
            <rect x="11" y="7" width="1" height="3" fill="#e01e1e" />
            <rect x="7" y="8" width="2" height="2" fill="#2d2d2d" />
          </svg>
        </div>

        {/* 🟩 The Grass Block Footer */}
        <div className="w-full h-24 bg-[#5d4037] border-t-16 border-[#5b8731] relative">
            <div className="absolute top-0 left-0 w-full h-4 overflow-hidden">
                <div className="w-full h-2 bg-[#5b8731]"></div>
                <div className="flex w-full">
                     <div className="w-full border-t-4 border-dashed border-[#5b8731] -mt-0.5 opacity-100"></div>
                </div>
            </div>
            
        </div>
      </div>
    </div>
  );
}