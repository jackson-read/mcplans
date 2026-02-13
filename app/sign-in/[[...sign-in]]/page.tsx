import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#87CEEB] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* ☁️ Background Clouds (Parallax effect) */}
      <div className="absolute top-20 left-10 w-32 h-12 bg-white/40 blur-xl rounded-full"></div>
      <div className="absolute bottom-40 right-20 w-48 h-16 bg-white/30 blur-2xl rounded-full"></div>
      
      {/* 🚀 The "Flying Up" Container */}
      <div className="animate-float z-10">
        
        {/* The Floating Island Box */}
        <div className="bg-[#e0f7fa] p-2 border-4 border-white shadow-2xl rounded-xl relative">
          
          {/* Minecraft "Window" Header */}
          <div className="bg-[#8b8b8b] border-b-4 border-[#555555] p-2 mb-2 flex justify-between items-center">
            <span className="font-minecraft text-white drop-shadow-md ml-2">Server Connection</span>
            <Link href="/">
              <button className="w-6 h-6 bg-[#ff5555] border-2 border-white text-white font-bold leading-none flex items-center justify-center hover:bg-[#ff0000]">
                ×
              </button>
            </Link>
          </div>

          {/* Clerk Component */}
          <SignIn appearance={{
            elements: {
              card: "shadow-none bg-transparent",
              headerTitle: "font-minecraft text-2xl text-[#373737]",
              headerSubtitle: "font-minecraft text-[#555555]",
              formButtonPrimary: "font-minecraft bg-[#5b8731] hover:bg-[#4a6e28] border-b-4 border-[#3e6826] active:border-b-0 active:translate-y-1 transition-all",
              footerActionLink: "text-[#5b8731] font-bold hover:text-[#4a6e28]",
              formFieldInput: "font-minecraft border-2 border-[#8b8b8b] bg-[#ffffff]",
              socialButtonsBlockButton: "font-minecraft border-2 border-[#8b8b8b] hover:bg-[#f0f0f0]",
            }
          }} />
        </div>

        {/* 🏝️ Floating Island Dirt Bottom (Optional Detail) */}
        <div className="w-[90%] mx-auto h-4 bg-[#5d4037] border-b-4 border-[#3e2723] rounded-b-lg opacity-80"></div>
      </div>
      
    </div>
  );
}