import React from 'react';
import Link from 'next/link';

type Props = {
  locale: string;
  variant?: 'full' | 'compact';
};

export default function MiersMethod({ locale, variant = 'full' }: Props) {
  if (variant === 'compact') {
    return (
      <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-lg my-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-primary-800 mb-1">
            {locale === 'lv' && 'Kvalitātes garantija: M-I-E-R-S standarts'}
            {locale === 'en' && 'Quality Guarantee: M-I-E-R-S Standard'}
            {locale === 'nl-BE' && 'Kwaliteitsgarantie: M-I-E-R-S Standaard'}
          </h3>
          <p className="text-gray-700">
            {locale === 'lv' && 'Visi darbi tiek veikti pēc mūsu sertificētās metodes: 10 gadu garantija, pārbaudīti materiāli un meistaru atbildība.'}
            {locale === 'en' && 'All work performed according to our certified method: 10-year warranty, tested materials, and specialist accountability.'}
            {locale === 'nl-BE' && 'Alle werkzaamheden uitgevoerd volgens onze gecertificeerde methode: 10 jaar garantie, geteste materialen en verantwoordelijkheid van specialisten.'}
          </p>
        </div>
        <Link 
          href={`/${locale}/about`}
          className="whitespace-nowrap px-4 py-2 bg-white border border-primary-200 text-primary-700 font-medium rounded hover:bg-primary-50 transition-colors"
        >
          {locale === 'lv' && 'Uzzināt vairāk →'}
          {locale === 'en' && 'Learn more →'}
          {locale === 'nl-BE' && 'Meer weten →'}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 border-l-4 border-primary-400 p-6 rounded-xl shadow my-8">
      <h2 className="text-2xl font-bold mb-4 text-primary-700">
        {locale === 'lv' && <>Izmantojam būvniecības metodi - <span className="tracking-widest">M-I-E-R-S</span></>}
        {locale === 'en' && <>We use the <span className="tracking-widest">M-I-E-R-S</span> construction method</>}
        {locale === 'nl-BE' && <>Wij gebruiken de <span className="tracking-widest">M-I-E-R-S</span> bouwmethode</>}
      </h2>
      <ul className="list-none space-y-3 text-lg text-gray-800">
        {locale === 'lv' && <>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">M</span> <span>- materiālu ilgmūžība</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">I</span> <span>- izpildījuma kvalitāte ar sertificētiem speciālistiem</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">E</span> <span>- estētiski pievilcīgi risinājumi</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">R</span> <span>- rezultāta garantija 10 gadi un pilna atbildības uzņemšanās</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">S</span> <span>- serviss un attieksme, kas priecēs visos būvniecības posmos</span></li>
        </>}
        {locale === 'en' && <>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">M</span> <span>- Material longevity</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">I</span> <span>- Impeccable execution by certified specialists</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">E</span> <span>- Elegant and aesthetic solutions</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">R</span> <span>- Results guaranteed for 10 years with full accountability</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">S</span> <span>- Service and attitude that delight at every stage of construction</span></li>
        </>}
        {locale === 'nl-BE' && <>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">M</span> <span>- Materiaalduurzaamheid</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">I</span> <span>- Uitvoering van topkwaliteit door gecertificeerde specialisten</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">E</span> <span>- Esthetisch aantrekkelijke oplossingen</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">R</span> <span>- Resultaatgarantie van 10 jaar en volledige verantwoordelijkheid</span></li>
          <li className="flex items-start"><span className="font-bold text-primary-700 w-8">S</span> <span>- Service en houding die in elke bouwfase plezier geven</span></li>
        </>}
      </ul>
    </div>
  );
}
