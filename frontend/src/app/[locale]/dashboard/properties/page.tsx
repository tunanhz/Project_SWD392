import Button from "@/components/ui/Button";

export default function MyPropertiesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">My Properties</h1>
          <p className="text-gray-500 italic">Manage your property submissions and track auction results.</p>
        </div>
        <Button variant="accent">Post New Property</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: 'Modern Sunset Villa', status: 'AUCTIONING', currentBid: '$2,650,000', views: '1.2K' },
          { title: 'Skyline Penthouse', status: 'PENDING', currentBid: 'N/A', views: '450' },
        ].map((prop, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-primary">{prop.title}</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{prop.views} views</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                prop.status === 'AUCTIONING' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {prop.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Current Highest Bid</p>
                <p className="text-xl font-black text-primary">{prop.currentBid}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="ghost" size="sm">Stats</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
