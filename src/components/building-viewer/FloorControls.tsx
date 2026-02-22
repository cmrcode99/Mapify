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

  const allVisible = visibleFloors.every((v) => v);
  const someVisible = visibleFloors.some((v) => v);

  const toggleAll = () => {
    if (allVisible) {
      onChange(visibleFloors.map(() => false));
    } else {
      onChange(visibleFloors.map(() => true));
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-3 text-white text-sm shadow-xl border border-white/10 min-w-[140px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300">Floors</h3>
        <button
          onClick={toggleAll}
          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors px-1.5 py-0.5 rounded hover:bg-white/10"
          aria-label={allVisible ? "Hide all floors" : "Show all floors"}
        >
          {allVisible ? "Hide All" : "Show All"}
        </button>
      </div>
      <div className="space-y-1">
        {labels.map((label, i) => (
          <label
            key={label}
            className="flex items-center gap-2 py-1 px-1.5 cursor-pointer hover:bg-white/10 rounded transition-all group"
          >
            <input
              type="checkbox"
              checked={visibleFloors[i]}
              onChange={() => toggle(i)}
              className="accent-blue-400 cursor-pointer w-3.5 h-3.5"
              aria-label={`Toggle ${label}`}
            />
            <span className="group-hover:text-blue-200 transition-colors text-sm">{label}</span>
          </label>
        ))}
      </div>
      {!someVisible && (
        <p className="text-[10px] text-amber-400 mt-2 px-1.5">
          Select at least one floor
        </p>
      )}
    </div>
  );
}
