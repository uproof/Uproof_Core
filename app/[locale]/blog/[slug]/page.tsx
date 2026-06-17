
const safeDateLocales: Record<string, string> = {
  lv: 'lv-LV',
  en: 'en-US',
  'nl-BE': 'nl-BE',
};
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Image from 'next/image';
import {Link} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import blogMetadata from '@/data/blog-metadata.json';
import blogData from '@/data/blog.json';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'strong', 'b', 'em', 'i', 'u',
    'blockquote', 'code', 'pre',
    'a', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['class'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  transformTags: {
    h1: () => ({
      tagName: 'h2',
      attribs: {}
    }),
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      
      // Check for relative or hash links
      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('./') || href.startsWith('../')) {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: attribs.rel || 'noopener'
          }
        };
      }

      // For absolute URLs, parse and validate the host
      let isInternal = false;
      try {
        const url = new URL(href);
        const allowedHosts = ['uproof.eu', 'www.uproof.eu'];
        isInternal = allowedHosts.includes(url.hostname);
      } catch {
        // Invalid URL format - treat as external
        isInternal = false;
      }

      if (isInternal) {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: attribs.rel || 'noopener'
          }
        };
      }

      return {
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      };
    }
  }
};

const locales = ['lv', 'en', 'nl-BE'];

export function generateStaticParams() {
  // Use lightweight metadata for params generation (12KB instead of 136KB)
  const published = blogMetadata.filter((p: any) => p.status === 'published');
  return locales.flatMap(locale =>
    published.map(post => ({locale, slug: (post as any).slug || String(post.id)}))
  );
}

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

// Enable ISR: Revalidate every hour to refresh blog content without full rebuild
export const revalidate = 3600;

const blogPosts = blogData as Array<{
  id: number;
  slug?: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  status?: string;
  category: string;
  readTime?: string;
  author?: string;
  content?: string;
}>;

const publishedBlogPosts = blogPosts.filter((post) => post.status === 'published');
const placeholderImage = '/images/blog/placeholder.svg';

function findPost(slug: string) {
  return publishedBlogPosts.find(p => p.slug === slug) || publishedBlogPosts.find(p => String(p.id) === slug);
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const post = findPost(slug);
  
  if (!post) {
    return {title: 'Post Not Found'};
  }

  const postSlug = post.slug || String(post.id);
  const canonical = `https://uproof.eu/${locale}/blog/${postSlug}`;
  const imageSrc = post.image?.trim() ? post.image : placeholderImage;
  
  // Get enhanced metadata if available
  const postMetadata = blogMetadata.find((m: any) => m.slug === postSlug || m.id === post.id);
  const metaDescription = postMetadata?.metaDescription || post.excerpt;
  const ogDescription = postMetadata?.socialMeta?.ogDescription || metaDescription;
  const twitterDescription = postMetadata?.socialMeta?.twitterDescription || metaDescription;
  const twitterCardValue = (postMetadata?.socialMeta?.twitterCard as 'summary_large_image' | 'summary' | 'player' | 'app') || 'summary_large_image';
  
  // Generate hreflang alternates for blog post
  const languages: Record<string, string> = {
    lv: `https://uproof.eu/lv/blog/${postSlug}`,
    en: `https://uproof.eu/en/blog/${postSlug}`,
    'nl-BE': `https://uproof.eu/nl-BE/blog/${postSlug}`,
    'x-default': `https://uproof.eu/lv/blog/${postSlug}`,
  };

  return {
    title: `${post.title} | UpRoof Blog`,
    description: metaDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: postMetadata?.socialMeta?.ogTitle || post.title,
      description: ogDescription,
      url: canonical,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author || 'UpRoof Team'],
      locale: locale === 'lv' ? 'lv_LV' : locale === 'en' ? 'en_US' : 'nl_BE',
    },
    twitter: {
      card: twitterCardValue,
      title: postMetadata?.socialMeta?.twitterTitle || post.title,
      description: twitterDescription,
    },
  };
}

export default async function BlogPostPage({params}: Props) {
  const {locale, slug} = await params;

  const post = findPost(slug);

  if (!post) {
    notFound();
  }

  const postSlug = post.slug || String(post.id);
  const currentIndex = publishedBlogPosts.findIndex((p) => (p.slug || String(p.id)) === postSlug);
  const previousPost = currentIndex >= 0 ? publishedBlogPosts[currentIndex - 1] : undefined;
  const nextPost = currentIndex >= 0 ? publishedBlogPosts[currentIndex + 1] : undefined;
  const hasAuthor = Boolean(post.author && post.author.trim());
  const imageSrc = post.image?.trim() ? post.image : placeholderImage;
  const cleanText = (post.content ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(' ').length : undefined;
  const breadcrumbNames = {
    home: locale === 'lv' ? 'Sākums' : locale === 'nl-BE' ? 'Home' : 'Home',
    blog: locale === 'lv' ? 'Blogs' : locale === 'nl-BE' ? 'Blog' : 'Blog',
  };

  // Get enhanced metadata if available
  const postMetadata = blogMetadata.find((m: any) => m.slug === postSlug || m.id === post.id);
  const keywords = postMetadata?.keywords?.join(', ') || `${post.category}, ${post.title}`;
  const imageAlt = postMetadata?.imageAlt || post.title;
  const schemaType = postMetadata?.schemaType || 'BlogPosting';

  // BlogPosting structured data with enhanced fields
  const articleSchema: any = {
    '@context': 'https://schema.org',
    '@type': ['BlogPosting', 'Article'],
    '@id': `https://uproof.eu/${locale}/blog/${postSlug}#article`,
    headline: post.title,
    description: post.excerpt,
    image: {
      '@type': 'ImageObject',
      url: `https://uproof.eu${imageSrc}`,
      caption: imageAlt,
    },
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
      '@id': `https://uproof.eu/${locale}/blog/${postSlug}`,
    },
    inLanguage: locale === 'lv' ? 'lv-LV' : locale === 'en' ? 'en-US' : 'nl-BE',
    articleSection: post.category,
    keywords,
    wordCount,
  };

  // Add HowTo schema for how-to articles
  if (schemaType === 'HowTo' && postMetadata?.relatedPosts) {
    articleSchema['@type'].push('HowTo');
  }

  // BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: breadcrumbNames.home,
        item: `https://uproof.eu/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: breadcrumbNames.blog,
        item: `https://uproof.eu/${locale}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://uproof.eu/${locale}/blog/${postSlug}`,
      },
    ],
  };

  // Featured Snippets schema for comparison/decision blogs
  const schemas = [articleSchema, breadcrumbSchema];
  
  if (postMetadata?.featuredSnippets && postMetadata.featuredSnippets.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: postMetadata.featuredSnippets.map((snippet: string, idx: number) => ({
        '@type': 'Question',
        name: snippet,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `See the blog post for detailed information about: ${snippet}`
        }
      }))
    };
    schemas.push(faqSchema);
  }

  // Internal links with proper locale support - replace hardcoded locale with current locale
  const getLocaleAwareLink = (url: string, currentLocale: string) => {
    // Replace hardcoded locale in URL with current locale
    const urlMatch = url.match(/^\/([a-z-]+)\//);
    if (urlMatch) {
      return url.replace(`/${urlMatch[1]}/`, `/${currentLocale}/`);
    }
    // If no locale in URL, add current locale
    return `/${currentLocale}${url}`;
  };

  const internalLinksHtml = postMetadata?.internalLinks?.map((link: any) => {
    const localeAwareUrl = getLocaleAwareLink(link.url, locale);
    return `<li><a href="${localeAwareUrl}" class="text-primary-600 font-semibold hover:underline">${link.anchor}</a></li>`;
  }).join('') || '';

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
            {hasAuthor ? <span>By {post.author}</span> : null}
            {hasAuthor ? <span>•</span> : null}
            <time>
              {new Date(post.date).toLocaleDateString(safeDateLocales[locale] || 'en-US', {
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
          {/* Featured Image */}
          <div className="mb-12 relative h-96 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={imageSrc}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content with anchor support */}
          <div 
            className="max-w-none
              [&_h2]:text-4xl [&_h2]:font-extrabold [&_h2]:text-gray-900 [&_h2]:mb-6 [&_h2]:mt-12 [&_h2]:pb-4 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:scroll-mt-20
              [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:scroll-mt-20
              [&_p]:text-lg [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-6
              [&_strong]:font-bold [&_strong]:text-gray-900 [&_strong]:text-lg
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
              [&_ul_li]:text-lg [&_ul_li]:text-gray-700 [&_ul_li]:leading-relaxed
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2
              [&_ol_li]:text-lg [&_ol_li]:text-gray-700 [&_ol_li]:leading-relaxed
              [&_a]:text-primary-600 [&_a]:font-semibold [&_a]:no-underline hover:[&_a]:underline
              [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-gray-600
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6
              [&_thead]:bg-gray-100
              [&_th]:text-left [&_th]:px-4 [&_th]:py-3 [&_th]:font-bold [&_th]:text-gray-900 [&_th]:border [&_th]:border-gray-300
              [&_td]:px-4 [&_td]:py-3 [&_td]:border [&_td]:border-gray-300"
            dangerouslySetInnerHTML={{__html: sanitizeHtml(post.content ?? '', SANITIZE_OPTIONS)}}
          />

          {/* Share & Back */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            {(previousPost || nextPost) ? (
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {previousPost ? (
                  <Link
                    href={`/blog/${previousPost.slug || previousPost.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      {locale === 'lv' ? 'Iepriekšējais raksts' : locale === 'nl-BE' ? 'Vorig artikel' : 'Previous article'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{previousPost.title}</p>
                  </Link>
                ) : <div />}

                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug || nextPost.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 text-left md:text-right">
                      {locale === 'lv' ? 'Nākamais raksts' : locale === 'nl-BE' ? 'Volgend artikel' : 'Next article'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 text-left md:text-right">{nextPost.title}</p>
                  </Link>
                ) : <div />}
              </div>
            ) : null}

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
      
      {/* Structured Data - Article + Breadcrumb + Optional FAQ/Snippets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      {postMetadata?.featuredSnippets && postMetadata.featuredSnippets.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: postMetadata.featuredSnippets.map((snippet: string) => ({
            '@type': 'Question',
            name: snippet,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `See the blog post for detailed information about: ${snippet}`
            }
          }))
        })}} />
      )}
    </main>
  );
}
