export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();

  // If NOT logged in, let Middleware handle it or show a basic "Access Denied"
  if (!userId) return <div>Access Denied. Please Sign In.</div>;

  const [myWorlds] = await Promise.all([
    db.query.members.findMany({
      where: and(eq(members.userId, userId), eq(members.status, "accepted")),
      with: { world: true },
    }),
  ]);

  const btnBase = "relative inline-flex items-center justify-center px-4 py-2 text-lg text-white border-2 border-b-4 active:border-b-2 active:translate-y-1 transition-all font-minecraft shadow-sm";
  const btnStone = `${btnBase} bg-[#767676] border-t-[#d0d1d4] border-l-[#d0d1d4] border-r-[#3a3a3a] border-b-[#282828] hover:bg-[#8a8a8a]`;
  const btnGreen = `${btnBase} bg-[#5b8731] border-t-[#7ecb46] border-l-[#7ecb46] border-r-[#3e6826] border-b-[#2f4f1d] hover:bg-[#4a6e28]`;

  return (
    <div className="min-h-screen p-8 font-minecraft bg-[#1e1e1e] text-white">
      <div className="max-w-5xl mx-auto bg-[#c6c6c6] border-4 border-black p-2 shadow-2xl">
        <div className="bg-[#c6c6c6] border-t-4 border-l-4 border-white border-b-4 border-r-4 p-6 min-h-[80vh]">
          
          <header className="flex justify-between items-end mb-8 border-b-2 border-[#555555] pb-4">
            <div>
              <h1 className="text-4xl text-[#404040] drop-shadow-sm">Your Worlds</h1>
              <p className="text-[#555555]">Select a world to enter</p>
            </div>
            <div className="border-2 border-[#555555] bg-[#8b8b8b] p-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard/new" className="group">
              <div className="h-40 bg-[#8b8b8b] border-t-4 border-l-4 border-b-4 border-r-4 border-white p-6 flex flex-col items-center justify-center hover:bg-[#9c9c9c] transition-colors relative">
                <span className="text-6xl text-[#ffffff] opacity-50">+</span>
                <span className="text-[#e0e0e0] mt-2">Create New</span>
              </div>
            </Link>

            {myWorlds.map((entry) => (
              <div key={entry.id} className="h-40 bg-[#8b8b8b] border-t-4 border-l-4 border-b-4 border-r-4 border-white p-4 flex flex-col justify-between hover:bg-[#9c9c9c] transition-colors relative">
                <h3 className="text-2xl text-white drop-shadow-md truncate">{entry.world.name}</h3>
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/world/${entry.world.id}`}>
                    <button className={`${btnGreen} text-sm py-1 px-4`}>PLAY &rarr;</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}