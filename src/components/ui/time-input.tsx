import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

const TimeInput = React.forwardRef<HTMLDivElement, TimeInputProps>(
  ({ value, onChange, className, id }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);

    // Parse the prop value
    const parsedHH = (value || "").split(":")[0] || "";
    const parsedMM = (value || "").split(":")[1] || "";

    const [localHH, setLocalHH] = React.useState(parsedHH);
    const [localMM, setLocalMM] = React.useState(parsedMM);

    // Sync local state when prop changes externally
    React.useEffect(() => {
      setLocalHH(parsedHH);
      setLocalMM(parsedMM);
    }, [parsedHH, parsedMM]);

    const emit = (hh: string, mm: string) => {
      onChange(`${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 2);
      if (v.length === 1 && parseInt(v, 10) > 2) {
        v = "0" + v;
      }
      if (v.length === 2) {
        const n = parseInt(v, 10);
        if (n > 23) v = "23";
        setLocalHH(v);
        emit(v, localMM || "00");
        requestAnimationFrame(() => {
          minuteRef.current?.focus();
          minuteRef.current?.select();
        });
      } else {
        setLocalHH(v);
      }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 2);
      if (v.length === 2) {
        const n = parseInt(v, 10);
        if (n > 59) v = "59";
        setLocalMM(v);
        emit(localHH || "00", v);
      } else {
        setLocalMM(v);
      }
    };

    const handleHourBlur = () => {
      if (localHH) {
        const padded = localHH.padStart(2, "0");
        setLocalHH(padded);
        emit(padded, localMM || "00");
      }
    };

    const handleMinuteBlur = () => {
      if (localMM) {
        const padded = localMM.padStart(2, "0");
        setLocalMM(padded);
        emit(localHH || "00", padded);
      }
    };

    const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === ":" || e.key === "ArrowRight") {
        e.preventDefault();
        minuteRef.current?.focus();
        minuteRef.current?.select();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        let n = parseInt(localHH || "0", 10);
        n = e.key === "ArrowUp" ? (n + 1) % 24 : (n - 1 + 24) % 24;
        const v = String(n).padStart(2, "0");
        setLocalHH(v);
        emit(v, localMM || "00");
      }
    };

    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && (e.currentTarget.value === "" || e.currentTarget.value === "00")) {
        e.preventDefault();
        hourRef.current?.focus();
        hourRef.current?.select();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        hourRef.current?.focus();
        hourRef.current?.select();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        let n = parseInt(localMM || "0", 10);
        n = e.key === "ArrowUp" ? (n + 1) % 60 : (n - 1 + 60) % 60;
        const v = String(n).padStart(2, "0");
        setLocalMM(v);
        emit(localHH || "00", v);
      }
    };

    const baseInput =
      "w-8 bg-transparent text-center text-sm font-mono outline-none placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 items-center gap-0.5 rounded-md border border-input bg-background px-3 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground mr-1.5" />
        <input
          ref={hourRef}
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="HH"
          className={baseInput}
          value={localHH}
          onFocus={(e) => e.target.select()}
          onMouseUp={(e) => e.preventDefault()}
          onChange={handleHourChange}
          onKeyDown={handleHourKeyDown}
          onBlur={handleHourBlur}
        />
        <span className="text-muted-foreground font-mono select-none">:</span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="MM"
          className={baseInput}
          value={localMM}
          onFocus={(e) => e.target.select()}
          onMouseUp={(e) => e.preventDefault()}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKeyDown}
          onBlur={handleMinuteBlur}
        />
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";

export { TimeInput };
