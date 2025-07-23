"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import InfiniteScrollingTags from "./InfiniteScrollingTags";

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};

export default function HeroSection() {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  return (
    <motion.section
      style={{ y: yPos }}
      className="relative z-20 flex flex-col items-center justify-center w-full px-4 py-32 overflow-x-hidden"
    >      
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={staggerContainer} 
        className="w-full max-w-4xl mx-auto"
      >
        <motion.div variants={textVariants} className="w-full text-center">
          <h2 className="w-full text-4xl font-bold leading-tight md:text-6xl">
            <span className="block w-full bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
              Gérez votre salle de sport
            </span>
            <span className="block w-full bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              avec une seule main
            </span>
          </h2>
        </motion.div>

        <motion.div variants={textVariants} className="w-full text-center">
          <p className="w-full mx-auto text-lg text-gray-300 md:text-xl max-w-2xl mb-10 leading-relaxed">
            <span className="font-semibold text-white">SENGYM</span> est la première plateforme tout-en-un pour gérer efficacement votre salle de sport.
          </p>
          <div className="w-full">
            <InfiniteScrollingTags />
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}