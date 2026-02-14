import { auth, clerkClient } from "@clerk/nextjs/server"; 
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { deletePlan, kickMember, renameWorld, updateBiome } from "@/app/actions";

// ⚠️ Next.js 15: params and searchParams are Promises
export default async function SettingsPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  
  const { id } = await params;
  const { from } = await searchParams; // Check if ?from=world exists
  
  const worldId = parseInt(id);
  if (isNaN(worldId)) redirect("/dashboard");

  const { userId } = await auth();
  if (!userId) redirect("/");

  // 1. Fetch World & Verify Ownership
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  if (!world || world.ownerId !== userId) {
    redirect("/dashboard");
  }

  // 2. Fetch Real Names from Clerk
  const client = await clerkClient();
  const memberIds = world.members.map(m => m.userId);
  let userMap = new Map<string, string>();
  
  try {
    const clerkUsers = await client.users.getUserList({
      userId: memberIds,
      limit: 100,
    });

    clerkUsers.data.forEach(u => {
      const name = u.username || u.firstName || "Miner";
      userMap.set(u.id, name);
    });
  } catch (e) {
    console.error("Failed to fetch Clerk users:", e);
  }

  // 3. Biome Configuration
  const biomes = [
    { 
      id: "plains", 
      name: "Plains", 
      bg: "bg-[#71c352]", 
      border: "border-[#4e8c36]", 
      desc: "Classic grass & flowers." 
    },
    { 
      id: "cherry", 
      name: "Cherry Blossom", 
      bg: "bg-[#ffb5d4]", 
      border: "border-[#d17da1]", 
      desc: "Pink petals & blue sky." 
    },
    { 
      id: "ocean", 
      name: "Ocean", 
      bg: "bg-[#4b8b8b]", 
      border: "border-[#2d5d5d]", 
      desc: "Deep blue & guardians." 
    },
    { 
      id: "spruce", 
      name: "Spruce Forest", 
      bg: "bg-[#584633]", 
      border: "border-[#3b2e22]", 
      desc: "Podzol & tall pines." 
    },
    { 
      id: "cave", 
      name: "Lush Cave", 
      bg: "bg-[#475c2e]", 
      border: "border-[#7d8c4d]", 
      desc: "Clay, moss & glow berries." 
    },
    { 
      id: "nether", 
      name: "The Nether", 
      bg: "bg-[#4d1616]", 
      border: "border-[#852323]", 
      desc: "Lava & fortresses." 
    },
    { 
      id: "end", 
      name: "The End", 
      bg: "bg-[#ebe6c5]", 
      border: "border-[#2b204a]", 
      desc: "End stone & void." 
    },
  ];

  // 📍 LOGIC: Determine Back Link Destination
  const backLink = from === "world" ? `/dashboard/world/${worldId}` : "/dashboard";
  const backLabel = from === "world" ? "Back to World" : "Back to Dashboard";

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* 🧱 Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundColor: "#0f0f0f",
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
           }}>
      </div>
      
      {/* 🔦 Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* 🔙 Back Link (Dynamic) */}
        <Link href={backLink} className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors font-minecraft group">
          <span className="group-hover:-translate-x-1 transition-transform">&lt;</span> {backLabel}
        </Link>

        {/* 🏷️ Header */}
        <div className="border-b-4 border-[#333] pb-6">
          <h1 className="text-4xl font-minecraft text-[#aaaaaa] mb-2 drop-shadow-md">World Settings</h1>
          <p className="text-zinc-500 font-minecraft text-sm">Configure permissions and appearance.</p>
        </div>

        {/* ✏️ SECTION 1: Rename */}
        <section className="bg-[#1a1a1a] border-4 border-[#555] p-6 shadow-[8px_8px_0_#000]">
          <h2 className="text-xl font-minecraft text-[#ccc] mb-6 flex items-center gap-2">
            <span className="text-[#888]">#</span> General
          </h2>
          
          <form action={renameWorld} className="flex flex-col md:flex-row gap-4 items-end">
            <input type="hidden" name="worldId" value={worldId} />
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-[#888] font-minecraft uppercase mb-2 ml-1">World Name</label>
              <input 
                name="newName"
                defaultValue={world.name}
                required
                className="w-full bg-[#111] border-2 border-[#333] p-3 text-white focus:outline-none focus:border-[#00aaaa] transition-colors font-minecraft"
              />
            </div>
            <button className="w-full md:w-auto bg-[#ccc] hover:bg-white text-black font-minecraft font-bold px-6 py-3 border-b-4 border-[#888] active:border-b-0 active:translate-y-1 active:mt-1 transition-all">
              SAVE
            </button>
          </form>
        </section>

        {/* 🌲 SECTION 2: Biome Selector */}
        <section className="bg-[#1a1a1a] border-4 border-[#555] p-6 shadow-[8px_8px_0_#000]">
          <h2 className="text-xl font-minecraft text-[#ccc] mb-6 flex items-center gap-2">
            <span className="text-[#888]">#</span> World Theme
          </h2>
          
          <form action={updateBiome}>
            <input type="hidden" name="worldId" value={worldId} />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {biomes.map((b) => (
                <label key={b.id} className="cursor-pointer group relative">
                  <input type="radio" name="biome" value={b.id} defaultChecked={world.biome === b.id} className="hidden peer" />
                  
                  {/* The Card */}
                  <div className={`h-32 ${b.bg} border-4 ${b.border} peer-checked:border-white peer-checked:shadow-[0_0_15px_white] transition-all flex flex-col items-center justify-center p-2 relative overflow-hidden group-hover:-translate-y-1`}>
                    
                    {/* Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                    
                    {/* Checkmark */}
                    <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity bg-black/50 rounded-full p-1">
                      <span className="text-white text-xs">✅</span>
                    </div>

                    {/* Text - White with Heavy Black Shadow */}
                    <span className="font-minecraft text-center text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)] relative z-10 text-white font-bold">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-white font-bold font-minecraft text-center mt-1 relative z-10 leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                      {b.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <button className="w-full md:w-auto bg-[#ccc] hover:bg-white text-black font-minecraft font-bold px-6 py-3 border-b-4 border-[#888] active:border-b-0 active:translate-y-1 active:mt-1 transition-all">
              UPDATE BIOME
            </button>
          </form>
        </section>

        {/* 👥 SECTION 3: Members */}
        <section className="bg-[#0a1a1a] border-4 border-[#00aaaa] p-6 shadow-[8px_8px_0_#000]">
          <div className="flex justify-between items-center mb-6 border-b-2 border-[#00aaaa]/30 pb-4">
            <h2 className="text-xl font-minecraft text-[#00aaaa] flex items-center gap-2">
              <span>👥</span> Members
            </h2>
            <Link href={`/dashboard/invite/${worldId}`}>
               <button className="text-xs bg-[#00aaaa]/10 text-[#00aaaa] border border-[#00aaaa] px-3 py-2 font-minecraft hover:bg-[#00aaaa] hover:text-black transition-colors">
                 + INVITE NEW
               </button>
            </Link>
          </div>

          <div className="space-y-4">
            {world.members.map((member) => {
              const realName = userMap.get(member.userId) || "Loading...";
              const isMe = member.userId === userId;
              const isOwner = member.role === 'owner';

              return (
                <div key={member.id} className="flex justify-between items-center p-4 bg-black/40 border-2 border-[#00aaaa]/30">
                  <div className="flex items-center gap-4">
                    {/* Role Badge */}
                    <div className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold font-minecraft border-2 ${isOwner ? 'bg-[#00aaaa] border-[#00ffff] text-black' : 'bg-[#333] border-[#555] text-[#888]'}`}>
                      {isOwner ? 'OP' : 'PL'}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <p className="text-white font-minecraft text-lg flex items-center gap-2">
                        {realName}
                        {isMe && <span className="text-[#555] text-xs">(You)</span>}
                        {member.status === 'pending' && <span className="text-[#ffd700] text-[10px] border border-[#ffd700] px-1 ml-2">PENDING</span>}
                      </p> 
                      <p className="text-[10px] text-[#00aaaa] font-mono tracking-widest uppercase opacity-70">{member.role}</p>
                    </div>
                  </div>

                  {/* Kick Button */}
                  {!isMe && (
                    <form action={kickMember}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <button className="text-[#aa0000] hover:text-[#ff5555] text-xs font-minecraft border-b-2 border-transparent hover:border-[#ff5555] transition-all pb-1">
                        [ KICK ]
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ⚠️ SECTION 4: Danger Zone */}
        <section className="bg-[#1a0505] border-4 border-[#aa0000] p-6 shadow-[8px_8px_0_#000] opacity-80 hover:opacity-100 transition-opacity">
          <h2 className="text-xl font-minecraft text-[#ff5555] mb-2 flex items-center gap-2">
            <span>🧨</span> Danger Zone
          </h2>
          <p className="text-[#aa5555] font-minecraft text-xs mb-6">
            Deleting a world is permanent. All chunks will be lost.
          </p>

          <form action={deletePlan} className="flex justify-end">
            <input type="hidden" name="id" value={worldId} />
            <button className="bg-[#aa0000] hover:bg-[#ff5555] text-white font-minecraft px-6 py-3 border-b-4 border-[#660000] active:border-b-0 active:translate-y-1 active:mt-1 transition-all flex items-center gap-2 group">
              <span className="group-hover:animate-pulse">⚠</span> DELETE WORLD
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}