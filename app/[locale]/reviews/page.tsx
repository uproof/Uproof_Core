import {unstable_setRequestLocale} from 'next-intl/server';
import {use} from 'react';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reviews from '@/components/Reviews';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/reviews`;
  
  const titleMap: Record<string, string> = {
    lv: 'Klientu atsauksmes | UpRoof',
    en: 'Customer Reviews | UpRoof',
    'nl-BE': 'Klantbeoordelingen | UpRoof'
  };
  
  const descMap: Record<string, string> = {
    lv: 'Lasiet, ko mūsu klienti saka par UpRoof jumta pakalpojumiem. Pārbaudītas atsauksmes no reāliem projektiem.',
    en: 'Read what our customers say about UpRoof roofing services. Verified reviews from real projects.',
    'nl-BE': 'Lees wat onze klanten zeggen over UpRoof dakdiensten. Geverifieerde beoordelingen van echte projecten.'
  };
  
  const languages: Record<string, string> = {
    lv: 'https://uproof.eu/lv/reviews',
    en: 'https://uproof.eu/en/reviews',
    'nl-BE': 'https://uproof.eu/nl-BE/reviews',
    'x-default': 'https://uproof.eu/lv/reviews'
  };
  
  const title = titleMap[locale] || titleMap.lv;
  const description = descMap[locale] || descMap.lv;
  
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: { url: canonical, title, description, type: 'website', locale },
    twitter: { title, description, card: 'summary_large_image' }
  };
}

export default function ReviewsPage({params}: PageProps) {
  const {locale} = use(params);
  unstable_setRequestLocale(locale);
  const t = useTranslations();

  const aggregateRatingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://uproof.eu/#organization',
    name: 'UpRoof',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mt-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {locale === 'lv' && 'Klientu atsauksmes'}
                {locale === 'en' && 'Customer Reviews'}
                {locale === 'nl-BE' && 'Klantbeoordelingen'}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {locale === 'lv' && 'Lasiet, ko mūsu klienti saka par UpRoof jumta pakalpojumiem. Pārbaudītas atsauksmes no reāliem projektiem Rīgā un visā Latvijā.'}
                {locale === 'en' && 'Read what our customers say about UpRoof roofing services. Verified reviews from real projects in Riga and throughout Latvia.'}
                {locale === 'nl-BE' && 'Lees wat onze klanten zeggen over UpRoof dakdiensten. Geverifieerde beoordelingen van echte projecten in Riga en heel Letland.'}
              </p>
              
              <div className="mt-8 inline-flex items-center justify-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-6 h-6 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">4.9</span>
                <span className="text-gray-600">
                  {locale === 'lv' && '(150+ atsauksmes)'}
                  {locale === 'en' && '(150+ reviews)'}
                  {locale === 'nl-BE' && '(150+ beoordelingen)'}
                </span>
              </div>
            </div>
            
            <Reviews />
            
            <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {locale === 'lv' && 'Gatavs sākt savu projektu?'}
                {locale === 'en' && 'Ready to start your project?'}
                {locale === 'nl-BE' && 'Klaar om uw project te starten?'}
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {locale === 'lv' && 'Pievienojieties simtiem apmierinātu klientu. Saņemiet bezmaksas konsultāciju un jumta novērtējumu.'}
                {locale === 'en' && 'Join hundreds of satisfied customers. Get a free consultation and roof assessment.'}
                {locale === 'nl-BE' && 'Sluit je aan bij honderden tevreden klanten. Ontvang gratis advies en dakinspectie.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={`/${locale}/contact`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  {locale === 'lv' && 'Sazināties ar mums'}
                  {locale === 'en' && 'Contact us'}
                  {locale === 'nl-BE' && 'Contacteer ons'}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a 
                  href="tel:+37125612440"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +371 25612440
                </a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {locale === 'lv' && 'Vai arī atstājiet savu atsauksmi Google Maps'}
                  {locale === 'en' && 'Or leave your review on Google Maps'}
                  {locale === 'nl-BE' && 'Of laat uw beoordeling achter op Google Maps'}
                </p>
                <a 
                  href="https://www.google.com/search?num=10&sca_esv=31d3cabc157c1d09&si=AL3DRZEsmMCCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOWQ-eCdLJUq8RkkdKDpMXAjjRZOpuQzyyNc3h-0yX0SKbu1-BM495FL6JrpK2l9Kx0nzcLkRMKZRO0-cduKdTbAPa6gmegG7fn0gF_o9ZZFzQbwSPw%3D%3D&q=UpRoof+%7C+Jumtu+b%C5%ABvniec%C4%ABba+Reviews&sa=X&ved=2ahUKEwjB7oGuvoGSAxWuNxAIHQm_HEgQ0bkNegQIIhAD&biw=1920&bih=934&dpr=1&aic=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018s3.132-7.018 7-7.018c1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z"/>
                  </svg>
                  {locale === 'lv' && 'Atstāt atsauksmi Google'}
                  {locale === 'en' && 'Leave a Google review'}
                  {locale === 'nl-BE' && 'Google beoordeling achterlaten'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
