interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({ title, subtitle, align = "center" }: SectionHeaderProps) {
  return (
    <div className={`mb-10 md:mb-16 ${align === "center" ? "text-center" : "text-left"}`}>
      <h2 className="font-playfair text-3xl md:text-4xl mb-4">{title}</h2>
      {subtitle && (
        <p className="text-text-secondary max-w-2xl text-sm md:text-base tracking-wide mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`h-px w-16 bg-gold mt-6 ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
