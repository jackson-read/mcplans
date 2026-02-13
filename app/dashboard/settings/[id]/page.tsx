import { auth, clerkClient } from "@clerk/nextjs/server"; 
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { deletePlan, kickMember, renameWorld } from "@/app/actions";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Next.js 15 Params Handling
  const { id } = await params;
  const worldId = parseInt(id);
  if (isNaN(worldId)) redirect("/dashboard");

  const { userId } = await auth();
  if (!userId) redirect("/");

  // 2. Fetch World
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  // 🛡️ Security Guard
  if (!world || world.ownerId !== userId) {
    redirect("/dashboard");
  }

  // 3. FETCH REAL NAMES (The Fix)
  const client = await clerkClient();
  const memberIds = world.members.map(m => m.userId);
  
  let userMap = new Map<string, string>();
  
  try {
    const clerkUsers = await client.users.getUserList({
      userId: memberIds,
      limit: 100,
    });

    // Create a lookup: ID -> Name
    clerkUsers.data.forEach(u => {
      // Try Username -> FirstName -> Email -> "Miner"
      const name = u.username || u.firstName || u.emailAddresses[0]?.emailAddress.split('@')[0] || "Miner";
      userMap.set(u.id, name);
    });
  } catch (e) {
    console.error("Failed to fetch Clerk users:", e);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6 md:p-12 relative overflow-hidden">
      
      {/* 🧱 Background Pattern (Matches Dashboard) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundColor: "#0f0f0f",
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
           }}>
      </div>
      
      {/* 🔦 Vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-0"></div>

      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        
        {/* 🔙 Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-4 transition-colors font-minecraft group">
          <span className="group-hover:-translate-x-1 transition-transform">&lt;</span> Back to Dashboard
        </Link>

        {/* 🏷️ Header */}
        <div className="border-b-4 border-[#333] pb-6">
          <h1 className="text-4xl font-minecraft text-[#aaaaaa] mb-2 drop-shadow-md">World Settings</h1>
          <p className="text-zinc-500 font-minecraft text-sm">Configure permissions and manage players.</p>
        </div>

        {/* ✏️ SECTION 1: Rename (Iron Theme) */}
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

        {/* 👥 SECTION 2: Members (Diamond Theme) */}
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

        {/* ⚠️ SECTION 3: Danger Zone (Redstone Theme) */}
        <section className="bg-[#1a0505] border-4 border-[#aa0000] p-6 shadow-[8px_8px_0_#000] opacity-80 hover:opacity-100 transition-opacity">
          <h2 className="text-xl font-minecraft text-[#ff5555] mb-2 flex items-center gap-2">
            <span>🧨</span> Danger Zone
          </h2>
          <p className="text-[#aa5555] font-minecraft text-xs mb-6">
            Deleting a world is permanent.
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