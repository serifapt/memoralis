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

    const [hh, mm] = React.useMemo(() => {
      const parts = (value || "").split(":");
      return [parts[0] || "", parts[1] || ""];
    }, [value]);

    const emit = (newHH: string, newMM: string) => {
      onChange(`${newHH.padStart(2, "0")}:${newMM.padStart(2, "0")}`);
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 2);
      if (v.length === 2) {
        const n = parseInt(v, 10);
        if (n > 23) v = "23";
        emit(v, mm || "00");
        minuteRef.current?.focus();
        minuteRef.current?.select();
      } else if (v.length === 1 && parseInt(v, 10) > 2) {
        v = "0" + v;
        emit(v, mm || "00");
        minuteRef.current?.focus();
        minuteRef.current?.select();
      } else {
        emit(v, mm || "00");
      }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 2);
      if (v.length === 2) {
        const n = parseInt(v, 10);
        if (n > 59) v = "59";
      }
      emit(hh || "00", v);
    };

    const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === ":" || e.key === "ArrowRight") {
        e.preventDefault();
        minuteRef.current?.focus();
        minuteRef.current?.select();
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        let n = parseInt(hh || "0", 10);
        n = e.key === "ArrowUp" ? (n + 1) % 24 : (n - 1 + 24) % 24;
        emit(String(n).padStart(2, "0"), mm || "00");
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
        let n = parseInt(mm || "0", 10);
        n = e.key === "ArrowUp" ? (n + 1) % 60 : (n - 1 + 60) % 60;
        emit(hh || "00", String(n).padStart(2, "0"));
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
          value={hh}
          onFocus={(e) => e.target.select()}
          onChange={handleHourChange}
          onKeyDown={handleHourKeyDown}
        />
        <span className="text-muted-foreground font-mono select-none">:</span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="MM"
          className={baseInput}
          value={mm}
          onFocus={(e) => e.target.select()}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKeyDown}
        />
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";

export { TimeInput };
