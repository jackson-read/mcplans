import { createPlan } from "@/app/actions";
import Link from "next/link";

export default function NewPlanPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">Create a New World 🌍</h1>
      </div>
      
      <form action={createPlan} className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* 1. World Name (Required) */}
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
            World Name
          </label>
          <input 
            name="name"
            type="text" 
            placeholder="e.g. The Mega SMP"
            required
            className="w-full p-3 rounded-lg border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
        </div>

        {/* 2. Invite Friend (Optional) - Replaced 'Plan Type' with this! */}
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
            Invite a Friend <span className="text-zinc-400 font-normal">(Optional)</span>
          </label>
          <input 
            name="inviteUsername"
            type="text" 
            placeholder="Enter their username..."
            className="w-full p-3 rounded-lg border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
          <p className="text-xs text-zinc-500 mt-2">
            You can always invite more people later from the dashboard.
          </p>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-black text-white font-bold rounded-xl 
                     hover:scale-[1.02] active:scale-[0.98] 
                     transition-all duration-200 shadow-lg dark:bg-white dark:text-black"
        >
          Create World & Invite 🚀
        </button>
      </form>
    </div>
  );
}