import { createPlan } from "@/app/actions";
import Link from "next/link";

export default function NewWorldPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* 🌑 Subtle Background Noise */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="w-full max-w-md z-10">
        
        {/* 🔙 Back Button */}
        <Link href="/dashboard" className="text-zinc-500 hover:text-white text-sm mb-6 inline-flex items-center gap-2 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Cancel and go back
        </Link>

        {/* 📝 The Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Green Glow at top */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#5b8731] to-transparent opacity-50"></div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-minecraft text-white mb-2 tracking-tight">New World</h1>
            <p className="text-zinc-500 text-sm">Start a fresh project. Your journey begins here.</p>
          </div>

          <form action={createPlan} className="space-y-6">
            
            {/* 1. World Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                World Name
              </label>
              <input 
                name="name"
                id="name"
                type="text" 
                placeholder="e.g. Amazingness"
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#5b8731] focus:ring-1 focus:ring-[#5b8731] transition-all font-minecraft"
              />
            </div>

            {/* 2. Invite Friend (From your original code!) */}
            <div className="space-y-2">
              <label htmlFor="inviteUsername" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Invite a Friend <span className="opacity-40 text-[10px]">(Optional)</span>
              </label>
              <input 
                name="inviteUsername"
                id="inviteUsername"
                type="text" 
                placeholder="Enter their username..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#5b8731] focus:ring-1 focus:ring-[#5b8731] transition-all font-minecraft"
              />
              <p className="text-[10px] text-zinc-600 ml-1">You can manage members later in world settings.</p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-[#5b8731] hover:bg-[#4a6e28] text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#5b8731]/20 font-minecraft text-lg flex items-center justify-center gap-3 group"
            >
              <span>Create World</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">🚀</span>
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}