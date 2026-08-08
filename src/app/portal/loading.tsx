export default function PortalLoading() {
  return (
    <div className="animate-fade-in">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-4 w-20 rounded-full mb-2" style={{ background: "var(--rule-faint)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div className="h-8 w-56 rounded-lg" style={{ background: "var(--rule-faint)", animation: "pulse 1.5s ease-in-out 0.1s infinite" }} />
        <div className="h-3 w-40 rounded mt-2" style={{ background: "var(--rule-faint)", animation: "pulse 1.5s ease-in-out 0.2s infinite" }} />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6 overflow-hidden relative"
            style={{ background: "var(--paper-card)", border: "1px solid rgba(201,194,174,0.5)" }}
          >
            {/* Shimmer bar at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: "var(--rule-faint)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div className="w-10 h-10 rounded-xl mb-4" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite` }} />
            <div className="h-9 w-24 rounded-lg mb-2" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.1 + 0.1}s infinite` }} />
            <div className="h-4 w-32 rounded mb-1" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.1 + 0.2}s infinite` }} />
            <div className="h-3 w-24 rounded" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.1 + 0.3}s infinite` }} />
          </div>
        ))}
      </div>

      {/* Row list skeleton */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(201,194,174,0.5)", background: "var(--paper-card)" }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="px-5 py-4 flex items-center gap-4"
            style={{ borderTop: i > 0 ? "1px solid var(--rule-faint)" : "none" }}
          >
            <div className="w-10 h-10 rounded-full shrink-0" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.08}s infinite` }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 rounded" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.08 + 0.1}s infinite` }} />
              <div className="h-3 w-52 rounded" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.08 + 0.2}s infinite` }} />
            </div>
            <div className="h-6 w-16 rounded-full shrink-0" style={{ background: "var(--rule-faint)", animation: `pulse 1.5s ease-in-out ${i * 0.08}s infinite` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
