import Button from "@/components/ui/Button";

export default function StaffDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-primary tracking-tight">Staff Approval Center</h1>
        <p className="text-gray-500 italic">Review and approve property submissions (BR-15 Compliance).</p>
      </div>

      <div className="glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-accent/5">
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Property Title</th>
              <th className="px-6 py-4">Starting Price</th>
              <th className="px-6 py-4">Documents</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-border/50">
            {[
              { owner: 'Alex Johnson', title: 'Skyline Penthouse', price: '$1,800,000', docs: 'Verified' },
              { owner: 'Maria Garcia', title: 'Forest Retreat', price: '$750,000', docs: 'Pending' },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-accent/5 transition-colors">
                <td className="px-6 py-4 font-medium">{row.owner}</td>
                <td className="px-6 py-4 font-bold text-primary">{row.title}</td>
                <td className="px-6 py-4 font-mono">{row.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    row.docs === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {row.docs}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex gap-2">
                        <Button variant="accent" size="sm" className="h-8">Approve</Button>
                        <Button variant="outline" size="sm" className="h-8 border-red-200 text-red-600 hover:bg-red-50">Reject</Button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
