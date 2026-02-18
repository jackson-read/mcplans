"use client";

import { useState } from "react";
import { updateBiome } from "@/app/actions";

// 🎨 1. THE EXACT BACKGROUND COMPONENT (Adapted for Preview)
// I changed 'fixed' to 'absolute' so it stays inside the preview box.
const BiomeBackground = ({ biome }: { biome: string }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden font-minecraft select-none">
      
      {/* ☁️ SHARED: CLOUDS */}
      {['plains', 'cherry', 'spruce'].includes(biome) && (
        <>
          <div className="absolute top-10 left-10 w-48 h-16 bg-white/30"></div>
          <div className="absolute top-24 left-1/3 w-32 h-12 bg-white/20"></div>
          <div className="absolute top-12 right-20 w-64 h-20 bg-white/30"></div>
          <div className="absolute top-40 -left-12.5 w-40 h-10 bg-white/10"></div>
        </>
      )}

      {/* --- PLAINS --- */}
      {biome === 'plains' && (
        <>
          <div className="absolute inset-0 bg-[#87ceeb]"></div>
          <div className="absolute bottom-0 w-full h-24 bg-[#5b3e2b]"></div>
          <div className="absolute bottom-24 w-full h-8 bg-[#5b8731] border-b-4 border-[#4a6b28] shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)]">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "16px 16px"}}></div>
          </div>
          
          {/* FLOWERS */}
          <div className="absolute bottom-32 left-20 w-4 h-4 bg-red-500 shadow-[4px_0_0_#b00,-4px_0_0_#b00,0_-4px_0_#b00,0_4px_0_#b00,0_0_0_4px_rgba(0,0,0,0.2)]"><div className="absolute top-4 left-1 w-2 h-6 bg-[#3e6826]"></div></div>
          <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-yellow-400 shadow-[4px_0_0_#d4af37,-4px_0_0_#d4af37,0_-4px_0_#d4af37,0_4px_0_#d4af37]"><div className="absolute top-4 left-1 w-2 h-6 bg-[#3e6826]"></div></div>
          <div className="absolute bottom-32 right-1/3 w-4 h-4 bg-blue-400 shadow-[4px_0_0_#00a,-4px_0_0_#00a,0_-4px_0_#00a,0_4px_0_#00a]"><div className="absolute top-4 left-1 w-2 h-6 bg-[#3e6826]"></div></div>
          <div className="absolute bottom-32 right-10 w-4 h-4 bg-white shadow-[4px_0_0_#ccc,-4px_0_0_#ccc,0_-4px_0_#ccc,0_4px_0_#ccc]"><div className="absolute top-4 left-1 w-2 h-6 bg-[#3e6826]"></div></div>
          
          {/* 🌿 MORE GRASS TEXTURE */}
          <div className="absolute bottom-32 left-10 w-2 h-10 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 left-40 w-2 h-14 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 left-1/2 w-2 h-12 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 right-1/4 w-2 h-16 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 right-20 w-2 h-8 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 left-[15%] w-2 h-12 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
          <div className="absolute bottom-32 right-[40%] w-2 h-10 bg-[#3e6826] border-l-4 border-[#2f4f1e]"></div>
        </>
      )}

      {/* --- CHERRY BLOSSOM --- */}
      {(biome === 'cherry' || biome === 'cherry_blossom') && (
        <>
          <div className="absolute inset-0 bg-[#9fd3ff]"></div>
          <div className="absolute bottom-0 w-full h-24 bg-[#5b3e2b]"></div>
          <div className="absolute bottom-24 w-full h-8 bg-[#6ebb47] border-b-4 border-[#589c36]">
            <div className="absolute inset-0 opacity-80" style={{backgroundImage: "radial-gradient(#ffb7d5 2px, transparent 2px)", backgroundSize: "24px 24px"}}></div>
          </div>
          {[5, 35, 75].map((pos, i) => (
            <div key={i} className="absolute bottom-32 w-24 h-64" style={{ left: `${pos}%` }}>
              <div className="absolute bottom-0 left-8 w-8 h-48 bg-[#3b2618] border-x-4 border-[#2b1c11]"></div>
              <div className="absolute bottom-32 -left-8 w-40 h-24 bg-[#ffb7d5] opacity-90 shadow-[inset_0_4px_0_#fff,inset_0_-8px_0_#eb9bb7]"></div>
              <div className="absolute bottom-48 left-0 w-24 h-16 bg-[#ffb7d5] opacity-90 shadow-[inset_0_4px_0_#fff]"></div>
            </div>
          ))}
        </>
      )}

      {/* --- OCEAN --- */}
      {biome === 'ocean' && (
        <>
          <div className="absolute inset-0 bg-[#006994]"></div>
          {[
            { t: 40, l: 20, c: "bg-orange-400" }, { t: 60, l: 50, c: "bg-yellow-400" },
            { t: 20, l: 80, c: "bg-blue-300" }, { t: 80, l: 10, c: "bg-red-400" },
            { t: 30, l: 40, c: "bg-green-300" }, { t: 70, l: 80, c: "bg-purple-300" },
            { t: 50, l: 10, c: "bg-gray-300" }, { t: 15, l: 60, c: "bg-orange-300" },
            { t: 85, l: 30, c: "bg-cyan-300" }, { t: 5, l: 40, c: "bg-pink-400" },
          ].map((f, i) => (
             <div key={i} className={`absolute w-8 h-4 ${f.c}`} style={{top: `${f.t}%`, left: `${f.l}%`}}>
                <div className="absolute top-1 right-0 w-2 h-2 bg-black opacity-50"></div>
                <div className={`absolute top-1 -left-2 w-2 h-2 ${f.c}`}></div>
             </div>
          ))}
        </>
      )}

      {/* --- SPRUCE --- */}
      {biome === 'spruce' && (
        <>
          <div className="absolute inset-0 bg-[#778ca3]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#4a3623] border-t-8 border-[#302316]">
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(#261a12 2px, transparent 2px)", backgroundSize: "8px 8px"}}></div>
          </div>
          {[10, 40, 75].map((pos, i) => (
            <div key={i} className="absolute bottom-32" style={{left: `${pos}%`}}>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-64 bg-[#2b1e16] border-x-2 border-[#1a110d]"></div>
               <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#1e2e14]"></div>
               <div className="absolute bottom-36 left-1/2 -translate-x-1/2 w-32 h-16 bg-[#1e2e14]"></div>
               <div className="absolute bottom-52 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#1e2e14]"></div>
            </div>
          ))}
        </>
      )}

      {/* --- LUSH CAVE --- */}
      {biome === 'cave' && (
        <>
          <div className="absolute inset-0 bg-[#222]"></div>
          <div className="absolute bottom-0 w-full h-24 flex">
             <div className="w-1/6 h-full bg-[#9fa4b2] border-t-4 border-[#858996]"></div>
             <div className="w-1/6 h-full bg-[#9fa4b2] border-t-4 border-[#858996]"></div>
             <div className="w-1/6 h-full bg-[#2d5e75] border-t-4 border-[#254d61]"></div>
             <div className="w-1/6 h-full bg-[#9fa4b2] border-t-4 border-[#858996]"></div>
             <div className="w-1/6 h-full bg-[#2d5e75] border-t-4 border-[#254d61]"></div>
             <div className="w-1/6 h-full bg-[#2d5e75] border-t-4 border-[#254d61]"></div>
          </div>
          {[10, 35, 65, 80].map((pos, i) => (
             <div key={i} className="absolute bottom-24 w-12 h-12 bg-[#4e6b2c] rounded-md" style={{ left: `${pos}%` }}>
                <div className="absolute -top-4 -left-2 w-16 h-8 bg-[#4e6b2c] rounded-md"></div>
                <div className="absolute top-0 left-2 w-2 h-2 bg-[#d965a3]"></div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#d965a3]"></div>
                <div className="absolute -top-2 left-6 w-2 h-2 bg-[#d965a3]"></div>
             </div>
          ))}
          {[5, 15, 30, 50, 70, 85, 95].map((pos, i) => (
            <div key={i} className="absolute top-0 flex flex-col items-center" style={{left: `${pos}%`}}>
               <div className="w-2 bg-[#4e6b2c]" style={{height: `${120 + (i % 3) * 60}px`}}></div>
               <div className="w-4 h-4 bg-[#ffd952] shadow-[0_0_20px_#ffd952] rounded-sm"></div>
               {i % 2 === 0 && <div className="absolute w-3 h-3 bg-[#ffd952] shadow-[0_0_15px_#ffd952] rounded-sm top-10"></div>}
            </div>
          ))}
        </>
      )}

      {/* --- NETHER --- */}
      {biome === 'nether' && (
        <>
          <div className="absolute inset-0 bg-[#2a0505]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#381111]">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "4px 4px"}}></div>
          </div>
          <div className="absolute top-0 left-20 w-40 h-full bg-[#ff7b00] border-x-4 border-[#cc5500] opacity-90"></div>
          <div className="absolute bottom-0 right-20">
             <div className="w-32 h-96 bg-[#1f0505]"></div> 
             <div className="absolute top-20 -left-32 w-32 h-16 bg-[#1f0505]"></div>
             <div className="absolute top-20 -left-40 w-8 h-12 bg-[#1f0505]"></div>
          </div>
        </>
      )}

      {/* --- END --- */}
      {biome === 'end' && (
        <>
          <div className="absolute inset-0 bg-[#0d0917]"></div>
          <div className="absolute bottom-0 w-full h-32 bg-[#dbd6ac] border-t-8 border-[#c9c59d]">
             <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "8px 8px", filter: "invert(1)"}}></div>
          </div>
          <div className="absolute bottom-32 left-20 w-16 h-64 bg-[#160f29] border-x-4 border-black"></div>
          <div className="absolute bottom-32 left-60 w-16 h-96 bg-[#160f29] border-x-4 border-black"></div>
          <div className="absolute bottom-32 right-40 w-16 h-48 bg-[#160f29] border-x-4 border-black"></div>
        </>
      )}
    </div>
  );
};

// 🎨 2. CONFIG DATA
const BIOMES = [
  { id: "plains", name: "Plains", bg: "bg-[#71c352]" },
  { id: "cherry", name: "Cherry Blossom", bg: "bg-[#ffb5d4]" },
  { id: "ocean", name: "Ocean", bg: "bg-[#4b8b8b]" },
  { id: "spruce", name: "Spruce Forest", bg: "bg-[#584633]" },
  { id: "cave", name: "Lush Cave", bg: "bg-[#475c2e]" },
  { id: "nether", name: "The Nether", bg: "bg-[#4d1616]" },
  { id: "end", name: "The End", bg: "bg-[#ebe6c5]" },
];

export default function BiomePicker({ currentBiome, worldId }: { currentBiome: string, worldId: number }) {
  const [selected, setSelected] = useState(currentBiome);
  
  const activeTheme = BIOMES.find(b => b.id === selected) || BIOMES[0];

  return (
    <section className="bg-[#1a1a1a] border-4 border-[#555] p-6 shadow-[8px_8px_0_#000] relative overflow-hidden flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-[#333] pb-4">
        <div>
          <h2 className="text-xl font-minecraft text-[#ccc] flex items-center gap-2">
            <span className="text-[#888]">#</span> World Theme
          </h2>
          <p className="text-xs text-[#666] font-minecraft mt-1">Select a biome.</p>
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
              <span className="relative z-10 font-minecraft text-white text-[10px] font-bold drop-shadow-md uppercase tracking-wide text-center">
                {b.name}
              </span>
            </button>
          ))}
        </div>

        {/* 🖥️ RIGHT: The Preview Box */}
        <div className="flex-1 bg-black border-4 border-[#333] relative rounded-lg overflow-hidden shadow-inner group">
          
          {/* 1. THE EXACT BACKGROUND */}
          <BiomeBackground biome={selected} />

          {/* 2. OVERLAY UI (So it looks like a dashboard) */}
          <div className="absolute inset-0 z-10 flex flex-col pointer-events-none p-6 gap-6">
              {/* Fake Header */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-black/10">
                 <div className="bg-black/40 px-3 py-1 rounded text-white font-minecraft text-lg shadow-sm backdrop-blur-sm">
                    {activeTheme.name}
                 </div>
                 <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-black/40" />
                    <div className="w-8 h-8 rounded-full bg-black/40" />
                 </div>
              </div>

              {/* Fake Cards */}
              <div className="grid grid-cols-2 gap-4 opacity-90">
                 <div className="h-24 bg-black/40 backdrop-blur-md border-2 border-black/10 rounded p-3 flex flex-col gap-2 shadow-lg">
                    <div className="w-3/4 h-3 bg-white/20 rounded" />
                    <div className="w-1/2 h-2 bg-white/10 rounded" />
                 </div>
                 <div className="h-24 bg-black/20 backdrop-blur-sm border-2 border-black/5 rounded p-3 flex flex-col gap-2">
                    <div className="w-full h-3 bg-white/10 rounded" />
                 </div>
              </div>
          </div>

        </div>

      </div>

      {/* 💾 Footer */}
      <div className="border-t-2 border-[#333] pt-4 flex justify-end items-center">
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