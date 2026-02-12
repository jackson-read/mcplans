import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema"; // We fetch from members now!
import { eq } from "drizzle-orm";
import Link from "next/link";
import { deletePlan } from "@/app/actions";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  // LOGIC: Find all worlds where YOU are a member
  // We use .query.members.findMany to get the member record + the connected world data
  const myWorlds = await db.query.members.findMany({
    where: eq(members.userId, userId!),
    with: {
      world: true, // Join with the worlds table to get the name
    },
  });

  // --- STYLING VARIABLES (Tweak these!) ---
  const styles = {
    pageContainer: "p-8 max-w-5xl mx-auto",
    header: "flex justify-between items-center mb-12",
    title: "text-3xl font-bold tracking-tight",
    
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
  // ----------------------------------------

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your Worlds</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className={styles.grid}>
        {/* 1. The 'Create New' Button is now a Card in the grid */}
        <div className={styles.createCard}>
          <h2 className="text-lg font-semibold">Start a New Journey</h2>
          <Link href="/dashboard/new">
            <button className={styles.createButton}>
              + Create World
            </button>
          </Link>
        </div>

        {/* 2. The List of Worlds */}
        {myWorlds.map((entry) => (
          <div key={entry.id} className={styles.worldCard}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className={styles.cardTitle}>{entry.world.name}</h3>
                <p className={styles.cardRole}>{entry.role}</p> 
              </div>
              
              {/* Only Owners see the Delete button */}
              {entry.role === 'owner' && (
                <form action={deletePlan}>
                  <input type="hidden" name="id" value={entry.world.id} />
                  <button type="submit" className={styles.deleteBtn}>
                    Delete
                  </button>
                </form>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
                    <Link href={`/dashboard/invite/${entry.world.id}`}>
                        <button className="text-sm px-3 py-1.5 bg-zinc-100 rounded-lg text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400">
                            Invite Friend ✉️
                        </button>
                    </Link>
                    <Link href={`/dashboard/world/${entry.world.id}`}>
               <button className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                 Enter World &rarr;
               </button>
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}