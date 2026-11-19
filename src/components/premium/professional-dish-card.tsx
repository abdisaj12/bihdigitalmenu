import { Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DishImage } from '@/components/dish-image';
import { ETB } from '@/lib/format';

interface ProfessionalDishCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isFavorite?: boolean;
  rating?: number;
  reviewCount?: number;
  isVegetarian?: boolean;
  onView: () => void;
  onFavorite: () => void;
  onAddToCart: () => void;
}

export function ProfessionalDishCard({
  name,
  description,
  price,
  imageUrl,
  isFeatured,
  isFavorite,
  rating = 4.5,
  reviewCount = 0,
  isVegetarian,
  onView,
  onFavorite,
  onAddToCart,
}: ProfessionalDishCardProps) {
  return (
    <article className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all hover:shadow-lg hover:border-[#D84315]/30">
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-[#D84315] text-white text-xs font-medium rounded-full">
          Chef's Special
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 dark:bg-black/95 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`size-4 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          }`}
        />
      </button>

      {/* Image */}
      <button
        onClick={onView}
        className="relative w-full aspect-[4/3] overflow-hidden bg-muted"
      >
        <DishImage src={imageUrl} name={name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Rating & Dietary */}
        <div className="flex items-center gap-3 text-xs">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-muted-foreground">({reviewCount})</span>
              )}
            </div>
          )}
          {isVegetarian && (
            <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded text-xs font-medium">
              Vegetarian
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-display font-semibold leading-snug line-clamp-2">
          <button onClick={onView} className="text-left hover:text-[#D84315] transition-colors">
            {name}
          </button>
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-2xl font-display font-semibold text-[#D84315]">
            {ETB(price)}
          </span>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            size="sm"
            className="bg-[#D84315] hover:bg-[#BF360C] text-white"
          >
            Add to Order
          </Button>
        </div>
      </div>
    </article>
  );
}
