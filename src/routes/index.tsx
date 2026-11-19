import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, ChefHat, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bulcha International Hotel — Fine Dining in Hawassa" },
      {
        name: "description",
        content: "An exceptional taste experience. Discover the art of fine dining at Bulcha International Hotel.",
      },
    ],
  }),
  component: CinematicIntro,
});

function CinematicIntro() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<'intro' | 'showcase' | 'welcome' | 'menu'>('intro');
  const [showSkip, setShowSkip] = useState(true);
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; delay: number; duration: number}>>([]);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (reduced) {
      setStage('welcome');
      return;
    }

    // Faster, snappier timing
    const timer1 = setTimeout(() => setStage('showcase'), 2500);  // 2.5s for intro
    const timer2 = setTimeout(() => setStage('welcome'), 5000);    // 5s total
    const timer3 = setTimeout(() => setShowSkip(false), 6000);     // 6s total

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [reduced]);

  const handleExploreMenu = () => {
    setStage('menu');
    setTimeout(() => {
      navigate({ to: '/menu' });
    }, 800);
  };

  const handleSkip = () => {
    setStage('welcome');
  };

  return (
    <div ref={containerRef} className="relative min-h-svh bg-[#0A0A0A] overflow-hidden">
      {/* Skip button - always visible */}
      {showSkip && stage !== 'menu' && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleSkip}
          className="fixed top-6 right-6 z-50 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-2xl"
        >
          Skip Intro →
        </motion.button>
      )}

      {/* Ambient particles background */}
      {!reduced && stage !== 'menu' && (
        <div className="fixed inset-0 pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: [0, Math.sin(particle.id) * 50, 0],
                y: [0, -100, -200],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              className="w-1 h-1 rounded-full bg-gradient-to-r from-[#D84315] to-orange-300 blur-sm"
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Stage 1: Epic Brand Reveal with 3D Effect */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center perspective-1000"
          >
            {/* Background image */}
            <motion.div
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80"
                alt="Fine dining"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
            
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
            
            {/* Radial gradient background */}
            <div className="absolute inset-0 bg-gradient-radial from-[#1A0808]/50 via-[#0A0A0A] to-black" />
            
            {/* Animated vignette */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80"
            />

            {/* Main content with 3D transform */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -15 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glowing orb behind logo */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-radial from-[#D84315]/30 via-[#D84315]/10 to-transparent blur-3xl"
              />

              {/* Logo with multiple animation layers */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="relative mb-8"
              >
                <motion.div
                  animate={{
                    filter: [
                      "drop-shadow(0 0 30px rgba(216, 67, 21, 0.4))",
                      "drop-shadow(0 0 50px rgba(216, 67, 21, 0.7))",
                      "drop-shadow(0 0 30px rgba(216, 67, 21, 0.4))",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <img
                    src="/src/assets/bulcha-logo.png"
                    alt="Bulcha International Hotel"
                    className="h-28 mx-auto"
                  />
                </motion.div>
              </motion.div>

              {/* Animated divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D84315] to-transparent mb-6"
              />

              {/* Location badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="relative inline-block mb-6"
              >
                <p className="relative px-6 py-2 rounded-full border border-[#D84315]/40 bg-[#D84315]/15 backdrop-blur-sm text-[#D84315] text-xs uppercase tracking-[0.3em] font-medium">
                  Hawassa · Ethiopia
                </p>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-white font-display text-5xl sm:text-6xl leading-tight"
              >
                An Exceptional
                <br />
                Taste Experience
              </motion.h1>

              {/* Sparkle icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute -top-4 -right-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-[#D84315]" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 2: Signature Dishes Showcase with Parallax */}
        {stage === 'showcase' && (
          <motion.div
            key="showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Solid background as fallback */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A0808] via-[#0A0A0A] to-black" />

            {/* Animated food images with parallax - stunning photography */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 1.4, opacity: 0, x: -150 }}
                animate={{ scale: 1, opacity: 0.5, x: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute left-0 top-0 w-1/2 h-full"
              >
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
                  alt="Gourmet signature dish"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/80" />
              </motion.div>

              <motion.div
                initial={{ scale: 1.4, opacity: 0, x: 150 }}
                animate={{ scale: 1, opacity: 0.5, x: 0 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                className="absolute right-0 top-0 w-1/2 h-full"
              >
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80"
                  alt="Fine dining atmosphere"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/40 to-black/80" />
              </motion.div>
            </div>

            {/* Center content with higher z-index */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative z-20 text-center px-6 max-w-2xl"
            >
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] border border-[#D84315]/20 rounded-full"
              />
              
              {/* Chef icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.8, duration: 1.2, ease: "backOut" }}
                className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#D84315] to-[#BF360C] mb-8 shadow-2xl"
              >
                <ChefHat className="w-12 h-12 text-white" />
              </motion.div>

              {/* Text content */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-[#D84315] text-sm uppercase tracking-[0.3em] mb-4 font-medium"
              >
                Signature Creations
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-white font-display text-5xl sm:text-6xl leading-tight mb-8"
              >
                Culinary
                <br />
                Masterpieces
              </motion.h2>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="flex items-center justify-center gap-6 sm:gap-8 text-white/70"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D84315]" />
                  <span className="text-sm font-medium">Award-winning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#D84315]" />
                  <span className="text-sm font-medium">5-Star Dining</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: Interactive Welcome */}
        {stage === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            {/* Animated background gradient */}
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(216, 67, 21, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(216, 67, 21, 0.15) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(216, 67, 21, 0.15) 0%, transparent 50%)',
                ]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 bg-black"
            />

            {/* Mesh gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0F0808] to-black opacity-95" />

            {/* Main content */}
            <motion.div
              style={{ opacity, scale }}
              className="relative z-10 w-full max-w-3xl text-center"
            >
              {/* Logo with continuous pulse */}
              <motion.div
                animate={{
                  filter: [
                    "drop-shadow(0 0 30px rgba(216, 67, 21, 0.4))",
                    "drop-shadow(0 0 50px rgba(216, 67, 21, 0.8))",
                    "drop-shadow(0 0 30px rgba(216, 67, 21, 0.4))",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.img
                  src="/src/assets/bulcha-logo.png"
                  alt="Bulcha International Hotel"
                  className="h-24 mx-auto mb-8"
                  initial={{ opacity: 0, scale: 0.8, y: -30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.div>

              {/* Location with gradient border */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative inline-block mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#D84315] via-orange-500 to-[#D84315] rounded-full blur-sm opacity-50" />
                <p className="relative px-8 py-3 rounded-full border border-[#D84315] bg-black/50 backdrop-blur-md text-[#D84315] text-sm uppercase tracking-[0.3em] font-medium">
                  Hawassa · Ethiopia
                </p>
              </motion.div>

              {/* Main headline with gradient text */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/80 font-display text-5xl sm:text-7xl lg:text-8xl leading-tight mb-8"
              >
                Discover the Art
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D84315] via-orange-400 to-[#D84315]">
                  of Fine Dining
                </span>
              </motion.h1>

              {/* Elegant description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/70 text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
              >
                A table set for every palate. Where Ethiopian traditions meet international excellence.
              </motion.p>

              {/* Language selector with glassmorphism */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap gap-4 justify-center mb-14"
              >
                {[
                  { lang: 'English', flag: '🇺🇸', useSvg: false },
                  { lang: 'አማርኛ', flag: '🇪🇹', useSvg: false }
                ].map((item, i) => (
                  <motion.button
                    key={item.lang}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-8 py-3 rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${
                      i === 0
                        ? 'border-white bg-white text-black font-medium'
                        : 'border-white/30 bg-white/5 backdrop-blur-md text-white/70 hover:border-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.useSvg ? (
                      <img src={item.flag} alt="" className="w-5 h-5 rounded-sm object-cover" />
                    ) : (
                      <span className="text-lg">{item.flag}</span>
                    )}
                    <span>{item.lang}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Epic CTA button with animated gradient */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-block"
                >
                  {/* Animated glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-[#D84315] to-[#BF360C] rounded-2xl blur-xl"
                  />
                  
                  <Button
                    onClick={handleExploreMenu}
                    className="relative h-20 px-16 rounded-2xl bg-gradient-to-r from-[#D84315] to-[#BF360C] hover:from-[#BF360C] hover:to-[#A02F0D] text-white text-lg font-semibold shadow-2xl border border-white/20"
                  >
                    <span className="flex items-center gap-4">
                      EXPLORE OUR MENU
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-6 h-6" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Services with icons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm"
              >
                {['Breakfast', 'Lunch', 'Dinner', 'Room Service'].map((service, i) => (
                  <motion.span
                    key={service}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D84315]" />
                    {service}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 4: Elegant Exit to Menu */}
        {stage === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-gradient-radial from-[#D84315]/20 via-black to-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#D84315] border-t-transparent rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
