"use client";

import { useState } from "react";
import { updateBiome } from "@/app/actions";

// 🎨 DEFINING THE THEMES
const BIOMES = [
  { 
    id: "plains", 
    name: "Plains", 
    bg: "bg-[#71c352]", 
    border: "border-[#4e8c36]", 
    text: "text-[#2f5e1e]", 
    accent: "bg-[#4e8c36]",
    desc: "Classic grass & flowers." 
  },
  { 
    id: "cherry", 
    name: "Cherry Blossom", 
    bg: "bg-[#ffb5d4]", 
    border: "border-[#d17da1]", 
    text: "text-[#9e4770]", 
    accent: "bg-[#d17da1]",
    desc: "Pink petals & blue sky." 
  },
  { 
    id: "ocean", 
    name: "Ocean", 
    bg: "bg-[#4b8b8b]", 
    border: "border-[#2d5d5d]", 
    text: "text-[#1a3838]", 
    accent: "bg-[#2d5d5d]",
    desc: "Deep blue & fish." 
  },
  { 
    id: "spruce", 
    name: "Spruce Forest", 
    bg: "bg-[#584633]", 
    border: "border-[#3b2e22]", 
    text: "text-[#261d14]", 
    accent: "bg-[#3b2e22]",
    desc: "Podzol & tall pines." 
  },
  { 
    id: "cave", 
    name: "Lush Cave", 
    bg: "bg-[#475c2e]", 
    border: "border-[#7d8c4d]", 
    text: "text-[#2e3d1b]", 
    accent: "bg-[#7d8c4d]",
    desc: "Clay, moss & glow berries." 
  },
  { 
    id: "nether", 
    name: "The Nether", 
    bg: "bg-[#4d1616]", 
    border: "border-[#852323]", 
    text: "text-[#3d0b0b]", 
    accent: "bg-[#852323]",
    desc: "Lava & fortresses." 
  },
  { 
    id: "end", 
    name: "The End", 
    bg: "bg-[#ebe6c5]", 
    border: "border-[#2b204a]", 
    text: "text-[#1a1230]", 
    accent: "bg-[#2b204a]",
    desc: "End stone & void." 
  },
];

export default function BiomePicker({ currentBiome, worldId }: { currentBiome: string, worldId: number }) {
  const [selected, setSelected] = useState(currentBiome);
  
  // Find the full object for the selected biome (fallback to plains)
  const activeTheme = BIOMES.find(b => b.id === selected) || BIOMES[0];

  return (
    <section className="bg-[#1a1a1a] border-4 border-[#555] p-6 shadow-[8px_8px_0_#000] relative overflow-hidden flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-[#333] pb-4">
        <div>
          <h2 className="text-xl font-minecraft text-[#ccc] flex items-center gap-2">
            <span className="text-[#888]">#</span> World Theme
          </h2>
          <p className="text-xs text-[#666] font-minecraft mt-1">Select a biome to change the dashboard appearance.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-100">
        
        {/* 🎨 LEFT: The Scrollable Grid */}
        <div className="w-full lg:w-1/3 overflow-y-auto pr-2 grid grid-cols-2 gap-3 content-start custom-scrollbar">
          {BIOMES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(b.id)}
              className={`
                relative h-20 border-4 transition-all flex items-center justify-center overflow-hidden group
                ${selected === b.id 
                  ? 'border-white opacity-100 ring-2 ring-white/50 z-10' 
                  : 'border-[#333] opacity-50 hover:opacity-100 hover:border-[#666]'
                }
                ${b.bg}
              `}
            >
              {/* Noise Texture Overlay */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E")` }} 
              />
              <span className="relative z-10 font-minecraft text-white text-[10px] font-bold drop-shadow-md uppercase tracking-wide text-center">{b.name}</span>
            </button>
          ))}
        </div>

        {/* 🖥️ RIGHT: The "Mini Dashboard" Preview */}
        <div className="flex-1 bg-[#111] border-4 border-[#333] relative rounded-lg overflow-hidden flex flex-col shadow-inner">
          
          {/* 1. App Background Pattern (Static) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}>
          </div>

          {/* 2. Mini Header */}
          <div className="h-12 border-b-2 border-[#333] flex items-center px-4 justify-between bg-black/20 relative z-10">
             <div className="flex gap-2 items-center">
                <div className={`w-6 h-6 rounded border-2 ${activeTheme.border} ${activeTheme.bg} opacity-80`} />
                <div className="w-24 h-3 bg-[#333] rounded" />
             </div>
             <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[#333]" />
             </div>
          </div>

          {/* 3. Mini Content Area */}
          <div className="p-6 flex gap-4 relative z-10 h-full">
             
             {/* Column 1: Active Tasks */}
             <div className="flex-1 flex flex-col gap-3">
                <div className="w-16 h-2 bg-[#333] rounded mb-1" />
                
                {/* ✨ MINI TASK CARD 1 */}
                <div className={`${activeTheme.bg} border-2 ${activeTheme.border} p-3 rounded shadow-md transform transition-all duration-300`}>
                   <div className="flex justify-between items-start mb-2">
                      <div className="w-4 h-4 bg-black/20 rounded-sm border border-black/10" />
                      <div className={`w-2 h-2 rounded-full ${activeTheme.text} bg-current opacity-50`} />
                   </div>
                   <div className={`w-3/4 h-2 bg-black/20 rounded mb-1`} />
                   <div className={`w-1/2 h-2 bg-black/10 rounded`} />
                </div>

                {/* ✨ MINI TASK CARD 2 */}
                <div className={`${activeTheme.bg} border-2 ${activeTheme.border} p-3 rounded shadow-md opacity-90 transform translate-y-1`}>
                   <div className="flex justify-between items-start mb-2">
                      <div className="w-4 h-4 bg-black/20 rounded-sm border border-black/10" />
                   </div>
                   <div className={`w-full h-2 bg-black/20 rounded`} />
                </div>

             </div>

             {/* Column 2: Completed (Faded) */}
             <div className="flex-1 flex flex-col gap-3 opacity-50">
                <div className="w-20 h-2 bg-[#333] rounded mb-1" />
                <div className="bg-[#222] border-2 border-[#333] p-3 rounded shadow-sm">
                   <div className="w-full h-2 bg-[#333] rounded mb-2" />
                   <div className="w-1/2 h-2 bg-[#333] rounded" />
                </div>
             </div>

          </div>

          {/* Floating Action Button Mockup */}
          <div className={`absolute bottom-6 right-6 w-10 h-10 rounded-full ${activeTheme.bg} border-2 ${activeTheme.border} shadow-lg flex items-center justify-center text-white font-bold`}>
             +
          </div>

        </div>

      </div>

      {/* 💾 Footer Actions */}
      <div className="border-t-2 border-[#333] pt-4 flex justify-between items-center">
         <p className="text-xs text-[#555] font-minecraft hidden md:block">
           Previewing: <span className="text-[#888]">{activeTheme.desc}</span>
         </p>
         <form action={updateBiome}>
            <input type="hidden" name="worldId" value={worldId} />
            <input type="hidden" name="biome" value={selected} />
            <button className="bg-[#ccc] hover:bg-white text-black font-minecraft font-bold px-8 py-3 border-b-4 border-[#888] active:border-b-0 active:translate-y-1 active:mt-1 transition-all">
               APPLY THEME
            </button>
         </form>
      </div>

    </section>
  );
}