import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { CITY_ZONES } from '../../data/cityData';
import { MapPin, Navigation, Plus, Minus, Maximize2 } from 'lucide-react';

interface MiniMapProps {
  onOpenFullMap: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ onOpenFullMap }) => {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const playerRotation = useGameStore((state) => state.playerRotation);
  const wantedStars = useGameStore((state) => state.playerStats.wantedStars);
  const shops = useGameStore((state) => state.shops);
  const vehicles = useGameStore((state) => state.vehicles);
  const activeDelivery = useGameStore((state) => state.activeDelivery);

  const [zoom, setZoom] = useState<1 | 1.8 | 2.6>(1.8);

  // Convert world [x, z] to centered radar % based on zoom level
  const toRadar = (wx: number, wz: number) => {
    const span = 460 / zoom; // Expanded full city = 460m
    const centerX = zoom === 1 ? 0 : playerPosition[0];
    const centerZ = zoom === 1 ? 0 : playerPosition[2];
    const px = 50 + ((wx - centerX) / span) * 100;
    const py = 50 + ((wz - centerZ) / span) * 100;
    return { x: px, y: py, visible: px >= -8 && px <= 108 && py >= -8 && py <= 108 };
  };

  const playerRadar = toRadar(playerPosition[0], playerPosition[2]);
  const policeRadar = toRadar(-18, 84);
  const deliveryRadar = activeDelivery
    ? toRadar(activeDelivery.targetPosition[0], activeDelivery.targetPosition[2])
    : null;

  // Road grid lines mapped to radar space
  const mainAxis = toRadar(0, 0);
  const ringNeg = toRadar(-50, -50);
  const ringPos = toRadar(50, 50);
  const midNeg = toRadar(-105, -105);
  const midPos = toRadar(105, 105);
  const outerNeg = toRadar(-165, -165);
  const outerPos = toRadar(165, 165);

  return (
    <div
      className="relative w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-slate-700 bg-[#0B101E]/95 shadow-2xl select-none group"
      style={{ borderColor: wantedStars > 0 ? '#ef4444' : undefined }}
    >
      {/* Clickable radar surface to open full map */}
      <div
        onClick={onOpenFullMap}
        className="absolute inset-0 cursor-pointer"
        title="সম্পূর্ণ মানচিত্র খুলুন"
      >
        {/* City Street Grid Lines */}
        <div
          className="absolute left-0 right-0 h-2 bg-slate-700/70 -translate-y-1/2"
          style={{ top: `${mainAxis.y}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-2 bg-slate-700/70 -translate-x-1/2"
          style={{ left: `${mainAxis.x}%` }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 bg-slate-800/90"
          style={{ top: `${ringNeg.y}%` }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 bg-slate-800/90"
          style={{ top: `${ringPos.y}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800/90"
          style={{ left: `${ringNeg.x}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800/90"
          style={{ left: `${ringPos.x}%` }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 bg-slate-800/70"
          style={{ top: `${midNeg.y}%` }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 bg-slate-800/70"
          style={{ top: `${midPos.y}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800/70"
          style={{ left: `${midNeg.x}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800/70"
          style={{ left: `${midPos.x}%` }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 bg-slate-800/50"
          style={{ top: `${outerNeg.y}%` }}
        />
        <div
          className="absolute left-0 right-0 h-0.5 bg-slate-800/50"
          style={{ top: `${outerPos.y}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800/50"
          style={{ left: `${outerNeg.x}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-800/50"
          style={{ left: `${outerPos.x}%` }}
        />

        {/* Zone Pins */}
        {CITY_ZONES.map((zone) => {
          const pos = toRadar(zone.position[0], zone.position[2]);
          if (!pos.visible) return null;
          return (
            <div
              key={zone.id}
              className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-80"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, backgroundColor: zone.color }}
            />
          );
        })}

        {/* Shop Squares */}
        {shops.map((shop) => {
          const pos = toRadar(shop.position[0], shop.position[2]);
          if (!pos.visible) return null;
          return (
            <div
              key={shop.id}
              className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-[2px] bg-amber-300 border border-slate-950 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            />
          );
        })}

        {/* Vehicle Dots */}
        {vehicles.map((veh) => {
          const pos = toRadar(veh.position[0], veh.position[2]);
          if (!pos.visible) return null;
          return (
            <div
              key={veh.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            />
          );
        })}

        {/* Police Station Marker */}
        {policeRadar.visible && (
          <div
            className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 bg-blue-600 border border-white/60 rounded-sm -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[7px] sm:text-[8px] font-black text-white"
            style={{ left: `${policeRadar.x}%`, top: `${policeRadar.y}%` }}
          >
            P
          </div>
        )}

        {/* Active Delivery Beacon */}
        {deliveryRadar && (
          <div
            className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400 border-2 border-white -translate-x-1/2 -translate-y-1/2 shadow-lg z-10"
            style={{
              left: `${Math.max(5, Math.min(95, deliveryRadar.x))}%`,
              top: `${Math.max(5, Math.min(95, deliveryRadar.y))}%`,
            }}
          />
        )}

        {/* Player Direction Arrow */}
        <div
          className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 border border-slate-950 -translate-x-1/2 -translate-y-1/2 shadow-lg flex items-center justify-center z-20"
          style={{ left: `${playerRadar.x}%`, top: `${playerRadar.y}%` }}
        >
          <Navigation
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-slate-950 fill-slate-950"
            style={{ transform: `rotate(${(-playerRotation * 180) / Math.PI}deg)` }}
          />
        </div>

        {/* Wanted Tint */}
        {wantedStars > 0 && (
          <div className="absolute inset-0 bg-red-600/15 pointer-events-none" />
        )}
      </div>

      {/* Header Tag */}
      <div className="hidden sm:flex absolute top-1.5 left-2 pointer-events-none items-center gap-1 text-[10px] font-bold text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded-md">
        <MapPin className="w-2.5 h-2.5 text-amber-400" />
        <span>চান্দা সিটি</span>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex flex-col gap-0.5 sm:gap-1 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => (z === 1 ? 1.8 : 2.6));
          }}
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-slate-900/95 border border-slate-700 hover:border-amber-400 text-slate-200 flex items-center justify-center"
          title="জুম ইন"
        >
          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => (z === 2.6 ? 1.8 : 1));
          }}
          className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-slate-900/95 border border-slate-700 hover:border-amber-400 text-slate-200 flex items-center justify-center"
          title="জুম আউট"
        >
          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>

      {/* Expand Map Button */}
      <button
        onClick={onOpenFullMap}
        className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 px-1 sm:px-1.5 py-0.5 rounded-md bg-slate-900/95 border border-slate-700 hover:border-amber-400 text-[8px] sm:text-[9px] text-slate-300 hover:text-white font-semibold flex items-center gap-0.5 sm:gap-1"
      >
        <span>ম্যাপ</span>
        <Maximize2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
      </button>
    </div>
  );
};
