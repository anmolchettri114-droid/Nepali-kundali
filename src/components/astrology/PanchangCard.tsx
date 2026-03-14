import React from 'react';
import { PanchangData } from '../../types';
import { Sun, Moon, Wind, Droplets, Sunrise, Sunset } from 'lucide-react';

interface PanchangCardProps {
  data: PanchangData;
}

const PanchangCard: React.FC<PanchangCardProps> = ({ data }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-serif font-bold text-red-900 mb-4 flex items-center gap-2">
        <Sun className="w-5 h-5 text-red-600" />
        आजको पञ्चाङ्ग (Daily Panchang)
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-red-700 uppercase tracking-wider font-medium">तिथि (Tithi)</p>
          <p className="text-lg font-bold text-red-900">{data.tithi}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-red-700 uppercase tracking-wider font-medium">नक्षत्र (Nakshatra)</p>
          <p className="text-lg font-bold text-red-900">{data.nakshatra}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-red-700 uppercase tracking-wider font-medium">योग (Yoga)</p>
          <p className="text-lg font-bold text-red-900">{data.yoga}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-red-700 uppercase tracking-wider font-medium">करण (Karana)</p>
          <p className="text-lg font-bold text-red-900">{data.karana}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-red-700 uppercase tracking-wider font-medium">राशि (Moon Rashi)</p>
          <p className="text-lg font-bold text-red-900">{data.rashi}</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-red-100 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-full">
            <Sunrise className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] text-red-600 uppercase font-bold">सूर्योदय (Sunrise)</p>
            <p className="text-sm font-bold text-red-900">{data.sunrise}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-full">
            <Sunset className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] text-red-600 uppercase font-bold">सूर्यास्त (Sunset)</p>
            <p className="text-sm font-bold text-red-900">{data.sunset}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanchangCard;
