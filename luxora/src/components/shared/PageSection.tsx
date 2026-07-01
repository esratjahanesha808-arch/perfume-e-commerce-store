import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
  /** Tighter vertical rhythm for sub-blocks (breadcrumb, hero) */
  compact?: boolean;
  id?: string;
}

/**
 * Vertical padding wrapper for MAJOR page blocks only (hero, full-width bands).
 * For stacked content (trust → tabs → reviews), use `.section-flow` instead.
 * For repeated items (review cards), use `.stack-gap-cards`.
 */
export function PageSection({
  children,
  className,
  as: Tag = "section",
  compact = false,
  id,
}: PageSectionProps) {
  return (
    <Tag
      id={id}
      className={cn(compact ? "page-section-compact" : "page-section", className)}
    >
      {children}
    </Tag>
  );
}
