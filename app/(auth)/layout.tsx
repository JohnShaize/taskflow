export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[rgb(var(--background))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay dark:opacity-[0.06]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
