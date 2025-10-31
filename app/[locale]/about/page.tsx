import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.about');
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-gray-700 max-w-3xl">
            {t('description')}
          </p>
          {/* M-I-E-R-S method window for all languages */}
          <div className="mt-8 bg-primary-50 border-l-4 border-primary-400 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2 text-primary-700">
              {locale === 'lv' && <>Izmantojam būvniecības metodi - <span className="tracking-widest">M-I-E-R-S</span></>}
              {locale === 'en' && <>We use the <span className="tracking-widest">M-I-E-R-S</span> construction method</>}
              {locale === 'nl-BE' && <>Wij gebruiken de <span className="tracking-widest">M-I-E-R-S</span> bouwmethode</>}
            </h2>
            <ul className="list-disc pl-6 text-lg text-gray-800">
              {locale === 'lv' && <>
                <li><b>M</b> - materiālu ilgmūžība</li>
                <li><b>I</b> - izpildījuma kvalitāte ar sertificētiem speciālistiem</li>
                <li><b>E</b> - estētiski pievilcīgi risinājumi</li>
                <li><b>R</b> - rezultāta garantija 10 gadi un pilna atbildības uzņemšanās</li>
                <li><b>S</b> - serviss un attieksme, kas priecēs visos būvniecības posmos</li>
              </>}
              {locale === 'en' && <>
                <li><b>M</b> - Material longevity</li>
                <li><b>I</b> - Impeccable execution by certified specialists</li>
                <li><b>E</b> - Elegant and aesthetic solutions</li>
                <li><b>R</b> - Results guaranteed for 10 years with full accountability</li>
                <li><b>S</b> - Service and attitude that delight at every stage of construction</li>
              </>}
              {locale === 'nl-BE' && <>
                <li><b>M</b> - Materiaalduurzaamheid</li>
                <li><b>I</b> - Uitvoering van topkwaliteit door gecertificeerde specialisten</li>
                <li><b>E</b> - Esthetisch aantrekkelijke oplossingen</li>
                <li><b>R</b> - Resultaatgarantie van 10 jaar en volledige verantwoordelijkheid</li>
                <li><b>S</b> - Service en houding die in elke bouwfase plezier geven</li>
              </>}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {['quality','reliability','safety','certified','guarantee','contract','fixedcost','payment','partners','insurance'].map((key) => (
            <div key={key} className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-extrabold mb-2 uppercase tracking-wide">{t(`values.${key}.title`)}</h3>
              <p className="text-gray-600">{t(`values.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
