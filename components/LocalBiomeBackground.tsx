"use client";

export default function LocalBiomeBackground({ biome }: { biome: string }) {

  return (
    // Note: I set this back to 'fixed' so it covers the whole screen on the world page!
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden font-minecraft select-none">
      
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
}