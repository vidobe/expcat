#!/usr/bin/env node
/**
 * Blog Post Migration Script
 * Extracts content from Epson blog posts and converts to AEM Edge Delivery markdown
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Blog post URLs to migrate
const BLOG_URLS = [
  'https://blog.epson.com/enterprise/manage-your-hospital-not-your-printer/',
  'https://blog.epson.com/small-business/are-you-making-one-of-these-five-common-mistakes-with-your-signage/',
  'https://blog.epson.com/small-business/5-ways-to-turn-social-media-accounts-into-cash-registers/',
  'https://blog.epson.com/small-business/the-future-of-telemedicine-and-the-ehr/',
  'https://blog.epson.com/education/how-university-admins-use-big-data-for-decisionmaking/',
  'https://blog.epson.com/education/college-augmented-reality-tours/',
  'https://blog.epson.com/small-business/5-ways-omnichannel-can-improve-your-retail-business/',
  'https://blog.epson.com/education/why-net-neutrality-matters-on-the-college-campus/',
  'https://blog.epson.com/education/tech-savvy-students-drive-higher-ed-to-teach-in-new-ways/',
  'https://blog.epson.com/education/augmented-reality-101-real-world-experiences-from-the-classroom/',
  'https://blog.epson.com/enterprise/faster-fabric-through-smart-printing/',
  'https://blog.epson.com/small-business/5-considerations-before-you-go-mobile-pos/',
  'https://blog.epson.com/education/classroom-game-for-business-innovation/',
  'https://blog.epson.com/small-business/5-ways-digital-records-help-patient-care/',
  'https://blog.epson.com/small-business/digital-document-management/',
  'https://blog.epson.com/education/5-ways-classroom-tech-keeps-students-engaged/',
  'https://blog.epson.com/enterprise/digital-pathology-in-the-new-digital-healthcare/',
  'https://blog.epson.com/education/distracted-students-how-to-balance-tech-with-learning/',
  'https://blog.epson.com/enterprise/build-a-collaborative-business/',
  'https://blog.epson.com/education/3-ways-tech-is-redefining-the-rules-of-the-classroom/',
];

const OUTPUT_DIR = '/workspace/content/blogs';

/**
 * Fetch HTML content from URL
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Extract blog name from URL for filename
 */
function getBlogName(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  // Get the last part (slug)
  return pathParts[pathParts.length - 1] || 'untitled';
}

/**
 * Extract text content between tags
 */
function extractBetween(html, startTag, endTag) {
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return '';
  const contentStart = startIdx + startTag.length;
  const endIdx = html.indexOf(endTag, contentStart);
  if (endIdx === -1) return '';
  return html.substring(contentStart, endIdx);
}

/**
 * Strip HTML tags
 */
function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Convert HTML to simplified markdown
 */
function htmlToMarkdown(html) {
  let md = html;

  // Remove scripts and styles
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Convert headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');

  // Convert paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');

  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Convert bold
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');

  // Convert italic
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  // Convert list items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');

  // Convert images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]*>/g, '');

  // Clean up whitespace
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#8217;/g, "'");
  md = md.replace(/&#8216;/g, "'");
  md = md.replace(/&#8220;/g, '"');
  md = md.replace(/&#8221;/g, '"');
  md = md.replace(/&#8211;/g, '–');
  md = md.replace(/&#8212;/g, '—');
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

/**
 * Parse blog post HTML and extract content
 */
function parseBlogPost(html, url) {
  const result = {
    url,
    title: '',
    category: '',
    author: '',
    date: '',
    featuredImage: '',
    content: '',
    tags: [],
  };

  // Extract title from <h1>
  const h1Match = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    result.title = stripTags(h1Match[1]);
  }

  // Extract category
  const categoryMatch = html.match(/<a[^>]*href="[^"]*\/category\/[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (categoryMatch) {
    result.category = stripTags(categoryMatch[1]);
  }

  // Extract author and date
  const metaMatch = html.match(/Epson\s+(\w+\s+\d+,?\s+\d{4})/i);
  if (metaMatch) {
    result.author = 'Epson';
    result.date = metaMatch[1];
  }

  // Extract featured image
  const imgMatch = html.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]*)"[^>]*>/i)
    || html.match(/<img[^>]*src="([^"]*)"[^>]*class="[^"]*wp-post-image[^"]*"[^>]*>/i);
  if (imgMatch) {
    result.featuredImage = imgMatch[1];
  }

  // Extract main content - look for entry-content or similar
  let contentMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*(?:tags|share|related)/i);
  if (!contentMatch) {
    contentMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  }
  if (contentMatch) {
    result.content = htmlToMarkdown(contentMatch[1]);
  }

  // Extract tags
  const tagMatches = html.matchAll(/<a[^>]*href="[^"]*\/tag\/([^/"]*)\/"[^>]*>([^<]*)<\/a>/gi);
  for (const match of tagMatches) {
    const tag = stripTags(match[2]);
    if (tag && !result.tags.includes(tag)) {
      result.tags.push(tag);
    }
  }

  return result;
}

/**
 * Generate AEM Edge Delivery markdown
 */
function generateMarkdown(post) {
  let md = '';

  // Metadata section
  md += '---\n';
  md += `title: ${post.title}\n`;
  if (post.category) md += `category: ${post.category}\n`;
  if (post.author) md += `author: ${post.author}\n`;
  if (post.date) md += `date: ${post.date}\n`;
  if (post.tags.length > 0) md += `tags: ${post.tags.join(', ')}\n`;
  md += '---\n\n';

  // Title
  md += `# ${post.title}\n\n`;

  // Featured image
  if (post.featuredImage) {
    md += `![${post.title}](${post.featuredImage})\n\n`;
  }

  // Content
  md += post.content;

  return md;
}

/**
 * Migrate a single blog post
 */
async function migrateBlogPost(url) {
  console.log(`Migrating: ${url}`);

  try {
    const html = await fetchUrl(url);
    const post = parseBlogPost(html, url);

    if (!post.title) {
      console.log(`  Warning: Could not extract title from ${url}`);
      return false;
    }

    const markdown = generateMarkdown(post);
    const filename = getBlogName(url) + '.md';
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, markdown);
    console.log(`  Saved: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`  Error migrating ${url}: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Blog Post Migration');
  console.log('===================\n');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Total URLs: ${BLOG_URLS.length}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const url of BLOG_URLS) {
    const result = await migrateBlogPost(url);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n===================');
  console.log(`Migration complete: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
