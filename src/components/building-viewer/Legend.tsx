"use client";

const LEGEND_ITEMS = [
  { color: "#002060", label: "Admin" },
  { color: "#4472C4", label: "Classroom" },
  { color: "#00B0F0", label: "Circulation" },
  { color: "#E48F24", label: "Lab" },
  { color: "#70AD47", label: "Office" },
  { color: "#FF66CC", label: "Student Space" },
  { color: "#B0B8C0", label: "General / Corridor" },
];

export default function Legend() {
  return (
    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">Room Types</h3>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2 py-0.5">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ background: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
