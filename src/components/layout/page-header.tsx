export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-lg border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0e9f6e,#2f8f9d,#111313)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-52 bg-[radial-gradient(circle_at_top_right,rgba(14,159,110,0.16),transparent_58%)]" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="section-kicker rounded-full border border-line bg-white px-3 py-1">SafeAccess</span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Sistema de Segurança RFID
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
