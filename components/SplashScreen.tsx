import { AnimatePresence, motion } from 'framer-motion';
import { Award, Leaf, MapPin, Sparkles, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'logo' | 'icons' | 'tagline' | 'complete'>('logo');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Stage transitions
    const logoTimer = setTimeout(() => setStage('icons'), 800);
    const iconsTimer = setTimeout(() => setStage('tagline'), 1600);
    const taglineTimer = setTimeout(() => setStage('complete'), 2400);
    const completeTimer = setTimeout(() => onComplete(), 3200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(logoTimer);
      clearTimeout(iconsTimer);
      clearTimeout(taglineTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const floatingIcons = [
    { Icon: Leaf, color: '#10b981', delay: 0 },
    { Icon: Users, color: '#3b82f6', delay: 0.1 },
    { Icon: Award, color: '#f59e0b', delay: 0.2 },
    { Icon: MapPin, color: '#ef4444', delay: 0.3 },
    { Icon: TrendingUp, color: '#8b5cf6', delay: 0.4 },
    { Icon: Sparkles, color: '#ec4899', delay: 0.5 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Main content container */}
        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Logo animation */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              duration: 0.8,
            }}
          >
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Logo circle */}
            <motion.div
              className="relative w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 20px 60px rgba(0,0,0,0.3)',
                  '0 25px 70px rgba(0,0,0,0.4)',
                  '0 20px 60px rgba(0,0,0,0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Leaf className="w-16 h-16 text-emerald-600" strokeWidth={2.5} />
            </motion.div>

            {/* Orbiting sparkles */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[0, 120, 240].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-3 h-3"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-70px)`,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" fill="currentColor" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* App name */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight"
              animate={{
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.5)',
                  '0 0 30px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Hamro Saath
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Safa Nepal
            </motion.p>
          </motion.div>

          {/* Floating feature icons */}
          <AnimatePresence>
            {stage !== 'logo' && (
              <motion.div
                className="flex gap-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {floatingIcons.map(({ Icon, color, delay }, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{
                      delay: delay,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: delay,
                        },
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tagline */}
          <AnimatePresence>
            {stage === 'tagline' || stage === 'complete' ? (
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.p
                  className="text-lg md:text-xl text-white/90 font-medium max-w-md"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  Making Civic Responsibility Rewarding
                </motion.p>
                <motion.p
                  className="text-sm md:text-base text-white/70 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  🌱 Earn Karma | 🏆 Collect NFT Badges | 🌍 Save the Planet
                </motion.p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Loading progress bar */}
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Loading text */}
          <motion.p
            className="text-white/70 text-sm mt-4"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Loading your civic journey...
          </motion.p>

          {/* Version info */}
          <motion.div
            className="absolute bottom-8 text-white/50 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Version 3.0 | Powered by Blockchain & AI
          </motion.div>
        </div>

        {/* Corner decorations */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
