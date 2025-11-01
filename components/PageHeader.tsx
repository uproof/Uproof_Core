"use client";

import {motion} from 'framer-motion';
import clsx from 'clsx';

type Props = {
  title: string;
  subtitle?: string;
  cta?: {label: string; href: string};
  useVanta?: boolean;
};

export default function PageHeader({title, subtitle, cta, useVanta = false}: Props) {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 to-white" />
        {/* subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{opacity: 0, y: 12}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.5}}
          className="text-4xl md:text-5xl font-bold text-gray-900"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{opacity: 0}}
            whileInView={{opacity: 1}}
            viewport={{once: true}}
            transition={{delay: 0.2, duration: 0.6}}
            className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl"
          >
            {subtitle}
          </motion.p>
        )}
        {cta && (
          <motion.a
            initial={{opacity: 0, y: 8}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{delay: 0.25, duration: 0.4}}
            href={cta.href}
            className={clsx(
              'inline-flex items-center gap-2 mt-8 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg',
              'hover:bg-primary-700 hover:shadow-xl transition'
            )}
          >
            {cta.label}
          </motion.a>
        )}
      </div>
    </section>
  );
}
