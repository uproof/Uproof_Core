import React from 'react';
import Link from 'next/link';

type Props = {
  locale: string;
  variant?: 'full' | 'compact';
};

export default function MiersMethod({ locale, variant = 'full' }: Props) {
  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-white border border-primary-100 p-6 rounded-2xl my-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-soft">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {locale === 'lv' && 'Kvalitātes garantija: M-I-E-R-S standarts'}
            {locale === 'en' && 'Quality Guarantee: M-I-E-R-S Standard'}
            {locale === 'nl-BE' && 'Kwaliteitsgarantie: M-I-E-R-S Standaard'}
          </h3>
          <p className="text-gray-600 text-sm">
            {locale === 'lv' && 'Visi darbi tiek veikti pēc mūsu sertificētās metodes: 10 gadu garantija, pārbaudīti materiāli un meistaru atbildība.'}
            {locale === 'en' && 'All work performed according to our certified method: 10-year warranty, tested materials, and specialist accountability.'}
            {locale === 'nl-BE' && 'Alle werkzaamheden uitgevoerd volgens onze gecertificeerde methode: 10 jaar garantie, geteste materialen en verantwoordelijkheid van specialisten.'}
          </p>
        </div>
        <Link 
          href={`/${locale}/about`}
          className="whitespace-nowrap px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 transition-all duration-300 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 text-sm"
        >
          {locale === 'lv' && 'Uzzināt vairāk'}
          {locale === 'en' && 'Learn more'}
          {locale === 'nl-BE' && 'Meer weten'}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
        {locale === 'lv' && <>Izmantojam būvniecības metodi - <span className="text-primary-600 tracking-widest">M-I-E-R-S</span></>}
        {locale === 'en' && <>We use the <span className="text-primary-600 tracking-widest">M-I-E-R-S</span> construction method</>}
        {locale === 'nl-BE' && <>Wij gebruiken de <span className="text-primary-600 tracking-widest">M-I-E-R-S</span> bouwmethode</>}
      </h2>
      <ul className="list-none space-y-5">
        {locale === 'lv' && <>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">M</span>
            <div>
              <span className="font-semibold text-gray-900">Materiālu ilgmūžība</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Izmantojam tikai sertificētus, pārbaudītus materiālus no vadošajiem Eiropas ražotājiem. Katrs materiāls tiek izvēlēts, ņemot vērā vietējos klimatiskos apstākļus, garantējot vismaz 25 gadu kalpošanas laiku.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">I</span>
            <div>
              <span className="font-semibold text-gray-900">Izpildījuma kvalitāte</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Mūsu komandā strādā tikai sertificēti speciālisti ar vismaz 10 gadu pieredzi. Katrs darbs tiek veikts pēc stingriem kvalitātes standartiem ar daudzpakāpju kontroli.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">E</span>
            <div>
              <span className="font-semibold text-gray-900">Estētiski pievilcīgi risinājumi</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Katrs projekts tiek izstrādāts, ņemot vērā ēkas arhitektūru un apkārtējo vidi. Mēs piedāvājam risinājumus, kas ne tikai aizsargā jūsu māju, bet arī palielina tās vērtību.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">R</span>
            <div>
              <span className="font-semibold text-gray-900">Rezultāta garantija 10 gadi</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Uzņemamies pilnu atbildību par veiktajiem darbiem. Piedāvājam 10 gadu garantiju ar dokumentētu atbildību. Jebkuri defekti garantijas periodā tiek novērsti bez maksas.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">S</span>
            <div>
              <span className="font-semibold text-gray-900">Serviss visos posmos</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Nodrošinām personīgu projekta vadītāju, regulārus progresa ziņojumus un ātru komunikāciju. Jūs vienmēr zināsiet, kas notiek ar jūsu projektu, no pirmās konsultācijas līdz garantijas beigām.</p>
            </div>
          </li>
        </>}
        {locale === 'en' && <>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">M</span>
            <div>
              <span className="font-semibold text-gray-900">Material Longevity</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">We use only certified, tested materials from leading European manufacturers. Each material is selected considering local climate conditions, guaranteeing at least 25 years of service life.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">I</span>
            <div>
              <span className="font-semibold text-gray-900">Impeccable Execution</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Our team consists only of certified specialists with at least 10 years of experience. Every job is performed according to strict quality standards with multi-stage quality control.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">E</span>
            <div>
              <span className="font-semibold text-gray-900">Elegant Solutions</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Each project is designed considering the building&apos;s architecture and surroundings. We offer solutions that not only protect your home but also increase its value.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">R</span>
            <div>
              <span className="font-semibold text-gray-900">Results Guaranteed for 10 Years</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">We take full responsibility for our work. We offer a 10-year warranty with documented accountability. Any defects during the warranty period are repaired free of charge.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">S</span>
            <div>
              <span className="font-semibold text-gray-900">Service at Every Stage</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">We provide a dedicated project manager, regular progress reports, and responsive communication. You&apos;ll always know what&apos;s happening with your project, from the first consultation to the end of warranty.</p>
            </div>
          </li>
        </>}
        {locale === 'nl-BE' && <>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">M</span>
            <div>
              <span className="font-semibold text-gray-900">Materiaalduurzaamheid</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Wij gebruiken uitsluitend gecertificeerde, geteste materialen van toonaangevende Europese fabrikanten. Elk materiaal wordt geselecteerd op basis van lokale klimaatomstandigheden, met een gegarandeerde levensduur van minimaal 25 jaar.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">I</span>
            <div>
              <span className="font-semibold text-gray-900">Onberispelijke Uitvoering</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Ons team bestaat uitsluitend uit gecertificeerde specialisten met minimaal 10 jaar ervaring. Elk werk wordt uitgevoerd volgens strikte kwaliteitsnormen met meervoudige kwaliteitscontrole.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">E</span>
            <div>
              <span className="font-semibold text-gray-900">Elegante Oplossingen</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Elk project wordt ontworpen met oog voor de architectuur van het gebouw en de omgeving. Wij bieden oplossingen die uw woning niet alleen beschermen maar ook de waarde verhogen.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">R</span>
            <div>
              <span className="font-semibold text-gray-900">Resultaat Gegarandeerd voor 10 Jaar</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Wij nemen volledige verantwoordelijkheid voor ons werk. Wij bieden 10 jaar garantie met gedocumenteerde aansprakelijkheid. Eventuele gebreken tijdens de garantieperiode worden kosteloos hersteld.</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
            <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">S</span>
            <div>
              <span className="font-semibold text-gray-900">Service in Elke Fase</span>
              <p className="text-gray-600 mt-1 text-sm leading-relaxed">Wij bieden een toegewijde projectmanager, regelmatige voortgangsrapporten en snelle communicatie. U weet altijd wat er met uw project gebeurt, van het eerste adviesgesprek tot het einde van de garantie.</p>
            </div>
          </li>
        </>}
      </ul>
    </div>
  );
}
