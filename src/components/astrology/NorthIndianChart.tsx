import React from 'react';
import { PlanetaryPosition } from '../../types';

interface NorthIndianChartProps {
  planets: PlanetaryPosition[];
  ascendant: string;
}

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ planets, ascendant }) => {
  const lagnaSign = parseInt(ascendant);
  
  // Helper to get sign for a house
  const getSignForHouse = (houseNum: number) => {
    let sign = (lagnaSign + houseNum - 1) % 12;
    return sign === 0 ? 12 : sign;
  };

  // Group planets by house
  const housePlanets: Record<number, string[]> = {};
  planets.forEach(p => {
    if (!housePlanets[p.house]) housePlanets[p.house] = [];
    housePlanets[p.house].push(p.planet);
  });

  const houseCoordinates = [
    { id: 1, x: 200, y: 140, labelX: 200, labelY: 110 }, // Top Diamond
    { id: 2, x: 100, y: 70, labelX: 100, labelY: 40 },  // Top Left
    { id: 3, x: 70, y: 100, labelX: 40, labelY: 100 },  // Left Top
    { id: 4, x: 140, y: 200, labelX: 110, labelY: 200 }, // Left Diamond
    { id: 5, x: 70, y: 300, labelX: 40, labelY: 300 },  // Left Bottom
    { id: 6, x: 100, y: 330, labelX: 100, labelY: 360 }, // Bottom Left
    { id: 7, x: 200, y: 260, labelX: 200, labelY: 290 }, // Bottom Diamond
    { id: 8, x: 300, y: 330, labelX: 300, labelY: 360 }, // Bottom Right
    { id: 9, x: 330, y: 300, labelX: 360, labelY: 300 }, // Right Bottom
    { id: 10, x: 260, y: 200, labelX: 290, labelY: 200 }, // Right Diamond
    { id: 11, x: 330, y: 100, labelX: 360, labelY: 100 }, // Right Top
    { id: 12, x: 300, y: 70, labelX: 300, labelY: 40 },  // Top Right
  ];

  return (
    <div className="relative w-full max-w-[500px] aspect-square bg-[#fff5f5] border-4 border-red-900 shadow-2xl rounded-xl overflow-hidden p-2">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Background Pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fee2e2" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />

        {/* Chart Lines */}
        <g stroke="#991b1b" strokeWidth="2.5" fill="none">
          <rect x="10" y="10" width="380" height="380" />
          <line x1="10" y1="10" x2="390" y2="390" />
          <line x1="390" y1="10" x2="10" y2="390" />
          <line x1="200" y1="10" x2="10" y2="200" />
          <line x1="10" y1="200" x2="200" y2="390" />
          <line x1="200" y1="390" x2="390" y2="200" />
          <line x1="390" y1="200" x2="200" y2="10" />
        </g>

        {/* Houses */}
        {houseCoordinates.map((house) => (
          <g key={house.id}>
            {/* Sign Number */}
            <text 
              x={house.labelX} 
              y={house.labelY} 
              textAnchor="middle" 
              dominantBaseline="middle"
              className="text-sm font-black fill-red-700 font-serif"
            >
              {getSignForHouse(house.id)}
            </text>
            
            {/* Planets */}
            <foreignObject 
              x={house.x - 45} 
              y={house.y - 25} 
              width="90" 
              height="50"
            >
              <div className="flex flex-wrap justify-center items-center h-full gap-1 px-1">
                {housePlanets[house.id]?.map((p, idx) => (
                  <span 
                    key={idx} 
                    className="text-[11px] font-bold text-red-950 bg-red-100/50 px-1 rounded border border-red-200/50 leading-tight"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-4 right-4 flex flex-col items-end">
        <div className="bg-red-800 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
          Lagna: {ascendant}
        </div>
      </div>
    </div>
  );
};

export default NorthIndianChart;
