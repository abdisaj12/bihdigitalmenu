import { motion } from 'framer-motion';
import { Heart, Star, Clock, TrendingUp, ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlatePresentation } from '@/components/plate-presentation';
import { DishImage } from '@/components/dish-image';
import { ETB } from '@/lib/format';

interface AmazingDishCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isFavorite?: boolean;
  rating?: number;
  reviewCount?: number;
  prepMinutes?: number;
  isVegetarian?: boolean;
  onView: () => void;
  onFavorite: () => void;
  onAddToCart: () => void;
}

export function AmazingDishCard({
  id,
  name,
  description,
  price,
  imageUrl,
  isFeatured,
  isPopular,
  isFavorite,
  rating = 4.5,
  reviewCount = 0,
  prepMinutes,
  isVegetarian,
  onView,
  onFavorite,
  onAddToCart,
}: AmazingDishCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col bg-gradient-to-br from-card to-card/50 rounded-3xl overflow-hidden border border-border/50 shadow-lg hover:shadow-2xl hover:border-[#D84315]/30 transition-all duration-300"
    >
      {/* Premium Badge Corner */}
      {(isFeatured || isPopular) && (
        <div className="absolute top-0 left-0 z-20">
          <div className="relative">
            <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
              <path
                d="M0,0 L80,0 L0,80 Z"
                fill={isFeatured ? 'url(#chefGradient)' : 'url(#popularGradient)'}
              />
              <defs>
                <linearGradient id="chefGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D84315" />
                  <stop offset="100%" stopColor="#BF360C" />
                </linearGradient>
                <linearGradient id="popularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-2 left-2 text-white">
              {isFeatured ? (
                <ChefHat className="size-5" />
              ) : (
                <TrendingUp className="size-5" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 dark:bg-black/95 backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <motion.div
          animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`size-5 transition-all ${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground group-hover:text-red-400'
            }`}
          />
        </motion.div>
      </button>

      {/* Image Container with Modern Card Style */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <button
          onClick={onView}
          className="block w-full h-full relative"
          aria-label={`View ${name}`}
        >
          <div className="absolute inset-0">
            <DishImage src={imageUrl} name={name} className="transition-transform duration-700 group-hover:scale-110" />
          </div>
        </button>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 pt-4 space-y-3">
        {/* Meta Info Bar */}
        <div className="flex items-center justify-between text-xs">
          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <Star className="size-3 fill-amber-500 text-amber-500" />
              <span className="font-medium text-amber-700 dark:text-amber-300">
                {rating.toFixed(1)}
              </span>
              {reviewCount > 0 && (
                <span className="text-amber-600/70 dark:text-amber-400/70">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Vegetarian Badge */}
          {isVegetarian && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <Sparkles className="size-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Veg
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-display font-semibold leading-tight group-hover:text-[#D84315] transition-colors line-clamp-2">
          <button onClick={onView} className="text-left w-full">
            {name}
          </button>
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Price
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-display text-[#D84315]">
              {ETB(price)}
            </span>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="h-11 px-6 rounded-full bg-gradient-to-r from-[#D84315] to-[#BF360C] hover:from-[#BF360C] hover:to-[#D84315] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Decorative Corner Accent */}
      <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="currentColor" className="text-[#D84315]" />
        </svg>
      </div>

      {/* Shine Effect on Hover */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '200%', opacity: 0.3 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
      />
    </motion.article>
  );
}
