import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button as UiButton } from '@/components/ui/button';
import { MUSCLE_GROUPS } from '@/modules/template-split/types/training';

export default function MuscleSelect({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const filtered = MUSCLE_GROUPS.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;
      if (!(e.target instanceof Node)) return;
      if (!el.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        className="w-full"
        placeholder={placeholder || 'Cerca o seleziona distretto...'}
        value={query || value}
        onChange={(e) => { setQuery((e.target as HTMLInputElement).value); setShowList(true); }}
        onFocus={() => setShowList(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setShowList(false); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1))); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex((i) => Math.max(0, i - 1)); }
          else if (e.key === 'Enter') { e.preventDefault(); const pick = filtered[focusedIndex] || filtered[0]; if (pick) { onChange(pick.name); setQuery(pick.name); setShowList(false); } }
        }}
      />
      {showList && (
        <div className="absolute z-20 mt-2 w-full max-w-full">
          <ScrollArea className="h-40 border border-border rounded-sm bg-popover w-full box-border overflow-hidden">
            <div className="py-1 px-0">
              {filtered.map((g, idx) => (
                <UiButton key={g.name} variant={value === g.name ? 'default' : 'ghost'} className={`w-full justify-start mb-1 text-sm truncate text-left pl-4 pr-4 ${value === g.name ? 'bg-dorso text-background hover:bg-dorso/90' : 'text-foreground hover:bg-muted'} ${idx === focusedIndex ? 'ring-2 ring-primary' : ''}`} onMouseEnter={() => setFocusedIndex(idx)} onClick={() => { onChange(g.name); setQuery(g.name); setShowList(false); }}>{g.name}</UiButton>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
