import { inviteUser } from "@/app/actions";
import Link from "next/link";

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // This is the World ID

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-white border rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-2">Invite a Friend ✉️</h1>
        <p className="text-zinc-500 mb-6">Enter their unique username below.</p>

        <form action={inviteUser} className="space-y-4">
          <input type="hidden" name="worldId" value={id} />
          
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input 
              name="username"
              type="text" 
              placeholder="e.g. SillyBilly123"
              className="w-full p-3 rounded-lg border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700"
              required 
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Invite
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}