import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import {Link} from '@/i18n/routing';
import blogData from '@/data/blog.json';
import type {Metadata} from 'next';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/blog`;
  const languages: Record<string, string> = {
    lv: 'https://uproof.eu/lv/blog',
    en: 'https://uproof.eu/en/blog',
    'nl-BE': 'https://uproof.eu/nl-BE/blog',
    'x-default': 'https://uproof.eu/lv/blog',
  };

  const titles: Record<string, string> = {
    lv: 'Jumtu ziņas un padomi | UpRoof blogs',
    en: 'Roofing Insights & Tips | UpRoof Blog',
    'nl-BE': 'Daktips & Inzichten | UpRoof Blog',
  };
  const descriptions: Record<string, string> = {
    lv: 'Ekspertu padomi par jumtu būvniecību, renovāciju, apkopi un sniega tīrīšanu. Jaunumi, nozares tendences un praktiskas rokasgrāmatas.',
    en: 'Expert advice on roofing construction, renovation, maintenance and snow removal. News, industry trends and practical guides.',
    'nl-BE': 'Deskundig advies over dakconstructie, renovatie, onderhoud. Nieuws, trends en praktische gidsen.',
  };

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    alternates: { canonical, languages },
  };
}

const blogPosts = blogData as Array<{
  id: number;
  slug?: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime?: string;
}>;

const placeholderImage = '/images/blog/placeholder.jpg';

export default async function BlogPage({params}: Props) {
  const {locale} = await params;
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {locale === 'lv' ? 'Jumtu ziņas un padomi' : locale === 'nl-BE' ? 'Daktips & Inzichten' : 'Roofing Insights & Tips'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {locale === 'lv' ? 'Ekspertu padomi, nozares tendences un praktiskas rokasgrāmatas jebkurām jumta vajadzībām' : locale === 'nl-BE' ? 'Deskundig advies, trends en praktische gidsen voor al uw dakbehoeften' : 'Expert advice, industry trends, and practical guides for all your roofing needs'}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={post.id}
                className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100"
              >
                {/* Image */}
                <Link href={`/blog/${post.slug || post.id}`} className="block">
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <Image
                      src={post.image?.trim() ? post.image : placeholderImage}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={index < 3}
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    <Link href={`/blog/${post.slug || post.id}`} className="hover:text-primary-600 transition-colors">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Date & Read More */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <time className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                    <Link
                      href={`/blog/${post.slug || post.id}`}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group/link"
                      aria-label={`${locale === 'lv' ? 'Lasīt vairāk' : locale === 'nl-BE' ? 'Lees meer' : 'Read more'}: ${post.title}`}
                    >
                      {locale === 'lv' ? 'Lasīt vairāk' : locale === 'nl-BE' ? 'Lees meer' : 'Read More'}
                      <span className="sr-only">: {post.title}</span>
                      <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>


        </div>
      </section>

      <Footer />
    </main>
  );
}
