import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import {Link} from '@/i18n/routing';
import type {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Sniega tīrīšana no jumta Rīgā | Jumta tīrīšana no sniega un ledus | UpRoof',
	description: 'Profesionāla sniega tīrīšana no jumta Rīgā un Pierīgā 24/7. Lāsteku tīrīšana, jumta tīrīšana no ledus un lāstekām, sniega izvešana. Soda nauda līdz 1400 EUR. Zvaniet +371 25612440.',
	keywords: [
		'sniega tīrīšana no jumta',
		'jumta tīrīšana no sniega',
		'lāsteku tīrīšana',
		'jumta tīrīšana no ledus un lāstekām',
		'sniega tīrīšana no jumta Rīgā',
		'sniega noņemšana no jumta',
		'lāsteku noņemšana',
		'ledus tīrīšana no jumta',
		'sniega tīrīšana daudzdzīvokļu mājai',
		'sniega izvešana',
		'sniega tīrīšana ar traktoru',
		'jumta sniega tīrīšanas pakalpojumi',
		'avārijas jumta tīrīšana no sniega',
		'sniega slogs uz jumta',
		'jumta tīrīšana ziemā',
	].join(', '),
	alternates: {
		canonical: 'https://uproof.eu/lv/urgency/sniega-tirisana',
		languages: {
			lv: 'https://uproof.eu/lv/urgency/sniega-tirisana',
			en: 'https://uproof.eu/en/urgency/sniega-tirisana',
			'nl-BE': 'https://uproof.eu/nl-BE/urgency/sniega-tirisana',
			'x-default': 'https://uproof.eu/lv/urgency/sniega-tirisana',
		},
	},
	openGraph: {
		title: 'Sniega tīrīšana no jumta Rīgā – 24/7 | UpRoof',
		description: 'Profesionāla sniega un ledus tīrīšana no jumta. Pilna cikla pakalpojums: sniega novadīšana, lāsteku tīrīšana, teritorijas sakopšana, sniega izvešana. Zvaniet tagad!',
		url: 'https://uproof.eu/lv/urgency/sniega-tirisana',
		type: 'website',
		locale: 'lv_LV',
	},
};

const FAQ_ITEMS = [
	{
		q: 'Cik maksā sniega tīrīšana no jumta?',
		a: 'Cena ir atkarīga no jumta laukuma, slīpuma, sniega biezuma un piekļuves sarežģītības. Zvaniet mums vai aizpildiet pieteikumu – mēs veiksim bezmaksas apskati un sniegsim fiksētu cenas piedāvājumu bez saistībām.',
	},
	{
		q: 'Cik ātri jūs varat ierasties?',
		a: 'Ārkārtas situācijās ierodamies 1–3 stundu laikā Rīgā un Pierīgā. Pieņemam pasūtījumus 24/7, arī brīvdienās un svētku dienās.',
	},
	{
		q: 'Vai var saņemt soda naudu par sniegu uz jumta?',
		a: 'Jā. Saskaņā ar Rīgas pašvaldības noteikumiem soda nauda fiziskām personām ir līdz 350 EUR, bet juridiskām personām līdz 1400 EUR. Ja pašvaldība veic piespiedu izpildi, izmaksas atlīdzina īpašnieks.',
	},
	{
		q: 'Vai jūs tīrāt arī daudzdzīvokļu māju jumtus?',
		a: 'Jā, mēs apkalpojam privātmājas, daudzdzīvokļu mājas un komercobjektus. Piedāvājam arī sezonas apkopes līgumus ar 15–20% atlaidi.',
	},
	{
		q: 'Kad nepieciešams tīrīt jumtu no sniega?',
		a: 'Reaģējiet, kad sniega biezums pārsniedz 30 cm, veidojas lāstekas garākas par 20 cm, vai redzami jumta deformācijas signāli. Preventīvi ieteicams tīrīt pēc katras intensīvas snigšanas (10+ cm).',
	},
	{
		q: 'Ko ietver pilna cikla sniega tīrīšana?',
		a: 'Mūsu pilna cikla pakalpojums ietver: sniega un ledus noņemšanu no jumta, lāsteku tīrīšanu, drošu sniega novadīšanu, satiksmes organizēšanu darbu laikā, teritorijas sakopšanu, un pēc nepieciešamības sniega tīrīšanu ar traktoru un sniega izvešanu.',
	},
];

export default async function SniegaTirisanaPage({params}: {params: Promise<{locale: string}>}) {
	const {locale} = await params;
	unstable_setRequestLocale(locale);

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: FAQ_ITEMS.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: {'@type': 'Answer', text: item.a},
		})),
	};

	const serviceSchema = {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': 'https://uproof.eu/lv/urgency/sniega-tirisana#service',
		name: 'Sniega tīrīšana no jumta',
		alternateName: ['Jumta tīrīšana no sniega', 'Lāsteku tīrīšana', 'Jumta tīrīšana no ledus un lāstekām'],
		description: 'Profesionāla pilna cikla sniega un ledus tīrīšana no jumta Rīgā un Pierīgā. Droša sniega novadīšana, lāsteku tīrīšana, satiksmes organizēšana, teritorijas sakopšana, sniega tīrīšana ar traktoru un sniega izvešana.',
		provider: {
			'@type': 'LocalBusiness',
			'@id': 'https://uproof.eu/#organization',
			name: 'UpRoof (SIA UpLift)',
			telephone: '+37125612440',
			email: 'karlis.uproof@gmail.com',
			url: 'https://uproof.eu',
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Rīga',
				addressCountry: 'LV',
			},
			areaServed: ['Rīga', 'Pierīga', 'Jūrmala', 'Jelgava', 'Ogre', 'Salaspils', 'Ķekava', 'Mārupe', 'Ādaži', 'Sigulda'],
			priceRange: '€€',
			openingHoursSpecification: {
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
				opens: '00:00',
				closes: '23:59',
			},
		},
		areaServed: {
			'@type': 'GeoCircle',
			geoMidpoint: {'@type': 'GeoCoordinates', latitude: 56.9496, longitude: 24.1052},
			geoRadius: '60000',
		},
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Sniega tīrīšanas pakalpojumi',
			itemListElement: [
				{'@type': 'Offer', itemOffered: {'@type': 'Service', name: 'Pilna cikla jumta tīrīšana no sniega un ledus'}},
				{'@type': 'Offer', itemOffered: {'@type': 'Service', name: 'Lāsteku tīrīšana'}},
				{'@type': 'Offer', itemOffered: {'@type': 'Service', name: 'Daudzdzīvokļu mājas jumta tīrīšana'}},
				{'@type': 'Offer', itemOffered: {'@type': 'Service', name: 'Sniega izvešana ar traktoru'}},
			],
		},
		availableChannel: {
			'@type': 'ServiceChannel',
			servicePhone: {'@type': 'ContactPoint', telephone: '+37125612440', contactType: 'customer service', availableLanguage: ['lv', 'en', 'ru']},
		},
	};

	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{'@type': 'ListItem', position: 1, name: 'UpRoof', item: 'https://uproof.eu/lv'},
			{'@type': 'ListItem', position: 2, name: 'Sniega tīrīšana no jumta', item: 'https://uproof.eu/lv/urgency/sniega-tirisana'},
		],
	};

	return (
		<main className="min-h-screen bg-white">
			<Header />
			<Breadcrumbs />

			{/* Hero */}
			<section className="pt-28 pb-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
				<div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}} />
				<div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="inline-block bg-red-600 text-white text-sm font-bold uppercase px-4 py-1.5 rounded mb-6 tracking-wide">
						Steidzams Pakalpojums 24/7
					</div>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
						Sniega tīrīšana no jumta Rīgā
					</h1>
					<p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8 leading-relaxed">
						Profesionāla pilna cikla jumta tīrīšana no sniega un ledus. Droša sniega novadīšana, lāsteku tīrīšana, teritorijas sakopšana un sniega izvešana. Ātra reaģēšana 1–3h.
					</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<a href="tel:+37125612440" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
							+371 25612440
						</a>
						<Link href="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
							Pieprasīt Bezmaksas Apskati
						</Link>
					</div>
				</div>
			</section>

			{/* Fine warning banner */}
			<section className="bg-red-50 border-y border-red-200">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
							<svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
						</div>
						<div>
							<p className="font-bold text-red-800 text-lg">Soda Nauda Par Neattīrītu Jumtu</p>
							<p className="text-red-700 mt-1">
								Fiziskām personām līdz <strong>350 EUR</strong>, juridiskām personām līdz <strong>1 400 EUR</strong>. Ja pašvaldība veic piespiedu izpildi – izmaksas atlīdzina īpašnieks papildus soda naudai.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Services grid */}
			<section className="py-16 md:py-20">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
						Mūsu Sniega Tīrīšanas Pakalpojumi
					</h2>
					<p className="text-gray-600 mb-10 max-w-2xl">
						Pilna cikla jumta tīrīšana no sniega un ledus – no sākotnējās apskates līdz teritorijas sakopšanai.
					</p>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							{title: 'Pilna cikla sniega tīrīšana', desc: 'Pilnīga sniega un ledus noņemšana no visa jumta vienmērīgi un droši, pasargājot jumta konstrukciju.'},
							{title: 'Lāsteku tīrīšana', desc: 'Droša lāsteku un ledus veidojumu noņemšana no jumta malām, karnīzēm un notekām ar profesionālu aprīkojumu.'},
							{title: 'Droša sniega novadīšana', desc: 'Kontrolēta sniega nolaišana no jumta, lai izvairītos no bojājumiem gājējiem, transportam un apkārtējai videi.'},
							{title: 'Satiksmes organizēšana', desc: 'Gājēju un transporta kustības organizēšana un drošības zonu norobežošana darbu norises laikā.'},
							{title: 'Teritorijas sakopšana', desc: 'Pēc jumta tīrīšanas savācam un sakopjam visu sniegu no teritorijas, atstājot tīru un drošu vidi.'},
							{title: 'Sniega izvešana ar traktoru', desc: 'Lieliem objektiem un lielu sniega daudzumu nodrošinām sniega tīrīšanu ar traktoru un pilnīgu sniega izvešanu.'},
						].map((service, i) => (
							<div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Why it's mandatory section */}
			<section className="py-16 md:py-20 bg-gray-50">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
						Kāpēc Sniega Tīrīšana No Jumta Ir Obligāta?
					</h2>
					<p className="text-gray-600 mb-10 max-w-3xl">
						Saskaņā ar Rīgas pašvaldības noteikumiem māju īpašniekiem ir tiešs pienākums nodrošināt jumta tīrīšanu no sniega, lāstekām un ledus ziemas periodā.
					</p>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold">1</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">Gājēju drošība</h3>
									<p className="text-gray-600 text-sm">Nokrītošs sniegs vai lāstekas var smagi ievainot gājējus. Mājas īpašnieks ir atbildīgs gan civiltiestiski, gan krimināltiestiski.</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold">2</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">Transportlīdzekļu bojājumi</h3>
									<p className="text-gray-600 text-sm">Sniegs vai ledus no jumta sabojā automašīnas. Īpašnieks ir atbildīgs par radītajiem zaudējumiem.</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold">3</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">Jumta konstrukcijas bojājumi</h3>
									<p className="text-gray-600 text-sm">Slapjš sniegs var svērt līdz 250 kg/m². Pārslodze izraisa deformācijas, plaisas un pat jumta sabrukumu.</p>
								</div>
							</div>
						</div>
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold">4</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">Mitruma iekļūšana ēkā</h3>
									<p className="text-gray-600 text-sm">Kad sniegs kūst, ūdens iekļūst ēkas iekšienē, bojājot apdari, izolāciju un elektroinstalāciju.</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold">5</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">Administratīvā atbildība</h3>
									<p className="text-gray-600 text-sm">RPP var izdot administratīvo aktu un veikt piespiedu izpildi. Īpašniekam jāatlīdzina pašvaldības izdevumi plus soda nauda.</p>
								</div>
							</div>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold">6</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">Ietvju bloķēšana nav risinājums</h3>
									<p className="text-gray-600 text-sm">Norobežot ietvi ir pieļaujams tikai uz dažām stundām tīrīšanas laikā. Ilgstoša bloķēšana ir pārkāpums.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Free quote CTA section */}
			<section className="py-16 md:py-20">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
						Saņemiet Bezmaksas Cenas Piedāvājumu
					</h2>
					<p className="text-gray-600 mb-8 max-w-2xl mx-auto">
						Katra objekta cena ir individuāla – tā ir atkarīga no jumta laukuma, slīpuma, sniega daudzuma un piekļuves sarežģītības. Zvaniet mums vai aizpildiet pieteikumu, un mēs sniegsim fiksētu cenu pirms darbu sākšanas.
					</p>
					<a href="tel:+37125612440" className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors">
						Zvaniet: +371 25612440
					</a>
					<p className="text-sm text-gray-500 mt-4">Bezmaksas apskate un fiksēts cenas piedāvājums bez saistībām</p>
				</div>
			</section>

			{/* Why UpRoof */}
			<section className="py-16 md:py-20 bg-gray-50">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 tracking-tight">
						Kāpēc Izvēlēties UpRoof?
					</h2>
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{title: 'Ātra reaģēšana', desc: 'Pieņemam pasūtījumus 24/7. Ierodamies 1–3 stundu laikā ārkārtas situācijās visā Rīgā un Pierīgā.'},
							{title: 'Sertificēta komanda', desc: 'Alpīnisti ar sertifikātiem darbam augstumā, 10+ gadu pieredze jumtu apkopē. Profesionāls drošības ekipējums.'},
							{title: 'Fiksētas cenas', desc: 'Bezmaksas apskate un cenas aprēķins pirms darbu sākšanas. Nav paslēptu maksājumu vai pārsteigumu.'},
							{title: 'Garantija', desc: 'Civiltiesiskās atbildības apdrošināšana, darbu izpildes garantija un pilna dokumentācija.'},
						].map((item, i) => (
							<div key={i}>
								<h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ section */}
			<section className="py-16 md:py-20">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 tracking-tight text-center">
						Biežāk Uzdotie Jautājumi
					</h2>
					<div className="space-y-4">
						{FAQ_ITEMS.map((item, i) => (
							<details key={i} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
								<summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer text-left font-semibold text-gray-900 group-open:text-gray-900 hover:text-gray-700">
									<span className="pr-4">{item.q}</span>
									<svg className="w-5 h-5 flex-shrink-0 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
								</summary>
								<div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
									<div className="h-px bg-gray-100 mb-4" />
									<p className="text-gray-600 leading-relaxed">{item.a}</p>
								</div>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* Process / how to order */}
			<section className="py-16 md:py-20 bg-gray-50">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 tracking-tight">
						Kā Pasūtīt Sniega Tīrīšanu No Jumta?
					</h2>
					<div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
						{[
							{step: '1', title: 'Zvaniet', desc: '+371 25612440 (24/7)'},
							{step: '2', title: 'Apskate', desc: 'Bezmaksas apskate vai novērtējums pēc foto'},
							{step: '3', title: 'Cenas piedāvājums', desc: 'Fiksēta cena pirms darbiem'},
							{step: '4', title: 'Darbu veikšana', desc: 'Droša un profesionāla izpilde'},
							{step: '5', title: 'Dokumenti', desc: 'Izpildes akts un garantija'},
						].map((item, i) => (
							<div key={i} className="text-center">
								<div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">{item.step}</div>
								<h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
								<p className="text-gray-600 text-sm">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-16 md:py-20 bg-gray-900 text-white">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
						Neuzņemieties Risku – Zvaniet Profesionāļiem
					</h2>
					<p className="text-gray-400 mb-8 max-w-xl mx-auto">
						Profesionāla sniega un ledus tīrīšana no jumta Rīgā un Pierīgā. Ātra reaģēšana, fiksētas cenas, sertificēta komanda.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a href="tel:+37125612440" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
							+371 25612440
						</a>
						<a href="mailto:karlis.uproof@gmail.com" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
							Rakstiet Mums
						</a>
					</div>
					<p className="text-gray-500 text-sm mt-6">Pieņemam pasūtījumus 24/7 – arī brīvdienās un svētku dienās</p>
				</div>
			</section>

			{/* Internal links */}
			<section className="py-10 border-t border-gray-200 bg-white" aria-labelledby="related-links-heading">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 id="related-links-heading" className="text-2xl font-bold mb-6 text-gray-900">Saistītās Lapas</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<nav aria-label="Saistītie Raksti" className="space-y-3">
							<h3 className="font-semibold text-gray-800 text-lg">Saistītie Raksti</h3>
							<ul className="space-y-2 text-sm">
								<li><Link href="/blog/sniega-tirisana-no-jumta-riga" className="text-primary-700 hover:underline">Sniega tīrīšana no jumta Rīgā 2026 – Oficiāls brīdinājums</Link></li>
								<li><Link href="/blog/lasteku-tirisana-jumta-tirisana-no-ledus" className="text-primary-700 hover:underline">Lāsteku tīrīšana un jumta tīrīšana no ledus</Link></li>
								<li><Link href="/blog/sniega-slogs-uz-jumta" className="text-primary-700 hover:underline">Sniega slogs uz jumta – Kad tas ir bīstami?</Link></li>
								<li><Link href="/blog/sniega-tirisana-daudzdzivoklu-maja" className="text-primary-700 hover:underline">Sniega tīrīšana no daudzdzīvokļu mājas jumta</Link></li>
								<li><Link href="/blog/ka-izvelieties-sniega-tirisanas-pakalpojumu" className="text-primary-700 hover:underline">Kā izvēlēties sniega tīrīšanas pakalpojumu sniedzēju</Link></li>
								<li><Link href="/blog/sniega-tirisana-ar-traktoru" className="text-primary-700 hover:underline">Sniega tīrīšana no jumta ar traktoru</Link></li>
							</ul>
						</nav>
						<nav aria-label="Saistītie Pakalpojumi" className="space-y-3">
							<h3 className="font-semibold text-gray-800 text-lg">Saistītie Pakalpojumi</h3>
							<ul className="space-y-2 text-sm">
								<li><Link href="/services/jumta-apkope-remonts" className="text-primary-700 hover:underline">Jumta apkope un remonts</Link></li>
								<li><Link href="/services/jumta-remonts" className="text-primary-700 hover:underline">Avārijas jumta remonts</Link></li>
								<li><Link href="/services/noteksistemu-uzstadisana" className="text-primary-700 hover:underline">Noteksistēmu uzstādīšana</Link></li>
								<li><Link href="/services/jumta-renovacija" className="text-primary-700 hover:underline">Jumta renovācija</Link></li>
								<li><Link href="/services/jumta-buvnieciba" className="text-primary-700 hover:underline">Jumta būvniecība</Link></li>
							</ul>
						</nav>
						<nav aria-label="Noderīgi Resursi" className="space-y-3">
							<h3 className="font-semibold text-gray-800 text-lg">Noderīgi Resursi</h3>
							<ul className="space-y-2 text-sm">
								<li><Link href="/urgency/caurs-jumts" className="text-primary-700 hover:underline">Tek jumts, ko darīt?</Link></li>
								<li><Link href="/blog" className="text-primary-700 hover:underline">Blog raksti</Link></li>
								<li><Link href="/projects" className="text-primary-700 hover:underline">Projekti</Link></li>
								<li><Link href="/contact" className="text-primary-700 hover:underline">Kontakts</Link></li>
							</ul>
						</nav>
					</div>
				</div>
			</section>

			<Footer />

			{/* Structured data */}
			<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
		</main>
	);
}

export const dynamic = 'force-static';
export const revalidate = 3600;
