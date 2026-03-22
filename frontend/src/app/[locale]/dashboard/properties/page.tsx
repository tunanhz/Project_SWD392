"use client";

import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import UploadDocumentModal from "@/components/UploadDocumentModal";

export default function MyPropertiesPage() {
  const t = useTranslations("MyProperties");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', address: '', startingPrice: '',
    area: '', beds: '0', baths: '0', propertyType: 'House'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadModal, setUploadModal] = useState<{isOpen: boolean, propertyId: string | number}>({ isOpen: false, propertyId: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const fetchProperties = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/properties/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', address: '', startingPrice: '', area: '', beds: '0', baths: '0', propertyType: 'House' });
    setEditingProperty(null);
    setShowForm(false);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const url = editingProperty
        ? `http://127.0.0.1:5000/api/properties/${editingProperty.id}`
        : 'http://127.0.0.1:5000/api/properties';
      const method = editingProperty ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          startingPrice: parseFloat(formData.startingPrice),
          area: parseFloat(formData.area) || null,
          beds: parseInt(formData.beds),
          baths: parseInt(formData.baths)
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Failed');
      }
      resetForm();
      fetchProperties();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (id: string | number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/properties/${id}/withdraw`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Failed to withdraw');
      }
      setMessage(t('withdrawSuccess'));
      fetchProperties();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const startEdit = (prop: any) => {
    setEditingProperty(prop);
    setFormData({
      title: prop.title,
      description: prop.description || '',
      address: prop.address,
      startingPrice: prop.startingPrice.toString(),
      area: prop.area?.toString() || '',
      beds: prop.beds?.toString() || '0',
      baths: prop.baths?.toString() || '0',
      propertyType: prop.propertyType || 'House'
    });
    setShowForm(true);
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-accent/5 rounded-xl w-1/3"></div>
      <div className="grid grid-cols-2 gap-8">
        {[1,2].map(i => <div key={i} className="h-48 bg-accent/5 rounded-3xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">{t('title')}</h1>
          <p className="text-gray-500 italic">{t('subtitle')}</p>
        </div>
        <Button variant="accent" onClick={() => { resetForm(); setShowForm(true); }}>
          {t('postNew')}
        </Button>
      </div>

      {message && (
        <div className={`p-3 text-sm font-bold rounded-xl border ${message.startsWith('Error') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="glass rounded-3xl border border-border/50 p-8 space-y-6 shadow-xl">
          <h2 className="text-xl font-bold text-primary">
            {editingProperty ? t('updateProperty') : t('postNewProperty')}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t('titleField')}</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t('description')}</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-24 rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none resize-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t('address')}</label>
              <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('startingPrice')}</label>
              <input type="number" required value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('area')}</label>
              <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('beds')}</label>
              <input type="number" value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('baths')}</label>
              <input type="number" value={formData.baths} onChange={e => setFormData({...formData, baths: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('propertyType')}</label>
              <select value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})} className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 text-sm focus:ring-2 focus:ring-accent outline-none">
                <option>House</option>
                <option>Villa</option>
                <option>Apartment</option>
                <option>Penthouse</option>
                <option>Land</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-4 pt-4">
              <Button type="submit" variant="accent" disabled={submitting}>
                {submitting ? t('submitting') : editingProperty ? t('updateProperty') : t('submitForReview')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>{t('cancel')}</Button>
            </div>
          </form>
        </div>
      )}

      {properties.length === 0 && !showForm ? (
        <div className="glass rounded-3xl border border-border/50 p-12 text-center">
          <p className="text-gray-400 text-lg">{t('noProperties')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('noPropertiesHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {properties.map((prop: any) => (
            <div key={prop.id} className="glass p-6 rounded-3xl border border-border/50 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-primary">{prop.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{prop.address}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  prop.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  prop.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  prop.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  prop.status === 'SOLD' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {prop.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-border/50 pt-3">
                <div><span className="text-gray-400 block">{t('price')}</span><span className="font-bold text-primary">${Number(prop.startingPrice).toLocaleString()}</span></div>
                <div><span className="text-gray-400 block">{t('area')}</span><span className="font-bold text-primary">{prop.area || '-'} m²</span></div>
                <div><span className="text-gray-400 block">{t('bedsAndBaths')}</span><span className="font-bold text-primary">{prop.beds}/{prop.baths}</span></div>
              </div>
              {prop.auction && (
                <div className="bg-accent/5 p-3 rounded-xl border border-accent/10 text-xs">
                  <span className="font-bold text-accent">{t('auction')}: {prop.auction.status}</span>
                  <span className="text-gray-400 ml-2">{t('ends')}: {new Date(prop.auction.endTime).toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-border/50 flex-wrap">
                {prop.status === 'PENDING' && (
                  <Button variant="outline" size="sm" onClick={() => startEdit(prop)}>{t('edit')}</Button>
                )}
                {(prop.status === 'PENDING' || prop.status === 'APPROVED') && (
                  <Button variant="outline" size="sm" onClick={() => setUploadModal({ isOpen: true, propertyId: prop.id })}>
                    {t('uploadDoc')}
                  </Button>
                )}
                {(prop.status === 'PENDING' || prop.status === 'APPROVED') && !prop.auction && (
                  <Button variant="outline" size="sm" onClick={() => handleWithdraw(prop.id)} className="text-red-500 border-red-200 hover:bg-red-50">
                    {t('withdraw')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadDocumentModal 
        isOpen={uploadModal.isOpen} 
        propertyId={uploadModal.propertyId} 
        onClose={() => setUploadModal({ isOpen: false, propertyId: '' })} 
        onSuccess={() => {
          setUploadModal({ isOpen: false, propertyId: '' });
          setMessage(t('uploadSuccess'));
          fetchProperties();
        }}
      />
    </div>
  );
}
