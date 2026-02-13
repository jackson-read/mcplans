export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { acceptInvite, declineInvite } from "@/app/actions";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) return <div>Access Denied</div>;

  const username = user?.username || user?.firstName || "Miner";

  // Fetch Worlds & Invites
  const activeWorlds = await db.query.members.findMany({
    where: and(eq(members.userId, userId), eq(members.status, "accepted")),
    with: { world: true },
  });

  const pendingInvites = await db.query.members.findMany({
    where: and(eq(members.userId, userId), eq(members.status, "pending")),
    with: { world: true },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative flex flex-col font-sans selection:bg-[#ff8c00] selection:text-black overflow-x-hidden pb-32">
      
      {/* 🏔️ CAVE BACKGROUND (Simulated Ores & Stone Noise) */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ 
             backgroundColor: "#0f0f0f",
             backgroundImage: `
                /* Noise Filter for Stone Texture */
                url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E"),
                /* Diamond Ore (Cyan spots) */
                radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.5) 0%, transparent 5px),
                radial-gradient(circle at 80% 10%, rgba(0, 255, 255, 0.5) 0%, transparent 5px),
                /* Emerald Ore (Green spots) */
                radial-gradient(circle at 10% 80%, rgba(0, 255, 0, 0.5) 0%, transparent 6px),
                radial-gradient(circle at 70% 60%, rgba(0, 255, 0, 0.5) 0%, transparent 5px),
                /* Redstone Ore (Red spots - subtle glow) */
                radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.4) 0%, transparent 8px),
                radial-gradient(circle at 90% 90%, rgba(255, 0, 0, 0.4) 0%, transparent 6px),
                /* Iron Ore (Tan/Orange spots) */
                radial-gradient(circle at 30% 20%, rgba(210, 180, 140, 0.6) 0%, transparent 5px),
                radial-gradient(circle at 60% 85%, rgba(210, 180, 140, 0.6) 0%, transparent 5px)
             `,
             backgroundSize: "auto, 300px 300px, 450px 450px, 350px 350px, 500px 500px" // Repeat patterns differently so it doesn't look like a grid
           }}>
      </div>

      {/* 🌋 LAVA POOL (Bottom Bar - Kept as requested) */}
      <div className="fixed bottom-0 left-0 w-full h-16 bg-[#cf5b13] border-t-4 border-[#ad3f0b] z-40 shadow-[0_-10px_60px_rgba(207,91,19,0.6)] flex items-center justify-center overflow-hidden">
         <div className="absolute top-2 left-10 w-8 h-2 bg-[#ffaa00] opacity-50 rounded-full animate-pulse"></div>
         <div className="absolute top-4 right-20 w-4 h-4 bg-[#ffaa00] opacity-50 rounded-full animate-bounce"></div>
      </div>
      
      {/* 🔦 DARK VIGNETTE */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-0"></div>

      {/* 🔝 HEADER */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10 relative">
        <div className="flex flex-col">
           <h1 className="text-4xl font-minecraft text-[#aaaaaa] drop-shadow-[4px_4px_0_#000]">
             <span className="text-[#555]">Dashboard</span>
           </h1>
        </div>
        
        {/* User Badge */}
        <div className="bg-[#222] border-2 border-[#444] shadow-[4px_4px_0px_0px_#000] p-2 pl-4 flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <span className="block text-xs text-[#888] font-minecraft uppercase tracking-widest">Player</span>
              <span className="block text-sm text-white font-bold font-minecraft">{username}</span>
           </div>
           <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 rounded-none border-2 border-[#444]" }}}/>
        </div>
      </header>

      {/* 🌍 MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 z-10 space-y-12">
        
        {/* 📬 INBOX */}
        {pendingInvites.length > 0 && (
          <section className="bg-[#2a2210] border-4 border-[#ffd700] p-6 shadow-[8px_8px_0_#000] relative">
            <h2 className="text-[#ffd700] font-minecraft text-xl mb-4 flex items-center gap-3">
              <span>✉️</span> Pending Invites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="bg-black/40 p-4 border-2 border-[#ffd700]/50 flex justify-between items-center">
                  <h3 className="text-white font-minecraft">{invite.world.name}</h3>
                  <div className="flex gap-2">
                    <form action={acceptInvite}>
                      <input type="hidden" name="memberId" value={invite.id} />
                      <button className="px-3 py-2 bg-[#5b8731] hover:bg-[#6da13b] text-white border-b-4 border-[#3e6826] active:border-b-0 active:translate-y-1 font-minecraft text-xs">ACCEPT</button>
                    </form>
                    <form action={declineInvite}>
                      <input type="hidden" name="memberId" value={invite.id} />
                      <button className="px-3 py-2 bg-[#aa0000] hover:bg-[#cc0000] text-white border-b-4 border-[#660000] active:border-b-0 active:translate-y-1 font-minecraft text-xs">DENY</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⛏️ WORLD GRID */}
        {activeWorlds.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-4 border-4 border-dashed border-[#333] bg-black/30 rounded-lg">
              <p className="font-minecraft text-xl text-[#555]">No worlds yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeWorlds.map((entry) => {
              const isOwner = entry.role === 'owner';
              
              // Theme: Diamond (Owner) vs Iron (Member)
              const theme = isOwner 
                ? {
                    border: "border-[#00aaaa]", 
                    bg: "bg-[#00aaaa]/10", 
                    text: "text-[#00aaaa]",
                    btnBg: "bg-[#00aaaa]",
                    btnHover: "hover:bg-[#00cccc]",
                    btnBorder: "border-[#007777]"
                  }
                : {
                    border: "border-[#888888]", 
                    bg: "bg-[#888888]/10", 
                    text: "text-[#cccccc]",
                    btnBg: "bg-[#555555]",
                    btnHover: "hover:bg-[#666666]",
                    btnBorder: "border-[#333333]"
                  };

              return (
                <div key={entry.id} className={`group relative bg-[#111] border-4 ${theme.border} shadow-[8px_8px_0_#000] transition-transform hover:-translate-y-1`}>
                  {/* Card Header */}
                  <div className={`h-32 ${theme.bg} relative p-6 flex flex-col items-center justify-center border-b-4 ${theme.border}`}>
                     <div className={`absolute top-0 left-0 px-2 py-1 text-[10px] font-bold font-minecraft uppercase bg-black ${theme.text}`}>
                        {isOwner ? 'OP' : 'Member'}
                     </div>
                     <h3 className={`font-minecraft text-2xl ${theme.text} text-center drop-shadow-md`}>
                       {entry.world.name}
                     </h3>
                  </div>
                  {/* Actions */}
                  <div className="p-4 flex gap-3 items-center bg-[#0a0a0a]">
                    <Link href={`/dashboard/world/${entry.world.id}`} className="flex-1">
                      <button className={`w-full py-3 ${theme.btnBg} ${theme.btnHover} text-white font-minecraft border-b-4 ${theme.btnBorder} active:border-b-0 active:translate-y-1 transition-all text-center flex items-center justify-center gap-2`}>
                         <span className="text-sm font-bold shadow-sm">ENTER WORLD</span>
                      </button>
                    </Link>
                    {isOwner && (
                       <Link href={`/dashboard/settings/${entry.world.id}`}>
                         <button className="h-12 w-12 flex items-center justify-center bg-[#222] hover:bg-[#333] text-[#00aaaa] border-b-4 border-[#111] active:border-b-0 active:translate-y-1 transition-all" title="Settings">
                           ⚙️
                         </button>
                       </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 🔮 OBSIDIAN HOTBAR (Kept as requested) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
         <div className="flex items-center justify-center p-2 bg-[#0a0710] border-4 border-[#3c2a6b] shadow-[0_0_20px_#3c2a6b] relative">
            <Link href="/dashboard/new" className="relative z-10 w-full">
               <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1a122e] hover:bg-[#281b45] text-[#bda3ff] font-minecraft border-b-4 border-[#0d0917] active:border-b-0 active:translate-y-1 active:mt-1 transition-all group">
                  <span className="text-2xl leading-none group-hover:rotate-90 transition-transform duration-300">+</span>
                  <span className="text-lg tracking-wide">CREATE NEW WORLD</span>
               </button>
            </Link>
         </div>
      </div>

    </div>
  );
}