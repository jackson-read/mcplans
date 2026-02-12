'use client'; // This component runs in the browser!

import { useState } from 'react';

// STYLING VARIABLES (Tweak colors here!) 🎨
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const SPIN_DURATION = 3; // Seconds

interface WheelProps {
  tasks: { id: number; description: string }[];
}

export default function Wheel({ tasks }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const handleSpin = () => {
    if (isSpinning || tasks.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // 1. Calculate a random spin (at least 5 full rotations + random ending)
    const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(newRotation);

    // 2. Wait for animation to finish, then calculate winner
    setTimeout(() => {
      setIsSpinning(false);
      calculateWinner(newRotation);
    }, SPIN_DURATION * 1000);
  };

  const calculateWinner = (finalRotation: number) => {
    const sliceSize = 360 / tasks.length;
    // The pointer is at the TOP (0 degrees). We reverse the rotation to find what's there.
    const effectiveAngle = (360 - (finalRotation % 360)) % 360;
    const winningIndex = Math.floor(effectiveAngle / sliceSize);
    
    setWinner(tasks[winningIndex].description);
  };

  // --- RENDERING HELPERS ---
  
  // If no tasks, show a boring grey circle
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-64 h-64 rounded-full bg-zinc-200 border-4 border-zinc-300 flex items-center justify-center">
          <p className="text-zinc-400 font-medium">Add Tasks!</p>
        </div>
      </div>
    );
  }

  // Generate the colorful pie chart CSS
  const gradientParts = tasks.map((_, i) => {
    const percent = 100 / tasks.length;
    return `${COLORS[i % COLORS.length]} ${i * percent}% ${(i + 1) * percent}%`;
  }).join(', ');
  
  const wheelStyle = {
    background: `conic-gradient(${gradientParts})`,
    transform: `rotate(${rotation}deg)`,
    transition: `transform ${SPIN_DURATION}s cubic-bezier(0.2, 0, 0.2, 1)`, // "Ease out" effect
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* THE POINTER (Triangle at top) */}
      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-zinc-800 z-10 mb-[-10px]" />

      {/* THE WHEEL */}
      <div 
        className="w-80 h-80 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden"
        style={wheelStyle}
      >
        {/* Optional: Center hub to make it look like a real wheel */}
        <div className="w-4 h-4 bg-white rounded-full z-10" />
      </div>

      {/* SPIN BUTTON */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="mt-8 px-8 py-3 bg-black text-white font-bold rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSpinning ? 'Spinning...' : 'SPIN! 🎲'}
      </button>

      {/* WINNER POPUP */}
      {winner && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl border-4 border-yellow-400 text-center animate-bounce">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">The Wheel Says:</p>
          <h3 className="text-2xl font-black text-black mt-1">{winner}</h3>
          <button 
            onClick={() => setWinner(null)} 
            className="mt-4 text-xs underline text-zinc-400"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}