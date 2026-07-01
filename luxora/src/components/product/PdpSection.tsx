import { cn } from "@/lib/utils";

/** Original PDP divider color — do not change */
export const PDP_BORDER = "rgba(200, 169, 107, 0.12)" as const;

interface PdpSectionProps {
  children: React.ReactNode;
  className?: string;
  borderedTop?: boolean;
  borderedBottom?: boolean;
  noVerticalPad?: boolean;
}

export function PdpSection({
  children,
  className,
  borderedTop = false,
  borderedBottom = false,
  noVerticalPad = false,
}: PdpSectionProps) {
  return (
    <div
      className={cn(
        !noVerticalPad && "pdp-section",
        borderedTop && "border-t border-[rgba(200,169,107,0.12)]",
        borderedBottom && "border-b border-[rgba(200,169,107,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
}
