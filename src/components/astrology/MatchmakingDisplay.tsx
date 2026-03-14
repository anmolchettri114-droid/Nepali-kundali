import React from 'react';
import { MatchmakingResult } from '../../types';
import { Heart, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchmakingDisplayProps {
  result: MatchmakingResult;
}

const MatchmakingDisplay: React.FC<MatchmakingDisplayProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 25) return 'text-green-600';
    if (score >= 18) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-24 h-24 text-pink-500 fill-pink-50" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={getScoreColor(result.score) + " text-3xl font-black"}>
              {result.score}/36
            </span>
          </div>
        </div>
        <h2 className="text-3xl font-serif font-bold text-red-900">{result.compatibility}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(result.details).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm text-center">
            <p className="text-[10px] text-red-600 uppercase font-bold tracking-wider mb-1">{key}</p>
            <p className="text-sm font-bold text-red-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm prose prose-red max-w-none">
        <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-red-500" />
          विस्तृत विश्लेषण (Detailed Analysis)
        </h3>
        <div className="whitespace-pre-wrap leading-relaxed text-red-900">
          {result.summary}
        </div>
      </div>
    </div>
  );
};

export default MatchmakingDisplay;
