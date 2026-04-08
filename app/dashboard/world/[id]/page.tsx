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
import BiomeDropdown from "@/components/BiomeDropdown";

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
      
      {/* USE THE LOCAL BACKGROUND COMPONENT */}
      <LocalBiomeBackground defaultBiome={world.biome || 'plains'} />

      {/* 🟩 FIXED HEADER (Robust Flex & Centering) */}
      <header className={`relative z-10 py-6 px-6 flex flex-row justify-between items-center gap-6 ${theme.cardBg} backdrop-blur-sm border-b-4 ${theme.border}`}>
        
        {/* 🟢 LEFT CONTAINER: Back button, Name, and Info text */}
        <div className="flex flex-col items-start gap-1 relative pl-8">
          {/* Back Arrow */}
          <Link href="/dashboard" className="absolute left-0 top-0 text-white hover:-translate-x-1 transition-transform p-1">
            &larr;
          </Link>

          <div>
            <h1 className={`text-4xl font-minecraft drop-shadow-md leading-none ${theme.text}`}>{world.name}</h1>
            
            <div className={`text-[10px] uppercase font-bold tracking-widest ${theme.text} opacity-80 flex items-center gap-2 mt-1`}>
                <span>Biome: {world.biome === 'ocean' ? 'Ocean' : (world.biome || "Plains")}</span>
                
                {/* 🛑 SETTINGS BUTTON */}
                <Link href={`/dashboard/settings/${worldId}?from=world`} className="hover:underline decoration-white cursor-pointer ml-2">
                  [Settings]
                </Link>
  
                {/* LEAVE BUTTON */}
                {member.role !== 'owner' && (
                  <form action={leaveWorld}>
                    <input type="hidden" name="worldId" value={worldId} />
                    <button className="hover:text-red-400 hover:underline decoration-red-400 cursor-pointer bg-transparent border-none p-0 ml-4">[Leave World]</button>
                  </form>
                )}
              </div>
          </div>
        </div>
        
        {/* 🟣 RIGHT CONTAINER: Heads & Invite Button */}
        <div className="flex flex-row items-center gap-4 h-full">
          <div className="flex -space-x-4 hover:-space-x-1 transition-all items-center">
             {world.members.map(m => {
               const user = userMap.get(m.userId);
               return (
                 <div key={m.id} className="relative group cursor-help">
                   <img src={user?.img} alt={user?.name} className={`w-12 h-12 rounded-md border-2 ${theme.border} bg-black shadow-md transition-transform hover:scale-110`} />
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 font-minecraft border border-white/10">
                     {user?.name} {m.role === 'owner' && '👑'}
                   </div>
                 </div>
               )
             })}
          </div>

          <Link href={`/dashboard/invite/${worldId}`}>
            <button className={`w-12 h-12 rounded-md border-2 border-dashed ${theme.border} text-white flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition-all text-2xl`}>+</button>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT: Widened layout, delegates grid to TaskArea */}
      <main className="relative z-10 max-w-7xl w-full mx-auto p-6">
        <TaskArea 
          tasks={worldTasks} 
          theme={theme} 
          userId={userId} 
          isOwner={member.role === 'owner'}
          userMap={userMap} 
          worldId={worldId}
        />
      </main>
    </div>
  );
}
