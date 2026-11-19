import { Award, TrendingUp, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoyaltyDisplayProps {
  points: number;
  ordersCount?: number;
}

export function LoyaltyDisplay({ points, ordersCount = 0 }: LoyaltyDisplayProps) {
  const getTier = (pts: number): { name: string; color: string; minPoints: number } => {
    if (pts >= 1000) return { name: 'Platinum', color: 'from-slate-300 to-slate-500', minPoints: 1000 };
    if (pts >= 500) return { name: 'Gold', color: 'from-yellow-300 to-yellow-600', minPoints: 500 };
    if (pts >= 200) return { name: 'Silver', color: 'from-gray-300 to-gray-500', minPoints: 200 };
    return { name: 'Bronze', color: 'from-amber-300 to-amber-600', minPoints: 0 };
  };

  const currentTier = getTier(points);
  const nextTier =
    currentTier.name === 'Platinum'
      ? null
      : currentTier.name === 'Gold'
      ? { name: 'Platinum', minPoints: 1000 }
      : currentTier.name === 'Silver'
      ? { name: 'Gold', minPoints: 500 }
      : { name: 'Silver', minPoints: 200 };

  const progress = nextTier
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-br from-[#D84315]/10 to-[#BF360C]/10 rounded-2xl border border-[#D84315]/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentTier.color} flex items-center justify-center`}>
            <Award className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium">{currentTier.name} Member</p>
            <p className="text-xs text-muted-foreground">{ordersCount} orders</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-bold text-[#D84315]">{points}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Points</p>
        </div>
      </div>

      {nextTier && (
        <>
          <div className="relative w-full h-2 bg-background rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D84315] to-[#BF360C]"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{nextTier.minPoints - points} points to {nextTier.name}</span>
            <TrendingUp className="size-3" />
          </div>
        </>
      )}

      {points >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 p-2 bg-[#D84315]/10 rounded-lg flex items-center gap-2 text-xs"
        >
          <Gift className="size-4 text-[#D84315]" />
          <span>You have {Math.floor(points / 100)} rewards available!</span>
        </motion.div>
      )}
    </motion.div>
  );
}
