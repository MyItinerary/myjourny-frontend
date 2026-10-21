// Figma "Chips" component (2001:11993 etc.) — filter pill with exact specs
export function FilterChip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center justify-center gap-2 rounded-[104px] bg-[#F4F2EE] px-4 py-1 text-sm font-normal text-foreground transition-colors hover:bg-[#eae7e1] cursor-pointer"
    >
      <span>{label}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="none"
        className="h-[5px] w-[10px] shrink-0"
      >
        <path
          d="M0.833496 0.833313L5.8335 5.83331L10.8335 0.833313"
          stroke="#160000"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
