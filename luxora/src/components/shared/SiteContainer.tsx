import { cn } from "@/lib/utils";

interface SiteContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article" | "nav";
}

/**
 * Canonical horizontal layout wrapper — matches Header/Footer/Homepage/Shop.
 * Always use this instead of ad-hoc max-w + mx-auto Tailwind classes.
 */
export function SiteContainer({
  children,
  className,
  as: Tag = "div",
}: SiteContainerProps) {
  return <Tag className={cn("site-container w-full", className)}>{children}</Tag>;
}
