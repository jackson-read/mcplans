import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { deletePlan, acceptInvite, declineInvite } from "@/app/actions";

export default async function DashboardPage() {
  // 1. Get the session, but don't just 'wait'—force a check
  const { userId } = await auth();

  // 2. If the user isn't found immediately, show a simple message
  // instead of letting the database queries fail and break the UI.
  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500 font-bold animate-pulse">
          Authenticating with the Server...
        </p>
      </div>
    );
  }

  // 3. Now that we definitely have a userId, run the queries
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

  const styles = {
    pageContainer: "p-8 max-w-5xl mx-auto",
    header: "flex justify-between items-center mb-12",
    title: "text-3xl font-bold tracking-tight",
    
    // The Invite Alert Box
    inviteBox: "mb-10 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl dark:bg-amber-900/10 dark:border-amber-900/30",
    
    // The 'Create New' Card
    createCard: "p-8 border-2 border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-900/50",
    createButton: "mt-4 px-6 py-3 bg-black text-white rounded-xl font-medium hover:scale-105 active:scale-95 transition-all dark:bg-white dark:text-black",
    
    // The World List Grid
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    worldCard: "p-6 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800",
    cardTitle: "text-xl font-bold mb-1",
    cardRole: "text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-6",
    deleteBtn: "text-red-500 text-sm hover:underline cursor-pointer",
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Worlds</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* 📬 PENDING INVITES SECTION */}
      {pendingInvites.length > 0 && (
        <div className={styles.inviteBox}>
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-4">📬 You've been invited!</h2>
          <div className="grid gap-3">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm dark:bg-zinc-800">
                <span className="font-bold">{invite.world.name}</span>
                <div className="flex gap-2">
                  <form action={acceptInvite}>
                    <input type="hidden" name="memberId" value={invite.id} />
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Accept</button>
                  </form>
                  <form action={declineInvite}>
                    <input type="hidden" name="memberId" value={invite.id} />
                    <button className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-300">Decline</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {/* Create New Card */}
        <div className={styles.createCard}>
          <h2 className="text-lg font-semibold">Start a New Journey</h2>
          <Link href="/dashboard/new">
            <button className={styles.createButton}>+ Create World</button>
          </Link>
        </div>

        {/* Accepted World List */}
        {myWorlds.map((entry) => (
          <div key={entry.id} className={styles.worldCard}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={styles.cardTitle}>{entry.world.name}</h3>
                <p className={styles.cardRole}>{entry.role}</p> 
              </div>
              {entry.role === 'owner' && (
                <form action={deletePlan}>
                  <input type="hidden" name="id" value={entry.world.id} />
                  <button type="submit" className={styles.deleteBtn}>Delete</button>
                </form>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Link href={`/dashboard/invite/${entry.world.id}`} className="flex-1">
                <button className="w-full text-sm py-2 bg-zinc-100 rounded-lg text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400">
                  Invite ✉️
                </button>
              </Link>
              <Link href={`/dashboard/world/${entry.world.id}`} className="flex-1">
                <button className="w-full text-sm py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enter &rarr;
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}