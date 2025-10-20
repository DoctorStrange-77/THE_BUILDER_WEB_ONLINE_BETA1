import { MUSCLE_GROUPS } from "@/modules/template-split/types/training";

interface VolumeBarProps {
  data: Record<string, number>;
  numDays?: number;
}

export const VolumeBar = ({ data, numDays }: VolumeBarProps) => {
  const FAMILY_DEFINITIONS: { key: string; label: string; matcher: RegExp }[] = [
    { key: "PETTORALI", label: "PETTORALI", matcher: /PETTORALE|PETTORALI/i },
    { key: "DELTOIDI", label: "DELTOIDI", matcher: /DELTOID/i },
    { key: "BICIPITI", label: "BICIPITI", matcher: /BICIPIT/i },
    { key: "DORSO", label: "DORSO", matcher: /DORSO|GRAN DORSALE|CENTRO SCHIENA/i },
    { key: "TRICIPITI", label: "TRICIPITI", matcher: /TRICIPIT/i },
    { key: "FEMORALI", label: "FEMORALI", matcher: /FEMORAL|FEMORALI/i },
    { key: "QUADRICIPITI", label: "QUADRICIPITI", matcher: /QUADRICIPIT/i },
    { key: "GLUTEI", label: "GLUTEI", matcher: /GLUTEO|GLUTEI|GLUTE/i },
  ];

  const childGroups = MUSCLE_GROUPS.map((g) => ({ ...g, volume: data[g.name] ?? 0 })).filter((g) => g.volume > 0);
  if (childGroups.length === 0) return null;

  const familyMap: Record<string, { label: string; children: { name: string; color: string; volume: number }[]; total: number }> = {};
  for (const child of childGroups) {
    const match = FAMILY_DEFINITIONS.find((f) => f.matcher.test(child.name));
    const key = match ? match.key : child.name;
    const label = match ? match.label : child.name;
    if (!familyMap[key]) familyMap[key] = { label, children: [], total: 0 };
    familyMap[key].children.push({ name: child.name, color: child.color, volume: child.volume });
    familyMap[key].total += child.volume;
  }

  const usedFamilies = Object.values(familyMap).filter((f) => f.total > 0).sort((a, b) => a.total - b.total);
  if (usedFamilies.length === 0) return null;

  const maxVolume = Math.max(...usedFamilies.map((f) => f.total));

  const containerStyle: React.CSSProperties = {};
  if (numDays && numDays > 0) {
    const gapSize = 8;
    containerStyle.width = `${numDays * 300 + (numDays - 1) * gapSize}px`;
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg px-4 py-3 max-w-full shadow-lg" style={containerStyle}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-bold text-sm tracking-tight">VOLUME PER DISTRETTO MUSCOLARE</h3>
        <div className="text-xs text-muted-foreground font-medium">Totale: <span className="text-primary font-bold">{Object.values(data).reduce((a, b) => a + b, 0)}</span></div>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="relative bg-background/30 rounded-md p-2" style={{ minHeight: 180 }}>
          {[0, 50, 100].map((percent) => (
            <div key={percent} className="absolute left-0 right-0 border-t border-muted-foreground/10" style={{ bottom: `${40 + (120 * percent / 100)}px` }}>
              <span className="absolute -left-6 -top-2 text-[10px] text-muted-foreground/60 font-mono">{Math.round((maxVolume * percent) / 100)}</span>
            </div>
          ))}

          <div className="flex items-end justify-around space-x-2 px-2" style={{ height: 120 }}>
            {usedFamilies.map((family) => (
              <div key={family.label} className="flex flex-col items-center group" style={{ width: 50, height: 120 }}>
                <div className="relative w-full h-full rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-border/50">
                  {(() => {
                    let cum = 0;
                    return family.children.map((child, idx) => {
                      const hPercent = maxVolume > 0 ? (child.volume / maxVolume) * 100 : 0;
                      const bottomPercent = (cum / maxVolume) * 100;
                      cum += child.volume;
                      return (
                        <div key={child.name} className="absolute left-0 w-full transition-all duration-500 ease-out hover:brightness-110" style={{ bottom: `${bottomPercent}%`, height: `${hPercent}%`, background: `linear-gradient(180deg, hsl(var(--${child.color})) 0%, hsl(var(--${child.color}) / 0.85) 100%)`, borderTop: idx === 0 ? undefined : '1px solid rgba(0,0,0,0.3)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)' }} title={`${child.name}: ${child.volume} ex`} />
                      );
                    });
                  })()}

                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <div className="bg-background/90 backdrop-blur-sm text-primary font-bold text-xs px-1.5 py-0.5 rounded border border-primary/50 shadow-sm">{family.total}</div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="block text-[10px] font-bold text-foreground/90 leading-tight tracking-wide" title={family.label}>{family.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
