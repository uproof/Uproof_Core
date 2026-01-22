import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import {Link} from '@/i18n/routing';
import blogData from '@/data/blog.json';

type Props = {
  params: {locale: string};
};

const blogPosts = blogData as Array<{
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime?: string;
}>;

const placeholderImage = '/images/blog/placeholder.jpg';

export default function BlogPage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Roofing Insights & Tips
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Expert advice, industry trends, and practical guides for all your roofing needs
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
                <Link href={`/blog/${post.id}`} className="block">
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
                    <Link href={`/blog/${post.id}`} className="hover:text-primary-600 transition-colors">
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
                      href={`/blog/${post.id}`}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group/link"
                    >
                      Read More
                      <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            <button className="px-4 py-2 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-bold hover:bg-gray-100 transition-colors border border-gray-300">
              2
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-bold hover:bg-gray-100 transition-colors border border-gray-300">
              3
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
