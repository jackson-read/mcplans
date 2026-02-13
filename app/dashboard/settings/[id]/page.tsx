import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, members } from "@/db/schema"; // 'plans' is the table for worlds
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { deletePlan, kickMember, renameWorld } from "@/app/actions"; // We will create these actions next!

export default async function SettingsPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const worldId = parseInt(params.id);
  if (isNaN(worldId)) redirect("/dashboard");

  // 1. Fetch World & Verify Ownership
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: {
      members: true, // Get the list of players
    }
  });

  // If world doesn't exist OR user is not the owner -> Kick them out
  const userMember = world?.members.find(m => m.userId === userId);
  if (!world || userMember?.role !== 'owner') {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-6 md:p-12">
      
      {/* 🔙 Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
        <span>&larr;</span> Back to Dashboard
      </Link>

      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* 🏷️ Header */}
        <div>
          <h1 className="text-4xl font-minecraft text-white mb-2">World Settings</h1>
          <p className="text-zinc-500">Manage your world, invite friends, and configure permissions.</p>
        </div>

        {/* ✏️ SECTION 1: General Settings (Rename) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-[#5b8731]">01.</span> General
          </h2>
          
          <form action={renameWorld} className="flex gap-4 items-end">
            <input type="hidden" name="worldId" value={worldId} />
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">World Name</label>
              <input 
                name="newName"
                defaultValue={world.name}
                required
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5b8731] transition-colors font-minecraft"
              />
            </div>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors">
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
            {/* Invite Button */}
            <Link href={`/dashboard/invite/${worldId}`}>
               <button className="text-sm bg-[#5b8731]/10 text-[#5b8731] border border-[#5b8731]/20 px-3 py-1.5 rounded-md hover:bg-[#5b8731]/20 transition-colors">
                 + Invite New
               </button>
            </Link>
          </div>

          <div className="space-y-3">
            {world.members.map((member) => (
              <div key={member.id} className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  {/* Avatar Placeholder */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.role === 'owner' ? 'bg-[#5b8731] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {member.role === 'owner' ? 'OP' : 'PL'}
                  </div>
                  <div>
                    {/* In a real app, you'd fetch the User's name from Clerk here. For now, we show ID or role */}
                    <p className="text-sm text-white font-medium">Player ({member.role})</p> 
                    <p className="text-xs text-zinc-600 font-mono">{member.userId.slice(0, 12)}...</p>
                  </div>
                </div>

                {/* Kick Button (Cannot kick yourself) */}
                {member.userId !== userId && (
                  <form action={kickMember}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <button className="text-zinc-500 hover:text-red-500 text-sm font-medium transition-colors px-3 py-1">
                      Kick
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ⚠️ SECTION 3: Danger Zone */}
        <section className="border border-red-900/30 bg-red-950/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2 text-red-500 flex items-center gap-2">
            Danger Zone
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Once you delete a world, there is no going back. All plans and builds will be lost forever.
          </p>

          <form action={deletePlan} className="flex justify-end">
            <input type="hidden" name="id" value={worldId} />
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              Delete World
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}