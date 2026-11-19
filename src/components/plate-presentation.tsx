import type { ReactNode } from 'react';

export function PlatePresentation({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return (
    <div className="relative w-full aspect-square">
      {/* Outer plate ring - terracotta/orange */}
      <div className="absolute inset-0 rounded-full border-[3px] border-[#D84315] opacity-95" />
      
      {/* Middle plate ring - soft peach gradient */}
      <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 border-2 border-[#D84315]/20" />
      
      {/* Inner white plate */}
      <div className="absolute inset-[18px] rounded-full bg-white border border-orange-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]" />
      
      {/* Food content area - circular crop */}
      <div className="absolute inset-[22px] rounded-full overflow-hidden">
        {children}
      </div>

      {/* Featured star badge */}
      {featured && (
        <div className="absolute -top-2 -right-2 z-10 flex size-10 items-center justify-center rounded-full bg-[#D84315] text-white text-lg font-bold shadow-lg">
          ★
        </div>
      )}
    </div>
  );
}
