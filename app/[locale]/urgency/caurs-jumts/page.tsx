import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import {Link} from '@/i18n/routing';
import type {Metadata} from 'next';

type Props = {
	params: Promise<{locale: string}>;
};

const titles: Record<string, string> = {
	lv: 'Man ir caurs jumts – ko darīt? | UpRoof',
	en: 'My Roof Is Leaking – What Should I Do? | UpRoof',
	'nl-BE': 'Mijn dak lekt – wat nu? | UpRoof',
};

const descriptions: Record<string, string> = {
	lv: 'Steidzama jumta noplūdes situācija: soli pa solim darbības, pagaidu risinājumi, profesionāla palīdzība un izmaksu faktori.',
	en: 'Emergency roof leak: step-by-step actions, temporary fixes, professional help and cost factors. Call +371 25612440.',
	'nl-BE': 'Noodgeval daklek: stap-voor-stap actie, tijdelijke oplossingen, professionele hulp en kostenfactoren. Bel +371 25612440.',
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
	const {locale} = await params;
	const canonical = `https://uproof.eu/${locale}/urgency/caurs-jumts`;

	return {
		title: titles[locale] || titles.lv,
		description: descriptions[locale] || descriptions.lv,
		alternates: {
			canonical,
			languages: {
				lv: 'https://uproof.eu/lv/urgency/caurs-jumts',
				en: 'https://uproof.eu/en/urgency/caurs-jumts',
				'nl-BE': 'https://uproof.eu/nl-BE/urgency/caurs-jumts',
				'x-default': 'https://uproof.eu/lv/urgency/caurs-jumts',
			},
		},
		openGraph: {
			title: titles[locale] || titles.lv,
			description: descriptions[locale] || descriptions.lv,
			url: canonical,
			type: 'website',
			siteName: 'UpRoof',
		},
	};
}


export default async function UrgencyLeakPage({ params }: Props) {
	const { locale } = await params;
	unstable_setRequestLocale(locale);
	return (
		<main className="min-h-screen">
			<Header />
			<Breadcrumbs />
			<section className="pt-24 pb-12 bg-gradient-to-b from-red-50 to-white">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h1 className="text-4xl font-bold text-red-700 mb-6">{locale === 'lv' ? 'Man ir caurs jumts – ko darīt?' : locale === 'en' ? 'My Roof Is Leaking – What Should I Do?' : 'Mijn dak lekt – wat nu?'}</h1>
					<p className="text-gray-800 mb-6">
						{locale === 'lv' ? 'Ātra rīcība samazina bojājumus un izmaksas. Zemāk – strukturēts rīcības plāns, diagnostika un īstermiņa risinājumi līdz speciālista ierašanās brīdim.'
						: locale === 'en' ? 'Prompt action reduces damage and cost. Below is a structured action plan, diagnostics, and temporary measures until a specialist arrives.'
						: 'Snel handelen beperkt schade en kosten. Hieronder: een gestructureerd stappenplan, diagnose en tijdelijke maatregelen tot een specialist arriveert.'}
					</p>
					<div className="space-y-8 text-gray-800">
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '1. Nekavējoties pasargā iekštelpas' : locale === 'en' ? '1. Protect Interior Immediately' : '1. Bescherm direct het interieur'}</h2>
							<ul className="text-sm list-disc pl-5 space-y-1">
								<li>{locale === 'lv' ? 'Novieto spaiņus un absorbējošus materiālus zem noplūdes.' : locale === 'en' ? 'Place buckets and absorbent materials under the leak.' : 'Plaats emmers en absorberend materiaal onder de lekkage.'}</li>
								<li>{locale === 'lv' ? 'Atvieno un pārklāj elektriskās ierīces, nodrošini drošību.' : locale === 'en' ? 'Disconnect and cover electrical appliances; ensure safety.' : 'Ontkoppel en dek elektrische apparaten af; borg veiligheid.'}</li>
								<li>{locale === 'lv' ? 'Pārvieto jutīgus priekšmetus, samazini mitruma uzkrāšanos.' : locale === 'en' ? 'Move sensitive items; reduce moisture accumulation.' : 'Verplaats kwetsbare items; beperk vochtopbouw.'}</li>
							</ul>
						</div>
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '2. Atrodi noplūdes zonu' : locale === 'en' ? '2. Locate The Source' : '2. Lokaliseer de bron'}</h2>
							<ul className="text-sm list-disc pl-5 space-y-1">
								<li>{locale === 'lv' ? 'Pārbaudi jumta logus, skursteņa apdari, savienojumus pie sienām un ielejām.' : locale === 'en' ? 'Inspect skylights, chimney flashing, wall/valley junctions.' : 'Controleer dakramen, schoorsteenlood, muur-/gootaansluitingen.'}</li>
								<li>{locale === 'lv' ? 'Novērtē noteksistēmu un lietus ūdens novadīšanu – aizsērējumi palielina risku.' : locale === 'en' ? 'Assess gutters and drainage; blockages raise risk.' : 'Beoordeel goten en afwatering; verstoppingen vergroten risico.'}</li>
								<li>{locale === 'lv' ? 'Iekštelpās meklē tumšus plankumus, mitrumu, pelējumu pie griestiem un sienām.' : locale === 'en' ? 'Indoors, check for dark spots, moisture, mould near ceilings/walls.' : 'Binnen: controleer op donkere plekken, vocht, schimmel bij plafonds/muren.'}</li>
							</ul>
						</div>
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '3. Pagaidu risinājums' : locale === 'en' ? '3. Temporary Mitigation' : '3. Tijdelijke oplossing'}</h2>
							<ul className="text-sm list-disc pl-5 space-y-1">
								<li>{locale === 'lv' ? 'Uzklāj ūdensnecaurlaidīgu pārsegu; nostiprini ar slodzi vai speciāliem stiprinājumiem.' : locale === 'en' ? 'Apply a waterproof cover; secure with ballast or suitable fixings.' : 'Breng een waterdichte afdekking aan; fixeer met ballast of geschikte bevestiging.'}</li>
								<li>{locale === 'lv' ? 'Nepielieto agresīvus ķīmiskos hermētiķus – tie bieži pasliktina stāvokli.' : locale === 'en' ? 'Avoid aggressive chemical sealants; they often worsen the situation.' : 'Vermijd agressieve chemische kitten; die verslechteren vaak de situatie.'}</li>
								<li>{locale === 'lv' ? 'Ja droši – notīri kritiskos notekceļu punktus, lai mazinātu ūdens uzkrāšanos.' : locale === 'en' ? 'If safe, clear critical gutter points to reduce water build-up.' : 'Indien veilig: maak kritieke goten schoon om waterophoping te beperken.'}</li>
							</ul>
						</div>
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '4. Izsauc speciālistu' : locale === 'en' ? '4. Call a Specialist' : '4. Bel een specialist'}</h2>
							<p className="text-sm">{locale === 'lv' ? 'Steidzams remonts pieejams 24–48h Rīgā un Pierīgā. Sazinoties, norādi noplūdes vietu, seguma materiālu un piekļuvi jumtam.' : locale === 'en' ? 'Emergency repair available within 24–48h in Riga region. When contacting, provide leak location, covering material, and roof access details.' : 'Spoedreparatie beschikbaar binnen 24–48u in regio Riga. Geef bij contact de lekkageplek, dakbedekking en toegang tot het dak door.'}</p>
						</div>
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? '5. Izmaksu faktori' : locale === 'en' ? '5. Cost Drivers' : '5. Kostenfactoren'}</h2>
							<ul className="text-sm list-disc pl-5 space-y-1">
								<li>{locale === 'lv' ? 'Seguma materiāls' : locale === 'en' ? 'Roofing material' : 'Dakmateriaal'}</li>
								<li>{locale === 'lv' ? 'Piekļūstamība / sarežģītība' : locale === 'en' ? 'Accessibility / complexity' : 'Toegankelijkheid / complexiteit'}</li>
								<li>{locale === 'lv' ? 'Mitinājuma apjoms' : locale === 'en' ? 'Moisture penetration scope' : 'Omvang van vochtindringing'}</li>
							</ul>
						</div>
						<div className="bg-primary-50 p-6 rounded-lg border border-primary-200">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? 'Ko darīt / ko nedarīt' : locale === 'en' ? 'Do / Don’t' : 'Wel / Niet'}</h2>
							<div className="grid md:grid-cols-2 gap-4 text-sm">
								<div>
									<p className="font-semibold mb-2">{locale === 'lv' ? 'Darīt' : locale === 'en' ? 'Do' : 'Wel'}</p>
									<ul className="list-disc pl-5 space-y-1">
										<li>{locale === 'lv' ? 'Fiksē situāciju ar foto; tas palīdz diagnostikā.' : locale === 'en' ? 'Document with photos; helpful for diagnostics.' : 'Leg vast met foto’s; nuttig voor diagnose.'}</li>
										<li>{locale === 'lv' ? 'Nodrošini drošību, izvairies no slidenām virsmām.' : locale === 'en' ? 'Ensure safety; avoid slippery surfaces.' : 'Zorg voor veiligheid; vermijd gladde oppervlakken.'}</li>
										<li>{locale === 'lv' ? 'Sazinies ar speciālistu pēc iespējas ātrāk.' : locale === 'en' ? 'Contact a specialist as soon as possible.' : 'Neem zo snel mogelijk contact op met een specialist.'}</li>
									</ul>
								</div>
								<div>
									<p className="font-semibold mb-2">{locale === 'lv' ? 'Nedarīt' : locale === 'en' ? 'Don’t' : 'Niet'}</p>
									<ul className="list-disc pl-5 space-y-1">
										<li>{locale === 'lv' ? 'Nekāp uz jumta spēcīgā vējā vai apledojumā.' : locale === 'en' ? 'Do not climb the roof in strong wind or ice.' : 'Klim niet op het dak bij harde wind of ijs.'}</li>
										<li>{locale === 'lv' ? 'Nelieto neatbilstošus hermētiķus uz karstiem/mitriem segumiem.' : locale === 'en' ? 'Do not apply unsuitable sealants on hot/wet coverings.' : 'Breng geen ongeschikte kitten aan op hete/natte bedekking.'}</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-2xl font-semibold mb-3">{locale === 'lv' ? 'Sazinies ar UpRoof' : locale === 'en' ? 'Contact UpRoof' : 'Neem contact op met UpRoof'}</h2>
							<p className="text-sm mb-2">{locale === 'lv' ? 'Bezmaksas sākotnējais novērtējums un skaidrs remonta plāns.' : locale === 'en' ? 'Free initial assessment and a clear repair plan.' : 'Gratis eerste beoordeling en een helder herstelplan.'}</p>
							<p className="text-sm">{locale === 'lv' ? 'Zvani ' : locale === 'en' ? 'Call ' : 'Bel '}<a href="tel:+37125612440" className="underline">+371 25612440</a> {locale === 'lv' ? 'vai raksti' : locale === 'en' ? 'or write' : 'of schrijf'} <a href="mailto:karlis.uproof@gmail.com" className="underline">karlis.uproof@gmail.com</a></p>
						</div>
					</div>
				</div>
			</section>
			<section className="py-8 border-t border-gray-200">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h3 className="font-semibold text-gray-900 mb-3">{locale === 'lv' ? 'Saistītie pakalpojumi' : locale === 'en' ? 'Related Services' : 'Gerelateerde diensten'}</h3>
					<ul className="space-y-2">
						<li><Link href="/urgency/sniega-tirisana" className="text-gray-600 hover:text-gray-900 hover:underline text-sm">{locale === 'lv' ? 'Sniega tīrīšana no jumta Rīgā – 24/7' : locale === 'en' ? 'Snow Removal from Roof in Riga – 24/7' : 'Sneeuwruiming van het dak in Riga – 24/7'}</Link></li>
						<li><Link href="/services/jumta-apkope-remonts" className="text-gray-600 hover:text-gray-900 hover:underline text-sm">{locale === 'lv' ? 'Jumta apkope un remonts' : locale === 'en' ? 'Roof Maintenance & Repair' : 'Dakonderhoud & Reparatie'}</Link></li>
					</ul>
				</div>
			</section>
			<Footer />
		</main>
	);
}
