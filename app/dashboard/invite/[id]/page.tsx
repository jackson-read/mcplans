import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { sendInvite } from "@/app/actions";

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worldId = parseInt(id);
  const { userId } = await auth();

  if (!userId) redirect("/");

  // 1. Verify Owner
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
  });

  if (!world || world.ownerId !== userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* 🧱 BLOCKY BACKGROUND (Matches Settings Page) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundColor: "#0f0f0f",
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
           }}>
      </div>
      
      {/* 🔦 Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-0"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <Link href={`/dashboard/settings/${worldId}`} className="text-zinc-500 hover:text-white text-sm mb-6 inline-flex items-center gap-2 font-minecraft group transition-colors">
          <span className="group-hover:-translate-x-1 transition-transform">&lt;</span> Back to Settings
        </Link>

        {/* ✉️ THE GOLDEN INVITE CARD */}
        <div className="bg-[#1a1205] border-4 border-[#ffd700] p-8 shadow-[0_0_40px_rgba(255,215,0,0.1)] relative">
          
          {/* Decorative Corner Pixels */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#ffd700]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#ffd700]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#ffd700]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#ffd700]"></div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-minecraft text-[#ffd700] mb-2 drop-shadow-[2px_2px_0_#000]">Invite a Friend</h1>
            <p className="text-[#aa8800] text-sm font-minecraft">to join <span className="text-white border-b border-[#aa8800]">"{world.name}"</span></p>
          </div>

          <form action={sendInvite} className="space-y-6">
            <input type="hidden" name="worldId" value={worldId} />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#ccaa00] font-minecraft uppercase tracking-wider ml-1">
                Friend's Username
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-[#ffd700] blur opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
                <input 
                  name="username"
                  type="text" 
                  placeholder="Steve"
                  required
                  autoComplete="off"
                  className="w-full relative bg-[#0a0a0a] border-4 border-[#554400] p-4 text-white placeholder:text-[#443300] focus:outline-none focus:border-[#ffd700] transition-colors font-minecraft text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#554400]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              </div>
              <p className="text-[10px] text-[#665500] font-minecraft ml-1">
                * Must match their exact Clerk username
              </p>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#5b8731] hover:bg-[#6da13b] text-white font-minecraft font-bold py-4 border-b-4 border-[#3e6826] active:border-b-0 active:translate-y-1 active:mt-1 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>SEND INVITE</span>
              <span className="group-hover:translate-x-1 transition-transform">🚀</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}