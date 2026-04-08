"use client";

export default function BiomeDropdown() {
  return (
    <select 
      onChange={(e) => {
        if (e.target.value) {
          localStorage.setItem('localBiomeOverride', e.target.value);
        } else {
          localStorage.removeItem('localBiomeOverride');
        }
        window.location.reload();
      }}
      className="bg-black/50 text-white font-minecraft text-[10px] p-1 ml-2 border border-white/20 cursor-pointer focus:outline-none"
    >
      <option value="">[Local Theme]</option>
      <option value="plains">Plains</option>
      <option value="cherry">Cherry</option>
      <option value="ocean">Ocean</option>
      <option value="spruce">Spruce</option>
      <option value="cave">Lush Cave</option>
      <option value="nether">Nether</option>
      <option value="end">The End</option>
    </select>
  );
}