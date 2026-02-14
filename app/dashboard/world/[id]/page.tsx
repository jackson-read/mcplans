import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { createTask, toggleTask, deleteTask, updateTaskNote } from "@/app/actions";

// 🎨 THEME CONFIGURATION (Colors for UI elements)
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

// 🌄 CSS PIXEL ART ENGINE
const BiomeBackground = ({ biome }: { biome: string }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden font-minecraft select-none">
      
      {/* ☁️ SHARED: CLOUDS (For Overworld Biomes) */}
      {['plains', 'cherry', 'spruce'].includes(biome) && (
        <>
          <div className="absolute top-10 left-20 w-32 h-12 bg-white/20"></div>
          <div className="absolute top-16 left-40 w-24 h-8 bg-white/20"></div>
          <div className="absolute top-24 right-40 w-48 h-12 bg-white/20"></div>
        </>
      )}

      {/* --- PLAINS --- */}
      {biome === 'plains' && (
        <>
          <div className="absolute inset-0 bg-[#87ceeb]"></div> {/* Sky */}
          {/* Grass Block Bottom */}
          <div className="absolute bottom-0 w-full h-32 bg-[#5b8731] border-t-8 border-[#4a6b28] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)]">
             {/* Dirt Texture */}
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "16px 16px"}}></div>
          </div>
          
          {/* Pixel Art Flowers (Box Shadows) */}
          <div className="absolute bottom-32 left-10 w-2 h-2 bg-transparent shadow-[4px_0_0_#f00,8px_0_0_#f00,6px_-4px_0_#ff0,6px_-8px_0_#f00]"></div> {/* Poppy */}
          <div className="absolute bottom-32 right-20 w-2 h-2 bg-transparent shadow-[4px_0_0_#ff0,8px_0_0_#ff0,6px_-4px_0_#fff,6px_-8px_0_#ff0]"></div> {/* Dandelion */}
          
          {/* Tall Grass */}
          <div className="absolute bottom-32 left-40 w-1 h-16 bg-[#3e6826] border-l-4 border-[#4a6b28]"></div>
          <div className="absolute bottom-32 left-44 w-1 h-12 bg-[#3e6826] border-l-4 border-[#4a6b28]"></div>
          <div className="absolute bottom-32 right-1/3 w-1 h-20 bg-[#3e6826] border-l-4 border-[#4a6b28]"></div>
        </>
      )}

      {/* --- CHERRY BLOSSOM --- */}
      {(biome === 'cherry' || biome === 'cherry_blossom') && (
        <>
          <div className="absolute inset-0 bg-[#9fd3ff]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#6ebb47] border-t-8 border-[#589c36]">
            {/* Pink Petals on Ground */}
            <div className="absolute inset-0 opacity-80" style={{backgroundImage: "radial-gradient(#ffb7d5 2px, transparent 2px)", backgroundSize: "24px 24px"}}></div>
          </div>
          
          {/* Blocky Tree */}
          <div className="absolute bottom-32 left-10 w-16 h-48 bg-[#3b2618] border-r-8 border-[#2b1c11]">
            <div className="absolute -top-32 -left-24 w-64 h-48 bg-[#ffb7d5] shadow-[inset_-10px_-10px_0_#eb9bb7]"></div>
          </div>

          {/* Falling Petals (Square) */}
          <div className="absolute inset-0 animate-petal-fall" style={{ backgroundImage: 'linear-gradient(to bottom, #ffb7d5 4px, transparent 4px)', backgroundSize: '60px 140px', backgroundPosition: '10px 0' }}></div>
        </>
      )}

      {/* --- OCEAN --- */}
      {biome === 'ocean' && (
        <>
          <div className="absolute inset-0 bg-[#006994]"></div>
          {/* Water Texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 2px, transparent 0, transparent 40px)" }}></div>
          
          {/* Blocky Monument (Front View) */}
          <div className="absolute bottom-0 right-10 w-80 h-64 bg-[#4b8b8b] flex flex-col items-center justify-end">
             <div className="w-64 h-48 bg-[#4b8b8b] border-4 border-[#2d5d5d] flex items-center justify-center">
                <div className="w-4 h-full bg-[#2d5d5d]"></div>
                <div className="w-4 h-full bg-[#2d5d5d] ml-8"></div>
                <div className="w-4 h-full bg-[#2d5d5d] mr-8"></div>
                <div className="absolute w-8 h-8 bg-[#aaffff] shadow-[0_0_20px_#aaffff]"></div> {/* Sea Lantern */}
             </div>
             <div className="w-80 h-16 bg-[#2d5d5d]"></div>
          </div>

          {/* Pixel Fish */}
          <div className="absolute top-1/2 left-20 w-8 h-4 bg-orange-500 shadow-[2px_0_0_#fff]"></div>
          <div className="absolute top-1/3 left-1/2 w-6 h-3 bg-blue-300 shadow-[2px_0_0_#fff]"></div>
        </>
      )}

      {/* --- SPRUCE --- */}
      {biome === 'spruce' && (
        <>
          <div className="absolute inset-0 bg-[#778ca3]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#4a3623] border-t-8 border-[#302316]">
             {/* Podzol Texture */}
             <div className="absolute inset-0 opacity-30" style={{backgroundImage: "radial-gradient(#261a12 4px, transparent 4px)", backgroundSize: "12px 12px"}}></div>
          </div>
          
          {/* Spruce Tree */}
          <div className="absolute bottom-32 left-10 w-12 h-64 bg-[#2b1e16]">
             {/* Leaves (Triangles made of Borders) */}
             <div className="absolute bottom-20 -left-14 border-l-40 border-r-40 border-b-60 border-l-transparent border-r-transparent border-b-[#1e2e14]"></div>
             <div className="absolute bottom-40 -left-10 border-l-30 border-r-30 border-b-50 border-l-transparent border-r-transparent border-b-[#1e2e14]"></div>
             <div className="absolute bottom-60 -left-6 border-l-20 border-r-20 border-b-40 border-l-transparent border-r-transparent border-b-[#1e2e14]"></div>
          </div>

          {/* Pixel Wolf */}
          <div className="absolute bottom-32 right-40">
             <div className="w-12 h-8 bg-[#ddd]"></div> {/* Body */}
             <div className="absolute -top-6 left-0 w-8 h-8 bg-[#ddd]"></div> {/* Head */}
             <div className="absolute top-8 left-0 w-2 h-4 bg-[#ddd]"></div> {/* Leg */}
             <div className="absolute top-8 right-0 w-2 h-4 bg-[#ddd]"></div> {/* Leg */}
             <div className="absolute top-0 -right-1 w-4 h-2 bg-[#ddd]"></div> {/* Tail */}
          </div>
        </>
      )}

      {/* --- LUSH CAVE --- */}
      {biome === 'cave' && (
        <>
          <div className="absolute inset-0 bg-[#1a1a1a]"></div>
          
          {/* Floor: Mixed Clay/Stone/Moss */}
          <div className="absolute bottom-0 w-full h-24 flex">
             <div className="w-1/3 h-full bg-[#646464] border-t-4 border-[#555]"></div> {/* Stone */}
             <div className="w-1/3 h-full bg-[#475c2e] border-t-4 border-[#5e7a3d]"></div> {/* Moss */}
             <div className="w-1/3 h-full bg-[#394247] border-t-4 border-[#254d61] relative"> {/* Water */}
                <div className="absolute top-4 left-10 w-12 h-4 bg-[#f28b82]"></div> {/* Axolotl Body */}
                <div className="absolute top-2 left-18 w-2 h-2 bg-[#f28b82]"></div> {/* Fin */}
             </div>
          </div>
          
          {/* Hanging Glow Berries (Pixel Vines) */}
          <div className="absolute top-0 left-20 flex flex-col items-center">
             <div className="w-2 h-32 bg-[#4e6b2c]"></div>
             <div className="w-4 h-4 bg-[#ffd952] shadow-[0_0_15px_#ffd952] rounded-sm"></div>
          </div>
          <div className="absolute top-0 right-40 flex flex-col items-center">
             <div className="w-2 h-48 bg-[#4e6b2c]"></div>
             <div className="w-4 h-4 bg-[#ffd952] shadow-[0_0_15px_#ffd952] rounded-sm"></div>
          </div>
        </>
      )}

      {/* --- NETHER --- */}
      {biome === 'nether' && (
        <>
          <div className="absolute inset-0 bg-[#2a0505]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#4d1616]">
             {/* Netherrack Noise */}
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 8px)"}}></div>
          </div>
          
          {/* Lava Fall (Right Side) */}
          <div className="absolute top-0 right-10 w-32 h-full bg-[#cf5b13] border-x-4 border-[#ad3f0b] opacity-90"></div>
          
          {/* Fortress (Left) */}
          <div className="absolute bottom-0 left-0">
             <div className="w-24 h-96 bg-[#381111] border-r-8 border-[#260b0b]">
                {/* Brick Texture */}
                <div className="w-full h-full opacity-30" style={{backgroundImage: "linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)", backgroundSize: "20px 10px"}}></div>
             </div>
             <div className="absolute bottom-64 left-24 w-64 h-16 bg-[#381111]"></div>
          </div>
        </>
      )}

      {/* --- END --- */}
      {biome === 'end' && (
        <>
          <div className="absolute inset-0 bg-[#0d0917]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#dbd6ac] border-t-8 border-[#c9c59d]">
             {/* End Stone Texture (Inverted Noise) */}
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "8px 8px", filter: "invert(1)"}}></div>
          </div>
          
          {/* Obsidian Pillars */}
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
      
      {/* 🖼️ BACKGROUND LAYER */}
      <BiomeBackground biome={world.biome || 'plains'} />

      {/* 🔝 HEADER */}
      <header className={`relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-4 ${theme.cardBg} backdrop-blur-sm border-b-4 ${theme.border}`}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white hover:-translate-x-1 transition-transform">&larr;</Link>
          <div>
            <h1 className={`text-3xl font-minecraft drop-shadow-md ${theme.text}`}>{world.name}</h1>
            <div className={`text-[10px] uppercase font-bold tracking-widest ${theme.text} opacity-80 flex items-center gap-2`}>
              <span>Biome: {world.biome || "Plains"}</span>
              {member.role === 'owner' && (
                // ⚠️ NOTICE: We add ?from=world here!
                <Link href={`/dashboard/settings/${worldId}?from=world`} className="hover:underline decoration-white cursor-pointer">[Settings]</Link>
              )}
            </div>
          </div>
        </div>
        
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

      {/* 📝 MAIN CONTENT */}
      <main className="relative z-10 max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COL: Wheel */}
        <div className="md:col-span-1 space-y-6">
           <div className={`${theme.cardBg} border-4 ${theme.border} p-6 shadow-xl backdrop-blur-sm`}>
              <h2 className={`font-minecraft text-xl mb-4 border-b-2 ${theme.border} pb-2 ${theme.text}`}>Spin Wheel</h2>
              <div className={`aspect-square bg-black/20 rounded-full border-4 border-dashed ${theme.border} flex items-center justify-center`}>
                 <p className={`text-xs opacity-50 font-minecraft ${theme.text}`}>Coming Soon...</p>
              </div>
           </div>
        </div>

        {/* RIGHT COL: Tasks */}
        <div className="md:col-span-2 space-y-6">
           {/* Add Task */}
           <div className={`${theme.cardBg} border-4 ${theme.border} p-4 shadow-xl backdrop-blur-sm`}>
              <form action={createTask} className="flex gap-2">
                 <input type="hidden" name="worldId" value={worldId} />
                 <input name="description" required placeholder="Add a new task..." className={`flex-1 bg-black/20 border-2 ${theme.border} ${theme.text} rounded p-3 focus:outline-none focus:bg-black/40 transition-colors placeholder:text-white/30`} />
                 <button className={`${theme.accent} ${theme.text} px-6 font-bold font-minecraft border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition-all`}>ADD</button>
              </form>
           </div>

           {/* Task List */}
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

      {/* Animation Styles */}
      <style>{`
        @keyframes petal-fall {
          0% { background-position: 10px -100px; }
          100% { background-position: 10px 800px; }
        }
        .animate-petal-fall { animation: petal-fall 10s linear infinite; }
      `}</style>
    </div>
  );
}