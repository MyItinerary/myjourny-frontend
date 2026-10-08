const BUTTON_CLASS =
  "flex size-6 items-center justify-center rounded-full border border-[#F5032D] text-[#F5032D] transition-colors hover:bg-[#F5032D]/10 disabled:opacity-40 disabled:border-[#CDCDCD] disabled:text-[#CDCDCD] cursor-pointer disabled:cursor-not-allowed";

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={BUTTON_CLASS}
      >
        −
      </button>
      <span className="min-w-[1ch] text-center font-sans text-sm font-semibold text-[#130404]">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={BUTTON_CLASS}
      >
        +
      </button>
    </div>
  );
}
