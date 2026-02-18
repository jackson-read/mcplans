"use client";

import { useState } from "react";
import { updateBiome } from "@/app/actions";

// The data moves here so the client can use it
const BIOMES = [
  { id: "plains", name: "Plains", bg: "bg-[#71c352]", border: "border-[#4e8c36]", text: "text-[#2f5e1e]", desc: "Classic grass & flowers." },
  { id: "cherry", name: "Cherry Blossom", bg: "bg-[#ffb5d4]", border: "border-[#d17da1]", text: "text-[#9e4770]", desc: "Pink petals & blue sky." },
  { id: "ocean", name: "Ocean", bg: "bg-[#4b8b8b]", border: "border-[#2d5d5d]", text: "text-[#1a3838]", desc: "Deep blue & fish." },
  { id: "spruce", name: "Spruce Forest", bg: "bg-[#584633]", border: "border-[#3b2e22]", text: "text-[#261d14]", desc: "Podzol & tall pines." },
  { id: "cave", name: "Lush Cave", bg: "bg-[#475c2e]", border: "border-[#7d8c4d]", text: "text-[#2e3d1b]", desc: "Clay, moss & glow berries." },
  { id: "nether", name: "The Nether", bg: "bg-[#4d1616]", border: "border-[#852323]", text: "text-[#3d0b0b]", desc: "Lava & fortresses." },
  { id: "end", name: "The End", bg: "bg-[#ebe6c5]", border: "border-[#2b204a]", text: "text-[#1a1230]", desc: "End stone & void." },
];

export default function BiomePicker({ currentBiome, worldId }: { currentBiome: string, worldId: number }) {
  const [selected, setSelected] = useState(currentBiome);
  
  // Find the full object for the selected biome (fallback to plains)
  const activeTheme = BIOMES.find(b => b.id === selected) || BIOMES[0];

  return (
    <section className="bg-[#1a1a1a] border-4 border-[#555] p-6 shadow-[8px_8px_0_#000] relative overflow-hidden">
      <h2 className="text-xl font-minecraft text-[#ccc] mb-6 flex items-center gap-2 relative z-10">
        <span className="text-[#888]">#</span> World Theme
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 🎨 LEFT: The Grid of Choices */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
          {BIOMES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(b.id)}
              className={`
                relative h-24 border-4 transition-all text-left p-2 flex flex-col justify-end overflow-hidden group
                ${selected === b.id 
                  ? 'border-white scale-105 z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'border-[#333] opacity-60 hover:opacity-100 hover:border-[#666]'
                }
                ${b.bg}
              `}
            >
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <span className="relative z-10 font-minecraft text-white text-xs font-bold drop-shadow-md">{b.name}</span>
            </button>
          ))}
        </div>

        {/* 🖼️ RIGHT: The Live Preview */}
        <div className="w-full lg:w-64 shrink-0">
          <p className="text-[10px] uppercase text-[#888] font-bold mb-2 font-minecraft">Live Preview</p>
          
          {/* The Fake Dashboard Card */}
          <div className={`w-full aspect-square rounded-lg p-4 flex flex-col gap-3 transition-colors duration-300 ${activeTheme.bg} border-4 ${activeTheme.border}`}>
             <div className="h-4 w-1/2 bg-black/20 rounded-sm" />
             
             {/* A Fake Task */}
             <div className="bg-white/90 p-2 rounded shadow-sm border-l-4 border-black/20">
               <div className="h-2 w-3/4 bg-black/20 rounded-sm mb-1" />
               <div className="h-2 w-1/2 bg-black/10 rounded-sm" />
             </div>

             <div className="mt-auto text-center">
               <span className={`text-xs font-minecraft font-bold ${activeTheme.text} bg-white/50 px-2 py-1 rounded`}>
                 {activeTheme.name}
               </span>
             </div>
          </div>
        </div>

      </div>

      {/* 💾 The Real Save Button */}
      <form action={updateBiome} className="mt-8 flex justify-end">
        <input type="hidden" name="worldId" value={worldId} />
        <input type="hidden" name="biome" value={selected} />
        <button className="bg-[#ccc] hover:bg-white text-black font-minecraft font-bold px-8 py-3 border-b-4 border-[#888] active:border-b-0 active:translate-y-1 active:mt-1 transition-all">
          SAVE THEME
        </button>
      </form>
    </section>
  );
}