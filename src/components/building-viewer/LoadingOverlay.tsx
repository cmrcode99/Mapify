"use client";

export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-[#1a1a2e] flex flex-col items-center justify-center text-[#e0e0ff]">
      <h2 className="text-2xl font-semibold mb-5 tracking-widest">
        ECEB Building Viewer
      </h2>
      <div className="w-[360px] h-3.5 bg-[#2a2a4e] rounded-full overflow-hidden">
        <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#4472C4] to-[#00B0F0] animate-pulse" />
      </div>
      <p className="mt-3.5 text-sm text-[#8888bb]">
        Loading building data...
      </p>
    </div>
  );
}
