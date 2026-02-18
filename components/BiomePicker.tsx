"use client";

import { useState } from "react";
import { updateBiome } from "@/app/actions";

// 🎨 1. THEME DEFINITIONS (Exact match to your real themes)
const BIOMES = [
  { 
    id: "plains", 
    name: "Plains", 
    cardBg: "bg-[#71c352]",      // Used for Task Cards
    border: "border-[#4e8c36]",  // Used for Borders
    text: "text-[#2f5e1e]",      // Used for Text
    desc: "Classic grass & flowers." 
  },
  { 
    id: "cherry", 
    name: "Cherry Blossom", 
    cardBg: "bg-[#ffb5d4]", 
    border: "border-[#d17da1]", 
    text: "text-[#9e4770]", 
    desc: "Pink petals & blue sky." 
  },
  { 
    id: "ocean", 
    name: "Ocean", 
    cardBg: "bg-[#4b8b8b]", 
    border: "border-[#2d5d5d]", 
    text: "text-[#1a3838]", 
    desc: "Deep blue & fish." 
  },
  { 
    id: "spruce", 
    name: "Spruce Forest", 
    cardBg: "bg-[#584633]", 
    border: "border-[#3b2e22]", 
    text: "text-[#261d14]", 
    desc: "Podzol & tall pines." 
  },
  { 
    id: "cave", 
    name: "Lush Cave", 
    cardBg: "bg-[#475c2e]", 
    border: "border-[#7d8c4d]", 
    text: "text-[#2e3d1b]", 
    desc: "Clay, moss & glow berries." 
  },
  { 
    id: "nether", 
    name: "The Nether", 
    cardBg: "bg-[#4d1616]", 
    border: "border-[#852323]", 
    text: "text-[#3d0b0b]", 
    desc: "Lava & fortresses." 
  },
  { 
    id: "end", 
    name: "The End", 
    cardBg: "bg-[#ebe6c5]", 
    border: "border-[#2b204a]", 
    text: "text-[#1a1230]", 
    desc: "End stone & void." 
  },
];

// 🖼️ 2. THE MOCK CARD (Visual Copy of SortableTask)
// This uses the exact same CSS classes as your real task cards
function MockTaskCard({ theme, task }: { theme: any, task: any }) {
  return (
    <div className={`
      relative group ${theme.cardBg} border-2 ${theme.border} p-3 shadow-md backdrop-blur-sm 
      flex flex-col gap-2 h-full
    `}>
      {/* Header: Checkbox & Delete */}
      <div className="flex items-start justify-between gap-2">
         <div className={`w-5 h-5 border-2 ${theme.border} bg-black/20 flex items-center justify-center rounded-sm`}>
            {task.isCompleted && <span className="text-white text-sm">✓</span>}
         </div>
         <span className="text-red-400 text-xs font-bold opacity-0 group-hover:opacity-100">X</span>
      </div>

      {/* Body: Description */}
      <div className="flex-1">
        <p className={`text-sm leading-tight ${theme.text} ${task.isCompleted ? "line-through opacity-50" : ""}`}>
          {task.description}
        </p>
        <p className={`text-[9px] opacity-50 mt-1 font-mono uppercase ${theme.text}`}>
          By {task.author}
        </p>
      </div>

      {/* Footer: Note */}
      <div className={`mt-auto pt-2 border-t ${theme.border} rounded p-1`}>
         <p className={`text-[9px] opacity-40 italic ${theme.text}`}>
            {task.note || "No notes."}
         </p>
      </div>
    </div>
  );
}

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
          <p className="text-xs text-[#666] font-minecraft mt-1">Select a biome to see it in action.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-112.5">
        
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
                ${b.cardBg}
              `}
            >
              {/* Noise Texture Overlay */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E")` }} 
              />
              <span className="relative z-10 font-minecraft text-white text-[10px] font-bold drop-shadow-md uppercase tracking-wide text-center">
                {b.name}
              </span>
            </button>
          ))}
        </div>

        {/* 🖥️ RIGHT: The "Real Page" Simulation */}
        <div className="flex-1 bg-[#111] border-4 border-[#333] relative rounded-lg overflow-hidden shadow-inner group">
          
          {/* 1. REAL BACKGROUND (Noise & Vignette) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0" 
               style={{ 
                 backgroundColor: "#0f0f0f",
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
               }}>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-0"></div>

          {/* 2. THE SCALED CONTENT CONTAINER 
              We use scale-[0.6] to shrink the "Real" UI to fit the box 
          */}
          <div className="w-[166%] h-[166%] origin-top-left transform scale-[0.6] p-8 flex flex-col gap-8 relative z-10 pointer-events-none select-none">
            
            {/* Fake Header */}
            <div className="flex justify-between items-center border-b-4 border-[#333] pb-6">
               <div>
                  <h1 className="text-4xl font-minecraft text-[#aaaaaa] mb-2 drop-shadow-md">
                    {activeTheme.name}
                  </h1>
                  <p className="text-zinc-500 font-minecraft text-sm">{activeTheme.desc}</p>
               </div>
               <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#333] border-2 border-[#555]" />
                  <div className="w-10 h-10 rounded-full bg-[#333] border-2 border-[#555]" />
               </div>
            </div>

            {/* Fake Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MockTaskCard 
                  theme={activeTheme} 
                  task={{ description: "Build a Starter House", author: "Steve", isCompleted: true, note: "Needs a roof" }} 
                />
                <MockTaskCard 
                  theme={activeTheme} 
                  task={{ description: "Gather 64 Iron Ore", author: "Alex", isCompleted: false, note: "" }} 
                />
                <MockTaskCard 
                  theme={activeTheme} 
                  task={{ description: "Defeat the Ender Dragon", author: "You", isCompleted: false, note: "Need potions" }} 
                />
            </div>
          </div>

          {/* "Preview Mode" Label */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-white/20 px-2 py-1 rounded text-[10px] font-mono text-white/50 z-20">
             LIVE PREVIEW
          </div>

        </div>

      </div>

      {/* 💾 Footer Actions */}
      <div className="border-t-2 border-[#333] pt-4 flex justify-between items-center">
         <p className="text-xs text-[#555] font-minecraft hidden md:block">
           Theme: <span className="text-[#ccc]">{activeTheme.desc}</span>
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