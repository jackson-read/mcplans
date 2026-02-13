export const dynamic = "force-dynamic"; // 1. FORCE NEW DATA
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { deletePlan, acceptInvite, declineInvite } from "@/app/actions";

export default async function DashboardPage() {
  const { userId } = await auth();

  // 2. DEBUG STRIP: This prints your ID on the screen so we know if Auth is working
  if (!userId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-4">
        <h1 className="text-4xl font-bold text-red-500">SESSION LOST</h1>
        <p>UserId is null. Middleware did not restore session.</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 rounded">Go Home & Sign In</Link>
      </div>
    );
  }

  // 3. Fetch Data
  const [myWorlds, pendingInvites] = await Promise.all([
    db.query.members.findMany({
      where: and(eq(members.userId, userId), eq(members.status, "accepted")),
      with: { world: true },
    }),
    db.query.members.findMany({
      where: and(eq(members.userId, userId), eq(members.status, "pending")),
      with: { world: true },
    })
  ]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto font-sans">
      {/* --- DEBUG STRIP (REMOVE LATER) --- */}
      <div className="bg-red-900/50 border border-red-500 p-2 mb-8 text-xs text-red-200 font-mono text-center rounded">
        DEBUG MODE v3.0 | UserID: {userId} | Worlds Found: {myWorlds.length}
      </div>
      {/* ---------------------------------- */}

      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Your Worlds</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Invites */}
      {pendingInvites.length > 0 && (
         <div className="mb-10 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-yellow-800">
           <h2 className="font-bold">📬 Pending Invites: {pendingInvites.length}</h2>
           {pendingInvites.map(i => (
             <div key={i.id} className="flex gap-2 mt-2">
               <span>{i.world.name}</span>
               <form action={acceptInvite}><input type="hidden" name="memberId" value={i.id}/><button className="bg-green-500 text-white px-2 rounded">Accept</button></form>
             </div>
           ))}
         </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
          <Link href="/dashboard/new"><button className="font-bold">+ Create World</button></Link>
        </div>

        {myWorlds.length > 0 ? myWorlds.map((entry) => (
          <div key={entry.id} className="p-6 border rounded-xl shadow-sm bg-white dark:bg-zinc-800 dark:border-zinc-700">
            <h3 className="text-xl font-bold">{entry.world.name}</h3>
            <p className="text-sm text-gray-500 uppercase">{entry.role}</p>
            <div className="flex gap-2 mt-4">
              <Link href={`/dashboard/world/${entry.world.id}`}><button className="bg-blue-600 text-white px-3 py-1 rounded">Enter</button></Link>
              {entry.role === 'owner' && (
                 <form action={deletePlan}><input type="hidden" name="id" value={entry.world.id}/><button className="text-red-500 text-sm">Delete</button></form>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-2 p-10 text-center border bg-gray-50 rounded">
            <p className="font-bold text-gray-500">No worlds found in DB for this user.</p>
          </div>
        )}
      </div>
    </div>
  );
}