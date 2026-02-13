export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) return <div>Access Denied</div>;

  // Fetch Worlds
  const [myWorlds] = await Promise.all([
    db.query.members.findMany({
      where: and(eq(members.userId, userId), eq(members.status, "accepted")),
      with: { world: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#121212] text-white relative flex flex-col font-sans selection:bg-[#5b8731] selection:text-white">
      
      {/* 🌑 Background Pattern (Subtle Noise) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* 🔝 Header */}
      <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center z-10">
        <div className="flex flex-col">
           <h1 className="text-3xl font-minecraft text-[#e0e0e0] tracking-wide">
             Dashboard
           </h1>
           <p className="text-zinc-500 text-sm">Select a world to start planning</p>
        </div>
        
        {/* User Profile (Styled cleaner) */}
        <div className="bg-zinc-800/50 rounded-full p-1 pl-4 pr-1 flex items-center gap-3 border border-zinc-700/50 backdrop-blur-md">
           <span className="text-xs text-zinc-400 font-minecraft hidden sm:block">LOGGED IN</span>
           <UserButton afterSignOutUrl="/" appearance={{
             elements: {
               userButtonAvatarBox: "w-8 h-8"
             }
           }}/>
        </div>
      </header>

      {/* 🌍 World Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pb-32 z-10">
        {myWorlds.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 border-2 border-dashed border-zinc-800 rounded-2xl">
              <p>No worlds found.</p>
              <p className="text-sm">Check your Hotbar below to create one!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myWorlds.map((entry) => (
              <div key={entry.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-[#5b8731]/10">
                
                {/* Card Header / Image Placeholder */}
                <div className="h-32 bg-linear-to-br from-zinc-800 to-zinc-900 relative p-6 flex flex-col justify-end">
                   {/* Role Badge */}
                   <div className={`absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${
                      entry.role === 'owner' 
                      ? 'bg-[#5b8731]/10 text-[#5b8731] border-[#5b8731]/20' 
                      : 'bg-zinc-700/30 text-zinc-400 border-zinc-700'
                   }`}>
                      {entry.role}
                   </div>
                   
                   {/* World Name */}
                   <h3 className="font-minecraft text-2xl text-white truncate drop-shadow-md">
                     {entry.world.name}
                   </h3>
                </div>

                {/* Card Actions */}
                <div className="p-4 flex gap-3 items-center bg-zinc-950/50">
                  {/* PLAY Button (Dominant) */}
                  <Link href={`/dashboard/world/${entry.world.id}`} className="flex-1">
                    <button className="w-full py-3 bg-[#5b8731] hover:bg-[#4a6e28] text-white font-minecraft border-b-4 border-[#3e6826] active:border-b-0 active:translate-y-1 rounded-lg transition-all text-center flex items-center justify-center gap-2">
                       <span>PLAY</span>
                       <span className="opacity-50">▶</span>
                    </button>
                  </Link>

                  {/* EDIT Button (Owner Only) */}
                  {entry.role === 'owner' ? (
                     <Link href={`/dashboard/settings/${entry.world.id}`}>
                       <button className="h-13 w-13 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 rounded-lg transition-all" title="World Settings">
                         {/* Gear Icon SVG */}
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                         </svg>
                       </button>
                     </Link>
                  ) : (
                    // Placeholder for non-owners (maybe 'Leave' button later)
                    <div className="w-13"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 📦 THE HOTBAR (Floating Footer) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
         <div className="flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-2xl ring-1 ring-black/50">
            
            {/* Create New World Button */}
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