const PALETTES = [
  { bg: "bg-blue-500/15",   text: "text-blue-400" },
  { bg: "bg-violet-500/15", text: "text-violet-400" },
  { bg: "bg-emerald-500/15",text: "text-emerald-400" },
  { bg: "bg-amber-500/15",  text: "text-amber-400" },
  { bg: "bg-rose-500/15",   text: "text-rose-400" },
  { bg: "bg-cyan-500/15",   text: "text-cyan-400" },
  { bg: "bg-fuchsia-500/15",text: "text-fuchsia-400" },
  { bg: "bg-lime-500/15",   text: "text-lime-400" },
  { bg: "bg-orange-500/15", text: "text-orange-400" },
  { bg: "bg-teal-500/15",   text: "text-teal-400" },
];

export function memberColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}
