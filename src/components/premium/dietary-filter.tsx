import { Check, Leaf, Fish, Wheat, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DietaryFilters {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  halal?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot' | null;
}

interface DietaryFilterProps {
  filters: DietaryFilters;
  onChange: (filters: DietaryFilters) => void;
}

export function DietaryFilter({ filters, onChange }: DietaryFilterProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  const toggleFilter = (key: keyof DietaryFilters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const setSpiceLevel = (level: DietaryFilters['spiceLevel']) => {
    onChange({ ...filters, spiceLevel: filters.spiceLevel === level ? null : level });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-full border-[#D84315]/30 hover:border-[#D84315]/60"
        >
          <Leaf className="size-4 mr-2" />
          Dietary Preferences
          {activeCount > 0 && (
            <span className="ml-2 flex items-center justify-center w-5 h-5 text-xs bg-[#D84315] text-white rounded-full">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Dietary Preferences</h4>

          <div className="space-y-2">
            <button
              onClick={() => toggleFilter('vegetarian')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                filters.vegetarian
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Leaf className="size-4 text-emerald-600" />
                <span className="text-sm">Vegetarian</span>
              </div>
              {filters.vegetarian && <Check className="size-4 text-emerald-600" />}
            </button>

            <button
              onClick={() => toggleFilter('vegan')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                filters.vegan
                  ? 'border-green-500 bg-green-50 dark:bg-green-950'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Leaf className="size-4 text-green-600" />
                <span className="text-sm">Vegan</span>
              </div>
              {filters.vegan && <Check className="size-4 text-green-600" />}
            </button>

            <button
              onClick={() => toggleFilter('glutenFree')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                filters.glutenFree
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wheat className="size-4 text-amber-600" />
                <span className="text-sm">Gluten-Free</span>
              </div>
              {filters.glutenFree && <Check className="size-4 text-amber-600" />}
            </button>

            <button
              onClick={() => toggleFilter('halal')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                filters.halal
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Fish className="size-4 text-blue-600" />
                <span className="text-sm">Halal</span>
              </div>
              {filters.halal && <Check className="size-4 text-blue-600" />}
            </button>
          </div>

          <div className="space-y-2 pt-3 border-t">
            <h5 className="text-xs font-medium text-muted-foreground">Spice Level</h5>
            <div className="grid grid-cols-4 gap-2">
              {(['mild', 'medium', 'hot', 'extra_hot'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSpiceLevel(level)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                    filters.spiceLevel === level
                      ? 'border-[#D84315] bg-[#D84315]/10'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <Flame
                    className={`size-4 ${
                      level === 'mild'
                        ? 'text-orange-300'
                        : level === 'medium'
                        ? 'text-orange-500'
                        : level === 'hot'
                        ? 'text-red-500'
                        : 'text-red-700'
                    }`}
                  />
                  <span className="text-[10px] capitalize">{level.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
            className="w-full"
          >
            Clear All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
