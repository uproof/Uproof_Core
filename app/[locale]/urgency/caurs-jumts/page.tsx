import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Man ir caurs jumts – ko darīt? | UpRoof',
  description: 'Steidzama jumta noplūdes situācija: soli pa solim darbības, pagaidu risinājumi, profesionāla palīdzība un izmaksu faktori.',
  alternates: { canonical: 'https://uproof.eu/lv/urgency/caurs-jumts' }
};

export default function UrgencyLeakPage({ params: { locale }}: { params: { locale: string }}) {
  unstable_setRequestLocale(locale);
  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-24 pb-12 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-red-700 mb-6">{locale === 'lv' ? 'Man ir caurs jumts – ko darīt?' : locale === 'en' ? 'My Roof Is Leaking – What Should I Do?' : 'Mijn dak lekt – wat nu?'}</h1>
          <div className="space-y-8 text-gray-800">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '1. Nekavējoties pasargā iekštelpas' : locale === 'en' ? '1. Protect Interior Immediately' : '1. Bescherm direct het interieur'}</h2>
              <p className="text-sm">{locale === 'lv' ? 'Novieto spaiņus, pārklāj elektriskās ierīces, izvairies no mitruma uzkrāšanās.' : locale === 'en' ? 'Place buckets, cover electrics, prevent saturation.' : 'Plaats emmers, dek elektrische apparaten af, voorkom verzadiging.'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '2. Atrodi noplūdes zonu' : locale === 'en' ? '2. Locate The Source' : '2. Lokaliseer de bron'}</h2>
              <p className="text-sm">{locale === 'lv' ? 'Pārbaudi jumta logus, skursteņa pieslēgumus, metāla savienojumus.' : locale === 'en' ? 'Inspect skylights, chimney flashing, metal joints.' : 'Controleer dakramen, schoorsteen aansluitingen, metalen voegen.'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '3. Pagaidu risinājums' : locale === 'en' ? '3. Temporary Mitigation' : '3. Tijdelijke oplossing'}</h2>
              <p className="text-sm">{locale === 'lv' ? 'Izmanto ūdensnecaurlaidīgu plēvi / magnētiskus paneļus līdz profesionālai vizītei.' : locale === 'en' ? 'Use waterproof tarp / magnetic panels until professional visit.' : 'Gebruik waterdicht zeil / magnetische panelen tot professionele komst.'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '4. Izsauc speciālistu' : locale === 'en' ? '4. Call a Specialist' : '4. Bel een specialist'}</h2>
              <p className="text-sm">{locale === 'lv' ? 'Steidzams remonts pieejams 24–48h Rīgā un Pierīgā.' : locale === 'en' ? 'Emergency repair available within 24–48h in Riga region.' : 'Spoedreparatie beschikbaar binnen 24–48u in regio Riga.'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '5. Izmaksu faktori' : locale === 'en' ? '5. Cost Drivers' : '5. Kostenfactoren'}</h2>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>{locale === 'lv' ? 'Seguma materiāls' : locale === 'en' ? 'Roofing material' : 'Dakmateriaal'}</li>
                <li>{locale === 'lv' ? 'Piekļūstamība / sarežģītība' : locale === 'en' ? 'Accessibility / complexity' : 'Toegankelijkheid / complexiteit'}</li>
                <li>{locale === 'lv' ? 'Mitinājuma apjoms' : locale === 'en' ? 'Moisture penetration scope' : 'Omvang van vochtindringing'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
