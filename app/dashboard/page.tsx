export const dynamic = "force-dynamic";
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

  // 1. Loading State (Instead of "Session Lost")
  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-bold animate-pulse">Loading World Data...</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Data
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
    <div className="min-h-screen p-8 max-w-5xl mx-auto font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight">Your Worlds</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* 📬 Pending Invites */}
      {pendingInvites.length > 0 && (
         <div className="mb-10 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl dark:bg-amber-900/10">
           <h2 className="font-bold text-amber-800 dark:text-amber-400 mb-4">📬 Pending Invites</h2>
           <div className="grid gap-3">
             {pendingInvites.map(i => (
               <div key={i.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm">
                 <span className="font-medium">{i.world.name}</span>
                 <div className="flex gap-2">
                   <form action={acceptInvite}>
                     <input type="hidden" name="memberId" value={i.id}/>
                     <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Accept</button>
                   </form>
                   <form action={declineInvite}>
                     <input type="hidden" name="memberId" value={i.id}/>
                     <button className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Decline</button>
                   </form>
                 </div>
               </div>
             ))}
           </div>
         </div>
      )}

      {/* 🌍 World Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card */}
        <Link href="/dashboard/new" className="group">
          <div className="h-full p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</span>
            <span className="font-bold">Create World</span>
          </div>
        </Link>

        {/* Existing Worlds */}
        {myWorlds.map((entry) => (
          <div key={entry.id} className="flex flex-col justify-between p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold truncate">{entry.world.name}</h3>
                {entry.role === 'owner' && (
                   <form action={deletePlan}>
                     <input type="hidden" name="id" value={entry.world.id}/>
                     <button className="text-red-500 hover:text-red-600 text-xs font-bold uppercase tracking-wider">Delete</button>
                   </form>
                )}
              </div>
              <span className="inline-block px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold rounded uppercase tracking-wide text-zinc-500 mb-6">
                {entry.role}
              </span>
            </div>
            
            <div className="flex gap-3 mt-auto">
              <Link href={`/dashboard/invite/${entry.world.id}`} className="flex-1">
                <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors">Invite</button>
              </Link>
              <Link href={`/dashboard/world/${entry.world.id}`} className="flex-1">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">Enter &rarr;</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {myWorlds.length === 0 && (
        <div className="col-span-full mt-10 text-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl">
          <p className="text-zinc-500">You don't have any worlds yet. Click "Create World" to start!</p>
        </div>
      )}
    </div>
  );
}