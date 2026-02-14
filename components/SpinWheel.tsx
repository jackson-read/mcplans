"use client";

import { useState } from "react";

// 🛠️ FIX: Allow isCompleted to be boolean OR null
type Task = {
  id: number;
  description: string;
  isCompleted: boolean | null;
};

export default function SpinWheel({ tasks, theme }: { tasks: Task[], theme: any }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Filter out completed tasks (treating null as false/incomplete)
  const activeTasks = tasks.filter(t => t.isCompleted !== true);

  const handleSpin = () => {
    if (activeTasks.length === 0) return;
    
    setSpinning(true);
    setResult(null);

    // Audio effect could go here
    
    let duration = 0;
    const interval = setInterval(() => {
      // Show random task while spinning
      const randomTemp = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      setResult(randomTemp.description);
      
      duration += 100;
      if (duration > 2000) { // Spin for 2 seconds
        clearInterval(interval);
        const finalTask = activeTasks[Math.floor(Math.random() * activeTasks.length)];
        setResult(finalTask.description);
        setSpinning(false);
      }
    }, 100);
  };

  return (
    <div className={`${theme.cardBg} border-4 ${theme.border} p-6 shadow-xl backdrop-blur-sm h-full flex flex-col`}>
      <h2 className={`font-minecraft text-xl mb-4 border-b-2 ${theme.border} pb-2 ${theme.text}`}>
        Task Roulette
      </h2>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        
        {/* The Display Box */}
        <div className={`w-full aspect-video ${theme.accent} border-4 ${theme.border} flex items-center justify-center p-4 text-center relative overflow-hidden group`}>
          
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/10 pointer-events-none" style={{backgroundSize: '100% 4px'}}></div>
          
          {result ? (
            <p className={`font-minecraft text-lg ${spinning ? 'opacity-50 blur-[1px]' : 'scale-110 drop-shadow-md'} transition-all ${theme.text}`}>
              {result}
            </p>
          ) : (
            <p className="font-minecraft text-sm opacity-50">
              {activeTasks.length > 0 ? "Ready to spin..." : "No tasks available!"}
            </p>
          )}
        </div>

        {/* The Button */}
        <button 
          onClick={handleSpin}
          disabled={spinning || activeTasks.length === 0}
          className={`
            w-full py-4 font-minecraft font-bold text-xl uppercase tracking-widest
            ${theme.text} ${theme.accent} border-b-8 ${theme.border}
            active:border-b-0 active:translate-y-2 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:brightness-110
          `}
        >
          {spinning ? "SPINNING..." : "SPIN WHEEL"}
        </button>
        
        <p className="text-[10px] opacity-40 font-minecraft text-center">
          Picks a random incomplete task
        </p>
      </div>
    </div>
  );
}