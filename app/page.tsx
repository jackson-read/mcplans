import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  // 🚦 TRAFFIC COP LOGIC 🚦
  // If the user is logged in, send them straight to the real dashboard!
  if (userId) {
    redirect("/dashboard");
  }

  // If they are NOT logged in, show the Landing Page
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-8 text-center font-sans">
      <h1 className="text-6xl font-black tracking-tighter mb-6">
        MC <span className="text-green-500">PLANS</span>
      </h1>
      <p className="text-xl text-zinc-400 max-w-lg mb-10">
        The ultimate tool for planning your Minecraft empire. 
        Track builds, invite friends, and conquer the server
      </p>
      
      <div className="flex gap-4">
        <Link href="/sign-in">
          <button className="mc-btn w-48">
            Sign In
          </button>
        </Link>
        <Link href="/sign-up">
          <button className="mc-btn mc-btn-green w-48">
            Get Started
          </button>
        </Link>
      </div>
      
      {/* Decorative 'Dirt Block' Footer */}
      <div className="fixed bottom-0 w-full h-16 bg-[#5d4037] border-t-8 border-[#4caf50]"></div>
    </div>
  );
}