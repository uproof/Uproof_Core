import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import {Link} from '@/i18n/routing';
import type {Metadata} from 'next';

type Props = {
	params: Promise<{locale: string}>;
};

const titles: Record<string, string> = {
	lv: 'Vētras bojāts jumts Rīgā | Steidzams remonts 24/7',
	en: 'Wind & Storm Roof Damage in Riga | Emergency 24/7',
	'nl-BE': 'Dakschade door wind en storm in Riga | Spoed 24/7',
};

const descriptions: Record<string, string> = {
	lv: 'Steidzams jumta remonts pēc vētras vai stipra vēja Rīgā un Pierīgā. Noplūžu apturēšana, pagaidu pārsegums, diagnostika un pilns remonta plāns. Zvaniet +371 25612440.',
	en: 'Emergency roof repair after storm or strong wind in Riga and nearby areas. Leak stop, temporary cover, diagnostics and full repair plan. Call +371 25612440.',
	'nl-BE': 'Dringend dakherstel na storm of harde wind in Riga en omgeving. Lekstop, tijdelijke afdekking, diagnose en volledig herstelplan. Bel +371 25612440.',
};

const ogLocales: Record<string, string> = {
	lv: 'lv_LV',
	en: 'en_US',
	'nl-BE': 'nl_BE',
};

const copy = {
	lv: {
		heroTitle: 'Vētras un Vēja Bojāts Jumts? Rīkojieties Nekavējoties',
		heroBody:
			'Pēc stipra vēja pat nelieli bojājumi ātri pārvēršas noplūdēs un konstrukciju riskos. UpRoof nodrošina steidzamu jumta stabilizāciju, noplūžu apturēšanu un profesionālu remonta risinājumu 24/7.',
		badge: 'Steidzams Pakalpojums 24/7',
		primaryCta: 'Zvanīt Uzreiz',
		secondaryCta: 'Pieteikt Apskati',
		whyTitle: 'Kāpēc Vētras Bojājumi Ir Kritiski?',
		whyBody:
			'Vējš paceļ seguma loksnes, bojā kore, saplēš pieslēgumus pie skursteņiem un jumta logiem, kā arī atver ceļu ūdens iekļūšanai. Jo ātrāk tiek veikta pagaidu aizsardzība, jo mazākas būs remonta izmaksas.',
		servicesTitle: 'Ko Mēs Veicam Pēc Vētras',
		processTitle: 'Kā Notiek Steidzamais Remonts',
		relatedTitle: 'Saistītās Lapas',
		faqTitle: 'Biežāk Uzdotie Jautājumi',
	},
	en: {
		heroTitle: 'Roof Damaged by Wind or Storm? Act Fast',
		heroBody:
			'After strong winds, even minor roof damage can quickly become leaks and structural risk. UpRoof provides emergency roof stabilization, leak stop and a full repair solution 24/7.',
		badge: 'Emergency Service 24/7',
		primaryCta: 'Call Now',
		secondaryCta: 'Book Inspection',
		whyTitle: 'Why Storm Damage Is Critical',
		whyBody:
			'Wind can lift roofing sheets, damage ridge sections, tear flashing near chimneys and skylights, and allow water ingress. The faster temporary protection is installed, the lower the total repair cost.',
		servicesTitle: 'What We Do After a Storm',
		processTitle: 'How Emergency Repair Works',
		relatedTitle: 'Related Pages',
		faqTitle: 'Frequently Asked Questions',
	},
	'nl-BE': {
		heroTitle: 'Dak beschadigd door wind of storm? Handel snel',
		heroBody:
			'Na harde wind kunnen zelfs kleine dakschades snel uitgroeien tot lekken en structureel risico. UpRoof biedt 24/7 noodstabilisatie, lekstop en een volledig hersteltraject.',
		badge: 'Spoedservice 24/7',
		primaryCta: 'Bel Nu',
		secondaryCta: 'Inspectie Aanvragen',
		whyTitle: 'Waarom stormschade kritisch is',
		whyBody:
			'Wind kan dakdelen oplichten, nokdelen beschadigen, aansluitingen rond schoorstenen en dakramen losmaken en waterinfiltratie veroorzaken. Snelle tijdelijke beveiliging verlaagt de totale herstelkost.',
		servicesTitle: 'Wat Wij Doen Na Een Storm',
		processTitle: 'Zo Werkt Spoedherstel',
		relatedTitle: 'Gerelateerde Pagina\'s',
		faqTitle: 'Veelgestelde Vragen',
	},
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
	const {locale} = await params;
	const canonical = `https://uproof.eu/${locale}/urgency/vetras-jumta-bojajumi`;

	return {
		title: titles[locale] || titles.lv,
		description: descriptions[locale] || descriptions.lv,
		keywords: [
			'vetras bojats jumts',
			'veja bojajumi jumtam',
			'jumta remonts pec vetras',
			'steidzams jumta remonts',
			'jumta noplude pec vetras',
			'avarijas jumta remonts riga',
			'wind damage roof repair riga',
			'storm roof damage emergency',
		].join(', '),
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
			},
		},
		alternates: {
			canonical,
			languages: {
				lv: 'https://uproof.eu/lv/urgency/vetras-jumta-bojajumi',
				en: 'https://uproof.eu/en/urgency/vetras-jumta-bojajumi',
				'nl-BE': 'https://uproof.eu/nl-BE/urgency/vetras-jumta-bojajumi',
				'x-default': 'https://uproof.eu/lv/urgency/vetras-jumta-bojajumi',
			},
		},
		openGraph: {
			title: titles[locale] || titles.lv,
			description: descriptions[locale] || descriptions.lv,
			url: canonical,
			type: 'website',
			locale: ogLocales[locale] || 'lv_LV',
			siteName: 'UpRoof',
		},
	};
}

const FAQ_ITEMS = {
	lv: [
		{
			q: 'Ko darīt uzreiz pēc vētras, ja jumts ir bojāts?',
			a: 'Vispirms nodrošiniet drošību, atslēdziet riskantas elektroierīces, dokumentējiet bojājumus ar foto un izsauciet jumta speciālistu. Nepieciešamības gadījumā uzstādām pagaidu pārsegumu tajā pašā dienā.',
		},
		{
			q: 'Cik ātri varat ierasties?',
			a: 'Rīgā un Pierīgā steidzamos gadījumos parasti 1-3 stundu laikā, atkarībā no laikapstākļiem un piekļuves drošības.',
		},
		{
			q: 'Vai veicat tikai pagaidu darbus?',
			a: 'Nē. Mēs nodrošinām pilnu ciklu: avārijas stabilizāciju, diagnostiku, detalizētu tāmi un pilnu jumta remontu vai bojāto zonu nomaiņu.',
		},
	],
	en: [
		{
			q: 'What should I do immediately after storm roof damage?',
			a: 'Prioritize safety, switch off risky electrical circuits, document visible damage with photos, and call a roof specialist. We can install temporary protection the same day when needed.',
		},
		{
			q: 'How fast can you arrive?',
			a: 'In Riga and nearby areas, we usually arrive within 1-3 hours for emergency requests, depending on weather and safe access.',
		},
		{
			q: 'Do you only do temporary fixes?',
			a: 'No. We provide full scope: emergency stabilization, diagnostics, clear quote, and complete repair or replacement of damaged roof sections.',
		},
	],
	'nl-BE': [
		{
			q: 'Wat doe ik direct na stormschade aan het dak?',
			a: 'Zorg eerst voor veiligheid, schakel risicovolle stroomkringen uit, documenteer zichtbare schade met foto\'s en bel een dakspecialist. Indien nodig plaatsen we nog dezelfde dag een tijdelijke afdekking.',
		},
		{
			q: 'Hoe snel kunnen jullie ter plaatse zijn?',
			a: 'In Riga en omgeving zijn we bij spoed meestal binnen 1-3 uur ter plaatse, afhankelijk van weer en veilige toegang.',
		},
		{
			q: 'Doen jullie alleen tijdelijke herstellingen?',
			a: 'Nee. We leveren het volledige traject: noodstabilisatie, diagnose, duidelijke offerte en volledig herstel of vervanging van beschadigde dakdelen.',
		},
	],
};

export default async function VetrasJumtaBojajumiPage({params}: Props) {
	const {locale} = await params;
	const lang = (locale in copy ? locale : 'lv') as 'lv' | 'en' | 'nl-BE';

	const faqItems = FAQ_ITEMS[lang];
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqItems.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: {'@type': 'Answer', text: item.a},
		})),
	};

	const serviceSchema = {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': 'https://uproof.eu/lv/urgency/vetras-jumta-bojajumi#service',
		name: 'Steidzams jumta remonts pēc vētras',
		description:
			'Steidzams jumta remonts pēc vētras un stipra vēja: pagaidu pārsegums, noplūžu apturēšana, bojājumu diagnostika un pilns remonta plāns Rīgā un Pierīgā.',
		provider: {
			'@type': 'LocalBusiness',
			'@id': 'https://uproof.eu/#organization',
			name: 'UpRoof (SIA UpLift)',
			telephone: '+37125612440',
			email: 'contact@uproof.eu',
			url: 'https://uproof.eu',
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Rīga',
				addressCountry: 'LV',
			},
		},
		areaServed: ['Rīga', 'Pierīga', 'Jūrmala', 'Mārupe', 'Ādaži', 'Salaspils', 'Ogre', 'Jelgava'],
		availableChannel: {
			'@type': 'ServiceChannel',
			servicePhone: {
				'@type': 'ContactPoint',
				telephone: '+37125612440',
				contactType: 'customer service',
				availableLanguage: ['lv', 'en', 'ru'],
			},
		},
	};

	const text = copy[lang];

	return (
		<main className="min-h-screen bg-white">
			<Header />
			<Breadcrumbs />

			<section className="pt-28 pb-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="inline-block bg-red-600 text-white text-sm font-bold uppercase px-4 py-1.5 rounded mb-6 tracking-wide">
						{text.badge}
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
						{text.heroTitle}
					</h1>
					<p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-8 leading-relaxed">{text.heroBody}</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<a href="tel:+37125612440" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-colors text-lg">
							+371 25612440
						</a>
						<Link href="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
							{text.secondaryCta}
						</Link>
					</div>
				</div>
			</section>

			<section className="bg-red-50 border-y border-red-200">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<p className="text-red-800 font-semibold text-lg">
						{lang === 'lv'
							? 'Svarīgi: pēc stipras vētras jumta bojājumi var būt neredzami no ielas. Veicam drošu diagnostiku ar foto fiksāciju.'
							: lang === 'en'
								? 'Important: after severe wind, roof damage can be invisible from street level. We provide safe diagnostics with photo evidence.'
								: 'Belangrijk: na zware wind is dakschade vaak niet zichtbaar vanaf straatniveau. Wij doen een veilige diagnose met fotobewijs.'}
					</p>
				</div>
			</section>

			<section className="py-16 md:py-20">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">{text.whyTitle}</h2>
					<p className="text-slate-600 max-w-3xl leading-relaxed">{text.whyBody}</p>
				</div>
			</section>

			<section className="py-16 md:py-20 bg-slate-50">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 tracking-tight">{text.servicesTitle}</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{[
							lang === 'lv'
								? {
									title: 'Noplūžu tūlītēja apturēšana',
									desc: 'Lokalizējam bojājumu vietas un apturam ūdens iekļūšanu, lai samazinātu sekundāros bojājumus iekštelpās.',
								}
								: lang === 'en'
									? {
										title: 'Immediate Leak Stabilization',
										desc: 'We isolate critical points and stop water ingress to reduce secondary indoor damage.',
									}
									: {
										title: 'Onmiddellijke lekstabilisatie',
										desc: 'We isoleren kritieke punten en stoppen waterinfiltratie om vervolgschade binnen te beperken.',
									},
							lang === 'lv'
								? {
									title: 'Pagaidu pārsegums un vēja aizsardzība',
									desc: 'Uzstādām drošu pagaidu segumu bojātajās zonās līdz pilna remonta veikšanai.',
								}
								: lang === 'en'
									? {
										title: 'Temporary Cover and Wind Protection',
										desc: 'We install robust temporary weather protection until full repair is completed.',
									}
									: {
										title: 'Tijdelijke afdekking en windbescherming',
										desc: 'We plaatsen een sterke tijdelijke weerbescherming tot het definitieve herstel klaar is.',
									},
							lang === 'lv'
								? {
									title: 'Bojājumu diagnostika ar foto atskaiti',
									desc: 'Sagatavojam pārskatāmu defektu sarakstu un remonta prioritātes īpašniekam/apdrošinātājam.',
								}
								: lang === 'en'
									? {
										title: 'Damage Diagnostics with Photo Report',
										desc: 'You get a clear defect list and repair priorities for owner and insurer decisions.',
									}
									: {
										title: 'Schadediagnose met fotorapport',
										desc: 'Je ontvangt een duidelijke defectenlijst en herstelprioriteiten voor eigenaar en verzekeraar.',
									},
							lang === 'lv'
								? {
									title: 'Pilns remonta plāns',
									desc: 'Izstrādājam detalizētu piedāvājumu un veicam pilnu jumta atjaunošanu vai lokālu nomaiņu.',
								}
								: lang === 'en'
									? {
										title: 'Complete Repair Plan',
										desc: 'We prepare a detailed quote and execute full restoration or targeted replacement.',
									}
									: {
										title: 'Volledig herstelplan',
										desc: 'We maken een gedetailleerde offerte en voeren volledig herstel of gerichte vervanging uit.',
									},
						].map((service, index) => (
							<div key={index} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all">
								<h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
								<p className="text-slate-600 leading-relaxed text-sm">{service.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-16 md:py-20">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 tracking-tight">{text.processTitle}</h2>
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							lang === 'lv' ? '1. Zvans un situācijas apraksts' : lang === 'en' ? '1. Call and damage brief' : '1. Bel en schadebeschrijving',
							lang === 'lv' ? '2. Steidzama ierašanās un stabilizācija' : lang === 'en' ? '2. Emergency arrival and stabilization' : '2. Spoedbezoek en stabilisatie',
							lang === 'lv' ? '3. Diagnostika un remonta tāme' : lang === 'en' ? '3. Diagnostics and repair quote' : '3. Diagnose en herstelofferte',
							lang === 'lv' ? '4. Pilns remonts un garantija' : lang === 'en' ? '4. Full repair and warranty' : '4. Volledig herstel en garantie',
						].map((item, index) => (
							<div key={index} className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700 font-medium">
								{item}
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-16 md:py-20 bg-slate-900 text-white">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
						{lang === 'lv'
							? 'Nepieļaujiet, ka vētras bojājumi kļūst dārgāki'
							: lang === 'en'
								? 'Do Not Let Storm Damage Become More Expensive'
								: 'Laat stormschade niet duurder worden'}
					</h2>
					<p className="text-slate-300 mb-8">
						{lang === 'lv'
							? 'Mēs apturam noplūdi, nodrošinām jumtu pret nākamo lietu un izstrādājam skaidru remonta plānu.'
							: lang === 'en'
								? 'We stop active leaks, secure your roof against the next rain, and deliver a clear repair plan.'
								: 'Wij stoppen actieve lekken, beveiligen je dak voor de volgende regen en leveren een duidelijk herstelplan.'}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="tel:+37125612440" className="inline-flex items-center justify-center bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-colors">
							{text.primaryCta}
						</a>
						<a href="mailto:contact@uproof.eu" className="inline-flex items-center justify-center border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
							contact@uproof.eu
						</a>
					</div>
				</div>
			</section>

			<section className="py-10 border-t border-slate-200 bg-white" aria-labelledby="related-links-heading">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 id="related-links-heading" className="text-2xl font-bold mb-6 text-slate-900">{text.relatedTitle}</h2>
					<ul className="grid md:grid-cols-3 gap-4 text-sm">
						<li><Link href="/urgency/caurs-jumts" className="text-primary-700 hover:underline">{lang === 'lv' ? 'Man ir caurs jumts - ko darīt?' : lang === 'en' ? 'My Roof Is Leaking - What Should I Do?' : 'Mijn dak lekt - wat nu?'}</Link></li>
						<li><Link href="/services/jumta-apkope-remonts" className="text-primary-700 hover:underline">{lang === 'lv' ? 'Jumta apkope un remonts' : lang === 'en' ? 'Roof Maintenance & Repair' : 'Dakonderhoud & Herstel'}</Link></li>
						<li><Link href="/services/seasonal" className="text-primary-700 hover:underline">{lang === 'lv' ? 'Sezonālie jumta darbi' : lang === 'en' ? 'Seasonal Roof Services' : 'Seizoensgebonden dakdiensten'}</Link></li>
					</ul>
				</div>
			</section>

			<section className="py-16 md:py-20 bg-slate-50">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 tracking-tight text-center">{text.faqTitle}</h2>
					<div className="space-y-4">
						{faqItems.map((item, index) => (
							<details key={index} className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
								<summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer text-left font-semibold text-slate-900">
									<span className="pr-4">{item.q}</span>
									<svg className="w-5 h-5 flex-shrink-0 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
								</summary>
								<div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 text-slate-600 leading-relaxed">
									<div className="h-px bg-slate-100 mb-4" />
									{item.a}
								</div>
							</details>
						))}
					</div>
				</div>
			</section>

			<Footer />

			<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
		</main>
	);
}

export const dynamic = 'force-static';
export const revalidate = 3600;
