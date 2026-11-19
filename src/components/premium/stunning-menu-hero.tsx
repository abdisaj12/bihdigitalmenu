import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sparkles, ChefHat, Award, Flame, Star } from 'lucide-react';

interface StunningMenuHeroProps {
  dishCount: number;
  currentCategory?: string;
}

// Real meal images from Bulcha's media library
const heroImages = [
  { src: '/src/assets/bulcha-dining-platter.jpg', name: 'Ethiopian Platter', category: 'Traditional' },
  { src: '/src/assets/dish-burger.jpg', name: 'Gourmet Burger', category: 'International' },
  { src: '/src/assets/dish-pasta.jpg', name: 'Italian Pasta', category: 'International' },
  { src: '/src/assets/dish-salmon.jpg', name: 'Grilled Salmon', category: 'Seafood' },
  { src: '/src/assets/dish-dessert.jpg', name: 'Delicious Dessert', category: 'Sweets' },
  { src: '/src/assets/hero-ambience.jpg', name: 'Dining Experience', category: 'Ambience' },
];

export function StunningMenuHero({ dishCount, currentCategory }: StunningMenuHeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const reducedMotion = useReducedMotion();

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % heroImages.length;
    const img = new Image();
    img.src = heroImages[nextIndex].src;
  }, [currentImageIndex]);

  // Rotate images every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageLoaded(false);
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Change image when category changes
  useEffect(() => {
    if (currentCategory && currentCategory !== 'all') {
      setImageLoaded(false);
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }
  }, [currentCategory]);

  return (
    <div className="relative -mx-5 sm:-mx-8 overflow-hidden">
      {/* Dynamic Food Images Background - Professional Height */}
      <div className="absolute inset-0 h-[450px] sm:h-[500px] lg:h-[550px]">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-bulcha-red rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Image with Ken Burns Effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0.3, 
              scale: imageLoaded ? [1.1, 1.05] : 1.1 
            }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ 
              opacity: { duration: 0.8, ease: 'easeInOut' },
              scale: { duration: 6, ease: 'linear' }
            }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentImageIndex].src}
              alt={heroImages[currentImageIndex].name}
              className="w-full h-full object-cover object-center brightness-90"
              loading="eager"
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dish Info Card - Floating Bottom Right */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${currentImageIndex}`}
            initial={{ opacity: 0, x: 50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-20 right-8 z-20 hidden sm:block"
          >
            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 px-6 py-4 min-w-[240px]">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-bulcha-red/30">
                  <img
                    src={heroImages[currentImageIndex].src}
                    alt={heroImages[currentImageIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-bulcha-red uppercase tracking-wider mb-1">
                    {heroImages[currentImageIndex].category}
                  </p>
                  <h3 className="text-base font-display font-bold text-foreground leading-tight line-clamp-2">
                    {heroImages[currentImageIndex].name}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Elegant Gradient Overlays - Optimized for light & dark themes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent dark:from-black/60 dark:via-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent dark:from-black/70 dark:via-black/20" />
        
        {/* Animated Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Food Icons Animation */}
        {!reducedMotion && (
          <>
            <motion.div
              className="absolute top-20 right-20 text-white/10 dark:text-white/20"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Flame className="w-16 h-16" />
            </motion.div>
            
            <motion.div
              className="absolute bottom-32 left-20 text-white/10 dark:text-white/20"
              animate={{
                y: [0, 15, 0],
                rotate: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <Star className="w-12 h-12" />
            </motion.div>
          </>
        )}
      </div>

      {/* Content with Stunning Animations */}
      <div className="relative z-10 px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            {/* Animated Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-bulcha-red/50 bg-gradient-to-r from-bulcha-red/20 to-bulcha-burgundy/20 backdrop-blur-md mb-6 shadow-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Award className="size-4 text-bulcha-red" />
              </motion.div>
              <span className="text-sm font-semibold text-white tracking-wide drop-shadow-lg">
                Premium Selection
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="size-4 text-yellow-400" />
              </motion.div>
            </motion.div>

            {/* Stunning Headline with Gradient Animation */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <motion.span 
                className="block text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight"
              >
                <motion.span 
                  className="block text-white drop-shadow-2xl mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Discover Our
                </motion.span>
                <motion.span 
                  className="block relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.span
                    className="bg-gradient-to-r from-bulcha-red via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-text-shimmer"
                    style={{
                      backgroundSize: '200% auto',
                    }}
                  >
                    Exceptional Menu
                  </motion.span>
                  {/* Underline Animation */}
                  <motion.div
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-bulcha-red via-orange-500 to-transparent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                  />
                </motion.span>
              </motion.span>
            </motion.h1>

            {/* Description with Fade-in - No dish count */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg sm:text-xl text-white drop-shadow-lg font-light leading-relaxed mb-8 max-w-xl"
            >
              Carefully crafted dishes blending{' '}
              <span className="text-yellow-400 font-medium">Ethiopian heritage</span>{' '}
              with international flavors
            </motion.p>

            {/* Info Badges with Stagger Animation */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.6,
                  },
                },
              }}
              className="flex flex-wrap items-center gap-4"
            >
              <BadgeItem 
                icon={ChefHat} 
                label="Chef" 
                value="Curated" 
                delay={0}
              />
              <BadgeItem 
                icon={Sparkles} 
                label="Fresh" 
                value="Daily" 
                delay={0.1}
              />
              <BadgeItem 
                icon={Flame} 
                label="Quality" 
                value="Premium" 
                delay={0.2}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Smooth Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
      
      {/* Image Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setImageLoaded(false);
              setCurrentImageIndex(index);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'w-12 bg-bulcha-red shadow-lg shadow-bulcha-red/50' 
                : 'w-6 bg-white/40 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="sr-only">View image {index + 1}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Animated Badge Component
function BadgeItem({ 
  icon: Icon, 
  label, 
  value, 
  delay 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  delay: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/20 dark:hover:bg-white/15 transition-colors cursor-default"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay,
        }}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-bulcha-red/40 to-bulcha-burgundy/40 dark:from-bulcha-red/30 dark:to-bulcha-burgundy/30 backdrop-blur-sm border border-bulcha-red/60 dark:border-bulcha-red/50 flex items-center justify-center shadow-inner"
      >
        <Icon className="size-5 text-bulcha-red drop-shadow-lg" />
      </motion.div>
      <div>
        <p className="text-xs text-white/90 font-medium leading-none drop-shadow">{label}</p>
        <p className="text-sm text-white font-bold leading-none mt-1 drop-shadow">{value}</p>
      </div>
    </motion.div>
  );
}
