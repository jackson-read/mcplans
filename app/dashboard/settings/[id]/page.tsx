import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { worlds } from "@/db/schema";
import { eq } from "drizzle-orm";

// ⚠️ Note the Type Change: params is now a Promise!
export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Await the params (Next.js 15 Fix)
  const { id } = await params;
  const worldId = parseInt(id);

  const { userId } = await auth();

  // 2. Safe Database Fetch
  let world = null;
  let errorMsg = null;

  try {
    world = await db.query.worlds.findFirst({
      where: eq(worlds.id, worldId),
      with: { members: true }
    });
  } catch (e: any) {
    errorMsg = e.message;
  }

  // 3. Render the "X-Ray" View
  return (
    <div className="min-h-screen bg-black text-white p-12 font-mono">
      <h1 className="text-3xl text-green-500 mb-8 border-b border-green-900 pb-4">
        🔍 DIAGNOSTIC MODE (Next.js 15 Fixed)
      </h1>

      <div className="space-y-6 max-w-2xl">
        
        {/* User Check */}
        <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
          <p className="text-zinc-500 mb-1">CURRENT USER ID</p>
          <code className="text-blue-400 block break-all">{userId || "NOT LOGGED IN"}</code>
        </div>

        {/* World ID Check */}
        <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
           <p className="text-zinc-500 mb-1">TARGET WORLD ID</p>
           {/* If this shows a number now, we are winning! */}
           <code className="text-yellow-400 block">{isNaN(worldId) ? "NaN (STILL BROKEN)" : worldId}</code>
        </div>

        {/* Database Result */}
        <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
          <p className="text-zinc-500 mb-1">DATABASE FETCH STATUS</p>
          {errorMsg ? (
            <p className="text-red-500 font-bold">CRASHED: {errorMsg}</p>
          ) : !world ? (
             <p className="text-red-500 font-bold">SUCCESS, BUT WORLD NOT FOUND (Result is null)</p>
          ) : (
             <div className="space-y-2">
                <p className="text-green-500 font-bold">SUCCESS - DATA FOUND</p>
                <p>World Name: <span className="text-white">{world.name}</span></p>
                <p>Owner ID in DB: <span className={`break-all ${world.ownerId === userId ? "text-green-400" : "text-red-500"}`}>{world.ownerId || "NULL/EMPTY"}</span></p>
                <p>Member Count: <span className="text-white">{world.members.length}</span></p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}