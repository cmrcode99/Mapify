"use client";

interface FloorControlsProps {
  labels: string[];
  visibleFloors: boolean[];
  onChange: (visibleFloors: boolean[]) => void;
}

export default function FloorControls({ labels, visibleFloors, onChange }: FloorControlsProps) {
  const toggle = (index: number) => {
    const next = [...visibleFloors];
    next[index] = !next[index];
    onChange(next);
  };

  return (
    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">Floors</h3>
      {labels.map((label, i) => (
        <label
          key={label}
          className="flex items-center gap-2 py-0.5 cursor-pointer hover:text-blue-200 transition-colors"
        >
          <input
            type="checkbox"
            checked={visibleFloors[i]}
            onChange={() => toggle(i)}
            className="accent-blue-400"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}
