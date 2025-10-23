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
                className="bg-white shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-56 bg-gray-200 overflow-hidden">
                  {/* Placeholder - replace with actual images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold opacity-50">
                      {post.id}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    <Link href={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Date & Read More */}
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-sm font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide"
                    >
                      Read More →
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
