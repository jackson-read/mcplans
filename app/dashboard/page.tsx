export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
// We need to import the new actions here (even though we haven't added them to actions.ts yet!)
import { acceptInvite, declineInvite } from "@/app/actions"; 

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return <div>Access Denied</div>;

  // 1. Fetch ACCEPTED worlds (Active)
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
    <div className="min-h-screen bg-[#121212] text-white relative flex flex-col font-sans selection:bg-[#5b8731] selection:text-white">
      
      {/* 🌑 Background Noise */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* 🔝 Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex flex-col">
           <h1 className="text-3xl font-minecraft text-[#e0e0e0] tracking-wide">Dashboard</h1>
           <p className="text-zinc-500 text-sm">Select a world to start planning</p>
        </div>
        
        <div className="bg-zinc-800/50 rounded-full p-1 pl-4 pr-1 flex items-center gap-3 border border-zinc-700/50 backdrop-blur-md">
           <span className="text-xs text-zinc-400 font-minecraft hidden sm:block">LOGGED IN</span>
           <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }}}/>
        </div>
      </header>

      {/* 🌍 World Grid & Inbox */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pb-32 z-10 space-y-10">
        
        {/* 📬 THE INBOX (Pending Invites) */}
        {pendingInvites.length > 0 && (
          <section className="bg-zinc-900/50 border border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50"></div>
            <h2 className="text-yellow-500 font-minecraft text-xl mb-4 flex items-center gap-2">
              <span>📬</span> Pending Invites ({pendingInvites.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="bg-black/40 p-4 rounded-xl border border-zinc-700 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold">{invite.world.name}</h3>
                    <p className="text-xs text-zinc-500">You have been invited to join.</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={acceptInvite}>
                      <input type="hidden" name="memberId" value={invite.id} />
                      <button className="px-4 py-2 bg-[#5b8731] hover:bg-[#4a6e28] text-white text-xs font-bold rounded-lg transition-colors font-minecraft">
                        ACCEPT
                      </button>
                    </form>
                    <form action={declineInvite}>
                      <input type="hidden" name="memberId" value={invite.id} />
                      <button className="px-4 py-2 bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 text-xs font-bold rounded-lg transition-colors font-minecraft">
                        DECLINE
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeWorlds.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 border-2 border-dashed border-zinc-800 rounded-2xl">
              <p>No worlds found.</p>
              <p className="text-sm">Check your Hotbar below to create one!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWorlds.map((entry) => (
              <div key={entry.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-[#5b8731]/10">
                
                <div className="h-32 bg-linear-to-br from-zinc-800 to-zinc-900 relative p-6 flex flex-col justify-end">
                   <div className={`absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${entry.role === 'owner' ? 'bg-[#5b8731]/10 text-[#5b8731] border-[#5b8731]/20' : 'bg-zinc-700/30 text-zinc-400 border-zinc-700'}`}>
                      {entry.role}
                   </div>
                   
                   <h3 className="font-minecraft text-2xl text-white truncate drop-shadow-md">
                     {entry.world.name}
                   </h3>
                </div>

                <div className="p-4 flex gap-3 items-center bg-zinc-950/50">
                  <Link href={`/dashboard/world/${entry.world.id}`} className="flex-1">
                    <button className="w-full py-3 bg-[#5b8731] hover:bg-[#4a6e28] text-white font-minecraft border-b-4 border-[#3e6826] active:border-b-0 active:translate-y-1 rounded-lg transition-all text-center flex items-center justify-center gap-2">
                       <span>PLAY</span>
                       <span className="opacity-50">▶</span>
                    </button>
                  </Link>

                  {/* Only Owners get the Settings Gear */}
                  {entry.role === 'owner' && (
                     <Link href={`/dashboard/settings/${entry.world.id}`}>
                       <button className="h-13 w-13 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 rounded-lg transition-all" title="World Settings">
                         ⚙️
                       </button>
                     </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 📦 THE HOTBAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
         <div className="flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-2xl ring-1 ring-black/50">
            
            <Link href="/dashboard/new">
               <button className="flex items-center gap-3 px-6 py-3 bg-[#e0e0e0] hover:bg-white text-black font-minecraft rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg">
                  <span className="text-2xl leading-none font-bold">+</span>
                  <span className="text-lg">Create New World</span>
               </button>
            </Link>

         </div>
      </div>

    </div>
  );
}