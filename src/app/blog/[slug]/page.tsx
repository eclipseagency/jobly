import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPost } from '@/lib/blog-data';
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      url: `https://www.jobly.ph/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://www.jobly.ph/blog/${post.slug}`,
    },
  };
}

function parseMarkdown(content: string): string {
  // Simple markdown parser for basic formatting
  return content
    .split('\n')
    .map(line => {
      // Headers
      if (line.startsWith('## ')) {
        return `<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">${line.slice(3)}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3 class="text-xl font-semibold text-slate-900 mt-6 mb-3">${line.slice(4)}</h3>`;
      }
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Lists
      if (line.startsWith('- ')) {
        return `<li class="ml-4 text-slate-700">${line.slice(2)}</li>`;
      }
      if (line.match(/^\d+\. /)) {
        return `<li class="ml-4 text-slate-700">${line.replace(/^\d+\. /, '')}</li>`;
      }
      // Blockquotes
      if (line.startsWith('> ')) {
        return `<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-slate-50 italic text-slate-700">${line.slice(2)}</blockquote>`;
      }
      // Tables (simplified)
      if (line.startsWith('|')) {
        return ''; // Skip table formatting for now
      }
      // Empty lines
      if (line.trim() === '') {
        return '<br/>';
      }
      // Regular paragraphs
      return `<p class="text-slate-700 leading-relaxed mb-4">${line}</p>`;
    })
    .join('\n');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter(p => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  const breadcrumbs = [
    { name: 'Home', url: 'https://www.jobly.ph' },
    { name: 'Blog', url: 'https://www.jobly.ph/blog' },
    { name: post.title, url: `https://www.jobly.ph/blog/${post.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        title={post.title}
        description={post.description}
        author={post.author}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        url={`https://www.jobly.ph/blog/${post.slug}`}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-white">
        {/* Header - Same as Homepage */}
        <Header currentPage="blog" />

        {/* Breadcrumbs */}
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li><Link href="/" className="hover:text-primary-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-primary-600">Blog</Link></li>
            <li>/</li>
            <li className="text-slate-900 truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="py-8 border-b border-slate-200">
            <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-slate-600 mb-6">
              {post.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{post.author}</p>
                  <p className="text-slate-500">{post.authorRole}</p>
                </div>
              </div>
              <span>•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>
          </header>

          {/* Article Content */}
          <div
            className="py-8 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
          />

          {/* Tags */}
          <div className="py-8 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="py-8 my-8 bg-gradient-to-r from-primary-600 to-cyan-600 rounded-xl text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Find Your Dream Job?</h3>
            <p className="text-white/90 mb-6">Browse thousands of job opportunities in the Philippines</p>
            <Link
              href="/jobs"
              className="inline-block px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="py-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <article key={relatedPost.slug} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded mb-3">
                      {relatedPost.category}
                    </span>
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                      <Link href={`/blog/${relatedPost.slug}`} className="hover:text-primary-600">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{relatedPost.description}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Footer - Same as Homepage */}
        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </>
  );
}
