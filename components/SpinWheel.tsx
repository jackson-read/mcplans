"use client";

import { useState } from "react";

type Task = {
  id: number;
  description: string;
  isCompleted: boolean | null;
};

export default function SpinWheel({ tasks, theme }: { tasks: Task[], theme: any }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const activeTasks = tasks.filter(t => t.isCompleted !== true);

  const handleSpin = () => {
    if (activeTasks.length === 0) return;
    
    setSpinning(true);
    setResult(null);
    
    let duration = 0;
    const interval = setInterval(() => {
      const randomTemp = activeTasks[Math.floor(Math.random() * activeTasks.length)];
      setResult(randomTemp.description);
      
      duration += 100;
      if (duration > 2000) {
        clearInterval(interval);
        const finalTask = activeTasks[Math.floor(Math.random() * activeTasks.length)];
        setResult(finalTask.description);
        setSpinning(false);
      }
    }, 100);
  };

  return (
    // Removed 'h-full', added 'h-fit' to stop it from stretching/centering when tasks tasks grow
    <div className={`${theme.cardBg} border-4 ${theme.border} p-6 shadow-xl backdrop-blur-sm h-fit flex flex-col`}>
      <h2 className={`font-minecraft text-xl mb-4 border-b-2 ${theme.border} pb-2 ${theme.text}`}>
        Roll Random Task
      </h2>
      
      <div className="flex flex-col items-center justify-start gap-6">
        
        {/* Display Box */}
        <div className={`w-full aspect-video ${theme.accent} border-4 ${theme.border} flex items-center justify-center p-4 text-center relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/10 pointer-events-none" style={{backgroundSize: '100% 4px'}}></div>
          
          {result ? (
            <p className={`font-minecraft text-lg ${spinning ? 'opacity-50 blur-[1px]' : 'scale-110 drop-shadow-md'} transition-all ${theme.text}`}>
              {result}
            </p>
          ) : (
            <p className="font-minecraft text-sm opacity-50">
              {activeTasks.length > 0 ? "Ready to roll..." : "No tasks available!"}
            </p>
          )}
        </div>

        {/* Button */}
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
          {spinning ? "ROLLING..." : "ROLL TASK"}
        </button>
        
        <p className="text-[10px] opacity-40 font-minecraft text-center">
          Picks a random incomplete task
        </p>
      </div>
    </div>
  );
}