import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
}

interface HeroSearchInputProps {
  placeholder: string;
  icon: React.ReactNode;
  searchFn: (query: string) => Promise<SearchResult[]>;
  value: string;
  onChange: (value: string) => void;
}

export function HeroSearchInput({ placeholder, icon, searchFn, value, onChange }: HeroSearchInputProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchFn(value);
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, searchFn]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 flex items-center justify-center">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      </div>
      <Input
        placeholder={placeholder}
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3 text-center">Nenhum resultado encontrado</p>
          ) : (
            results.map((r) => (
              <a
                key={r.id}
                href={r.href}
                className={cn(
                  "block px-3 py-2.5 text-sm hover:bg-accent transition-colors cursor-pointer border-b last:border-b-0 border-border/50"
                )}
                onClick={() => setOpen(false)}
              >
                <span className="font-medium text-foreground">{r.label}</span>
                {r.sublabel && (
                  <span className="block text-xs text-muted-foreground mt-0.5">{r.sublabel}</span>
                )}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
