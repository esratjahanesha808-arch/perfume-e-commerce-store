"use client";

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
}

export function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div>
      <span className="pdp-info-label">Size</span>
      <div className="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Select size">
        {sizes.map((size) => {
          const isActive = selected === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(size)}
              className={`min-w-0 px-2 sm:px-4 py-2.5 sm:py-3 rounded-md text-[10px] sm:text-xs tracking-widest uppercase font-semibold border transition-all duration-200 cursor-pointer text-center ${
                isActive
                  ? "bg-[rgba(172,125,69,0.15)] text-[#C8A96B] border-[#C8A96B]"
                  : "bg-[#111111] text-[#A1A1A1] border-[rgba(200,169,107,0.15)] hover:border-[#C8A96B] hover:text-[#F5F5F5]"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
