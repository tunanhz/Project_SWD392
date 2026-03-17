export default function AdminReports() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">System Reports</h1>
        <p className="text-gray-500 italic">Thống kê và báo cáo hệ thống đấu giá.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border border-border/50 space-y-4">
            <h3 className="text-lg font-bold text-primary">Monthly Revenue</h3>
            <div className="h-48 bg-accent/5 rounded-2xl flex items-end justify-between p-4 gap-2">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="w-full bg-accent/20 rounded-t-lg hover:bg-accent/40 transition-all cursor-pointer"></div>
                ))}
            </div>
            <p className="text-2xl font-black text-primary">$452,000</p>
            <p className="text-xs text-green-600 font-bold uppercase">+12.5% from last month</p>
        </div>

        <div className="glass p-8 rounded-3xl border border-border/50 space-y-6">
            <h3 className="text-lg font-bold text-primary">System Health</h3>
            <div className="space-y-4">
                {[
                    { label: 'Active Socket Connections', value: '452', status: 'Healthy' },
                    { label: 'Pending Approvals', value: '8', status: 'Normal' },
                    { label: 'DB Latency', value: '14ms', status: 'Optimal' },
                ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-xl font-bold text-primary">{s.value}</p>
                        </div>
                        <span className="text-xs font-black text-accent">{s.status}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
