"use client";
import Button from "@/components/ui/Button";
import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";

export default function Home() {
  const t = useTranslations("Landing");
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-background to-background"></div>
      
      <div className="container px-4 mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        <div className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-accent uppercase bg-accent/10 rounded-full border border-accent/20">
          Locale: {useLocale()} | {t('heroTitle') ? 'Translations Loaded' : 'Translations MISSING'}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary max-w-4xl mx-auto leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('heroSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button variant="accent" size="lg" className="w-full sm:w-auto px-8">
            {t('exploreAuctions')}
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
            {t('listProperty')}
          </Button>
        </div>

        <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { label: 'Properties Sold', value: '1,200+' },
            { label: 'Active Auctions', value: '45' },
            { label: 'Total Bidders', value: '10K+' },
            { label: 'Trust Score', value: '99.9%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
