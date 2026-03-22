"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

export default function StaffPropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations("StaffApproval");
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/properties/${id}`);
        if (!res.ok) throw new Error("Property not found");
        const data = await res.json();
        setProperty(data);
      } catch (err: any) {
        setActionError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setActionError('');
    setActionMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/properties/${id}/approve`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.message || "Action failed");
      }
      setActionMsg(status === 'APPROVED' ? 'Tài sản đã được duyệt!' : 'Đã từ chối tài sản!');
      // Update local state to reflect change
      setProperty((prev: any) => ({ ...prev, status }));
      
      // Optionally redirect back after short delay
      setTimeout(() => router.push('/dashboard/staff'), 1500);
    } catch (err: any) {
      setActionError(`Error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse pt-20">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="h-96 bg-accent/5 rounded-3xl w-full"></div>
    </div>
  );

  if (!property) return <div className="p-8 text-center text-red-500">Property not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl pt-8 pb-16">
      {/* Header and Back button */}
      <div className="flex items-center justify-between">
        <div>
           <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/staff')} className="mb-4">
            &larr; Quay lại danh sách
          </Button>
          <h1 className="text-3xl font-black text-primary tracking-tight">Chi tiết tài sản & Xét duyệt</h1>
          <p className="text-gray-500 italic">Review legal documents and ownership before approval</p>
        </div>
        
        {/* Action Status */}
        <div className="flex flex-col items-end gap-1">
          <div className={`px-4 py-2 rounded-xl font-bold text-sm tracking-wider uppercase ${
            property.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' : 
            property.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
            {property.status}
          </div>
        </div>
      </div>

      {actionMsg && <div className="p-4 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold">{actionMsg}</div>}
      {actionError && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold">{actionError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl border border-border/50 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-primary border-b border-border/50 pb-4">{property.title}</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Giá khởi điểm</span>
                <span className="text-lg font-bold text-primary">${Number(property.startingPrice).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Tiền cọc yêu cầu</span>
                <span className="text-lg font-bold text-accent">${Number(property.depositAmount).toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Địa chỉ</span>
                <span className="text-gray-700 font-medium">{property.address}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Mô tả chi tiết</span>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed bg-white rounded-xl p-4 border border-border/50">{property.description}</p>
            </div>
            
            {/* Images */}
            {property.images && property.images.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Hình ảnh tài sản</span>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {property.images.map((img: any) => (
                     <div key={img.id} className="relative group overflow-hidden rounded-xl h-32 border border-border/30">
                       <img src={img.url} alt="Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Owner, Documents, Actions */}
        <div className="space-y-6">
          
          {/* Owner Info */}
          <div className="glass p-6 rounded-3xl border border-border/50 shadow-sm">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Chủ sở hữu</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center font-black text-accent text-xl">
                {property.owner?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-primary">{property.owner?.username || 'Unknown Owner'}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Customer / Owner</p>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="glass p-6 rounded-3xl border border-border/50 shadow-sm">
             <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Tài liệu pháp lý</h3>
             {property.legalDocuments && property.legalDocuments.length > 0 ? (
               <ul className="space-y-3">
                 {property.legalDocuments.map((doc: any) => (
                   <li key={doc.id} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 shadow-sm">
                     <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{doc.fileName || 'Tài liệu'}</span>
                     <Button variant="outline" size="sm" onClick={() => window.open(doc.fileUrl, '_blank')} className="h-8 text-xs font-bold text-accent border-accent/30 hover:bg-accent/5">
                       Xem file
                     </Button>
                   </li>
                 ))}
               </ul>
             ) : (
                <div className="text-center p-6 bg-red-50/50 border border-red-100 rounded-xl">
                  <span className="text-2xl mb-2 block">📄❌</span>
                  <p className="text-sm text-red-500 italic font-medium">Chưa có tài liệu pháp lý nào được tải lên.</p>
                </div>
             )}
          </div>

          {/* Action Buttons */}
          {property.status === 'PENDING' && (
            <div className="glass p-6 rounded-3xl border border-border/50 shadow-sm space-y-3 bg-gradient-to-b from-white to-accent/5">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 text-center">Hành động xét duyệt</h3>
              <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed">Vui lòng kiểm tra kỹ tất cả hình ảnh và tài liệu pháp lý trước khi phê duyệt.</p>
              <Button 
                variant="accent" 
                className="w-full h-12 text-base font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all"
                onClick={() => handleAction('APPROVED')}
              >
                ✅ Duyệt Tài Sản
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base font-bold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                onClick={() => handleAction('REJECTED')}
              >
                ❌ Từ Chối
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
