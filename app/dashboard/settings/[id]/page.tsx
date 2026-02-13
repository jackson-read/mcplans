import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { deletePlan, kickMember, renameWorld } from "@/app/actions";

export default async function SettingsPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const worldId = parseInt(params.id);
  if (isNaN(worldId)) redirect("/dashboard");

  // 1. Fetch World
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  // 🛡️ DEBUG SECURITY CHECK
  // Instead of redirecting instantly, we show why it's failing.
  if (!world || world.ownerId !== userId) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-red-900/50 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-red-500 font-minecraft text-2xl mb-4">Access Denied</h1>
          <div className="space-y-4 text-sm font-mono text-zinc-400">
            <p>Reason: {!world ? "World not found" : "ID Mismatch"}</p>
            <div className="p-3 bg-black rounded border border-zinc-800">
              <p className="text-zinc-500 text-[10px] uppercase mb-1">Your Clerk ID:</p>
              <p className="text-white break-all">{userId}</p>
            </div>
            <div className="p-3 bg-black rounded border border-zinc-800">
              <p className="text-zinc-500 text-[10px] uppercase mb-1">Database Owner ID:</p>
              <p className="text-white break-all">{world?.ownerId || "NULL"}</p>
            </div>
          </div>
          <Link href="/dashboard" className="mt-8 block text-center py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-minecraft">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-6 md:p-12">
      
      {/* 🔙 Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
      </Link>

      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* 🏷️ Header */}
        <div>
          <h1 className="text-4xl font-minecraft text-white mb-2">World Settings</h1>
          <p className="text-zinc-500 text-sm">Manage your world, invite friends, and configure permissions.</p>
        </div>

        {/* ✏️ SECTION 1: General Settings (Rename) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-[#5b8731]">01.</span> General
          </h2>
          
          <form action={renameWorld} className="flex gap-4 items-end">
            <input type="hidden" name="worldId" value={worldId} />
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">World Name</label>
              <input 
                name="newName"
                defaultValue={world.name}
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5b8731] transition-colors font-minecraft"
              />
            </div>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-zinc-200 transition-all active:scale-95">
              Save
            </button>
          </form>
        </section>

        {/* 👥 SECTION 2: Members (Invite & Kick) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-[#5b8731]">02.</span> Members
            </h2>
            <Link href={`/dashboard/invite/${worldId}`}>
               <button className="text-sm bg-[#5b8731]/10 text-[#5b8731] border border-[#5b8731]/20 px-3 py-1.5 rounded-md hover:bg-[#5b8731]/20 transition-colors">
                 + Invite New
               </button>
            </Link>
          </div>

          <div className="space-y-3">
            {world.members.map((member) => (
              <div key={member.id} className="flex justify-between items-center p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border-2 ${member.role === 'owner' ? 'bg-[#5b8731]/20 border-[#5b8731] text-[#5b8731]' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                    {member.role === 'owner' ? 'OP' : 'PL'}
                  </div>
                  <div>
                    <p className="text-sm text-white font-minecraft">
                      {member.userId === userId ? "You" : "Player"} 
                      <span className="text-zinc-600 ml-2 font-sans text-xs uppercase tracking-widest">{member.role}</span>
                    </p> 
                    <p className="text-[10px] text-zinc-600 font-mono truncate max-w-37.5">{member.userId}</p>
                  </div>
                </div>

                {member.userId !== userId && (
                  <form action={kickMember}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <button className="text-zinc-500 hover:text-red-500 text-xs font-bold uppercase tracking-tighter transition-colors px-3 py-1 border border-zinc-800 rounded hover:border-red-500/30">
                      Kick
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ⚠️ SECTION 3: Danger Zone */}
        <section className="border border-red-900/30 bg-red-950/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2 text-red-500 flex items-center gap-2">
            Danger Zone
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Deleting a world is permanent. All associated tasks and plans will be deleted from the server.
          </p>

          <form action={deletePlan} className="flex justify-end">
            <input type="hidden" name="id" value={worldId} />
            <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2 group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Delete World
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}