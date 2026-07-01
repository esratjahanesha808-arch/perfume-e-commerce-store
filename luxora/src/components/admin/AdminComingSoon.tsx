interface AdminComingSoonProps {
  title: string;
  description?: string;
}

export function AdminComingSoon({
  title,
  description = "This section is planned for an upcoming phase. The admin dashboard home is fully functional.",
}: AdminComingSoonProps) {
  return (
    <div className="admin-coming-soon">
      <h2 className="admin-coming-soon-title">{title}</h2>
      <p className="admin-coming-soon-text">{description}</p>
    </div>
  );
}
