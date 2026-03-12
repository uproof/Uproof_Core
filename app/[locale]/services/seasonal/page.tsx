import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactSection from '@/components/ContactSection';
import {Link} from '@/i18n/routing';

export const dynamic = 'force-static';
export const revalidate = 3600;

const localeCopy: Record<string, {
  title: string;
  subtitle: string;
  cta: string;
  cards: { title: string; body: string; href: string; pill: string }[];
}> = {
  lv: {
    title: 'Pavasara darbi jumtam – pārbaude un profilakse',
    subtitle: 'Rūpīgi sakop jumtu pēc ziemas: diagnostika, noplūžu novēršana, notekas, jumta logu hermētika un seguma mazgāšana.',
    cta: 'Uzsākt pieteikumu',
    cards: [
      {
        title: 'Jumta diagnostika un noplūžu apturēšana',
        body: 'Termokamera/inspekcija, savienojumu blīvēšana, avārijas labojumi un fotofiksācija ar ieteikumiem.',
        href: '/services/jumta-apkope-remonts',
        pill: 'Prioritāte: nekavējoties'
      },
      {
        title: 'Noteku tīrīšana un drenāžas pārbaude',
        body: 'Tekņu un notekcauruļu tīrīšana, sateku pārbaude, ūdens novadīšanas testēšana un stiprinājumu pievilkšana.',
        href: '/services/noteksistemu-uzstadisana',
        pill: 'Pirms lietavām'
      },
      {
        title: 'Jumta logu hermētika un pieslēgumi',
        body: 'Logu pieslēgumu pārblīvēšana, skārda elementu pārbaude, blīvju maiņa un ūdens noteces nodrošināšana.',
        href: '/services/jumta-logu-montaza',
        pill: 'Pirms lietus sezonas'
      },
      {
        title: 'Seguma mazgāšana, sūnas un krāsošanas sagatavošana',
        body: 'Seguma mazgāšana, sūnu un aplikuma noņemšana, vietējs pārklājuma remonts un virsmas sagatavošana krāsošanai.',
        href: '/services/jumta-krasosana',
        pill: 'Sezonas laikā'
      }
    ]
  },
  en: {
    title: 'Spring roof care – inspection first, leaks prevented',
    subtitle: 'Close out winter: diagnostics, leak sealing, gutter tune-up, skylight flashing, roof wash and paint prep.',
    cta: 'Book spring visit',
    cards: [
      {
        title: 'Roof diagnostics & leak stop',
        body: 'Thermal/visual check, flashing re-seal, emergency leak stop, photo report with fixes.',
        href: '/services/jumta-apkope-remonts',
        pill: 'Priority: ASAP'
      },
      {
        title: 'Gutter cleaning & drainage tune-up',
        body: 'Clear gutters and downpipes, inspect valleys, test runoff, tighten brackets for heavy rain.',
        href: '/services/noteksistemu-uzstadisana',
        pill: 'Before heavy rain'
      },
      {
        title: 'Skylight sealing & flashing refresh',
        body: 'Re-seal skylight perimeters, inspect tin work, replace gaskets, ensure clean drainage paths.',
        href: '/services/jumta-logu-montaza',
        pill: 'Ahead of spring storms'
      },
      {
        title: 'Roof wash, moss removal, paint prep',
        body: 'Wash the roof, remove moss and buildup, spot-repair coating, prep surfaces for repainting.',
        href: '/services/jumta-krasosana',
        pill: 'During dry days'
      }
    ]
  },
  'nl-BE': {
    title: 'Voorjaarszorg voor het dak – eerst inspecteren, dan voorkomen',
    subtitle: 'Na de winter: diagnose, lekdichting, goten reinigen, dakramen afdichten, dak reinigen en schilderklaar maken.',
    cta: 'Voorjaarsbezoek plannen',
    cards: [
      {
        title: 'Dakdiagnose en lekstop',
        body: 'Thermische/visuele check, aansluitingen opnieuw afdichten, noodherstel en fotoverslag met acties.',
        href: '/services/jumta-apkope-remonts',
        pill: 'Prioriteit: direct'
      },
      {
        title: 'Gootreiniging en afwaterings-check',
        body: 'Goten en regenpijpen reinigen, kilgoten controleren, waterafvoer testen, beugels aanspannen.',
        href: '/services/noteksistemu-uzstadisana',
        pill: 'Voor de voorjaarsbuien'
      },
      {
        title: 'Dakramen afdichten en aansluitingen vernieuwen',
        body: 'Rondom dakramen opnieuw afdichten, zink/staal controleren, rubbers vervangen en afwatering vrijmaken.',
        href: '/services/jumta-logu-montaza',
        pill: 'Voor de regenperiode'
      },
      {
        title: 'Dakreiniging, mos verwijderen, schildervoorbereiding',
        body: 'Dak reinigen, mos en aanslag verwijderen, coating lokaal bijwerken, ondergrond voorbereiden op schilderen.',
        href: '/services/jumta-krasosana',
        pill: 'Bij droog weer'
      }
    ]
  }
};

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const lang = localeCopy[locale] ? locale : 'lv';
  const canonical = `https://uproof.eu/${locale}/services/seasonal`;
  const languages = {
    lv: 'https://uproof.eu/lv/services/seasonal',
    en: 'https://uproof.eu/en/services/seasonal',
    'nl-BE': 'https://uproof.eu/nl-BE/services/seasonal',
    'x-default': 'https://uproof.eu/lv/services/seasonal'
  };

  return {
    title: localeCopy[lang].title,
    description: localeCopy[lang].subtitle,
    alternates: { canonical, languages },
    openGraph: {
      title: localeCopy[lang].title,
      description: localeCopy[lang].subtitle,
      url: canonical,
      type: 'website',
      images: [{url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'UpRoof seasonal roof care'}]
    },
    twitter: {
      card: 'summary_large_image',
      title: localeCopy[lang].title,
      description: localeCopy[lang].subtitle,
      images: ['/images/og-image.jpg']
    }
  };
}

export default async function SeasonalServicesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  unstable_setRequestLocale(locale);
  const lang = localeCopy[locale] ? locale : 'lv';
  const copy = localeCopy[lang];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/services/maintenance.webp')" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="max-w-3xl">
            <p className="text-primary-300 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3">
              {lang === 'lv' ? 'Pavasara pārbaude' : lang === 'nl-BE' ? 'Voorjaarscheck' : 'Spring checklist'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">{copy.title}</h1>
            <p className="text-lg text-gray-200 leading-relaxed max-w-2xl">{copy.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#spring-list" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors shadow-lg shadow-primary-500/25">
                {copy.cta}
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {lang === 'lv' ? 'Sazināties' : lang === 'nl-BE' ? 'Contact' : 'Contact us'}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to top, #f8fafc 0%, rgba(248,250,252,0) 100%)' }} />
      </section>

      <section id="spring-list" className="relative z-10 -mt-6 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {copy.cards.map((card, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sm:p-7 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
                  <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700">{card.pill}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{lang === 'lv' ? 'Pavasara darbi' : lang === 'nl-BE' ? 'Voorjaar' : 'Spring'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{card.title}</h2>
                <p className="text-gray-600 leading-relaxed flex-1">{card.body}</p>
                <div className="flex gap-3 flex-wrap pt-2">
                  <Link href={card.href} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                    {lang === 'lv' ? 'Apskatīt pakalpojumu' : lang === 'nl-BE' ? 'Bekijk dienst' : 'View service'}
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    {lang === 'lv' ? 'Pieteikt vizīti' : lang === 'nl-BE' ? 'Bezoek plannen' : 'Schedule visit'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}
