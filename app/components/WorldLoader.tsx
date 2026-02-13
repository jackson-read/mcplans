'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorldLoader() {
  const router = useRouter();
  const [text, setText] = useState("Connecting to server...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Random "Loading" phases
    const t1 = setTimeout(() => setText("Logging in..."), 600);
    const t2 = setTimeout(() => setText("Downloading terrain..."), 1400);
    
    // 2. Redirect to Dashboard after 2.5 seconds
    const t3 = setTimeout(() => {
      router.push('/dashboard');
    }, 2400);

    // 3. Fake Progress Bar Animation
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) return 100;
        const jump = Math.floor(Math.random() * 15) + 5; 
        return Math.min(old + jump, 100);
      });
    }, 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#2e211b] font-minecraft text-white z-50 fixed inset-0">
      
      <div className="flex flex-col items-center gap-4 w-80">
        <h2 className="text-xl text-[#dcdcdc] drop-shadow-md">{text}</h2>

        {/* The Empty Bar Container */}
        <div className="w-full h-4 bg-[#1a1a1a] border-2 border-white relative">
          {/* The Green Loading Bar */}
          <div 
            className="h-full bg-[#5b8731] transition-all duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-[#555555] text-xs">
        MC Plans v1.0
      </div>
    </div>
  );
}