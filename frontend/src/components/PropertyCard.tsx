import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description?: string;
    address: string;
    startingPrice: string | number;
    beds: number;
    baths: number;
    area: number;
    status: string;
    propertyType: string;
    images?: { url: string }[];
    auction?: {
      startTime: string;
      endTime: string;
      status: string;
    };
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const imageUrl = property.images && property.images.length > 0 
    ? property.images[0].url 
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop";

  const status = property.auction?.status || property.status;
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(property.startingPrice));

  return (
    <div className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 text-white backdrop-blur-md">
            {property.propertyType}
          </span>
        </div>
        {property.auction?.endTime && (
          <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-lg text-white font-mono text-xs">
            Ends: {new Date(property.auction.endTime).toLocaleDateString()}
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">{property.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 line-clamp-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.address}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 border-y border-border/50 py-3 font-medium">
          <span className="flex items-center gap-1">{property.beds} Bds</span>
          <span className="flex items-center gap-1">{property.baths} Ba</span>
          <span className="flex items-center gap-1">{property.area} m²</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Starting Price</p>
            <p className="text-2xl font-black text-primary">{price}</p>
          </div>
          <Link href={`/auctions/${property.id}`}>
            <Button variant="accent" size="sm" className="font-bold">View Bid</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
