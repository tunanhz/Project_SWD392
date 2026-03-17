import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: string;
    type: string;
    beds: number;
    baths: number;
    size: string;
    image: string;
    status: string;
    endTime: string;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            property.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {property.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 text-white backdrop-blur-md">
            {property.type}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-lg text-white font-mono text-sm">
          Ends in: 2d 05h
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{property.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 border-y border-border/50 py-3">
          <span className="flex items-center gap-1 italic">{property.beds} Beds</span>
          <span className="flex items-center gap-1 italic">{property.baths} Baths</span>
          <span className="flex items-center gap-1 italic">{property.size}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Reserve Price</p>
            <p className="text-2xl font-black text-primary">{property.price}</p>
          </div>
          <Link href={`/auctions/${property.id}`}>
            <Button variant="accent" size="sm">View Bid</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
