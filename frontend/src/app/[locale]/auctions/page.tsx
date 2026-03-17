"use client";

import { useEffect, useState } from "react";
import { Link } from "@/navigation";
import PropertyCard from "@/components/PropertyCard";
import { useTranslations } from "next-intl";

export default function AuctionsPage() {
  const t = useTranslations("Auctions");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        setProperties(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="container px-4 mx-auto py-12 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{t('title')}</h1>
        <p className="text-gray-500 max-w-2xl mx-auto italic">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-border/50">
        <div className="flex gap-4">
          <select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer">
            <option>{t('allTypes')}</option>
            <option>Villa</option>
            <option>Penthouse</option>
            <option>Mansion</option>
          </select>
          <select className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer">
            <option>{t('allLocations')}</option>
            <option>District 1</option>
            <option>District 2</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('sortBy')}:</span>
          <select className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer text-accent">
            <option>{t('latest')}</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[400px] rounded-2xl bg-accent/5 animate-pulse border border-border/20"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 glass rounded-3xl border border-red-100">
          <p className="text-red-500 font-bold">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-accent underline">Try again</button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-border/50">
          <p className="text-gray-500">No auctions found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {properties.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
