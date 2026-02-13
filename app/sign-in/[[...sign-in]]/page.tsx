import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignIn appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-zinc-900 border border-zinc-800 text-white",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
          dividerText: "text-zinc-500",
          formFieldLabel: "text-zinc-300",
          formFieldInput: "bg-zinc-950 border-zinc-800 text-white",
          footerActionText: "text-zinc-400",
          footerActionLink: "text-blue-400 hover:text-blue-300"
        }
      }} />
    </div>
  );
}