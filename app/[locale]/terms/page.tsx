import {use} from 'react';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Props = {
  params: Promise<{locale: string}>;
};

const titles: Record<string, string> = {
  lv: 'Noteikumi un nosacījumi | UpRoof',
  en: 'Terms and Conditions | UpRoof',
  'nl-BE': 'Algemene voorwaarden | UpRoof',
};

const descriptions: Record<string, string> = {
  lv: 'UpRoof noteikumi un nosacījumi. Pamatnoteikumi vietnes, pakalpojumu un datu izmantošanai.',
  en: 'UpRoof terms and conditions. Baseline rules for using the website, services, and data.',
  'nl-BE': 'UpRoof algemene voorwaarden. Basisregels voor het gebruik van de website, diensten en gegevens.',
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/terms`;

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    alternates: {
      canonical,
      languages: {
        lv: 'https://uproof.eu/lv/terms',
        en: 'https://uproof.eu/en/terms',
        'nl-BE': 'https://uproof.eu/nl-BE/terms',
        'x-default': 'https://uproof.eu/lv/terms',
      },
    },
  };
}

export default function TermsPage({params}: Props) {
  const {locale} = use(params);
  const isLv = locale === 'lv';
  const isNlBe = locale === 'nl-BE';

  const copy = isLv
    ? {
        title: 'Noteikumi un nosacījumi',
        intro: 'Šie noteikumi nosaka pamatnosacījumus UpRoof vietnes un pakalpojumu lietošanai.',
        sections: [
          ['Pakalpojumu izmantošana', 'Vietni drīkst izmantot tikai likumīgām un godprātīgām darbībām. Jūs nedrīkstat mēģināt apiet piekļuves kontroli, traucēt sistēmu darbību vai izmantot datus neatļautiem mērķiem.'],
          ['Piedāvājumi un līgumi', 'Vietnē publicētā informācija ir informatīva. Saistoši pakalpojumu noteikumi, cenas un termiņi tiek apstiprināti rakstiski atsevišķā līgumā vai pasūtījuma apstiprinājumā.'],
          ['Lietotāja pienākumi', 'Jūs esat atbildīgs par pareizas informācijas sniegšanu, konta drošību un autorizētu piekļuvi saviem datiem.'],
          ['Atbildības ierobežojums', 'Mēs rīkojamies saprātīgi, lai nodrošinātu vietnes darbību, taču negarantējam nepārtrauktu pieejamību vai pilnīgu kļūdu neesamību.'],
          ['Intelektuālais īpašums', 'Teksti, vizuālie materiāli un zīmola elementi pieder UpRoof vai ir izmantoti ar atļauju. To kopēšana bez rakstiskas piekrišanas nav atļauta.'],
          ['Piemērojamie tiesību akti', 'Šos noteikumus regulē Latvijas tiesību akti. Strīdi tiek risināti sarunu ceļā, bet nepieciešamības gadījumā kompetentā tiesā Latvijā.'],
        ],
        disclaimer: 'Šī lapa ir praktisks interneta noteikumu pamats, nevis individuāla juridiska konsultācija.',
      }
    : isNlBe
      ? {
          title: 'Algemene voorwaarden',
          intro: 'Deze voorwaarden beschrijven de basisregels voor het gebruik van de UpRoof-website en diensten.',
          sections: [
            ['Gebruik van de diensten', 'U mag de website alleen gebruiken voor wettige en eerlijke handelingen. U mag geen toegang omzeilen, de werking verstoren of gegevens voor onbevoegde doeleinden gebruiken.'],
            ['Offertes en contracten', 'Informatie op de website is informatief. Bindende prijzen, scope en termijnen worden bevestigd in een aparte schriftelijke overeenkomst of orderbevestiging.'],
            ['Verplichtingen van de gebruiker', 'U bent verantwoordelijk voor correcte informatie, accountbeveiliging en geautoriseerde toegang tot uw gegevens.'],
            ['Beperking van aansprakelijkheid', 'We spannen ons redelijkerwijs in om de website beschikbaar te houden, maar we garanderen geen ononderbroken werking of foutloosheid.'],
            ['Intellectuele eigendom', 'Teksten, afbeeldingen en merkonderdelen behoren toe aan UpRoof of worden gebruikt met toestemming. Kopiëren zonder schriftelijke toestemming is niet toegestaan.'],
            ['Toepasselijk recht', 'Deze voorwaarden vallen onder het Lets recht. Geschillen worden eerst minnelijk behandeld en daarna, indien nodig, voorgelegd aan een bevoegde rechtbank in Letland.'],
          ],
          disclaimer: 'Deze pagina biedt een praktische basis, maar is geen persoonlijk juridisch advies.',
        }
      : {
          title: 'Terms and Conditions',
          intro: 'These terms set the baseline rules for using the UpRoof website and services.',
          sections: [
            ['Use of services', 'You may use the website only for lawful and fair purposes. You must not bypass access controls, disrupt the system, or use data for unauthorized purposes.'],
            ['Quotes and contracts', 'Information on the website is informational. Binding scope, pricing, and timelines are confirmed in a separate written agreement or order confirmation.'],
            ['User responsibilities', 'You are responsible for providing accurate information, keeping your account secure, and only accessing data you are authorized to use.'],
            ['Limitation of liability', 'We use reasonable efforts to keep the website available, but we do not guarantee uninterrupted service or error-free operation.'],
            ['Intellectual property', 'Text, visuals, and brand assets belong to UpRoof or are used with permission. Copying them without written consent is not allowed.'],
            ['Governing law', 'These terms are governed by Latvian law. Disputes should first be resolved in good faith and then, if needed, in the competent courts of Latvia.'],
          ],
          disclaimer: 'This page is a practical baseline policy, not individualized legal advice.',
        };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">UpRoof</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{copy.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{copy.intro}</p>
        <div className="mt-8 space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {copy.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
            </section>
          ))}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {copy.disclaimer}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
