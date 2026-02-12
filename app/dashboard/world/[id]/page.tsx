import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { tasks, members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createTask, removeMember } from "@/app/actions";
import Link from "next/link";
import Wheel from "@/components/Wheel";
import { clerkClient } from "@clerk/nextjs/server";
import TaskArea from "@/components/TaskArea";

export default async function WorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worldId = Number(id);
  const { userId } = await auth();

  // 1. Fetch the Tasks for this world
  const worldTasks = await db.select().from(tasks).where(eq(tasks.worldId, worldId));

  // 2. Fetch and translate Members
  const allMembers = await db.select().from(members).where(eq(members.worldId, worldId));
  const client = await clerkClient();
  
  const memberDetails = await Promise.all(
    allMembers.map(async (m) => {
      const user = await client.users.getUser(m.userId);
      return {
        id: m.id,
        userId: m.userId,
        username: user.username || "Unknown",
        role: m.role
      };
    })
  );

  // 3. Verify you are allowed here
  const memberCheck = await db.query.members.findFirst({
    where: and(eq(members.worldId, worldId), eq(members.userId, userId!))
  });
  
  if (!memberCheck) return <div className="p-8">Access Denied</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT SIDE: The To-Do List 📝 */}
      <div className="w-1/2 p-8 bg-zinc-50 border-r border-zinc-200 overflow-y-auto dark:bg-zinc-900 dark:border-zinc-800">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">&larr; Back</Link>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">World Tasks</h1>
        </div>

        {/* Member List 👥 */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-tighter text-zinc-400 mb-2">Players Online</h2>
          <div className="flex flex-wrap gap-2">
            {memberDetails.map((m) => (
              <div key={m.id} className="flex items-center gap-2 bg-zinc-200 px-3 py-1 rounded dark:bg-zinc-800 border-b-2 border-zinc-400 dark:border-zinc-950">
                <span className={`text-sm font-bold ${m.role === 'owner' ? 'text-yellow-600' : 'text-zinc-600 dark:text-zinc-300'}`}>
                  {m.username} {m.role === 'owner' && '👑'}
                </span>
                
                {(memberCheck.role === 'owner' || m.userId === userId) && m.role !== 'owner' && (
                  <form action={removeMember}>
                    <input type="hidden" name="membershipId" value={m.id} />
                    <input type="hidden" name="worldId" value={worldId} />
                    <button type="submit" className="text-red-500 hover:scale-125 transition-transform ml-1 leading-none font-black">×</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className="my-6 border-zinc-200 dark:border-zinc-800" />

        {/* The 'Add Task' Form */}
        <form action={createTask} className="mb-8 flex gap-2">
          <input type="hidden" name="worldId" value={worldId} />
          <input 
            name="description" 
            placeholder="Add a new task..." 
            className="flex-1 p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="bg-black text-white px-6 rounded-lg font-bold dark:bg-white dark:text-black hover:opacity-80 transition-opacity">
            Add
          </button>
        </form>

        {/* The List of Tasks (NOW HANDLED BY TASKAREA) */}
        <TaskArea initialTasks={worldTasks} worldId={worldId} />
      </div>

      {/* RIGHT SIDE: The Wheel 🎡 */}
      <div className="w-1/2 bg-blue-50 flex flex-col items-center justify-center dark:bg-zinc-950">
        <Wheel tasks={worldTasks} />
      </div>
    </div>
  );
}