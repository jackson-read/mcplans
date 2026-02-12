import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* This shows ONLY when the user is logged out */}
        <SignedOut>
          <h1 className="text-3xl font-semibold">Welcome to MC Plans</h1>
          <p className="text-lg text-zinc-600">Sign in to start managing your Minecraft worlds.</p>
          <SignInButton mode="modal">
            <button className="h-12 px-8 rounded-full bg-black text-white dark:bg-white dark:text-black">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* This shows ONLY when the user is logged in */}
        <SignedIn>
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-semibold">Your Dashboard</h1>
            <UserButton />
          </div>
          <p className="mt-4">You are logged in! Ready to plan some builds?</p>
        </SignedIn>
      </main>
    </div>
  );
}
