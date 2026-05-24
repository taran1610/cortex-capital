export default function DashboardLoading() {
  return (
    <div className="min-h-dvh animate-pulse bg-[#06080f]">
      <div className="h-[57px] border-b border-white/[0.06] bg-[#0a0d14]/90" />
      <div className="mx-auto max-w-[1600px] p-4 md:p-6">
        <div className="mb-8 h-24 rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-4 lg:grid-cols-[240px_1fr_300px]">
          <div className="h-64 rounded-2xl bg-white/[0.04]" />
          <div className="h-[420px] rounded-2xl bg-white/[0.04]" />
          <div className="h-80 rounded-2xl bg-white/[0.04]" />
        </div>
        <div className="mt-8 h-72 rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}
