"use client";

import { useState } from "react";
import { createLinkingCode } from "@/app/actions";

export default function LinkServerSection({ worldId }: { worldId: number }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    setLoading(true);
    try {
      const newCode = await createLinkingCode(worldId);
      setCode(newCode);
    } catch (error) {
      console.error("Failed to generate code", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#1a1a1a] border-4 border-[#555] p-6 shadow-[8px_8px_0_#000]">
      <h2 className="text-xl font-minecraft text-[#ccc] mb-4 flex items-center gap-2">
        <span className="text-[#888]">#</span> Server Connection
      </h2>
      
      <p className="text-zinc-500 font-minecraft text-xs mb-6">
        Generate a secret key to link your Minecraft server to this world dashboard.
      </p>

      {!code ? (
        <button 
          onClick={handleLink}
          disabled={loading}
          className="w-full md:w-auto bg-[#00aaaa] hover:bg-[#00ffff] text-black font-minecraft font-bold px-6 py-3 border-b-4 border-[#008888] active:border-b-0 active:translate-y-1 active:mt-1 transition-all disabled:opacity-50"
        >
          {loading ? "GENERATING..." : "GENERATE LINKING CODE"}
        </button>
      ) : (
<div className="space-y-6">
  {/* The Big Code Box */}
  <div className="bg-black/60 border-2 border-dashed border-[#00aaaa] p-6 text-center shadow-[4px_4px_0_#000]">
    <p className="text-[#888] text-xs font-minecraft mb-2 uppercase tracking-widest">
      Your Secret Key (Expires in 5m)
    </p>
    <p className="text-5xl font-minecraft text-[#00ffff] tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
      {code}
    </p>
  </div>

  {/* 📍 The Instruction Text (Bigger & Clearer) */}
  <div className="text-center space-y-3">
    <p className="text-zinc-300 font-minecraft text-lg">
      Run this command in-game to link your server:
    </p>
    <div className="inline-block bg-black border-2 border-[#333] p-3 px-5 font-mono text-[#00ffff] text-xl shadow-[4px_4px_0_#222]">
      /tasks link {code}
    </div>
  </div>

  <div className="text-center">
    <button 
      onClick={() => setCode(null)}
      className="text-zinc-600 hover:text-zinc-400 text-xs font-minecraft underline transition-colors"
    >
      Generate a different code
    </button>
  </div>
</div>
      )}
    </section>
  );
}