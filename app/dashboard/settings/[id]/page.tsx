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
  if (isNaN(worldId)) return <div className="p-10 text-white">Invalid World ID</div>;

  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  // 🛡️ THE BYPASS: If there's an issue, show an info card instead of redirecting
  if (!world || world.ownerId !== userId) {
    return (
      <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center">
        <div className="max-w-md p-8 bg-zinc-900 border-2 border-red-500 rounded-2xl shadow-2xl font-mono">
          <h1 className="text-red-500 text-2xl mb-6 font-minecraft">SECURITY LOG</h1>
          <div className="space-y-4 text-xs">
            <p className="text-zinc-500">USER_ID: <span className="text-white">{userId}</span></p>
            <p className="text-zinc-500">WORLD_OWNER_ID: <span className="text-yellow-500">{world?.ownerId || "UNDEFINED/NULL"}</span></p>
            <hr className="border-zinc-800" />
            <p className="text-red-400">STATUS: Access Denied. The database does not recognize you as the creator of this world.</p>
            <p className="text-zinc-400 mt-4 italic">Note: Worlds created before today might have an empty 'ownerId' field.</p>
          </div>
          <Link href="/dashboard" className="mt-8 block text-center py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors">
             BACK TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  // --- REST OF YOUR ACTUAL PAGE CODE BELOW ---
  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans p-6 md:p-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
      </Link>
      <div className="max-w-3xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-minecraft text-white mb-2">World Settings</h1>
          <p className="text-zinc-500 text-sm">Manage your world, invite friends, and configure permissions.</p>
        </div>
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="text-[#5b8731]">01.</span> General</h2>
          <form action={renameWorld} className="flex gap-4 items-end">
            <input type="hidden" name="worldId" value={worldId} />
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">World Name</label>
              <input name="newName" defaultValue={world.name} required className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5b8731] transition-colors font-minecraft" />
            </div>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-zinc-200 transition-all active:scale-95">Save</button>
          </form>
        </section>
        {/* ... Rest of Member/Danger sections ... */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
           <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
           <form action={deletePlan}>
             <input type="hidden" name="id" value={worldId} />
             <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Delete World</button>
           </form>
        </section>
      </div>
    </div>
  );
}