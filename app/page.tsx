import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // 🧱 The Minecraft Button Styles defined as a string
  const btnClass = "relative inline-flex items-center justify-center w-48 py-3 text-xl text-white bg-mc-stone border-2 border-b-4 border-t-[#d0d1d4] border-l-[#d0d1d4] border-r-[#3a3a3a] border-b-[#282828] active:border-b-2 active:translate-y-1 transition-all hover:bg-[#8a8a8a] font-minecraft shadow-sm";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-8 text-center font-sans relative overflow-hidden">
      {/* Background Pattern (Optional) */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="relative z-10">
        <h1 className="text-6xl font-minecraft mb-6 drop-shadow-md">
          MC <span className="text-[#5b8731]">PLANS</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-lg mb-10 font-minecraft">
          The ultimate tool for planning your Minecraft empire. 
          Track builds, invite friends, and conquer the server.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/sign-in">
            {/* Standard Button */}
            <button className={btnClass}>
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            {/* Green 'Get Started' Button */}
            <button className={`${btnClass} bg-[#5b8731] border-t-[#7ecb46] border-l-[#7ecb46] border-r-[#3e6826] border-b-[#2f4f1d] hover:bg-[#4a6e28]`}>
              Get Started
            </button>
          </Link>
        </div>
      </div>
      
      {/* Decorative 'Dirt Block' Footer */}
      <div className="fixed bottom-0 w-full h-16 bg-[#5d4037] border-t-8 border-[#4caf50]"></div>
    </div>
  );
}