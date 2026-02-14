import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { createTask, toggleTask, deleteTask, updateTaskNote } from "@/app/actions";

// 🎨 BIOME THEME ENGINE
const getTheme = (biome: string) => {
  switch (biome) {
    case 'nether': return {
      bg: "bg-[#2a0505]", pattern: "radial-gradient(circle, #500 10%, transparent 10%)",
      text: "text-[#ffaaaa]", accent: "bg-[#852323]", border: "border-[#500]",
      cardBg: "bg-[#4d1616]", noteBg: "bg-[#2a0505]"
    };
    case 'end': return {
      bg: "bg-[#0d0917]", pattern: "radial-gradient(circle, #2b204a 1px, transparent 1px)",
      text: "text-[#e0d8ff]", accent: "bg-[#2b204a]", border: "border-[#554477]",
      cardBg: "bg-[#1a1429]", noteBg: "bg-[#0a0812]"
    };
    case 'ocean': return {
      bg: "bg-[#051a24]", pattern: "repeating-linear-gradient(45deg, #092b3b 0, #092b3b 1px, transparent 0, transparent 50%)",
      text: "text-[#aaffff]", accent: "bg-[#2d5d5d]", border: "border-[#4b8b8b]",
      cardBg: "bg-[#0b2b36]", noteBg: "bg-[#04121a]"
    };
    case 'cherry': return {
      bg: "bg-[#2e1a20]", pattern: "radial-gradient(circle, #eb6eb0 20%, transparent 20%)",
      text: "text-[#ffdbe8]", accent: "bg-[#a83e72]", border: "border-[#eb6eb0]",
      cardBg: "bg-[#4a2433]", noteBg: "bg-[#26151a]"
    };
    case 'spruce': return {
      bg: "bg-[#1a120b]", pattern: "linear-gradient(to right, #2b1e16 1px, transparent 1px), linear-gradient(to bottom, #2b1e16 1px, transparent 1px)",
      text: "text-[#aacc88]", accent: "bg-[#3b2a1e]", border: "border-[#5c4033]",
      cardBg: "bg-[#261a12]", noteBg: "bg-[#0d0906]"
    };
    case 'cave': return {
      bg: "bg-[#050a03]", pattern: "radial-gradient(circle at top left, #2f451b, transparent 40%)",
      text: "text-[#d6ff99]", accent: "bg-[#475c2e]", border: "border-[#7d8c4d]",
      cardBg: "bg-[#1a2611]", noteBg: "bg-[#080f04]"
    };
    case 'plains': default: return {
      bg: "bg-[#1a2115]", pattern: "linear-gradient(335deg, rgba(255,255,255,0.03) 23px, transparent 23px)",
      text: "text-[#ffffff]", accent: "bg-[#5b8731]", border: "border-[#3e6826]",
      cardBg: "bg-[#2a3622]", noteBg: "bg-[#11160e]"
    };
  }
};

export default async function WorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worldId = parseInt(id);
  const { userId } = await auth();

  if (!userId) redirect("/");

  // 1. Fetch World & Tasks
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  if (!world) redirect("/dashboard");

  // Verify Membership
  const member = world.members.find((m) => m.userId === userId);
  if (!member) redirect("/dashboard");

  const worldTasks = await db.query.tasks.findMany({
    where: eq(tasks.worldId, worldId),
    orderBy: [desc(tasks.createdAt)],
  });

  // 2. Fetch Usernames for the "Player Head" Header
  const client = await clerkClient();
  const memberIds = world.members.map(m => m.userId);
  let userMap = new Map<string, any>();
  
  try {
    const clerkUsers = await client.users.getUserList({ userId: memberIds, limit: 100 });
    clerkUsers.data.forEach(u => {
      userMap.set(u.id, {
        name: u.username || u.firstName || "Miner",
        img: u.imageUrl
      });
    });
  } catch (e) {
    console.error("Fetch users error", e);
  }

  // 3. Apply Theme
  const theme = getTheme(world.biome || 'plains');

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans relative overflow-x-hidden selection:bg-white/20`}>
      
      {/* 🎨 Dynamic Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: theme.pattern, backgroundSize: "40px 40px" }}>
      </div>
      <div className="fixed inset-0 bg-linear-to-b from-black/50 to-transparent pointer-events-none z-0"></div>

      {/* 🔝 HEADER: World Name & Player Heads */}
      <header className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-black/20 bg-black/10 backdrop-blur-sm">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:-translate-x-1 transition-transform opacity-70 hover:opacity-100">
             &larr;
          </Link>
          <div>
            <h1 className="text-3xl font-minecraft drop-shadow-md">{world.name}</h1>
            <div className={`text-[10px] uppercase font-bold tracking-widest opacity-60 flex items-center gap-2`}>
              <span>Biome: {world.biome || "Plains"}</span>
              {member.role === 'owner' && (
                <Link href={`/dashboard/settings/${worldId}`} className="hover:text-white hover:underline decoration-white cursor-pointer">
                  [Settings]
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 👤 PLAYER LIST (No 'X' buttons, just heads) */}
        <div className="flex -space-x-3 hover:space-x-1 transition-all">
           {world.members.map(m => {
             const user = userMap.get(m.userId);
             return (
               <div key={m.id} className="relative group cursor-help">
                 <img 
                   src={user?.img} 
                   alt={user?.name} 
                   className={`w-10 h-10 rounded-md border-2 ${theme.border} bg-black shadow-md transition-transform hover:scale-110 hover:z-50`}
                 />
                 {/* Tooltip */}
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 font-minecraft border border-white/10">
                   {user?.name} {m.role === 'owner' && '👑'}
                 </div>
               </div>
             )
           })}
           <Link href={`/dashboard/invite/${worldId}`}>
             <button className={`w-10 h-10 rounded-md border-2 border-dashed ${theme.border} flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-white/10 transition-all text-xl`}>
               +
             </button>
           </Link>
        </div>
      </header>

      {/* 📝 MAIN CONTENT */}
      <main className="relative z-10 max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COL: Wheel (Placeholder for now) */}
        <div className="md:col-span-1 space-y-6">
           <div className={`${theme.cardBg} border-4 ${theme.border} p-6 shadow-xl`}>
              <h2 className="font-minecraft text-xl mb-4 border-b-2 border-white/10 pb-2">Spin Wheel</h2>
              <div className="aspect-square bg-black/20 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center">
                 <p className="text-xs opacity-50 font-minecraft">Coming Soon...</p>
              </div>
           </div>
        </div>

        {/* RIGHT COL: Tasks */}
        <div className="md:col-span-2 space-y-6">
           
           {/* Add Task Form */}
           <div className={`${theme.cardBg} border-4 ${theme.border} p-4 shadow-xl`}>
              <form action={createTask} className="flex gap-2">
                 <input type="hidden" name="worldId" value={worldId} />
                 <input 
                   name="description" 
                   required 
                   placeholder="Add a new task..." 
                   className={`flex-1 bg-black/20 border-2 ${theme.border} rounded p-3 focus:outline-none focus:bg-black/40 transition-colors placeholder:text-white/30`}
                 />
                 <button className={`${theme.accent} px-6 font-bold font-minecraft border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all`}>
                   ADD
                 </button>
              </form>
           </div>

           {/* Task List */}
           <div className="space-y-4">
              {worldTasks.map(task => {
                const isMyTask = task.creatorId === userId; // Am I the creator?
                
                return (
                  <div key={task.id} className={`group ${theme.cardBg} border-l-4 ${theme.border} p-4 shadow-md hover:shadow-lg transition-all`}>
                    
                    {/* Top Row: Checkbox, Text, Delete */}
                    <div className="flex items-start gap-3">
                       <form action={toggleTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="worldId" value={worldId} />
                          <button className={`w-6 h-6 border-2 ${theme.border} bg-black/20 flex items-center justify-center hover:bg-white/10 transition-colors rounded-sm`}>
                             {task.isCompleted && <span className="text-lg leading-none">✓</span>}
                          </button>
                       </form>
                       
                       <div className="flex-1">
                          <p className={`text-lg leading-tight ${task.isCompleted ? "line-through opacity-40" : ""}`}>
                             {task.description}
                          </p>
                          <p className="text-[10px] opacity-40 mt-1 font-mono uppercase">
                             Added by {userMap.get(task.creatorId || "")?.name || 'Unknown'}
                          </p>
                       </div>

                       <form action={deleteTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="worldId" value={worldId} />
                          <button className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 transition-opacity px-2">
                            x
                          </button>
                       </form>
                    </div>

                    {/* 🗒️ Notes Section */}
                    <div className={`mt-3 pt-3 border-t border-white/5 ${theme.noteBg} rounded p-2`}>
                      {isMyTask ? (
                        // If I created it, I can Edit
                        <form action={updateTaskNote}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="worldId" value={worldId} />
                          <textarea 
                            name="note" 
                            placeholder="Add notes... (Only you can edit this)" 
                            defaultValue={task.note || ""}
                            className="w-full bg-transparent text-sm opacity-80 focus:opacity-100 focus:outline-none resize-y min-h-10 placeholder:text-white/20"
                          />
                          <button className="text-[10px] uppercase opacity-50 hover:opacity-100 mt-1">
                            Save Note
                          </button>
                        </form>
                      ) : (
                        // If someone else created it, I can only Read
                        task.note ? (
                          <p className="text-sm opacity-70 italic">"{task.note}"</p>
                        ) : (
                          <p className="text-[10px] opacity-30 italic">No notes from creator.</p>
                        )
                      )}
                    </div>

                  </div>
                );
              })}

              {worldTasks.length === 0 && (
                <div className="text-center opacity-40 py-10 font-minecraft">
                   No tasks yet. Punch a tree!
                </div>
              )}
           </div>

        </div>
      </main>
    </div>
  );
}