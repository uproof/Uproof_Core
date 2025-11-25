import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
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

export function generateMetadata({params}: Props): Metadata {
  const post = blogPosts.find(p => p.id === parseInt(params.id));
  
  if (!post) {
    return {title: 'Post Not Found'};
  }

  const {locale, id} = params;
  const canonical = `https://uproof.eu/${locale}/blog/${id}`;
  
  // Generate hreflang alternates for blog post
  const languages: Record<string, string> = {
    lv: `https://uproof.eu/lv/blog/${id}`,
    en: `https://uproof.eu/en/blog/${id}`,
    'nl-BE': `https://uproof.eu/nl-BE/blog/${id}`,
    'x-default': `https://uproof.eu/lv/blog/${id}`,
  };

  return {
    title: `${post.title} | UpRoof Blog`,
    description: post.excerpt,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author || 'UpRoof Team'],
      locale: locale === 'lv' ? 'lv_LV' : locale === 'en' ? 'en_US' : 'nl_BE',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default function BlogPostPage({params: {locale, id}}: Props) {
  unstable_setRequestLocale(locale);

  const post = blogPosts.find(p => p.id === parseInt(id));

  if (!post) {
    notFound();
  }

  // BlogPosting structured data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://uproof.eu/${locale}/blog/${id}#article`,
    headline: post.title,
    description: post.excerpt,
    image: `https://uproof.eu${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      '@id': 'https://uproof.eu/#organization',
      name: post.author || 'UpRoof Team',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://uproof.eu/#organization',
      name: 'UpRoof',
      logo: {
        '@type': 'ImageObject',
        url: 'https://uproof.eu/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://uproof.eu/${locale}/blog/${id}`,
    },
    inLanguage: locale === 'lv' ? 'lv-LV' : locale === 'en' ? 'en-US' : 'nl-BE',
    articleSection: post.category,
    keywords: post.category,
  };

  // BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://uproof.eu/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `https://uproof.eu/${locale}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://uproof.eu/${locale}/blog/${id}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumbs />
      
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
      
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
    </main>
  );
}
