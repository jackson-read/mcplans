export default function SettingsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-black text-white p-20 flex flex-col gap-4">
      <h1 className="text-4xl font-bold text-green-500">I AM ALIVE!</h1>
      <p className="text-xl">Checking World ID: {params.id}</p>
      <p className="text-zinc-500 italic">If you can see this, the folder structure and routing are working.</p>
    </div>
  );
}