import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import {Link} from '@/i18n/routing';
import {notFound} from 'next/navigation';

type Props = {
  params: {locale: string; id: string};
};

// Sample blog posts - replace with real data from CMS or API
const blogPosts = [
  {
    id: 1,
    title: 'Top 5 Roofing Materials for 2025',
    excerpt: 'Discover the most durable and cost-effective roofing materials that will protect your home for decades.',
    content: `
      <h2>Introduction</h2>
      <p>Choosing the right roofing material is one of the most important decisions for any homeowner. In 2025, we have more options than ever before, with materials that offer superior durability, energy efficiency, and aesthetic appeal.</p>
      
      <h2>1. Metal Roofing</h2>
      <p>Metal roofing continues to dominate as one of the most popular choices. With a lifespan of 40-70 years, metal roofs are incredibly durable and energy-efficient. They reflect solar heat, which can reduce cooling costs by up to 25%.</p>
      
      <h2>2. Asphalt Shingles</h2>
      <p>Asphalt shingles remain a cost-effective and versatile option. Modern architectural shingles offer improved durability and come in a wide range of colors and styles.</p>
      
      <h2>3. Clay and Concrete Tiles</h2>
      <p>Perfect for Mediterranean and Spanish-style homes, clay and concrete tiles are extremely durable and can last over 50 years with proper maintenance.</p>
      
      <h2>4. Synthetic Roofing</h2>
      <p>Innovative synthetic materials now mimic the appearance of slate, wood, and clay while offering superior durability and lower maintenance requirements.</p>
      
      <h2>5. Green Roofing</h2>
      <p>Eco-conscious homeowners are increasingly choosing green roofs with vegetation, which provide excellent insulation, reduce stormwater runoff, and improve air quality.</p>
      
      <h2>Conclusion</h2>
      <p>The best roofing material depends on your budget, climate, home style, and personal preferences. Consult with our roofing experts to find the perfect solution for your home.</p>
    `,
    image: '/images/blog/roofing-materials.jpg',
    date: '2025-01-15',
    category: 'Materials',
    readTime: '5 min read',
    author: 'UpRoof Team'
  },
  {
    id: 2,
    title: 'How to Maintain Your Roof in Winter',
    excerpt: 'Essential tips for keeping your roof in perfect condition during the harsh winter months.',
    content: `
      <h2>Winter Roof Maintenance Guide</h2>
      <p>Winter can be tough on your roof. Snow, ice, and freezing temperatures can cause serious damage if you're not prepared. Here's everything you need to know to protect your investment.</p>
      
      <h2>Pre-Winter Inspection</h2>
      <p>Before winter arrives, schedule a professional roof inspection. Look for loose shingles, damaged flashing, and clogged gutters that could cause problems when temperatures drop.</p>
      
      <h2>Remove Snow Buildup</h2>
      <p>Heavy snow can put excessive weight on your roof structure. Use a roof rake to safely remove snow from the ground, or hire professionals for heavy accumulation.</p>
      
      <h2>Prevent Ice Dams</h2>
      <p>Proper attic insulation and ventilation are key to preventing ice dams. Ensure your attic temperature stays close to outdoor temperatures to prevent snow from melting and refreezing.</p>
      
      <h2>Check for Leaks</h2>
      <p>Inspect your attic regularly for signs of water infiltration. Brown stains, dripping water, or musty odors indicate potential leaks that need immediate attention.</p>
      
      <h2>Professional Help</h2>
      <p>Don't hesitate to call roofing professionals if you notice any issues. Winter damage can quickly escalate, leading to costly repairs.</p>
    `,
    image: '/images/blog/winter-maintenance.jpg',
    date: '2025-01-10',
    category: 'Maintenance',
    readTime: '4 min read',
    author: 'UpRoof Team'
  },
  {
    id: 3,
    title: 'Signs Your Roof Needs Repair',
    excerpt: 'Learn to identify the warning signs that indicate your roof requires professional attention.',
    content: `
      <h2>Warning Signs Your Roof Needs Repair</h2>
      <p>Catching roof problems early can save you thousands in repair costs. Here are the key warning signs every homeowner should watch for.</p>
      
      <h2>1. Missing or Damaged Shingles</h2>
      <p>Check for shingles that are cracked, curled, or completely missing. These gaps allow water to penetrate your roof deck.</p>
      
      <h2>2. Granules in Gutters</h2>
      <p>Asphalt shingles shed granules as they age. Excessive granules in your gutters indicate your shingles are deteriorating.</p>
      
      <h2>3. Sagging Roof Deck</h2>
      <p>A sagging roofline indicates structural problems that require immediate professional attention.</p>
      
      <h2>4. Water Stains on Ceilings</h2>
      <p>Brown or yellow stains on your ceiling are clear signs of water infiltration from your roof.</p>
      
      <h2>5. Daylight Through Roof Boards</h2>
      <p>If you can see daylight through your roof boards in the attic, you have holes that need repair.</p>
      
      <h2>6. Increased Energy Bills</h2>
      <p>Poor roof insulation or ventilation can cause your heating and cooling costs to spike.</p>
      
      <h2>Take Action</h2>
      <p>If you notice any of these signs, contact a professional roofing contractor immediately for an inspection.</p>
    `,
    image: '/images/blog/roof-repair.jpg',
    date: '2025-01-05',
    category: 'Tips',
    readTime: '6 min read',
    author: 'UpRoof Team'
  },
  {
    id: 4,
    title: 'Energy-Efficient Roofing Solutions',
    excerpt: 'Reduce your energy bills with modern roofing technologies and insulation techniques.',
    content: `
      <h2>Energy-Efficient Roofing for Modern Homes</h2>
      <p>Your roof plays a crucial role in your home's energy efficiency. With the right materials and techniques, you can significantly reduce your heating and cooling costs.</p>
      
      <h2>Cool Roof Technology</h2>
      <p>Cool roofs reflect more sunlight and absorb less heat than standard roofs. This technology can reduce roof surface temperatures by up to 50°F.</p>
      
      <h2>Proper Insulation</h2>
      <p>Adequate attic insulation prevents heat transfer between your living space and the outdoors. Modern insulation materials offer superior R-values for maximum efficiency.</p>
      
      <h2>Ventilation Systems</h2>
      <p>Ridge vents, soffit vents, and attic fans work together to maintain proper air circulation and prevent moisture buildup.</p>
      
      <h2>Solar Roofing</h2>
      <p>Solar panels or solar shingles can generate clean energy while protecting your home, potentially eliminating your electricity bills.</p>
      
      <h2>Green Roofs</h2>
      <p>Vegetative roof systems provide natural insulation, reduce urban heat island effects, and manage stormwater runoff.</p>
      
      <h2>Return on Investment</h2>
      <p>While energy-efficient roofing may cost more upfront, the long-term savings on energy bills make it a smart investment.</p>
    `,
    image: '/images/blog/energy-efficient.jpg',
    date: '2024-12-28',
    category: 'Innovation',
    readTime: '7 min read',
    author: 'UpRoof Team'
  },
  {
    id: 5,
    title: 'The Complete Roof Installation Guide',
    excerpt: 'Everything you need to know about the roof installation process from start to finish.',
    content: `
      <h2>Complete Roof Installation Process</h2>
      <p>Understanding the roof installation process helps you make informed decisions and know what to expect when working with contractors.</p>
      
      <h2>Step 1: Initial Inspection</h2>
      <p>Professional roofers inspect your current roof, measure the area, check structural integrity, and identify any underlying issues.</p>
      
      <h2>Step 2: Material Selection</h2>
      <p>Choose roofing materials based on your budget, climate, home style, and longevity requirements. Your contractor will provide samples and recommendations.</p>
      
      <h2>Step 3: Permit Acquisition</h2>
      <p>Most localities require building permits for roof replacement. Your contractor should handle this process.</p>
      
      <h2>Step 4: Old Roof Removal</h2>
      <p>The existing roofing materials are carefully removed and disposed of. This phase is messy but necessary for proper installation.</p>
      
      <h2>Step 5: Deck Inspection and Repair</h2>
      <p>Once the old roof is removed, the roof deck is inspected for damage. Any rotted or damaged sections are replaced.</p>
      
      <h2>Step 6: Installation</h2>
      <p>Underlayment, drip edge, flashing, and roofing materials are installed according to manufacturer specifications and building codes.</p>
      
      <h2>Step 7: Cleanup and Final Inspection</h2>
      <p>The site is thoroughly cleaned, and a final inspection ensures quality workmanship and compliance with codes.</p>
      
      <h2>Timeline</h2>
      <p>Most residential roof installations take 1-3 days, depending on size, complexity, and weather conditions.</p>
    `,
    image: '/images/blog/installation-guide.jpg',
    date: '2024-12-20',
    category: 'Guides',
    readTime: '10 min read',
    author: 'UpRoof Team'
  },
  {
    id: 6,
    title: 'Flat Roof vs Pitched Roof: Pros and Cons',
    excerpt: 'Compare the advantages and disadvantages of different roof types to make the right choice.',
    content: `
      <h2>Flat Roof vs Pitched Roof Comparison</h2>
      <p>Choosing between a flat and pitched roof affects your home's aesthetics, functionality, and maintenance requirements.</p>
      
      <h2>Flat Roofs</h2>
      <h3>Advantages:</h3>
      <ul>
        <li>Lower installation costs</li>
        <li>Easier and safer to access</li>
        <li>Can be used as additional outdoor space</li>
        <li>Ideal for solar panel installation</li>
        <li>Modern, minimalist aesthetic</li>
      </ul>
      
      <h3>Disadvantages:</h3>
      <ul>
        <li>Requires more frequent maintenance</li>
        <li>Drainage can be problematic</li>
        <li>Shorter lifespan than pitched roofs</li>
        <li>Not suitable for heavy snow areas</li>
      </ul>
      
      <h2>Pitched Roofs</h2>
      <h3>Advantages:</h3>
      <ul>
        <li>Superior water drainage</li>
        <li>Longer lifespan (40-70 years)</li>
        <li>Better insulation and ventilation</li>
        <li>More architectural variety</li>
        <li>Handles snow and rain better</li>
      </ul>
      
      <h3>Disadvantages:</h3>
      <ul>
        <li>Higher installation costs</li>
        <li>Difficult and dangerous to access</li>
        <li>Takes up more interior space</li>
        <li>Complex repairs</li>
      </ul>
      
      <h2>Making Your Choice</h2>
      <p>Consider your climate, budget, architectural style, and long-term plans when choosing between flat and pitched roofing.</p>
    `,
    image: '/images/blog/roof-types.jpg',
    date: '2024-12-15',
    category: 'Comparison',
    readTime: '5 min read',
    author: 'UpRoof Team'
  }
];

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
            dangerouslySetInnerHTML={{__html: post.content}}
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
