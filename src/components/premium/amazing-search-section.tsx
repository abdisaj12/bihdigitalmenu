import { Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { DietaryFilter, type DietaryFilters } from './dietary-filter';

interface AmazingSearchSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  dietaryFilters: DietaryFilters;
  onFiltersChange: (filters: DietaryFilters) => void;
  resultsCount: number;
}

export function AmazingSearchSection({
  search,
  onSearchChange,
  dietaryFilters,
  onFiltersChange,
  resultsCount,
}: AmazingSearchSectionProps) {
  return (
    <div className="relative -mx-5 sm:-mx-8 my-12 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/* Beautiful food background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D84315]/10 to-transparent" />
        
        {/* Animated grain texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <div className="absolute inset-0 bg-noise" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Stunning Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{
                textShadow: [
                  '0 0 20px rgba(216, 67, 21, 0.3)',
                  '0 0 40px rgba(216, 67, 21, 0.5)',
                  '0 0 20px rgba(216, 67, 21, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D84315]/40 bg-[#D84315]/10 backdrop-blur-sm"
            >
              <Sparkles className="size-4 text-[#D84315]" />
              <span className="text-xs font-medium tracking-[0.3em] uppercase text-white">
                Discover Your Next Favorite
              </span>
            </motion.div>

            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <span className="block bg-gradient-to-r from-[#D84315] via-[#FF6B35] to-[#D84315] bg-clip-text text-transparent mt-2">
                Dining Experience
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto font-light">
              Explore our curated collection of {resultsCount} exceptional dishes
            </p>
          </motion.div>

          {/* Search Bar - Extra Stunning */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 bg-gradient-to-r from-[#D84315] via-[#FF6B35] to-[#D84315] rounded-3xl blur-xl opacity-50"
            />

            {/* Search input container */}
            <div className="relative bg-white dark:bg-black rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              {/* Search icon */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Search className="size-6 text-[#D84315]" />
                </motion.div>
              </div>

              {/* Input */}
              <Input
                aria-label="Search our menu"
                className="h-20 pl-16 pr-6 text-lg sm:text-xl border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-medium placeholder:text-muted-foreground/60 placeholder:font-normal"
                placeholder="What are you craving today?"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: search ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D84315] via-[#FF6B35] to-[#D84315] origin-left"
              />
            </div>

            {/* Search hint */}
            {!search && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-3 text-center text-sm text-white/60"
              >
                Try searching for "pizza", "traditional", "vegetarian"...
              </motion.p>
            )}

            {/* Active search results */}
            {search && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                  <span className="font-semibold">{resultsCount}</span>
                  <span className="text-white/70">
                    {resultsCount === 1 ? 'result' : 'results'} found
                  </span>
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Dietary Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <DietaryFilter filters={dietaryFilters} onChange={onFiltersChange} />
          </motion.div>

          {/* Decorative floating elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  scale: 0,
                }}
                animate={{
                  y: '-10%',
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
                className="absolute w-1 h-1 rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
