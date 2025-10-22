"use client";

import {motion} from 'framer-motion';

type Stat = {
  value: string;
  label: string;
};

type Props = {
  stats: Stat[];
};

export default function StatsBar({stats}: Props) {
  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Diagonal background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: idx * 0.15, duration: 0.6}}
              className="text-center group"
            >
              <motion.div 
                className="text-5xl md:text-6xl font-bold text-white mb-3 transform group-hover:scale-110 transition-transform duration-300"
                initial={{scale: 0.5}}
                whileInView={{scale: 1}}
                viewport={{once: true}}
                transition={{delay: idx * 0.15 + 0.2, duration: 0.5, type: "spring"}}
              >
                {stat.value}
              </motion.div>
              <div className="text-base md:text-lg text-primary-100 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
              <div className="mt-4 h-1 w-16 bg-primary-300 mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
