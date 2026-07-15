#!/usr/bin/env node
// One-time authoring tool: renders /blog/<slug>.html for every post in
// blog-data/*.mjs from a shared template, then rewrites blog/index.html's
// grid and the site's sitemap.xml to match. Output is plain static HTML, // this script does not run in the browser and the site has no client-side
// blog engine.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { general } from '../blog-data/general.mjs';
import { industries } from '../blog-data/industries.mjs';
import { faq } from '../blog-data/faq.mjs';
import { cities } from '../blog-data/cities.mjs';
import { services } from '../page-data/services.mjs';
import { locations } from '../page-data/locations.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SITE_URL = 'https://proffitmarketing.com';

const GROUPS = [
  { key: 'guides', label: 'Website & Marketing Guides', data: general },
  { key: 'industry', label: 'Industry-Specific Guides', data: industries },
  { key: 'faq', label: 'Common Questions', data: faq },
  { key: 'local', label: 'Local SEO by City', data: cities },
];

const posts = GROUPS.flatMap((g) => g.data.map((p) => ({ ...p, group: g.key })));

const bySlug = new Map(posts.map((p) => [p.slug, p]));

// One consistent brand gradient for every card/hero thumbnail, reusing the
// exact navy-to-blue gradient already used for the homepage's pricing card
// and contact section, so blog cards read as part of the same site rather
// than each category getting its own color.
const CARD_GRADIENT = 'linear-gradient(135deg, #102352, #1d4ed8 55%, #3b6ef5)';

function gradientFor() {
  return CARD_GRADIENT;
}

const serviceBySlug = new Map(services.map((s) => [s.slug, s]));
const locationBySlug = new Map(locations.map((l) => [l.slug, l]));

// Maps each blog post to the 1-2 commercial service pages most relevant to
// it, so every post links to a page that actually sells something instead
// of ending at another free article.
const CITY_TO_LOCATION = {
  'local-seo-jacksonville-fl': 'jacksonville',
  'local-seo-jacksonville-beach-fl': 'jacksonville-beach',
  'local-seo-ponte-vedra-fl': 'ponte-vedra-beach',
  'local-seo-orange-park-fl': 'orange-park',
  'local-seo-st-augustine-fl': 'st-augustine',
  'local-seo-atlantic-beach-fl': 'atlantic-beach',
  'local-seo-fernandina-beach-fl': 'fernandina-beach',
  'local-seo-neptune-beach-fl': 'neptune-beach',
  'local-seo-middleburg-fl': 'middleburg',
  'local-seo-yulee-fl': 'yulee',
};

const GUIDE_SERVICE_MAP = {
  'small-business-website-design-guide': ['small-business-web-design', 'custom-website-design'],
  'local-seo-guide-for-small-businesses': ['local-seo-services'],
  'google-business-profile-optimization-guide': ['google-business-profile-management'],
  'why-website-speed-matters': ['website-speed-optimization'],
  'website-maintenance-checklist': ['website-maintenance-plans', 'website-security-backups'],
  'signs-its-time-for-a-website-redesign': ['website-redesign-services'],
  'how-much-does-a-website-cost': ['custom-website-design', 'website-care-plan'],
  'seo-basics-for-small-business-owners': ['local-seo-services'],
  'website-conversion-optimization-tips': ['conversion-rate-optimization'],
  'digital-marketing-strategy-for-local-business': ['conversion-rate-optimization', 'google-analytics-setup'],
};

const FAQ_SERVICE_MAP = {
  'do-i-really-need-a-website-in-2026': ['custom-website-design'],
  'how-long-does-it-take-to-build-a-website': ['custom-website-design'],
  'website-vs-social-media-page': ['custom-website-design'],
  'how-many-pages-should-my-website-have': ['custom-website-design'],
  'diy-website-builder-vs-professional': ['website-migration', 'custom-website-design'],
  'what-makes-a-website-trustworthy': ['website-copywriting', 'logo-and-branding'],
  'how-often-should-i-update-my-website': ['website-maintenance-plans'],
  'what-is-a-sitemap-and-why-it-matters': ['local-seo-services'],
  'website-roi-for-small-business': ['google-analytics-setup'],
  'website-launch-checklist': ['website-migration'],
};

function servicesForPost(post) {
  if (post.group === 'guides') return (GUIDE_SERVICE_MAP[post.slug] || ['custom-website-design']).map((s) => serviceBySlug.get(s)).filter(Boolean);
  if (post.group === 'faq') return (FAQ_SERVICE_MAP[post.slug] || ['custom-website-design']).map((s) => serviceBySlug.get(s)).filter(Boolean);
  if (post.group === 'industry') return ['custom-website-design', 'local-seo-services'].map((s) => serviceBySlug.get(s)).filter(Boolean);
  if (post.group === 'local') return ['local-seo-services', 'google-business-profile-management'].map((s) => serviceBySlug.get(s)).filter(Boolean);
  return [];
}

function locationForPost(post) {
  const slug = CITY_TO_LOCATION[post.slug];
  return slug ? locationBySlug.get(slug) : null;
}

function renderServiceLinks(post) {
  const svcs = servicesForPost(post);
  const loc = locationForPost(post);
  if (!svcs.length && !loc) return '';
  const items = [
    ...(loc ? [{ href: `/locations/${loc.slug}.html`, label: `Website Design in ${loc.city}, FL` }] : []),
    ...svcs.map((s) => ({ href: `/services/${s.slug}.html`, label: s.title })),
  ];
  return `
<div style="max-width:820px;margin:0 auto;padding:0 24px clamp(40px,5vw,56px)">
  <div style="background:#fafbfc;border:1px solid #eef0f4;border-radius:16px;padding:22px 24px">
    <div style="font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9aa1ad;margin-bottom:12px">Related services</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px">
${items.map((it) => `      <a href="${it.href}" style="display:inline-flex;align-items:center;gap:6px;background:#eef4ff;color:#2563eb;font-size:.88rem;font-weight:600;padding:9px 16px;border-radius:100px">${esc(it.label)}</a>`).join('\n')}
    </div>
  </div>
</div>`;
}

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slugTitle(slug) {
  const p = bySlug.get(slug);
  return p ? p.title : slug;
}

function wordCount(post) {
  const text = post.sections.map((s) => (s.body || []).join(' ')).join(' ') + ' ' + post.intro.join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

function readingTime(post) {
  return Math.max(4, Math.round(wordCount(post) / 200));
}

function renderParas(paras) {
  return paras
    .map((p) => {
      if (p.startsWith('- ')) {
        const items = p
          .split('\n')
          .map((l) => l.replace(/^- /, '').trim())
          .filter(Boolean)
          .map((l) => `<li>${l}</li>`)
          .join('\n        ');
        return `<ul>\n        ${items}\n      </ul>`;
      }
      if (p.startsWith('> ')) {
        return `<blockquote>${p.slice(2)}</blockquote>`;
      }
      return `<p>${p}</p>`;
    })
    .join('\n      ');
}

function renderSections(post) {
  return post.sections
    .map(
      (s) => `
      <h2 id="${s.id}">${esc(s.title)}</h2>
      ${renderParas(s.body)}${
        s.sub
          ? s.sub
              .map(
                (sub) => `
      <h3 id="${sub.id}">${esc(sub.title)}</h3>
      ${renderParas(sub.body)}`
              )
              .join('')
          : ''
      }`
    )
    .join('\n');
}

function renderToc(post) {
  const rows = [];
  rows.push(`<a href="#introduction">Introduction</a>`);
  post.sections.forEach((s) => {
    rows.push(`<a href="#${s.id}">${esc(s.title)}</a>`);
  });
  rows.push(`<a href="#faq">FAQ</a>`);
  return rows.map((r) => `        ${r}`).join('\n');
}

function renderFaqJsonLd(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });
}

function renderFaqHtml(post) {
  return post.faq
    .map(
      (f, i) => `
      <div data-faq="" style="border:1px solid #eaecf1;border-radius:16px;overflow:hidden;background:#fff;transition:border-color .2s ease,box-shadow .2s ease" style-hover="border-color:#dde3ee;box-shadow:0 6px 18px rgba(16,24,40,.05)">
        <button data-faq-toggle="" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;background:none;border:none;cursor:pointer;text-align:left;font-family:inherit">
          <span style="font-size:1rem;font-weight:600;color:#0e1116">${esc(f.q)}</span>
          <span data-faq-icon="" style="flex-shrink:0;width:24px;height:24px;border-radius:8px;background:#eef4ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:500;transition:transform .25s ease;transform:rotate(0deg)">+</span>
        </button>
        <div data-faq-body="" style="max-height:0px;overflow:hidden;transition:max-height .3s ease">
          <p style="padding:0 22px 20px;font-size:.95rem;color:#6b7280;line-height:1.7">${f.a}</p>
        </div>
      </div>`
    )
    .join('\n');
}

function renderRelated(post) {
  return post.relatedSlugs
    .map((slug) => {
      const p = bySlug.get(slug);
      if (!p) return '';
      return `
      <a href="/blog/${p.slug}.html" style="display:block;background:#fff;border:1px solid #eaecf1;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 24px 54px rgba(16,24,40,.12);border-color:#dde3ee">
        <div style="height:130px;overflow:hidden;background:${gradientFor(p.category)};display:flex;align-items:center;justify-content:center">
          <span style="font-size:1.6rem;font-weight:800;color:rgba(255,255,255,.85);letter-spacing:-.02em">Proffit<span style="opacity:.7">.</span></span>
        </div>
        <div style="padding:16px 18px 20px">
          <div style="display:inline-block;background:#eef4ff;color:#2563eb;font-size:.7rem;font-weight:700;border-radius:100px;padding:3px 10px;margin-bottom:9px">${esc(p.category)}</div>
          <div style="font-size:1rem;font-weight:700;letter-spacing:-.01em">${esc(p.title)}</div>
        </div>
      </a>`;
    })
    .join('\n');
}

function heroBlock(post) {
  return `<div style="width:100%;aspect-ratio:16/9;background:${gradientFor(post.category)};display:flex;align-items:center;justify-content:center;position:relative">
      <div style="position:absolute;inset:0;background-image:linear-gradient(#ffffff14 1px,transparent 1px),linear-gradient(90deg,#ffffff14 1px,transparent 1px);background-size:32px 32px"></div>
      <span style="position:relative;font-size:clamp(1.6rem,4vw,2.6rem);font-weight:800;color:rgba(255,255,255,.92);letter-spacing:-.02em;text-align:center;padding:0 32px">${esc(post.category)}</span>
    </div>`;
}

function renderPost(post) {
  const rt = readingTime(post);
  const introHtml = renderParas(post.intro);
  const dateDisplay = new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ENQBQ14V19"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ENQBQ14V19');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(post.seoTitle)} | Proffit Marketing Blog</title>
<meta name="description" content="${esc(post.metaDescription)}">
<meta name="author" content="Josiah Proffit">
<link rel="canonical" href="${SITE_URL}/blog/${post.slug}.html">

<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicon-512.png">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">

<meta property="og:type" content="article">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(post.metaDescription)}">
<meta property="og:url" content="${SITE_URL}/blog/${post.slug}.html">
<meta property="og:image" content="${SITE_URL}/assets/images/og-image.png">
<meta property="article:published_time" content="${post.date}">
<meta property="article:author" content="Josiah Proffit">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(post.metaDescription)}">
<meta name="twitter:image" content="${SITE_URL}/assets/images/og-image.png">

<link rel="stylesheet" href="/assets/css/style.css">

<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.metaDescription,
  image: `${SITE_URL}/assets/images/og-image.png`,
  datePublished: post.date,
  dateModified: post.date,
  author: { '@type': 'Person', name: 'Josiah Proffit' },
  publisher: { '@type': 'Organization', name: 'Proffit Marketing' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}.html` },
})}
</script>
<script type="application/ld+json">
${renderFaqJsonLd(post)}
</script>
</head>
<body>
<div style="overflow-x:hidden">

<nav id="nav" style="position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid #eef0f4;transition:padding .25s ease,box-shadow .25s ease">
  <div style="max-width:1200px;margin:0 auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px">
    <a href="/" style="font-size:1.35rem;font-weight:800;letter-spacing:-.03em;color:#0e1116">Proffit<span style="color:#2563eb">.</span></a>
    <div data-nav-links="" style="display:flex;gap:36px;align-items:center">
      <a href="/#services" style="font-size:.92rem;font-weight:500;color:#3d4452">Services</a>
      <a href="/#work" style="font-size:.92rem;font-weight:500;color:#3d4452">Our Work</a>
      <a href="/#pricing" style="font-size:.92rem;font-weight:500;color:#3d4452">Pricing</a>
      <a href="/#faq" style="font-size:.92rem;font-weight:500;color:#3d4452">FAQ</a>
      <a href="/blog/" style="font-size:.92rem;font-weight:600;color:#2563eb">Blog</a>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <a href="/#contact" style="display:inline-flex;align-items:center;gap:7px;background:#2563eb;color:#fff;font-size:.9rem;font-weight:600;padding:11px 20px;border-radius:12px;box-shadow:0 6px 18px rgba(37,99,235,.28);transition:transform .2s ease,box-shadow .2s ease" style-hover="transform:translateY(-2px);box-shadow:0 10px 26px rgba(37,99,235,.36)">Get a Free Quote</a>
      <button id="menu-toggle" data-menu="" aria-label="Menu" style="display:none;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid #e3e6ec;background:#fff;border-radius:11px;cursor:pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e1116" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
      </button>
    </div>
  </div>
  <div id="mobile-menu" style="display:none;border-top:1px solid #eef0f4;padding:10px 24px 18px;flex-direction:column;gap:4px;background:#fff">
    <a href="/#services" style="padding:10px 4px;font-weight:500;color:#3d4452">Services</a>
    <a href="/#work" style="padding:10px 4px;font-weight:500;color:#3d4452">Our Work</a>
    <a href="/#pricing" style="padding:10px 4px;font-weight:500;color:#3d4452">Pricing</a>
    <a href="/#faq" style="padding:10px 4px;font-weight:500;color:#3d4452">FAQ</a>
    <a href="/blog/" style="padding:10px 4px;font-weight:600;color:#2563eb">Blog</a>
  </div>
</nav>

<article>

<header style="padding:clamp(40px,6vw,64px) 0 0">
  <div style="max-width:820px;margin:0 auto;padding:0 24px">
    <a href="/blog/" style="display:inline-flex;align-items:center;gap:6px;font-size:.88rem;font-weight:600;color:#2563eb;margin-bottom:22px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>Back to Blog</a>
    <div style="display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;background:#eef4ff;padding:6px 12px;border-radius:100px;margin-bottom:18px">${esc(post.category)}</div>
    <h1 style="font-size:clamp(2rem,4.6vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.1">${esc(post.title)}</h1>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-top:22px;font-size:.9rem;color:#6b7280;font-weight:500">
      <div style="display:flex;align-items:center;gap:9px">
        <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#5b8bf5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem">J</div>
        <span style="color:#0e1116;font-weight:600">Josiah Proffit</span>
      </div>
      <span style="width:3px;height:3px;border-radius:50%;background:#c7cbd4"></span>
      <time datetime="${post.date}">${dateDisplay}</time>
      <span style="width:3px;height:3px;border-radius:50%;background:#c7cbd4"></span>
      <span>${rt} min read</span>
    </div>
  </div>
</header>

<div style="max-width:1040px;margin:32px auto 0;padding:0 24px">
  <div style="border-radius:22px;overflow:hidden;box-shadow:0 20px 50px rgba(16,24,40,.12)">
    ${heroBlock(post)}
  </div>
</div>

<div style="max-width:1040px;margin:0 auto;padding:clamp(48px,6vw,72px) 24px">
  <div data-split="" style="display:grid;grid-template-columns:220px 1fr;gap:56px;align-items:start">

    <nav data-toc="" aria-label="Table of contents" style="position:sticky;top:96px;background:#fafbfc;border:1px solid #eef0f4;border-radius:16px;padding:20px">
      <div style="font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9aa1ad;margin-bottom:14px">On this page</div>
      <div style="display:grid;gap:10px">
${renderToc(post)}
      </div>
    </nav>

    <div class="article-content">
      <h2 id="introduction">Introduction</h2>
      ${introHtml}
${renderSections(post)}

      <h2 id="faq">Frequently Asked Questions</h2>
    </div>
  </div>
</div>

<div style="max-width:820px;margin:0 auto;padding:0 24px clamp(40px,5vw,56px)">
  <div style="display:grid;gap:12px">
${renderFaqHtml(post)}
  </div>
</div>
${renderServiceLinks(post)}

<div style="max-width:820px;margin:0 auto;padding:0 24px clamp(56px,7vw,80px)">
  <div style="position:relative;background:linear-gradient(155deg,#0f1b3d,#142a63 55%,#1d4ed8);border-radius:24px;padding:clamp(28px,4vw,40px);overflow:hidden;box-shadow:0 24px 54px rgba(16,30,80,.28);text-align:center">
    <div style="position:absolute;top:-90px;right:-70px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(91,139,245,.4),transparent 65%)"></div>
    <div style="position:relative">
      <h3 style="font-size:1.5rem;font-weight:800;letter-spacing:-.02em;color:#fff">Ready for a website that actually works for your business?</h3>
      <p style="font-size:1rem;color:rgba(255,255,255,.78);line-height:1.6;margin-top:10px;max-width:480px;margin-left:auto;margin-right:auto">Proffit Marketing builds fast, custom websites for local businesses in Jacksonville and across Northeast Florida, plans starting at $399, from $97/month to keep it perfect.</p>
      <a href="/#contact" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#1d4ed8;font-size:1rem;font-weight:700;padding:14px 26px;border-radius:13px;margin-top:22px;transition:transform .2s ease,box-shadow .2s ease;box-shadow:0 10px 24px rgba(0,0,0,.16)" style-hover="transform:translateY(-2px);box-shadow:0 16px 34px rgba(0,0,0,.26)">Get a Free Quote</a>
    </div>
  </div>
</div>

<div style="max-width:820px;margin:0 auto;padding:0 24px clamp(56px,7vw,80px)">
  <div style="display:flex;align-items:center;gap:16px;background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:24px">
    <div style="width:56px;height:56px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,#2563eb,#5b8bf5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.2rem">J</div>
    <div>
      <div style="font-weight:700;font-size:1rem">Josiah Proffit</div>
      <p style="font-size:.9rem;color:#6b7280;line-height:1.6;margin-top:4px">Founder of Proffit Marketing, building fast, custom websites for local businesses across Northeast Florida. Writes about web design, SEO, and practical marketing for owners who'd rather run their business than manage a website.</p>
    </div>
  </div>
</div>

</article>

<section style="padding:0 0 clamp(72px,9vw,116px);background:#fafbfc;border-top:1px solid #f0f1f5">
  <div style="max-width:1200px;margin:0 auto;padding:clamp(56px,7vw,80px) 24px 0">
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:28px">Related articles</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:22px">
${renderRelated(post)}
    </div>
  </div>
</section>

<footer style="background:#0b0f17;color:#fff;padding:clamp(56px,7vw,80px) 0 36px">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-foot-grid="" style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:56px">
      <div>
        <div style="font-size:1.4rem;font-weight:800;letter-spacing:-.03em;margin-bottom:14px">Proffit<span style="color:#5b8bf5">.</span></div>
        <p style="font-size:.95rem;color:rgba(255,255,255,.55);line-height:1.7;max-width:320px">Custom websites for local businesses in Jacksonville and across Northeast Florida. Built fast, priced fair, cared for always.</p>
      </div>
      <div>
        <div style="font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px">Explore</div>
        <div style="display:grid;gap:11px">
          <a href="/#services" style="font-size:.93rem;color:rgba(255,255,255,.7)">Services</a>
          <a href="/#work" style="font-size:.93rem;color:rgba(255,255,255,.7)">Our Work</a>
          <a href="/#pricing" style="font-size:.93rem;color:rgba(255,255,255,.7)">Pricing</a>
          <a href="/#faq" style="font-size:.93rem;color:rgba(255,255,255,.7)">FAQ</a>
          <a href="/blog/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Blog</a>
          <a href="/services/" style="font-size:.93rem;color:rgba(255,255,255,.7)">All Service Pages</a>
          <a href="/locations/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Service Areas</a>
        </div>
      </div>
      <div>
        <div style="font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px">Get in touch</div>
        <div style="display:grid;gap:11px">
          <a href="/#contact" style="font-size:.93rem;color:rgba(255,255,255,.7)">Get a free quote</a>
          <a href="tel:+19043974279" style="font-size:.93rem;color:rgba(255,255,255,.7)">(904) 397-4279</a>
          <div style="font-size:.93rem;color:rgba(255,255,255,.7)">josiahproffit@gmail.com</div>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;margin-top:48px;padding-top:28px;border-top:1px solid rgba(255,255,255,.1)">
      <div style="font-size:.84rem;color:rgba(255,255,255,.45)">© 2026 Proffit Marketing. All rights reserved.</div>
      <div style="font-size:.84rem;color:rgba(255,255,255,.45)">Jacksonville, Florida 🌴</div>
    </div>
  </div>
</footer>

</div>
<a href="https://www.facebook.com/profile.php?id=61591239463259&amp;mibextid=wwXIfr&amp;mibextid=wwXIfr" target="_blank" rel="noopener" aria-label="Visit our Facebook page" style="position:fixed;bottom:92px;right:24px;z-index:60;width:56px;height:56px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(24,119,242,.4);transition:transform .2s ease,box-shadow .2s ease" style-hover="transform:translateY(-3px) scale(1.06);box-shadow:0 16px 34px rgba(24,119,242,.5)">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M22 12.06C22 6.53 17.52 2.04 12 2.04S2 6.53 2 12.06c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.89h-2.34v6.99C18.34 21.19 22 17.05 22 12.06z"></path></svg>
</a>
<script src="/assets/js/site.js"></script>
<script src="/assets/js/chatbot.js" defer></script>
</body>
</html>
`;
}

function renderIndexCard(post) {
  const rt = readingTime(post);
  const dateDisplay = new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return `      <a href="/blog/${post.slug}.html" data-reveal="" data-group="${post.group}" data-category="${esc(post.category)}" style="display:block;background:#fff;border:1px solid #eaecf1;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 24px 54px rgba(16,24,40,.12);border-color:#dde3ee">
        <div style="height:170px;overflow:hidden;background:${gradientFor(post.category)};display:flex;align-items:center;justify-content:center;position:relative">
          <div style="position:absolute;inset:0;background-image:linear-gradient(#ffffff14 1px,transparent 1px),linear-gradient(90deg,#ffffff14 1px,transparent 1px);background-size:28px 28px"></div>
          <span style="position:relative;font-size:1.05rem;font-weight:800;color:rgba(255,255,255,.92);letter-spacing:-.01em;text-align:center;padding:0 20px">${esc(post.category)}</span>
        </div>
        <div style="padding:18px 20px 22px">
          <div style="display:inline-block;background:#eef4ff;color:#2563eb;font-size:.7rem;font-weight:700;border-radius:100px;padding:3px 10px;margin-bottom:10px">${esc(post.category)}</div>
          <div style="font-size:1.05rem;font-weight:700;letter-spacing:-.01em;line-height:1.3">${esc(post.title)}</div>
          <div style="font-size:.86rem;color:#6b7280;margin-top:8px;line-height:1.5">${esc(post.excerpt)}</div>
          <div style="font-size:.8rem;color:#9aa1ad;margin-top:12px">${dateDisplay} · ${rt} min read</div>
        </div>
      </a>`;
}

function buildFilterPills() {
  const allBtn = `      <button type="button" data-filter="all" style="flex-shrink:0;background:#0e1116;color:#fff;font-size:.86rem;font-weight:600;padding:9px 18px;border:none;border-radius:100px;cursor:pointer;font-family:inherit;white-space:nowrap">All Articles</button>`;
  const groupBtns = GROUPS.map(
    (g) =>
      `      <button type="button" data-filter="${g.key}" style="flex-shrink:0;background:#fff;color:#3d4452;font-size:.86rem;font-weight:600;padding:9px 18px;border:1px solid #e4e7ee;border-radius:100px;cursor:pointer;font-family:inherit;white-space:nowrap">${esc(g.label)}</button>`
  ).join('\n');
  return `${allBtn}\n${groupBtns}`;
}

function buildIndustrySubfilter() {
  const industryCategories = [...new Set(industries.map((p) => p.category))];
  const allBtn = `        <button type="button" data-subfilter="all" style="flex-shrink:0;background:#eef4ff;color:#2563eb;font-size:.8rem;font-weight:600;padding:6px 14px;border:none;border-radius:100px;cursor:pointer;font-family:inherit;white-space:nowrap">All Trades</button>`;
  const catBtns = industryCategories
    .map(
      (cat) =>
        `        <button type="button" data-subfilter="${esc(cat)}" style="flex-shrink:0;background:#f5f6f8;color:#3d4452;font-size:.8rem;font-weight:600;padding:6px 14px;border:none;border-radius:100px;cursor:pointer;font-family:inherit;white-space:nowrap">${esc(cat)}</button>`
    )
    .join('\n');
  return `${allBtn}\n${catBtns}`;
}

function buildGroupSection(group) {
  const groupPosts = posts
    .filter((p) => p.group === group.key)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const cards = groupPosts.map(renderIndexCard).join('\n');
  const subfilter =
    group.key === 'industry'
      ? `      <div data-subfilter-row="" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px">
${buildIndustrySubfilter()}
      </div>\n`
      : '';
  return `    <div data-blog-group="${group.key}" style="margin-bottom:56px">
      <h2 style="font-size:1.4rem;font-weight:800;letter-spacing:-.02em;margin-bottom:18px">${esc(group.label)}</h2>
${subfilter}      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
${cards}
      </div>
    </div>`;
}

function buildIndexHtml() {
  const sections = GROUPS.map(buildGroupSection).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ENQBQ14V19"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ENQBQ14V19');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Marketing Blog | Proffit Marketing</title>
<meta name="description" content="Articles on websites, SEO, Google Business Profile optimization, AI, digital marketing, and growing a local business, from the Proffit Marketing team in Jacksonville, FL.">
<meta name="author" content="Josiah Proffit">
<link rel="canonical" href="${SITE_URL}/blog/">

<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicon-512.png">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">

<meta property="og:type" content="website">
<meta property="og:title" content="Marketing Blog | Proffit Marketing">
<meta property="og:description" content="Articles on websites, SEO, Google Business Profile optimization, AI, digital marketing, and growing a local business, from the Proffit Marketing team in Jacksonville, FL.">
<meta property="og:url" content="${SITE_URL}/blog/">
<meta property="og:image" content="${SITE_URL}/assets/images/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Marketing Blog | Proffit Marketing">
<meta name="twitter:description" content="Articles on websites, SEO, Google Business Profile optimization, AI, digital marketing, and growing a local business, from the Proffit Marketing team in Jacksonville, FL.">
<meta name="twitter:image" content="${SITE_URL}/assets/images/og-image.png">

<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<div style="overflow-x:hidden">

<nav id="nav" style="position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid #eef0f4;transition:padding .25s ease,box-shadow .25s ease">
  <div style="max-width:1200px;margin:0 auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px">
    <a href="/" style="font-size:1.35rem;font-weight:800;letter-spacing:-.03em;color:#0e1116">Proffit<span style="color:#2563eb">.</span></a>
    <div data-nav-links="" style="display:flex;gap:36px;align-items:center">
      <a href="/#services" style="font-size:.92rem;font-weight:500;color:#3d4452">Services</a>
      <a href="/#work" style="font-size:.92rem;font-weight:500;color:#3d4452">Our Work</a>
      <a href="/#pricing" style="font-size:.92rem;font-weight:500;color:#3d4452">Pricing</a>
      <a href="/#faq" style="font-size:.92rem;font-weight:500;color:#3d4452">FAQ</a>
      <a href="/blog/" style="font-size:.92rem;font-weight:600;color:#2563eb">Blog</a>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <a href="/#contact" style="display:inline-flex;align-items:center;gap:7px;background:#2563eb;color:#fff;font-size:.9rem;font-weight:600;padding:11px 20px;border-radius:12px;box-shadow:0 6px 18px rgba(37,99,235,.28);transition:transform .2s ease,box-shadow .2s ease" style-hover="transform:translateY(-2px);box-shadow:0 10px 26px rgba(37,99,235,.36)">Get a Free Quote</a>
      <button id="menu-toggle" data-menu="" aria-label="Menu" style="display:none;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid #e3e6ec;background:#fff;border-radius:11px;cursor:pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e1116" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
      </button>
    </div>
  </div>
  <div id="mobile-menu" style="display:none;border-top:1px solid #eef0f4;padding:10px 24px 18px;flex-direction:column;gap:4px;background:#fff">
    <a href="/#services" style="padding:10px 4px;font-weight:500;color:#3d4452">Services</a>
    <a href="/#work" style="padding:10px 4px;font-weight:500;color:#3d4452">Our Work</a>
    <a href="/#pricing" style="padding:10px 4px;font-weight:500;color:#3d4452">Pricing</a>
    <a href="/#faq" style="padding:10px 4px;font-weight:500;color:#3d4452">FAQ</a>
    <a href="/blog/" style="padding:10px 4px;font-weight:600;color:#2563eb">Blog</a>
  </div>
</nav>

<header style="position:relative;padding:clamp(56px,8vw,104px) 0 clamp(48px,6vw,72px)">
  <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0">
    <div style="position:absolute;top:-180px;right:-120px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.16),transparent 65%);filter:blur(20px)"></div>
    <div style="position:absolute;top:120px;left:-160px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.12),transparent 65%);filter:blur(20px)"></div>
    <div style="position:absolute;inset:0;background-image:linear-gradient(#0e111608 1px,transparent 1px),linear-gradient(90deg,#0e111608 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(ellipse 80% 60% at 50% 25%,#000,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 25%,#000,transparent 75%)"></div>
  </div>
  <div style="position:relative;z-index:1;max-width:780px;margin:0 auto;padding:0 24px;text-align:center">
    <div data-reveal="" style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #e7eaf0;border-radius:100px;padding:6px 14px;font-size:.78rem;font-weight:600;color:#3d4452;box-shadow:0 2px 8px rgba(16,24,40,.04)">
      <span style="display:inline-flex;align-items:center;gap:5px;background:#eef4ff;color:#2563eb;border-radius:100px;padding:3px 9px">Blog</span>
      Local business marketing, explained
    </div>
    <h1 data-reveal="" style="font-size:clamp(2.4rem,5.2vw,3.6rem);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:22px 0 0">Marketing Blog</h1>
    <p data-reveal="" style="font-size:clamp(1.05rem,1.5vw,1.15rem);color:#5b6472;line-height:1.65;max-width:620px;margin:20px auto 0">Practical articles on websites, SEO, Google Business Profile optimization, AI, digital marketing, and growing a local business, written for owners, not agencies.</p>
  </div>
</header>

<section style="padding:0 0 clamp(72px,9vw,116px)">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-filter-row="" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:44px;position:sticky;top:76px;z-index:10;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);padding:12px 0">
${buildFilterPills()}
    </div>
    <div id="blog-grid">
${sections}
    </div>
  </div>
</section>

<footer style="background:#0b0f17;color:#fff;padding:clamp(56px,7vw,80px) 0 36px">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-foot-grid="" style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:56px">
      <div>
        <div style="font-size:1.4rem;font-weight:800;letter-spacing:-.03em;margin-bottom:14px">Proffit<span style="color:#5b8bf5">.</span></div>
        <p style="font-size:.95rem;color:rgba(255,255,255,.55);line-height:1.7;max-width:320px">Custom websites for local businesses in Jacksonville and across Northeast Florida. Built fast, priced fair, cared for always.</p>
      </div>
      <div>
        <div style="font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px">Explore</div>
        <div style="display:grid;gap:11px">
          <a href="/#services" style="font-size:.93rem;color:rgba(255,255,255,.7)">Services</a>
          <a href="/#work" style="font-size:.93rem;color:rgba(255,255,255,.7)">Our Work</a>
          <a href="/#pricing" style="font-size:.93rem;color:rgba(255,255,255,.7)">Pricing</a>
          <a href="/#faq" style="font-size:.93rem;color:rgba(255,255,255,.7)">FAQ</a>
          <a href="/blog/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Blog</a>
          <a href="/services/" style="font-size:.93rem;color:rgba(255,255,255,.7)">All Service Pages</a>
          <a href="/locations/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Service Areas</a>
        </div>
      </div>
      <div>
        <div style="font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px">Get in touch</div>
        <div style="display:grid;gap:11px">
          <a href="/#contact" style="font-size:.93rem;color:rgba(255,255,255,.7)">Get a free quote</a>
          <a href="tel:+19043974279" style="font-size:.93rem;color:rgba(255,255,255,.7)">(904) 397-4279</a>
          <div style="font-size:.93rem;color:rgba(255,255,255,.7)">josiahproffit@gmail.com</div>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;margin-top:48px;padding-top:28px;border-top:1px solid rgba(255,255,255,.1)">
      <div style="font-size:.84rem;color:rgba(255,255,255,.45)">© 2026 Proffit Marketing. All rights reserved.</div>
      <div style="font-size:.84rem;color:rgba(255,255,255,.45)">Jacksonville, Florida 🌴</div>
    </div>
  </div>
</footer>

</div>
<a href="https://www.facebook.com/profile.php?id=61591239463259&amp;mibextid=wwXIfr&amp;mibextid=wwXIfr" target="_blank" rel="noopener" aria-label="Visit our Facebook page" style="position:fixed;bottom:92px;right:24px;z-index:60;width:56px;height:56px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(24,119,242,.4);transition:transform .2s ease,box-shadow .2s ease" style-hover="transform:translateY(-3px) scale(1.06);box-shadow:0 16px 34px rgba(24,119,242,.5)">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M22 12.06C22 6.53 17.52 2.04 12 2.04S2 6.53 2 12.06c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.89h-2.34v6.99C18.34 21.19 22 17.05 22 12.06z"></path></svg>
</a>
<script src="/assets/js/site.js"></script>
<script src="/assets/js/chatbot.js" defer></script>
</body>
</html>
`;
}

// sitemap.xml is generated by scripts/build-pages.mjs, which also covers
// /services/ and /locations/, run that script after this one if both
// blog and page content changed.

// --- run ---
mkdirSync(path.join(ROOT, 'blog'), { recursive: true });

let count = 0;
for (const post of posts) {
  const html = renderPost(post);
  writeFileSync(path.join(ROOT, 'blog', `${post.slug}.html`), html);
  count++;
}

writeFileSync(path.join(ROOT, 'blog', 'index.html'), buildIndexHtml());

console.log(`Built ${count} posts + blog/index.html`);
console.log('Run scripts/build-pages.mjs afterward to refresh sitemap.xml');
