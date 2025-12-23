import {Link} from '@/i18n/routing';
import type { Locale } from '@/lib/cities';
import CitiesPopover from '@/components/CitiesPopover';

type InternalLinksProps = {
  locale: string | Locale;
  currentSlug?: string;
  context?: 'service' | 'material' | 'urgency';
};

// Centralized slug maps (existing implemented pages only to avoid 404s)
const SERVICE_SLUGS = [
  'jumta-renovacija',
  'valcprofila-montaza',
  'dakstinu-montaza',
  'jumta-logu-montaza',
  'jumta-buvnieciba',
  'jumta-apkope-remonts',
  'noteksistemu-uzstadisana',
  'jumta-krasosana'
];

const MATERIAL_SLUGS = [
  'valcprofils',
  'pvc-tpo',
  'bitumena-rulli',
  'dakstini',
  'bezazbesta-siferis',
  'ruukki-classic',
  'jumta-krasa'
];

function materialAnchor(slug: string, locale: string) {
  const map: Record<string, Record<string,string>> = {
    'valcprofils': {
      lv: 'Valcprofila jumta materiāls',
      en: 'Standing seam metal',
      'nl-BE': 'Staande naad metaal'
    },
    'pvc-tpo': { lv: 'PVC / TPO membrānas jumts', en: 'PVC / TPO membrane', 'nl-BE': 'PVC / TPO dakfolie' },
    'bitumena-rulli': { lv: 'Bitumena ruļļu segums', en: 'Bitumen roll roofing', 'nl-BE': 'Bitumen rol dak' },
    'dakstini': { lv: 'Keramikas un betona dakstiņi', en: 'Clay & concrete tiles', 'nl-BE': 'Kleien & betonnen dakpannen' },
    'bezazbesta-siferis': { lv: 'Bezazbesta šīferis', en: 'Non-asbestos fibre cement slate', 'nl-BE': 'Asbestvrije vezelcement leien' },
    'ruukki-classic': { lv: 'Ruukki Classic profils', en: 'Ruukki Classic profile', 'nl-BE': 'Ruukki Classic profiel' },
    'jumta-krasa': { lv: 'Jumta krāsas un pārklājumi', en: 'Roof paints & coatings', 'nl-BE': 'Dakverf & coatings' }
  };
  return map[slug]?.[locale] || map[slug]?.lv || slug;
}

function serviceAnchor(slug: string, locale: string) {
  const map: Record<string, Record<string,string>> = {
    'jumta-renovacija': { lv: 'Jumta renovācija', en: 'Roof renovation', 'nl-BE': 'Dakrenovatie' },
    'valcprofila-montaza': { lv: 'Valcprofila montāža', en: 'Standing seam install', 'nl-BE': 'Staande naad installatie' },
    'dakstinu-montaza': { lv: 'Dakstiņu montāža', en: 'Tile roof install', 'nl-BE': 'Pannendak installatie' },
    'jumta-logu-montaza': { lv: 'Jumta logu montāža', en: 'Skylight installation', 'nl-BE': 'Dakraam installatie' },
    'jumta-buvnieciba': { lv: 'Jumta būvniecība', en: 'Roof construction', 'nl-BE': 'Dakbouw' },
    'jumta-apkope-remonts': { lv: 'Jumta apkope / remonts', en: 'Roof maintenance / repair', 'nl-BE': 'Dakonderhoud / reparatie' },
    'noteksistemu-uzstadisana': { lv: 'Noteksistēmu uzstādīšana', en: 'Gutter system install', 'nl-BE': 'Gootsysteem installatie' },
    'jumta-krasosana': { lv: 'Jumta krāsošana', en: 'Roof painting', 'nl-BE': 'Dakschilderen' }
  };
  return map[slug]?.[locale] || map[slug]?.lv || slug;
}

export default function InternalLinks({ locale, currentSlug, context }: InternalLinksProps) {
  // Filter out current slug from related lists
  const relatedServices = SERVICE_SLUGS.filter(s => s !== currentSlug);
  // Service-specific materials mapping
  const SERVICE_MATERIALS: Record<string, string[]> = {
    'jumta-renovacija': ['valcprofils', 'dakstini', 'bezazbesta-siferis', 'pvc-tpo', 'bitumena-rulli', 'ruukki-classic'],
    'valcprofila-montaza': ['valcprofils', 'ruukki-classic', 'jumta-krasa'],
    'dakstinu-montaza': ['dakstini', 'bezazbesta-siferis'],
    'jumta-logu-montaza': ['valcprofils', 'dakstini', 'bezazbesta-siferis', 'ruukki-classic'],
    'jumta-buvnieciba': ['valcprofils', 'ruukki-classic', 'dakstini', 'bezazbesta-siferis', 'pvc-tpo', 'bitumena-rulli'],
    'jumta-remonts': ['valcprofils', 'dakstini', 'bezazbesta-siferis', 'pvc-tpo', 'bitumena-rulli', 'jumta-krasa'],
    'jumta-apkope-remonts': ['valcprofils', 'dakstini', 'bezazbesta-siferis', 'pvc-tpo', 'bitumena-rulli', 'jumta-krasa'],
    'noteksistemu-uzstadisana': ['valcprofils', 'dakstini', 'bezazbesta-siferis', 'ruukki-classic', 'pvc-tpo'],
    'jumta-krasosana': ['jumta-krasa', 'valcprofils', 'ruukki-classic', 'dakstini']
  };
  const relatedMaterials =
    context === 'service' && currentSlug && SERVICE_MATERIALS[currentSlug]
      ? SERVICE_MATERIALS[currentSlug]
      : MATERIAL_SLUGS.filter(m => m !== currentSlug);

  const heading = locale === 'nl-BE' ? 'Gerelateerde pagina\'s' : locale === 'en' ? 'Related Pages' : 'Saistītās lapas';
  const servicesLabel = locale === 'nl-BE' ? 'Gerelateerde diensten' : locale === 'en' ? 'Related Services' : 'Saistītie pakalpojumi';
  const materialsLabel = locale === 'nl-BE' ? 'Gerelateerde materialen' : locale === 'en' ? 'Related Materials' : 'Saistītie materiāli';
  const resourcesLabel = locale === 'nl-BE' ? 'Handige bronnen' : locale === 'en' ? 'Helpful Resources' : 'Noderīgi resursi';

  return (
    <section className="py-10 border-t border-gray-200 bg-white" aria-labelledby="internal-links-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="internal-links-heading" className="text-2xl font-bold mb-6 text-gray-900">{heading}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <nav aria-label={servicesLabel} className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-lg">{servicesLabel}</h3>
            <ul className="space-y-2 text-sm">
              {context !== 'service' && SERVICE_SLUGS.slice(0,4).map(slug => (
                <li key={slug}><Link href={`/services/${slug}`} className="text-primary-700 hover:underline">{serviceAnchor(slug, locale)}</Link></li>
              ))}
              {context === 'service' && relatedServices.slice(0,5).map(slug => (
                <li key={slug}><Link href={`/services/${slug}`} className="text-primary-700 hover:underline">{serviceAnchor(slug, locale)}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label={materialsLabel} className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-lg">{materialsLabel}</h3>
            <ul className="space-y-2 text-sm">
              {relatedMaterials.slice(0,5).map(slug => (
                <li key={slug}><Link href={`/materials/${slug}`} className="text-primary-700 hover:underline">{materialAnchor(slug, locale)}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label={resourcesLabel} className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-lg">{resourcesLabel}</h3>
            <ul className="space-y-2 text-sm">
              <li><CitiesPopover locale={locale as Locale} /></li>
              <li><Link href={'/blog'} className="text-primary-700 hover:underline">{locale==='nl-BE'?'Blogartikelen':locale==='en'?'Blog articles':'Blog raksti'}</Link></li>
              <li><Link href={'/projects'} className="text-primary-700 hover:underline">{locale==='nl-BE'?'Projekten':locale==='en'?'Projects':'Projekti'}</Link></li>
              <li><Link href={'/urgency/caurs-jumts'} className="text-primary-700 hover:underline">{locale==='nl-BE'?'Lek in het dak?':locale==='en'?'Roof leak emergency':'Tek jumts, ko darīt?'}</Link></li>
              <li><Link href={'/contact'} className="text-primary-700 hover:underline">{locale==='nl-BE'?'Contact opnemen':locale==='en'?'Contact us':'Kontakts'}</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
