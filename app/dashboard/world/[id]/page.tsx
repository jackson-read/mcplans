import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { createTask, toggleTask, deleteTask, updateTaskNote } from "@/app/actions";
import SpinWheel from "@/components/SpinWheel"; // Import the wheel!


// 🎨 THEME COLORS
const getTheme = (biome: string) => {
  const defaults = { cardBg: "bg-black/40", border: "border-white/20", text: "text-white", accent: "bg-white/20" };
  switch (biome) {
    case 'nether': return { ...defaults, cardBg: "bg-[#2a0505]/90", border: "border-[#852323]", text: "text-[#ffaaaa]", accent: "bg-[#852323]" };
    case 'end': return { ...defaults, cardBg: "bg-[#0d0917]/90", border: "border-[#554477]", text: "text-[#d8b4e2]", accent: "bg-[#2b204a]" };
    case 'ocean': return { ...defaults, cardBg: "bg-[#051a24]/90", border: "border-[#4b8b8b]", text: "text-[#aaffff]", accent: "bg-[#2d5d5d]" };
    case 'cherry': return { ...defaults, cardBg: "bg-[#4a2433]/90", border: "border-[#eb6eb0]", text: "text-[#ffeef5]", accent: "bg-[#a83e72]" };
    case 'spruce': return { ...defaults, cardBg: "bg-[#261a12]/90", border: "border-[#5c4033]", text: "text-[#aacc88]", accent: "bg-[#3b2a1e]" };
    case 'cave': return { ...defaults, cardBg: "bg-[#1a2611]/90", border: "border-[#7d8c4d]", text: "text-[#d6ff99]", accent: "bg-[#475c2e]" };
    case 'plains': default: return { ...defaults, cardBg: "bg-[#1a2115]/90", border: "border-[#3e6826]", text: "text-[#ffffff]", accent: "bg-[#5b8731]" };
  }
};

// 🌄 VISUAL ENGINE
const BiomeBackground = ({ biome }: { biome: string }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden font-minecraft select-none">
      
      {/* ☁️ GLOBAL CLOUDS (Overworld) */}
      {['plains', 'cherry', 'spruce'].includes(biome) && (
        <>
          <div className="absolute top-10 left-10 w-48 h-16 bg-white/30"></div>
          <div className="absolute top-24 left-1/3 w-32 h-12 bg-white/20"></div>
          <div className="absolute top-12 right-20 w-64 h-20 bg-white/30"></div>
        </>
      )}

      {/* --- PLAINS --- */}
      {biome === 'plains' && (
        <>
          <div className="absolute inset-0 bg-[#87ceeb]"></div>
          {/* Ground Layers */}
          <div className="absolute bottom-0 w-full h-24 bg-[#5b3e2b]"></div> {/* Dirt */}
          <div className="absolute bottom-24 w-full h-8 bg-[#5b8731] border-b-4 border-[#4a6b28]"></div> {/* Grass Block Top */}
          
          {/* Blocky Flowers (CSS Box Shadows) */}
          <div className="absolute bottom-32 left-20 w-4 h-4 bg-red-500 shadow-[4px_0_0_#b00,-4px_0_0_#b00,0_-4px_0_#b00,0_4px_0_#b00,0_0_0_4px_rgba(0,0,0,0.2)]">
            <div className="absolute top-4 left-1 w-2 h-6 bg-[#3e6826]"></div>
          </div>
          <div className="absolute bottom-32 right-1/4 w-4 h-4 bg-yellow-400 shadow-[4px_0_0_#d4af37,-4px_0_0_#d4af37,0_-4px_0_#d4af37,0_4px_0_#d4af37]">
            <div className="absolute top-4 left-1 w-2 h-6 bg-[#3e6826]"></div>
          </div>

          {/* Grass Texture */}
          <div className="absolute bottom-32 left-40 w-2 h-12 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 left-44 w-2 h-8 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
        </>
      )}

      {/* --- CHERRY BLOSSOM --- */}
      {(biome === 'cherry' || biome === 'cherry_blossom') && (
        <>
          <div className="absolute inset-0 bg-[#9fd3ff]"></div>
          {/* Ground Layers */}
          <div className="absolute bottom-0 w-full h-24 bg-[#5b3e2b]"></div> {/* Dirt */}
          <div className="absolute bottom-24 w-full h-8 bg-[#6ebb47] border-b-4 border-[#589c36]"></div> {/* Grass Top */}
          
          {/* Trees (Improved) */}
          {[-10, 80].map((pos, i) => (
            <div key={i} className={`absolute bottom-32 left-[${pos}%] w-24 h-64`}>
              {/* Log */}
              <div className="absolute bottom-0 left-8 w-8 h-48 bg-[#3b2618] border-x-4 border-[#2b1c11]"></div>
              {/* Leaves (Blocky) */}
              <div className="absolute bottom-32 -left-8 w-40 h-24 bg-[#ffb7d5] opacity-90 shadow-[inset_0_-8px_0_#eb9bb7]"></div>
              <div className="absolute bottom-48 left-0 w-24 h-16 bg-[#ffb7d5] opacity-90"></div>
            </div>
          ))}
        </>
      )}

      {/* --- OCEAN --- */}
      {biome === 'ocean' && (
        <>
          <div className="absolute inset-0 bg-[#006994]"></div>
          
          {/* Ocean Monument (Better Perspective) */}
          <div className="absolute bottom-0 right-20 w-80 h-64 bg-[#4b8b8b] border-4 border-[#2d5d5d]">
             {/* Prismarine Details */}
             <div className="absolute top-10 left-10 w-60 h-4 bg-[#2d5d5d]"></div>
             <div className="absolute top-20 left-10 w-60 h-4 bg-[#2d5d5d]"></div>
             <div className="absolute top-32 left-10 w-60 h-4 bg-[#2d5d5d]"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#aaffff] shadow-[0_0_30px_#aaffff]"></div>
          </div>

          {/* Pixel Fish */}
          <div className="absolute top-40 left-20 w-12 h-6 bg-orange-400">
             <div className="absolute top-1 right-0 w-2 h-2 bg-black"></div> {/* Eye */}
             <div className="absolute top-2 -left-2 w-2 h-2 bg-orange-400"></div> {/* Tail */}
          </div>
          <div className="absolute top-60 left-1/3 w-8 h-4 bg-yellow-400">
             <div className="absolute top-1 right-0 w-1 h-1 bg-black"></div>
          </div>
        </>
      )}

      {/* --- SPRUCE --- */}
      {biome === 'spruce' && (
        <>
          <div className="absolute inset-0 bg-[#778ca3]"></div>
          {/* Podzol Ground */}
          <div className="absolute bottom-0 w-full h-32 bg-[#4a3623] border-t-8 border-[#302316]">
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(#261a12 2px, transparent 2px)", backgroundSize: "8px 8px"}}></div>
          </div>
          
          {/* Trees (Aligned) */}
          {[10, 40, 75].map((pos, i) => (
            <div key={i} className="absolute bottom-32" style={{left: `${pos}%`}}>
               {/* Log */}
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-64 bg-[#2b1e16] border-x-2 border-[#1a110d]"></div>
               {/* Leaves */}
               <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#1e2e14]"></div>
               <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-32 h-16 bg-[#1e2e14]"></div>
               <div className="absolute bottom-52 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#1e2e14]"></div>
            </div>
          ))}
        </>
      )}

      {/* --- LUSH CAVE --- */}
      {biome === 'cave' && (
        <>
          {/* Cave Texture Background */}
          <div className="absolute inset-0 bg-[#1a1a1a]" style={{backgroundImage: "radial-gradient(circle at 50% 50%, #111 20%, transparent 21%)", backgroundSize: "40px 40px"}}></div>
          
          {/* Mixed Ground (Random Patches) */}
          <div className="absolute bottom-0 w-full h-32 bg-[#646464] overflow-hidden">
             {/* Clay Patch */}
             <div className="absolute bottom-0 left-20 w-64 h-32 bg-[#9fa4b2] rounded-full blur-xl"></div>
             {/* Moss Patch */}
             <div className="absolute bottom-0 right-40 w-96 h-24 bg-[#475c2e] rounded-t-xl border-t-8 border-[#5e7a3d]"></div>
             {/* Water Patch */}
             <div className="absolute bottom-0 left-1/2 w-40 h-10 bg-[#2d5e75]"></div>
          </div>

          {/* Hanging Glow Berries (More of them) */}
          {[10, 25, 60, 85].map((pos, i) => (
            <div key={i} className="absolute top-0 flex flex-col items-center" style={{left: `${pos}%`}}>
               <div className="w-4 h-40 bg-[#4e6b2c]" style={{height: `${100 + i * 40}px`}}></div>
               <div className="w-6 h-6 bg-[#ffd952] shadow-[0_0_20px_#ffd952] rounded-sm"></div>
            </div>
          ))}
        </>
      )}

      {/* --- NETHER --- */}
      {biome === 'nether' && (
        <>
          <div className="absolute inset-0 bg-[#2a0505]"></div>
          {/* Netherrack (Noise Filter) */}
          <div className="absolute bottom-0 w-full h-32 bg-[#4d1616]">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
          </div>
          
          {/* Lava (Right Side, Textured) */}
          <div className="absolute top-0 right-0 w-48 h-full bg-[#cf5b13] border-l-8 border-[#ad3f0b]">
             <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
          </div>

          {/* Fortress (Uniform Bricks) */}
          <div className="absolute bottom-0 left-10 w-64 h-80 bg-[#381111]">
             {/* Brick Pattern */}
             <div className="absolute inset-0 opacity-40" style={{backgroundImage: "linear-gradient(#1a0505 2px, transparent 2px), linear-gradient(90deg, #1a0505 2px, transparent 2px)", backgroundSize: "32px 16px"}}></div>
          </div>
        </>
      )}

      {/* --- END --- */}
      {biome === 'end' && (
        <>
          <div className="absolute inset-0 bg-[#0d0917]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#dbd6ac] border-t-8 border-[#c9c59d]">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "8px 8px", filter: "invert(1)"}}></div>
          </div>
          {/* Pillars */}
          <div className="absolute bottom-32 left-20 w-16 h-64 bg-[#160f29] border-x-4 border-black"></div>
          <div className="absolute bottom-32 left-60 w-16 h-96 bg-[#160f29] border-x-4 border-black"></div>
          <div className="absolute bottom-32 right-40 w-16 h-48 bg-[#160f29] border-x-4 border-black"></div>
        </>
      )}
    </div>
  );
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
    orderBy: [desc(tasks.createdAt)],
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
      
      <BiomeBackground biome={world.biome || 'plains'} />

      {/* HEADER */}
      <header className={`relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-4 ${theme.cardBg} backdrop-blur-sm border-b-4 ${theme.border}`}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white hover:-translate-x-1 transition-transform">&larr;</Link>
          <div>
            <h1 className={`text-3xl font-minecraft drop-shadow-md ${theme.text}`}>{world.name}</h1>
            <div className={`text-[10px] uppercase font-bold tracking-widest ${theme.text} opacity-80 flex items-center gap-2`}>
              <span>Biome: {world.biome || "Plains"}</span>
              {member.role === 'owner' && (
                <Link href={`/dashboard/settings/${worldId}?from=world`} className="hover:underline decoration-white cursor-pointer">[Settings]</Link>
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
      <main className="relative z-10 max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COL: Wheel */}
        <div className="md:col-span-1 space-y-6">
           {/* 🎡 THE SPIN WHEEL COMPONENT */}
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

           <div className="space-y-4">
              {worldTasks.map(task => {
                const isMyTask = task.creatorId === userId;
                return (
                  <div key={task.id} className={`group ${theme.cardBg} border-l-4 ${theme.border} p-4 shadow-md backdrop-blur-sm hover:shadow-lg transition-all`}>
                    <div className="flex items-start gap-3">
                       <form action={toggleTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="worldId" value={worldId} />
                          <button className={`w-6 h-6 border-2 ${theme.border} bg-black/20 flex items-center justify-center hover:bg-white/10 text-white transition-colors rounded-sm`}>
                             {task.isCompleted && <span className="text-lg leading-none">✓</span>}
                          </button>
                       </form>
                       <div className="flex-1">
                          <p className={`text-lg leading-tight ${theme.text} ${task.isCompleted ? "line-through opacity-40" : ""}`}>{task.description}</p>
                          <p className={`text-[10px] opacity-40 mt-1 font-mono uppercase ${theme.text}`}>Added by {userMap.get(task.creatorId || "")?.name || 'Unknown'}</p>
                       </div>
                       <form action={deleteTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="worldId" value={worldId} />
                          <button className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 transition-opacity px-2">x</button>
                       </form>
                    </div>
                    {/* Notes */}
                    <div className={`mt-3 pt-3 border-t ${theme.border} rounded p-2`}>
                      {isMyTask ? (
                        <form action={updateTaskNote}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="worldId" value={worldId} />
                          <textarea name="note" placeholder="Add notes..." defaultValue={task.note || ""} className={`w-full bg-transparent text-sm ${theme.text} opacity-80 focus:opacity-100 focus:outline-none resize-y min-h-10 placeholder:text-white/20`} />
                          <button className={`text-[10px] uppercase ${theme.text} opacity-50 hover:opacity-100 mt-1`}>Save Note</button>
                        </form>
                      ) : (
                        task.note ? <p className={`text-sm opacity-70 italic ${theme.text}`}>"{task.note}"</p> : <p className={`text-[10px] opacity-30 italic ${theme.text}`}>No notes.</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {worldTasks.length === 0 && <div className={`text-center opacity-40 py-10 font-minecraft ${theme.text}`}>No tasks yet. Punch a tree!</div>}
           </div>
        </div>
      </main>
    </div>
  );
}