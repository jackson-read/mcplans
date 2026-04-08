import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, tasks } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import Link from "next/link";
import { createTask, toggleTask, deleteTask, updateTaskNote, leaveWorld } from "@/app/actions";
import SpinWheel from "@/components/SpinWheel";
import TaskArea from "@/components/TaskArea";
import LocalBiomeBackground from "@/components/LocalBiomeBackground";

const getTheme = (biome: string) => {
  const defaults = { cardBg: "bg-black/40", border: "border-white/20", text: "text-white", accent: "bg-white/20" };
  switch (biome) {
    case 'nether': return { ...defaults, cardBg: "bg-[#1a0505]/90", border: "border-[#500]", text: "text-[#ffaaaa]", accent: "bg-[#300]" };
    case 'end': return { ...defaults, cardBg: "bg-[#0d0917]/90", border: "border-[#554477]", text: "text-[#d8b4e2]", accent: "bg-[#2b204a]" };
    case 'ocean': return { ...defaults, cardBg: "bg-[#051a24]/90", border: "border-[#4b8b8b]", text: "text-[#aaffff]", accent: "bg-[#2d5d5d]" };
    case 'cherry': return { ...defaults, cardBg: "bg-[#4a2433]/90", border: "border-[#eb6eb0]", text: "text-[#ffeef5]", accent: "bg-[#a83e72]" };
    case 'spruce': return { ...defaults, cardBg: "bg-[#261a12]/90", border: "border-[#5c4033]", text: "text-[#aacc88]", accent: "bg-[#3b2a1e]" };
    case 'cave': return { ...defaults, cardBg: "bg-[#1a2611]/90", border: "border-[#7d8c4d]", text: "text-[#d6ff99]", accent: "bg-[#475c2e]" };
    case 'plains': default: return { ...defaults, cardBg: "bg-[#1a2115]/90", border: "border-[#3e6826]", text: "text-[#ffffff]", accent: "bg-[#5b8731]" };
  }
};



export default async function WorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worldId = parseInt(id);
  const { userId } = await auth();

  if (!userId) redirect("/");

  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  if (!world) redirect("/dashboard");
  const member = world.members.find((m) => m.userId === userId);
  if (!member) redirect("/dashboard");

  const worldTasks = await db.query.tasks.findMany({
    where: eq(tasks.worldId, worldId),
    orderBy: [asc(tasks.position), asc(tasks.createdAt)],
  });

  const client = await clerkClient();
  const memberIds = world.members.map(m => m.userId);
  let userMap = new Map<string, any>();
  try {
    const clerkUsers = await client.users.getUserList({ userId: memberIds, limit: 100 });
    clerkUsers.data.forEach(u => userMap.set(u.id, { name: u.username || u.firstName || "Miner", img: u.imageUrl }));
  } catch (e) { console.error(e); }

  const theme = getTheme(world.biome || 'plains');

return (
    <div className="min-h-screen font-sans relative overflow-x-hidden selection:bg-white/20">
      
      {/* 1. USE THE NEW LOCAL BACKGROUND COMPONENT */}
      <LocalBiomeBackground defaultBiome={world.biome || 'plains'} />

      {/* HEADER */}
      <header className={`relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-4 ${theme.cardBg} backdrop-blur-sm border-b-4 ${theme.border}`}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white hover:-translate-x-1 transition-transform">&larr;</Link>
          <div>
            <h1 className={`text-3xl font-minecraft drop-shadow-md ${theme.text}`}>{world.name}</h1>
            <div className={`text-[10px] uppercase font-bold tracking-widest ${theme.text} opacity-80 flex items-center gap-2`}>
            <span>Biome: {world.biome === 'ocean' ? 'Ocean' : (world.biome || "Plains")}</span>
              
              {/* 2. ADD THE LOCAL OVERRIDE DROPDOWN HERE */}
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    localStorage.setItem('localBiomeOverride', e.target.value);
                  } else {
                    localStorage.removeItem('localBiomeOverride');
                  }
                  window.location.reload();
                }}
                className="bg-black/50 text-white font-minecraft text-[10px] p-1 ml-2 border border-white/20 cursor-pointer focus:outline-none"
              >
                <option value="">[Local Theme]</option>
                <option value="plains">Plains</option>
                <option value="cherry">Cherry</option>
                <option value="ocean">Ocean</option>
                <option value="spruce">Spruce</option>
                <option value="cave">Lush Cave</option>
                <option value="nether">Nether</option>
                <option value="end">The End</option>
              </select>

              {/* 🛑 LEAVE / SETTINGS LOGIC */}
              {member.role === 'owner' ? (
              <Link href={`/dashboard/settings/${worldId}?from=world`} className="hover:underline decoration-white cursor-pointer ml-2">[Settings]</Link>
              ) : (
                <form action={leaveWorld}>
                  <input type="hidden" name="worldId" value={worldId} />
                  <button className="hover:text-red-400 hover:underline decoration-red-400 cursor-pointer bg-transparent border-none p-0 ml-4">[Leave World]</button>
                </form>
              )}
            </div>
          </div>
        </div>
        
        {/* Heads */}
        <div className="flex -space-x-3 hover:space-x-1 transition-all">
           {world.members.map(m => {
             const user = userMap.get(m.userId);
             return (
               <div key={m.id} className="relative group cursor-help">
                 <img src={user?.img} alt={user?.name} className={`w-10 h-10 rounded-md border-2 ${theme.border} bg-black shadow-md transition-transform hover:scale-110`} />
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 font-minecraft border border-white/10">
                   {user?.name} {m.role === 'owner' && '👑'}
                 </div>
               </div>
             )
           })}
           <Link href={`/dashboard/invite/${worldId}`}>
             <button className={`w-10 h-10 rounded-md border-2 border-dashed ${theme.border} text-white flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition-all text-xl`}>+</button>
           </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COL: Wheel */}
        <div className="md:col-span-1">
           <SpinWheel tasks={worldTasks} theme={theme} />
        </div>

        {/* RIGHT COL: Tasks */}
        <div className="md:col-span-2 space-y-6">
           <div className={`${theme.cardBg} border-4 ${theme.border} p-4 shadow-xl backdrop-blur-sm`}>
              <form action={createTask} className="flex gap-2">
                 <input type="hidden" name="worldId" value={worldId} />
                 <input name="description" required placeholder="Add a new task..." className={`flex-1 bg-black/20 border-2 ${theme.border} ${theme.text} rounded p-3 focus:outline-none focus:bg-black/40 transition-colors placeholder:text-white/30`} />
                 <button className={`${theme.accent} ${theme.text} px-6 font-bold font-minecraft border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all`}>ADD</button>
              </form>
           </div>

           <TaskArea 
              tasks={worldTasks} 
              theme={theme} 
              userId={userId} 
              isOwner={member.role === 'owner'}
              userMap={userMap} 
           />
        </div>
      </main>
    </div>
  );
}
