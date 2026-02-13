import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // 🧱 Base Button Style (The 3D Bevel Shape)
  const btnBase = "relative inline-flex items-center justify-center w-48 py-3 text-xl text-white border-2 border-b-4 active:border-b-2 active:translate-y-1 transition-all font-minecraft shadow-sm";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#87CEEB] text-white p-8 text-center font-sans relative overflow-hidden">
      
      {/* ☁️ Clouds (CSS shapes) */}
      <div className="absolute top-10 left-10 w-32 h-12 bg-white/80 opacity-80 rounded-none hidden md:block"></div>
      <div className="absolute top-24 right-20 w-48 h-16 bg-white/80 opacity-60 rounded-none hidden md:block"></div>

      <div className="relative z-10">
        {/* Title with Drop Shadow */}
        <h1 className="text-7xl font-minecraft mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
          MC <span className="text-[#5b8731] text-shadow-sm">PLANS</span>
        </h1>
        <p className="text-2xl text-white/90 max-w-lg mb-12 font-minecraft drop-shadow-md">
          Plan builds. Invite friends. Conquer.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          
          {/* 🪵 Sign In Button (Oak Wood) */}
          <Link href="/sign-in">
            <button className={`${btnBase} bg-[#a07449] border-t-[#bc986e] border-l-[#bc986e] border-r-[#5e3f22] border-b-[#422d1a] hover:bg-[#8f663d]`}>
              Sign In
            </button>
          </Link>

          {/* 🌿 Get Started Button (Grass Block) */}
          <Link href="/sign-up">
            <button className={`${btnBase} bg-[#5b8731] border-t-[#7ecb46] border-l-[#7ecb46] border-r-[#3e6826] border-b-[#2f4f1d] hover:bg-[#4a6e28]`}>
              Get Started
            </button>
          </Link>
        </div>
      </div>
      
      {/* 🌸 The Ground (Grass + Flowers) */}
      <div className="fixed bottom-0 w-full">
        {/* Flowers Layer (Sitting on top of the grass) */}
        <div className="flex justify-around items-end w-full px-10 mb-[-5px]">
          {/* Poppy (Red) */}
          <div className="w-4 h-4 bg-red-600 shadow-[4px_4px_0_rgba(0,0,0,0.2)] mb-4 animate-bounce duration-[3000ms]"></div>
          {/* Dandelion (Yellow) */}
          <div className="w-4 h-4 bg-yellow-400 shadow-[4px_4px_0_rgba(0,0,0,0.2)] mb-2"></div>
          {/* Tall Grass */}
          <div className="w-2 h-6 bg-[#4a6e28] mb-0 hidden sm:block"></div>
          {/* Another Poppy */}
          <div className="w-4 h-4 bg-red-600 shadow-[4px_4px_0_rgba(0,0,0,0.2)] mb-5 hidden sm:block"></div>
          {/* Tall Grass */}
          <div className="w-2 h-5 bg-[#4a6e28] mb-0"></div>
        </div>

        {/* The Dirt Block Footer */}
        <div className="w-full h-20 bg-[#5d4037] border-t-[12px] border-[#4caf50] relative z-20">
            <p className="text-center mt-6 text-[#8d6e63] font-minecraft text-sm opacity-50">
                Not affiliated with Mojang or Microsoft
            </p>
        </div>
      </div>
    </div>
  );
}