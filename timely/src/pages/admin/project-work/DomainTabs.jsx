// ==========================================
// DOMAIN TABS
//
// Generated dynamically from the domains configured for the current
// project (spec section 3) — nothing hardcoded. Stays usable/
// responsive even with many domains via horizontal scroll.
// ==========================================
export default function DomainTabs({ domains, activeDomainId, onSelectDomain }) {
  if (!domains || domains.length === 0) {
    return null;
  }

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {domains.map((domain) => {
        const isActive = activeDomainId === domain._id;

        return (
          <button
            key={domain._id}
            type="button"
            onClick={() => onSelectDomain(domain._id)}
            className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
              isActive
                ? "border-[#2563eb] bg-[#2563eb] text-white shadow-sm"
                : "border-[#cfd6df] bg-white text-[#475569] hover:bg-[#f1f5f9]"
            }`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: isActive ? "white" : domain.color || "#64748b" }}
            />
            {domain.name}
          </button>
        );
      })}
    </div>
  );
}
