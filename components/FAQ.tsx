'use client';

import {useTranslations} from 'next-intl';
import {motion, AnimatePresence} from 'framer-motion';
import {useState} from 'react';
import {ChevronDownIcon} from '@heroicons/react/24/outline';

export default function FAQ() {
  const t = useTranslations('home.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t('q1.question'),
      answer: t('q1.answer')
    },
    {
      question: t('q2.question'),
      answer: t('q2.answer')
    },
    {
      question: t('q3.question'),
      answer: t('q3.answer')
    },
    {
      question: t('q4.question'),
      answer: t('q4.answer')
    },
    {
      question: t('q5.question'),
      answer: t('q5.answer')
    },
    {
      question: t('q6.question'),
      answer: t('q6.answer')
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-24 bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-primary-200 shadow-card' 
                  : 'border-gray-100 shadow-soft hover:shadow-card hover:border-gray-200'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-5 sm:p-6 text-left group"
              >
                <span className={`text-base sm:text-lg font-semibold pr-4 transition-colors ${
                  openIndex === index ? 'text-primary-600' : 'text-gray-900 group-hover:text-gray-700'
                }`}>
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  openIndex === index 
                    ? 'bg-primary-100 rotate-180' 
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <ChevronDownIcon className={`w-5 h-5 transition-colors ${
                    openIndex === index ? 'text-primary-600' : 'text-gray-500'
                  }`} />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                      <div className="h-px bg-gray-100 mb-4" />
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
