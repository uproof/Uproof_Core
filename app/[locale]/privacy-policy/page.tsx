import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Props = {
  params: {locale: string};
};

export default function PrivacyPolicyPage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('privacy');

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          {t('title')}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            {t('lastUpdated')}: {new Date().toLocaleDateString(locale)}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('intro.title')}</h2>
            <p className="text-gray-700 leading-relaxed">{t('intro.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dataCollected.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('dataCollected.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t('dataCollected.items.contact')}</li>
              <li>{t('dataCollected.items.technical')}</li>
              <li>{t('dataCollected.items.usage')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cookies.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('cookies.intro')}</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('cookies.necessary.title')}</h3>
            <p className="text-gray-700 mb-4">{t('cookies.necessary.description')}</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('cookies.analytics.title')}</h3>
            <p className="text-gray-700 mb-4">{t('cookies.analytics.description')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('rights.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('rights.intro')}</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t('rights.items.access')}</li>
              <li>{t('rights.items.rectification')}</li>
              <li>{t('rights.items.erasure')}</li>
              <li>{t('rights.items.restriction')}</li>
              <li>{t('rights.items.portability')}</li>
              <li>{t('rights.items.objection')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t('contact.content')}</p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold text-gray-900">SIA UpLift</p>
              <p className="text-gray-700">Email: karlis.uproof@gmail.com</p>
              <p className="text-gray-700">Phone: +371 25612440</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
