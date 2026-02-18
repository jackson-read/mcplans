"use client";

import { useState } from "react";
import { deletePlan } from "@/app/actions"; // Import your server action

export default function DeleteWorldSection({ worldId }: { worldId: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <section className="bg-[#1a0505] border-4 border-[#aa0000] p-6 shadow-[8px_8px_0_#000] opacity-80 hover:opacity-100 transition-opacity">
      <h2 className="text-xl font-minecraft text-[#ff5555] mb-2 flex items-center gap-2">
        <span>🧨</span> Danger Zone
      </h2>
      <p className="text-[#aa5555] font-minecraft text-xs mb-6">
        Deleting a world is permanent. But you can always make another one.
      </p>

      <div className="flex justify-end h-14 items-center">
        {!isDeleting ? (
          // 🟢 STATE 1: Normal Button
          <button 
            onClick={() => setIsDeleting(true)}
            className="bg-[#aa0000] hover:bg-[#ff5555] text-white font-minecraft px-6 py-3 border-b-4 border-[#660000] active:border-b-0 active:translate-y-1 active:mt-1 transition-all flex items-center gap-2 group"
          >
            <span className="group-hover:animate-pulse">⚠</span> DELETE WORLD
          </button>
        ) : (
          // 🔴 STATE 2: Confirmation Box
          <div className="flex items-center gap-4 bg-[#2a0a0a] p-2 border-2 border-[#ff5555] animate-in fade-in slide-in-from-right-4 duration-200">
            <span className="text-[#ff5555] font-minecraft text-xs animate-pulse">
              ARE YOU SURE?
            </span>
            
            <form action={deletePlan}>
              <input type="hidden" name="id" value={worldId} />
              <button className="bg-[#ff0000] hover:bg-[#ff4444] text-white font-minecraft text-xs px-3 py-2 border-b-4 border-[#880000] active:border-b-0 active:translate-y-1 active:mt-1">
                YES, DELETE IT
              </button>
            </form>

            <button 
              onClick={() => setIsDeleting(false)}
              className="text-[#aaaaaa] hover:text-white font-minecraft text-xs hover:underline px-2"
            >
              CANCEL
            </button>
          </div>
        )}
      </div>
    </section>
  );
}