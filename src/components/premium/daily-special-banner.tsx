import { Sparkles, Clock, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DailySpecial {
  id: string;
  itemName: string;
  originalPrice: number;
  specialPrice: number;
  validUntil: string;
  remainingQuantity?: number;
  imageUrl?: string;
}

interface DailySpecialBannerProps {
  special: DailySpecial;
  onView: () => void;
}

export function DailySpecialBanner({ special, onView }: DailySpecialBannerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(special.validUntil).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [special.validUntil]);

  const discount = Math.round(
    ((special.originalPrice - special.specialPrice) / special.originalPrice) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-elegant cursor-pointer"
      onClick={onView}
    >
      <div className="relative bg-background rounded-[22px] p-5 h-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        <div className="relative flex items-center gap-4">
          {/* Image */}
          {special.imageUrl && (
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-amber-500/50">
              <img
                src={special.imageUrl}
                alt={special.itemName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="size-5 text-amber-500" />
              </motion.div>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Today's Special
              </span>
            </div>

            <h3 className="font-display text-xl mb-2 truncate">{special.itemName}</h3>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#D84315]">
                  ETB {special.specialPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ETB {special.originalPrice.toFixed(2)}
                </span>
              </div>

              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500 text-white text-xs font-bold"
              >
                <TrendingDown className="size-3" />
                {discount}% OFF
              </motion.span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>{timeLeft}</span>
              </div>
              {special.remainingQuantity !== undefined && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Only {special.remainingQuantity} left!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Shine Effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      </div>
    </motion.div>
  );
}
