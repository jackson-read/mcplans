export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { acceptInvite, declineInvite } from "@/app/actions";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return <div>Access Denied</div>;

  // 1. Fetch ACCEPTED worlds
  const activeWorlds = await db.query.members.findMany({
    where: and(eq(members.userId, userId), eq(members.status, "accepted")),
    with: { world: true },
  });

  // 2. Fetch PENDING invites (Inbox)
  const pendingInvites = await db.query.members.findMany({
    where: and(eq(members.userId, userId), eq(members.status, "pending")),
    with: { world: true },
  });

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white relative flex flex-col font-sans selection:bg-[#ff8c00] selection:text-black overflow-x-hidden">
      
      {/* 🌑 CAVE TEXTURE (Deepslate Noise) */}
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* 🌋 LAVA GLOW (Bottom Gradient) */}
      <div className="fixed bottom-0 left-0 w-full h-[50vh] bg-linear-to-t from-[#cf5b13]/20 to-transparent pointer-events-none z-0"></div>
      
      {/* 🔦 TORCH LIGHT (Top Vignette) */}
      <div className="fixed top-0 left-0 w-full h-[30vh] bg-linear-to-b from-black/80 to-transparent pointer-events-none z-0"></div>

      {/* 🔝 HEADER */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10 relative">
        <div className="flex flex-col">
           <h1 className="text-4xl font-minecraft text-[#aaaaaa] drop-shadow-md tracking-wide">
             <span className="text-[#6a6a6a]">/</span>dashboard
           </h1>
           <p className="text-zinc-500 text-sm font-minecraft mt-1">
             Coords: <span className="text-[#5b8731]">~ ~ ~</span>
           </p>
        </div>
        
        {/* User Badge (Bedrock Style) */}
        <div className="bg-[#1a1a1a] border-2 border-[#2a2a2a] shadow-[4px_4px_0px_0px_#000] rounded-none p-1 pl-4 pr-1 flex items-center gap-3">
           <span className="text-xs text-zinc-400 font-minecraft hidden sm:block uppercase tracking-widest">Steve</span>
           <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-none border border-zinc-600" }}}/>
        </div>
      </header>

      {/* 🌍 MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pb-40 z-10 space-y-12">
        
        {/* 📬 INBOX (Gold Vein Style) */}
        {pendingInvites.length > 0 && (
          <section className="bg-[#1e1a10] border-2 border-[#ffd700]/30 p-6 relative overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#ffd700] to-transparent opacity-50"></div>
            
            <h2 className="text-[#ffd700] font-minecraft text-xl mb-4 flex items-center gap-3">
              <span className="animate-bounce">💎</span> Pending Invites ({pendingInvites.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="bg-black/40 p-4 border border-[#ffd700]/20 flex justify-between items-center group hover:bg-[#ffd700]/10 transition-colors">
                  <div>
                    <h3 className="text-white font-minecraft text-lg">{invite.world.name}</h3>
                    <p className="text-xs text-[#ffd700]/70 font-mono">Invite from User...</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={acceptInvite}>
                      <input type="hidden" name="memberId" value={invite.id} />
                      <button className="px-4 py-2 bg-[#5b8731] hover:bg-[#4a6e28] text-white border-b-4 border-[#3e6826] active:border-b-0 active:translate-y-1 text-xs font-bold transition-all font-minecraft">
                        ACCEPT
                      </button>
                    </form>
                    <form action={declineInvite}>
                      <input type="hidden" name="memberId" value={invite.id} />
                      <button className="px-4 py-2 bg-[#aa0000] hover:bg-[#880000] text-white border-b-4 border-[#660000] active:border-b-0 active:translate-y-1 text-xs font-bold transition-all font-minecraft">
                        DENY
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ⛏️ WORLD GRID */}
        {activeWorlds.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-4 border-4 border-dashed border-[#1a1a1a] bg-[#0a0a0a]/50 rounded-lg">
              <p className="font-minecraft text-xl">No worlds found.</p>
              <p className="text-sm font-mono text-zinc-700">Start digging below...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeWorlds.map((entry) => {
              // 💎 Dynamic Styling based on Role
              const isOwner = entry.role === 'owner';
              const accentColor = isOwner ? "border-[#00e1ff]" : "border-[#a1a1a1]"; // Diamond vs Iron
              const glowColor = isOwner ? "shadow-[0_0_15px_rgba(0,225,255,0.15)]" : "shadow-[0_0_10px_rgba(255,255,255,0.05)]";
              const labelColor = isOwner ? "text-[#00e1ff] bg-[#00e1ff]/10" : "text-zinc-400 bg-zinc-800";

              return (
                <div key={entry.id} className={`group relative bg-[#151515] border-2 ${accentColor} ${glowColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                  
                  {/* Ore Texture (CSS Pattern) */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: '16px 16px' }}></div>

                  {/* Card Content */}
                  <div className="h-32 bg-linear-to-br from-[#1a1a1a] to-[#0f0f0f] relative p-6 flex flex-col justify-end border-b-2 border-[#222]">
                     <div className={`absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-1 font-minecraft border ${labelColor}`}>
                        {isOwner ? 'OP' : 'Member'}
                     </div>
                     
                     <h3 className="font-minecraft text-2xl text-white truncate drop-shadow-md z-10 group-hover:scale-[1.02] transition-transform origin-left">
                       {entry.world.name}
                     </h3>
                     {/* "Ore" specs on hover */}
                     {isOwner && <div className="absolute top-2 left-2 w-1 h-1 bg-[#00e1ff] shadow-[0_0_5px_#00e1ff] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}
                     {isOwner && <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-[#00e1ff] shadow-[0_0_8px_#00e1ff] opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-75"></div>}
                  </div>

                  {/* Actions */}
                  <div className="p-4 flex gap-3 items-center bg-[#0a0a0a]">
                    <Link href={`/dashboard/world/${entry.world.id}`} className="flex-1">
                      <button className="w-full py-3 bg-[#333] hover:bg-[#444] text-white font-minecraft border-b-4 border-[#111] active:border-b-0 active:translate-y-1 transition-all text-center flex items-center justify-center gap-2 group-hover:bg-[#5b8731] group-hover:border-[#3e6826]">
                         <span className="text-sm">ENTER WORLD</span>
                      </button>
                    </Link>

                    {/* Only Owners get the Settings Gear */}
                    {isOwner && (
                       <Link href={`/dashboard/settings/${entry.world.id}`}>
                         <button className="h-12 w-12 flex items-center justify-center bg-[#222] hover:bg-[#333] text-zinc-500 hover:text-white border-b-4 border-[#111] active:border-b-0 active:translate-y-1 transition-all" title="World Settings">
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

      {/* 📦 OBSIDIAN HOTBAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
         <div className="flex items-center justify-center gap-2 p-3 bg-[#120c18] border-4 border-[#2b204a] shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative">
            {/* Obsidian Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236a4c9c' fill-opacity='0.4'%3E%3Cpath d='M0 0h20L0 20z'/%3E%3C/g%3E%3C/svg%3E")` }}></div>
            
            <Link href="/dashboard/new" className="relative z-10 w-full">
               <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5b8731] hover:bg-[#6da13b] text-white font-minecraft border-b-4 border-[#2f4f13] active:border-b-0 active:translate-y-1 active:mt-1 transition-all shadow-lg group">
                  <span className="text-2xl leading-none drop-shadow-md group-hover:rotate-90 transition-transform duration-300">+</span>
                  <span className="text-lg drop-shadow-md tracking-wide">CREATE NEW WORLD</span>
               </button>
            </Link>

         </div>
      </div>

    </div>
  );
}