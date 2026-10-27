'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useScreenFit, ScreenFitState, ScreenTier } from '@/hooks/useScreenFit';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Maximize2,
  Minimize2,
  Sliders,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ScreenFitContextValue {
  fitState: ScreenFitState;
  simulationTier: ScreenTier | 'auto';
  setSimulationMode: (tier: ScreenTier | 'auto') => void;
  isHudOpen: boolean;
  setIsHudOpen: (open: boolean) => void;
}

const ScreenFitContext = createContext<ScreenFitContextValue | null>(null);

export function useScreenFitContext() {
  const ctx = useContext(ScreenFitContext);
  if (!ctx) {
    throw new Error('useScreenFitContext must be used within a ScreenFitProvider');
  }
  return ctx;
}

const SIMULATION_PRESETS: {
  id: ScreenTier | 'auto';
  label: string;
  category: string;
  width?: number;
  height?: number;
  icon: React.ElementType;
}[] = [
  { id: 'auto', label: 'Real Auto-Detect', category: 'Dynamic', icon: Sparkles },
  { id: 'phone', label: 'Compact Phone (375px)', category: 'Mobile', width: 375, height: 667, icon: Smartphone },
  { id: 'tablet', label: 'Tablet / iPad (768px)', category: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'laptop', label: 'Standard Laptop (1280px)', category: 'Laptop', width: 1280, height: 800, icon: Laptop },
  { id: 'desktop', label: 'Full HD Desktop (1920px)', category: 'Desktop', width: 1920, height: 1080, icon: Monitor },
  { id: 'tv', label: '4K Smart TV (2560px - 3840px)', category: 'Television', width: 2560, height: 1440, icon: Tv },
  { id: 'billboard', label: 'Digital Billboard (3840px+)', category: 'DOOH Billboard', width: 3840, height: 2160, icon: Maximize2 },
];

export function ScreenFitProvider({ children }: { children: React.ReactNode }) {
  const { fitState, updateFitMetrics } = useScreenFit();
  const [simulationTier, setSimulationTier] = useState<ScreenTier | 'auto'>('auto');
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Load persistence for HUD state
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('dokind_screen_hud_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (e) {}
  }, []);

  const handleSetSimulation = (presetId: ScreenTier | 'auto') => {
    setSimulationTier(presetId);
    const root = document.documentElement;

    if (presetId === 'auto') {
      root.removeAttribute('data-simulated-tier');
      root.style.removeProperty('--simulated-scale');
      updateFitMetrics();
    } else {
      const preset = SIMULATION_PRESETS.find((p) => p.id === presetId);
      if (preset && preset.width && preset.height) {
        root.setAttribute('data-simulated-tier', presetId);
        updateFitMetrics(preset.width, preset.height);
      }
    }
  };

  const handleDismissHud = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('dokind_screen_hud_dismissed', 'true');
    } catch (e) {}
  };

  const getTierIcon = (tier: ScreenTier) => {
    switch (tier) {
      case 'phone':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'laptop':
        return Laptop;
      case 'desktop':
        return Monitor;
      case 'tv':
        return Tv;
      case 'billboard':
        return Maximize2;
      default:
        return Monitor;
    }
  };

  const ActiveTierIcon = getTierIcon(fitState.tier);

  return (
    <ScreenFitContext.Provider
      value={{
        fitState,
        simulationTier,
        setSimulationMode: handleSetSimulation,
        isHudOpen,
        setIsHudOpen,
      }}
    >
      {children}

      {/* Responsive Screen Fit Floating Controller */}
      {process.env.NEXT_PUBLIC_ENABLE_SCREEN_HUD === 'true' && !isDismissed && (
        <aside
          aria-label="Responsive Screen Fit Controller"
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 pointer-events-auto print:hidden font-sans"
        >
          {isHudOpen ? (
            <div className="bg-white/95 backdrop-blur-md border border-[#E8E6E1] rounded-2xl shadow-2xl p-4 w-76 sm:w-84 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 text-[#202124]">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FFF0EF] text-[#EF4949]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">Universal Screen Fit</h4>
                    <p className="text-[10px] text-[#72777F]">Auto-adaptive across every display</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsHudOpen(false)}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                    title="Minimize controller"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDismissHud}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                    title="Dismiss controller for this session"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Current Metrics Card */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EAE7E2] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#72777F] font-medium">Detected Resolution</span>
                  <span className="font-mono font-bold text-[#202124] text-[11px]">
                    {fitState.width} × {fitState.height} px
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#72777F] font-medium">Display Tier</span>
                  <span className="capitalize font-bold text-[#EF4949] text-[11px] flex items-center gap-1">
                    <ActiveTierIcon className="w-3 h-3" />
                    {fitState.tier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#72777F] font-medium">Scale Multiplier</span>
                  <span className="font-mono font-bold text-[#25845B] text-[11px]">
                    {fitState.scaleFactor}x
                  </span>
                </div>
              </div>

              {/* Simulation Presets List */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block pb-1.5">
                  Simulate Display Mode
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {SIMULATION_PRESETS.map((preset) => {
                    const isSelected = simulationTier === preset.id;
                    const IconComponent = preset.icon;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSetSimulation(preset.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#EF4949] text-white shadow-xs font-bold'
                            : 'hover:bg-neutral-100/70 text-[#4A5056]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#72777F]'}`} />
                          <span>{preset.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                <span>Auto-resizes & fits in real-time</span>
                <span className="font-medium text-[#25845B]">✓ Active</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsHudOpen(true)}
              className="flex items-center gap-2 bg-[#202124]/90 hover:bg-[#202124] text-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full shadow-lg border border-white/20 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer group hover:scale-105"
              title="Click to view display metrics or simulate other screen sizes"
            >
              <ActiveTierIcon className="w-3.5 h-3.5 text-[#EF4949] group-hover:rotate-12 transition-transform" />
              <span className="font-mono text-[11px] sm:text-xs">
                {fitState.width}px • {fitState.tier}
              </span>
              <Sliders className="w-3 h-3 text-neutral-400 group-hover:text-white" />
            </button>
          )}
        </aside>
      )}
    </ScreenFitContext.Provider>
  );
}
