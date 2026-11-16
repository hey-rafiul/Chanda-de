import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { soundManager } from '../../audio/soundManager';
import { CITY_ZONES } from '../../data/cityData';
import { X, Navigation, Coins, Bell, Lock, Clock, Package } from 'lucide-react';

interface VehicleModalProps {
  onTeleport: (pos: [number, number, number]) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ onTeleport }) => {
  const vehicle = useGameStore((state) => state.selectedVehicle);
  const closeModal = useGameStore((state) => state.closeModal);
  const addMoney = useGameStore((state) => state.addMoney);
  const spendMoney = useGameStore((state) => state.spendMoney);
  const addXP = useGameStore((state) => state.addXP);
  const playerLevel = useGameStore((state) => state.playerStats.level);
  const activeEvent = useGameStore((state) => state.activeEvent);
  const vehicleCooldowns = useGameStore((state) => state.vehicleCooldowns);
  const setVehicleCooldown = useGameStore((state) => state.setVehicleCooldown);
  const activeDelivery = useGameStore((state) => state.activeDelivery);
  const startDeliveryJob = useGameStore((state) => state.startDeliveryJob);

  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!vehicle) return null;

  const isPoliceVehicle = vehicle.fareOrFee <= 0;
  const cooldownUntil = vehicleCooldowns[vehicle.id] || 0;
  const cooldownSec = Math.max(0, Math.ceil((cooldownUntil - nowMs) / 1000));
  const feeMultiplier = activeEvent?.effect === 'transport_rush' ? 2 : 1;
  const effectiveFee = vehicle.fareOrFee * feeMultiplier;
  const travelFare = Math.max(20, Math.round(vehicle.fareOrFee * 0.6));

  const handleHorn = () => {
    if (vehicle.type === 'rickshaw') {
      soundManager.playRickshawBell();
    } else if (isPoliceVehicle) {
      soundManager.playPoliceSiren();
    } else {
      soundManager.playBusHorn();
    }
  };

  const handleCollectUnionFee = () => {
    if (isPoliceVehicle || cooldownSec > 0) return;
    addMoney(effectiveFee, `Transport Fee: ${vehicle.name}`, `${vehicle.nameBn} থেকে পরিবহন ফি`, 'transport');
    addXP(45);
    setVehicleCooldown(vehicle.id, 55000);
    closeModal();
  };

  const handleFastTravel = (destZoneId: string) => {
    const targetZone = CITY_ZONES.find(
      (z) =>
        z.id === destZoneId ||
        z.name.toLowerCase().includes(destZoneId.toLowerCase())
    );
    if (!targetZone) return;

    if (playerLevel < targetZone.minLevel) {
      soundManager.playHit();
      useGameStore.getState().notify(
        'এলাকাটি এখনো লক আছে!',
        `${targetZone.nameBn} যেতে লেভেল ${targetZone.minLevel} প্রয়োজন।`,
        'warning'
      );
      return;
    }

    if (isPoliceVehicle) {
      handleHorn();
      onTeleport(targetZone.position);
      closeModal();
      return;
    }

    if (spendMoney(travelFare, `Ride to ${targetZone.name}`, `${targetZone.nameBn} ভাড়া`, 'transport')) {
      handleHorn();
      onTeleport(targetZone.position);
      closeModal();
    }
  };

  const handleAcceptVanDelivery = () => {
    const job = startDeliveryJob();
    if (job) closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0B101E] border-2 border-emerald-500/60 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/25 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl">
              {vehicle.type === 'bus' && '🚌'}
              {vehicle.type === 'rickshaw' && '🚲'}
              {vehicle.type === 'cng' && '🛺'}
              {vehicle.type === 'car' && '🚓'}
              {vehicle.type === 'van' && '🚐'}
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg leading-tight">{vehicle.nameBn}</h2>
              <div className="text-xs text-slate-400">ড্রাইভার: {vehicle.driverName}</div>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <div className="text-2xl mt-0.5">🗣️</div>
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-1">{vehicle.driverName} বললেন:</div>
              <p className="text-sm text-slate-100 font-bangla leading-relaxed">"{vehicle.dialogue}"</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleHorn}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>
                {vehicle.type === 'rickshaw'
                  ? 'ট্রিং ট্রিং বেল!'
                  : isPoliceVehicle
                  ? 'সাইরেন বাজান'
                  : 'হর্ন বাজান'}
              </span>
            </button>

            {!isPoliceVehicle && (
              <button
                onClick={handleCollectUnionFee}
                disabled={cooldownSec > 0}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all tabular-nums ${
                  cooldownSec > 0
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow active:scale-95'
                }`}
              >
                {cooldownSec > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>অপেক্ষা ({cooldownSec}s)</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>পরিবহন ফি (+৳{effectiveFee})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Delivery Van Express Job Offer */}
          {vehicle.type === 'van' && !activeDelivery && (
            <button
              onClick={handleAcceptVanDelivery}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow active:scale-95 transition-transform"
            >
              <Package className="w-4 h-4" />
              <span>এক্সপ্রেস পার্সেল ডেলিভারির কাজ নিন!</span>
            </button>
          )}

          {/* Fast Travel Destinations */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>ফাস্ট ট্রাভেল গন্তব্য</span>
              </span>
              <span className="text-[11px] text-amber-400 tabular-nums">
                {isPoliceVehicle ? 'থানা রুট (ফ্রি)' : `ভাড়া: ৳${travelFare}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {vehicle.destinations.map((destId) => {
                const zone = CITY_ZONES.find((z) => z.id === destId);
                const label = zone ? zone.nameBn : destId;
                const locked = zone ? playerLevel < zone.minLevel : false;
                return (
                  <button
                    key={destId}
                    onClick={() => handleFastTravel(destId)}
                    className={`py-2.5 px-3 rounded-xl border text-left text-xs font-bold transition-colors flex flex-col justify-center ${
                      locked
                        ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                        : 'bg-slate-800/80 hover:bg-emerald-950/70 border-slate-700 hover:border-emerald-500 text-white active:scale-95'
                    }`}
                  >
                    <span className="text-[10px] flex items-center justify-between text-emerald-300">
                      <span>গন্তব্য ➔</span>
                      {locked && zone && (
                        <span className="text-rose-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          Lv.{zone.minLevel}
                        </span>
                      )}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
