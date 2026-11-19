import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface DishRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function DishRating({
  rating,
  reviewCount = 0,
  size = 'md',
  showCount = true,
}: DishRatingProps) {
  const sizes = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const starSize = sizes[size];
  const textSize = textSizes[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = star === Math.ceil(rating) && rating % 1 !== 0;
          const fillPercent = partial ? (rating % 1) * 100 : filled ? 100 : 0;

          return (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: star * 0.05, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              {/* Background star (empty) */}
              <Star className={`${starSize} text-gray-300 dark:text-gray-700`} />

              {/* Filled star */}
              {fillPercent > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <Star
                    className={`${starSize} text-amber-500 fill-amber-500`}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <span className={`${textSize} font-medium text-foreground`}>
        {rating.toFixed(1)}
      </span>

      {showCount && reviewCount > 0 && (
        <span className={`${textSize} text-muted-foreground`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingInput({ value, onChange, size = 'lg' }: RatingInputProps) {
  const sizes = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-10',
  };

  const starSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(star)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D84315] rounded-full p-1"
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= value
                ? 'text-amber-500 fill-amber-500'
                : 'text-gray-300 dark:text-gray-700 hover:text-amber-300'
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}
