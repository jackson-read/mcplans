export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold animate-pulse">Building Terrain...</p>
      </div>
    </div>
  );
}