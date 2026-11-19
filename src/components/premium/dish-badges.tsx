import { Star, TrendingUp, ChefHat, Sparkles, Clock, Leaf, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface DishBadgesProps {
  isChefSpecial?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  prepMinutes?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isHalal?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  carbonFootprint?: number;
  isLocallySourced?: boolean;
}

export function DishBadges({
  isChefSpecial,
  isPopular,
  isFeatured,
  prepMinutes,
  isVegetarian,
  isVegan,
  isGlutenFree,
  isHalal,
  spiceLevel,
  carbonFootprint,
  isLocallySourced,
}: DishBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {isChefSpecial && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D84315] to-[#BF360C] text-white text-[10px] font-medium shadow-lg"
        >
          <ChefHat className="size-3" />
          Chef's Special
        </motion.span>
      )}

      {isPopular && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-medium"
        >
          <TrendingUp className="size-3" />
          Popular Choice
        </motion.span>
      )}

      {isFeatured && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-medium"
        >
          <Star className="size-3 fill-white" />
          Featured
        </motion.span>
      )}

      {prepMinutes && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium border border-blue-500/20">
          <Clock className="size-3" />
          {prepMinutes} min
        </span>
      )}

      {isVegan && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-medium border border-green-500/20">
          <Leaf className="size-3" />
          Vegan
        </span>
      )}

      {isVegetarian && !isVegan && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
          <Leaf className="size-3" />
          Vegetarian
        </span>
      )}

      {isGlutenFree && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
          GF
        </span>
      )}

      {isHalal && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium border border-blue-500/20">
          Halal
        </span>
      )}

      {spiceLevel && (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium ${
            spiceLevel === 'mild'
              ? 'bg-orange-100 text-orange-600 border border-orange-200'
              : spiceLevel === 'medium'
              ? 'bg-orange-200 text-orange-700 border border-orange-300'
              : spiceLevel === 'hot'
              ? 'bg-red-200 text-red-700 border border-red-300'
              : 'bg-red-300 text-red-800 border border-red-400'
          }`}
        >
          <Flame className="size-3" />
          {spiceLevel === 'extra_hot' ? 'Extra Hot' : spiceLevel.charAt(0).toUpperCase() + spiceLevel.slice(1)}
        </span>
      )}

      {carbonFootprint !== undefined && carbonFootprint < 2 && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-medium border border-green-500/20">
          🌱 Eco-Friendly
        </span>
      )}
    </div>
  );
}
