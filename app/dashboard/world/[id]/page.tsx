import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { worlds, tasks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import WorldClientUI from "@/components/WorldClientUI"; // This takes over the layout!

export default async function WorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worldId = parseInt(id);
  const { userId } = await auth();

  if (!userId) redirect("/");

  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
    with: { members: true }
  });

  if (!world) redirect("/dashboard");
  const member = world.members.find((m) => m.userId === userId);
  if (!member) redirect("/dashboard");

  const worldTasks = await db.query.tasks.findMany({
    where: eq(tasks.worldId, worldId),
    orderBy: [asc(tasks.position), asc(tasks.createdAt)],
  });

  const client = await clerkClient();
  const memberIds = world.members.map(m => m.userId);
  
  // Convert the Map to a plain object to safely pass it to the Client Component
  let userMapObj: Record<string, any> = {};
  try {
    const clerkUsers = await client.users.getUserList({ userId: memberIds, limit: 100 });
    clerkUsers.data.forEach(u => userMapObj[u.id] = { name: u.username || u.firstName || "Miner", img: u.imageUrl });
  } catch (e) { console.error(e); }

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden selection:bg-white/20">
      <WorldClientUI 
        world={world} 
        member={member} 
        worldTasks={worldTasks} 
        userMapObj={userMapObj} 
        userId={userId} 
        worldId={worldId} 
      />
    </div>
  );
}