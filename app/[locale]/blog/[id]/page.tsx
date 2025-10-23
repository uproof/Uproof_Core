import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import {Link} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import blogData from '@/data/blog.json';

type Props = {
  params: {locale: string; id: string};
};

const blogPosts = blogData as Array<{
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime?: string;
  author?: string;
  content?: string;
}>;

export default function BlogPostPage({params: {locale, id}}: Props) {
  unstable_setRequestLocale(locale);

  const post = blogPosts.find(p => p.id === parseInt(id));

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link 
              href="/blog"
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              ← Back to Blog
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1 bg-primary-600 text-white text-sm font-bold uppercase rounded">
              {post.category}
            </span>
            <span className="text-gray-300">{post.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-300">
            <span>By {post.author}</span>
            <span>•</span>
            <time>
              {new Date(post.date).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Image Placeholder */}
          <div className="mb-12 relative h-96 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
            <span className="text-white text-6xl font-bold opacity-50">
              {post.id}
            </span>
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600 prose-strong:text-gray-900 prose-ul:text-gray-600"
            dangerouslySetInnerHTML={{__html: post.content ?? ''}}
          />

          {/* Share & Back */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
