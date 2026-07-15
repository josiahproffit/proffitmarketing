#!/usr/bin/env node
// Renders /services/<slug>.html + /services/index.html and
// /locations/<slug>.html + /locations/index.html from page-data/*.mjs,
// then rewrites sitemap.xml to include every URL on the site (home, blog
// posts, service pages, location pages). Static HTML output only, no
// client-side router.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { services } from '../page-data/services.mjs';
import { locations } from '../page-data/locations.mjs';
import { general } from '../blog-data/general.mjs';
import { industries } from '../blog-data/industries.mjs';
import { faq } from '../blog-data/faq.mjs';
import { cities } from '../blog-data/cities.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SITE_URL = 'https://proffitmarketing.com';
const CARD_GRADIENT = 'linear-gradient(135deg, #102352, #1d4ed8 55%, #3b6ef5)';

const allPosts = [...general, ...industries, ...faq, ...cities];
const postBySlug = new Map(allPosts.map((p) => [p.slug, p]));
const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function checkIcon() {
  return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><path d="M20 6L9 17l-5-5"></path></svg>`;
}

function navLink(href, label, isActive, mobile) {
  const activeStyle = isActive ? 'font-weight:600;color:#2563eb' : 'font-weight:500;color:#3d4452';
  const base = mobile ? `padding:10px 4px;${activeStyle}` : `font-size:.92rem;${activeStyle}`;
  return `<a href="${href}" style="${base}">${label}</a>`;
}

function navHtml(active = null) {
  const links = [
    ['/services/', 'Services', 'services'],
    ['/our-work/', 'Our Work', 'our-work'],
    ['/pricing/', 'Pricing', 'pricing'],
    ['/faq/', 'FAQ', 'faq'],
    ['/blog/', 'Blog', 'blog'],
  ];
  const desktop = links.map(([href, label, key]) => `      ${navLink(href, label, key === active, false)}`).join('\n');
  const mobile = links.map(([href, label, key]) => `    ${navLink(href, label, key === active, true)}`).join('\n');
  return `<nav id="nav" style="position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid #eef0f4;transition:padding .25s ease,box-shadow .25s ease">
  <div style="max-width:1200px;margin:0 auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px">
    <a href="/" style="font-size:1.35rem;font-weight:800;letter-spacing:-.03em;color:#0e1116">Proffit<span style="color:#2563eb">.</span></a>
    <div data-nav-links="" style="display:flex;gap:36px;align-items:center">
${desktop}
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <a href="/#contact" style="display:inline-flex;align-items:center;gap:7px;background:#2563eb;color:#fff;font-size:.9rem;font-weight:600;padding:11px 20px;border-radius:12px;box-shadow:0 6px 18px rgba(37,99,235,.28);transition:transform .2s ease,box-shadow .2s ease" style-hover="transform:translateY(-2px);box-shadow:0 10px 26px rgba(37,99,235,.36)">Get a Free Quote</a>
      <button id="menu-toggle" data-menu="" aria-label="Menu" style="display:none;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid #e3e6ec;background:#fff;border-radius:11px;cursor:pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e1116" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
      </button>
    </div>
  </div>
  <div id="mobile-menu" style="display:none;border-top:1px solid #eef0f4;padding:10px 24px 18px;flex-direction:column;gap:4px;background:#fff">
${mobile}
  </div>
</nav>`;
}

const FOOTER = `<footer style="background:#0b0f17;color:#fff;padding:clamp(56px,7vw,80px) 0 36px">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-foot-grid="" style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:56px">
      <div>
        <div style="font-size:1.4rem;font-weight:800;letter-spacing:-.03em;margin-bottom:14px">Proffit<span style="color:#5b8bf5">.</span></div>
        <p style="font-size:.95rem;color:rgba(255,255,255,.55);line-height:1.7;max-width:320px">Custom websites for local businesses in Jacksonville and across Northeast Florida. Built fast, priced fair, cared for always.</p>
      </div>
      <div>
        <div style="font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:16px">Explore</div>
        <div style="display:grid;gap:11px">
          <a href="/services/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Services</a>
          <a href="/our-work/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Our Work</a>
          <a href="/pricing/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Pricing</a>
          <a href="/faq/" style="font-size:.93rem;color:rgba(255,255,255,.7)">FAQ</a>
          <a href="/blog/" style="font-size:.93rem;color:rgba(255,255,255,.7)">Blog</a>
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
</footer>`;

const FB_BUBBLE = `<a href="https://www.facebook.com/profile.php?id=61591239463259&amp;mibextid=wwXIfr&amp;mibextid=wwXIfr" target="_blank" rel="noopener" aria-label="Visit our Facebook page" style="position:fixed;bottom:92px;right:24px;z-index:60;width:56px;height:56px;border-radius:50%;background:#1877f2;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(24,119,242,.4);transition:transform .2s ease,box-shadow .2s ease" style-hover="transform:translateY(-3px) scale(1.06);box-shadow:0 16px 34px rgba(24,119,242,.5)">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M22 12.06C22 6.53 17.52 2.04 12 2.04S2 6.53 2 12.06c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54v-2.89h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.89h-2.34v6.99C18.34 21.19 22 17.05 22 12.06z"></path></svg>
</a>`;

// Sections lifted from the old single-page homepage, now shown on the
// dedicated /services/ page (which already listed the 20 detailed service
// cards) so nothing that used to live at /#services is lost.
const SERVICES_INTRO = `<section id="services" style="padding:clamp(72px,9vw,116px) 0;background:#fff">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-reveal="" style="text-align:center;max-width:680px;margin:0 auto 56px">
      <div style="display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;background:#eef4ff;padding:6px 12px;border-radius:100px;margin-bottom:18px">What we do</div>
      <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.08">Everything your website needs, handled.</h2>
      <p style="font-size:1.08rem;color:#6b7280;line-height:1.6;margin-top:16px">Whether you're starting from zero or escaping an overpriced contract, we've got the right fix.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px">
      <div data-reveal="" style="background:#fff;border:1px solid #ebedf2;border-radius:20px;padding:32px 28px;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 22px 50px rgba(16,24,40,.1);border-color:#dde3ee">
        <div style="width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#eaf1ff,#dbe7ff);display:flex;align-items:center;justify-content:center;margin-bottom:22px"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18"></path></svg></div>
        <h3 style="font-size:1.2rem;font-weight:700;letter-spacing:-.01em;margin-bottom:9px">Build from scratch</h3>
        <p style="font-size:.96rem;color:#6b7280;line-height:1.65">No website yet? We'll build a professional one-page site that makes you look established and helps customers find you.</p>
      </div>
      <div data-reveal="" style="background:#fff;border:1px solid #ebedf2;border-radius:20px;padding:32px 28px;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 22px 50px rgba(16,24,40,.1);border-color:#dde3ee">
        <div style="width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#eaf1ff,#dbe7ff);display:flex;align-items:center;justify-content:center;margin-bottom:22px"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"></path></svg></div>
        <h3 style="font-size:1.2rem;font-weight:700;letter-spacing:-.01em;margin-bottom:9px">Redesign &amp; upgrade</h3>
        <p style="font-size:.96rem;color:#6b7280;line-height:1.65">Site stuck in 2012? We'll rebuild it from scratch, modern, fast, and designed to actually turn visitors into customers.</p>
      </div>
      <div data-reveal="" style="background:#fff;border:1px solid #ebedf2;border-radius:20px;padding:32px 28px;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 22px 50px rgba(16,24,40,.1);border-color:#dde3ee">
        <div style="width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#eaf1ff,#dbe7ff);display:flex;align-items:center;justify-content:center;margin-bottom:22px"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
        <h3 style="font-size:1.2rem;font-weight:700;letter-spacing:-.01em;margin-bottom:9px">Switch &amp; save</h3>
        <p style="font-size:.96rem;color:#6b7280;line-height:1.65">Overpaying for an underperforming site? We'll rebuild yours better, for a fraction of the price, with no long-term lock-in.</p>
      </div>
    </div>
  </div>
</section>`;
const WHY_PROFFIT = `<section style="padding:clamp(72px,9vw,116px) 0;background:#fff">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-reveal="" style="text-align:center;max-width:700px;margin:0 auto 56px">
      <div style="display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;background:#eef4ff;padding:6px 12px;border-radius:100px;margin-bottom:18px">Why Proffit</div>
      <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.08">Built like an agency.<br>Priced for Main Street.</h2>
      <p style="font-size:1.08rem;color:#6b7280;line-height:1.6;margin-top:16px">The quality of a $15k website, without the $15k invoice, or the contract.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px">
      <div data-reveal="" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:26px;transition:transform .25s ease,box-shadow .25s ease" style-hover="transform:translateY(-4px);box-shadow:0 16px 38px rgba(16,24,40,.08)">
        <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid #e7eaf0;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"></path></svg></div>
        <h3 style="font-size:1.06rem;font-weight:700;margin-bottom:7px">Custom-built, never templated</h3>
        <p style="font-size:.92rem;color:#6b7280;line-height:1.6">Every site is designed for your business, not dragged out of a cookie-cutter theme.</p>
      </div>
      <div data-reveal="" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:26px;transition:transform .25s ease,box-shadow .25s ease" style-hover="transform:translateY(-4px);box-shadow:0 16px 38px rgba(16,24,40,.08)">
        <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid #e7eaf0;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"></path></svg></div>
        <h3 style="font-size:1.06rem;font-weight:700;margin-bottom:7px">Live in about two weeks</h3>
        <p style="font-size:.92rem;color:#6b7280;line-height:1.6">We handle design, copy, and setup. You review, approve, and go live, fast.</p>
      </div>
      <div data-reveal="" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:26px;transition:transform .25s ease,box-shadow .25s ease" style-hover="transform:translateY(-4px);box-shadow:0 16px 38px rgba(16,24,40,.08)">
        <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid #e7eaf0;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4L13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6z"></path><circle cx="7.5" cy="7.5" r="1.2"></circle></svg></div>
        <h3 style="font-size:1.06rem;font-weight:700;margin-bottom:7px">Flat, honest, fully managed</h3>
        <p style="font-size:.92rem;color:#6b7280;line-height:1.6">Plans from $399 to build, $97/month for hosting, security, and care, fully managed by us. No surprise fees, no developer to hunt down when something breaks.</p>
      </div>
      <div data-reveal="" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:26px;transition:transform .25s ease,box-shadow .25s ease" style-hover="transform:translateY(-4px);box-shadow:0 16px 38px rgba(16,24,40,.08)">
        <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid #e7eaf0;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
        <h3 style="font-size:1.06rem;font-weight:700;margin-bottom:7px">Local &amp; genuinely responsive</h3>
        <p style="font-size:.92rem;color:#6b7280;line-height:1.6">Based in Jacksonville. We answer the phone and reply within 24 hours.</p>
      </div>
      <div data-reveal="" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:26px;transition:transform .25s ease,box-shadow .25s ease" style-hover="transform:translateY(-4px);box-shadow:0 16px 38px rgba(16,24,40,.08)">
        <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid #e7eaf0;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></div>
        <h3 style="font-size:1.06rem;font-weight:700;margin-bottom:7px">Fast, with SEO already included</h3>
        <p style="font-size:.92rem;color:#6b7280;line-height:1.6">Sub-2-second loads plus on-page SEO, work other agencies bill hundreds a month for, built into every plan.</p>
      </div>
      <div data-reveal="" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:18px;padding:26px;transition:transform .25s ease,box-shadow .25s ease" style-hover="transform:translateY(-4px);box-shadow:0 16px 38px rgba(16,24,40,.08)">
        <div style="width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid #e7eaf0;display:flex;align-items:center;justify-content:center;margin-bottom:16px"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"></path></svg></div>
        <h3 style="font-size:1.06rem;font-weight:700;margin-bottom:7px">No contracts, ever</h3>
        <p style="font-size:.92rem;color:#6b7280;line-height:1.6">Month to month. Stay because it works for you, not because you're locked in.</p>
      </div>
    </div>
  </div>
</section>`;
const HOW_IT_WORKS = `<section style="padding:clamp(72px,9vw,116px) 0;background:#fafbfc;border-top:1px solid #f0f1f5;border-bottom:1px solid #f0f1f5">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-reveal="" style="text-align:center;max-width:680px;margin:0 auto 56px">
      <div style="display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;background:#eef4ff;padding:6px 12px;border-radius:100px;margin-bottom:18px">How it works</div>
      <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.08">From idea to live in four steps.</h2>
      <p style="font-size:1.08rem;color:#6b7280;line-height:1.6;margin-top:16px">Simple, transparent, and built around you. Most clients spend less than an hour total.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px">
      <div data-reveal="" style="background:#fff;border:1px solid #eaecf1;border-radius:18px;padding:28px 26px;position:relative">
        <div style="font-size:2.4rem;font-weight:800;letter-spacing:-.04em;color:#dbe4f5;line-height:1">01</div>
        <h3 style="font-size:1.1rem;font-weight:700;margin:10px 0 8px">Discovery call</h3>
        <p style="font-size:.93rem;color:#6b7280;line-height:1.6">A quick chat about your business, your customers, and what you want your site to do.</p>
      </div>
      <div data-reveal="" style="background:#fff;border:1px solid #eaecf1;border-radius:18px;padding:28px 26px;position:relative">
        <div style="font-size:2.4rem;font-weight:800;letter-spacing:-.04em;color:#dbe4f5;line-height:1">02</div>
        <h3 style="font-size:1.1rem;font-weight:700;margin:10px 0 8px">Design &amp; copy</h3>
        <p style="font-size:.93rem;color:#6b7280;line-height:1.6">We design the layout and write the words. You'll see a real preview, not a wireframe.</p>
      </div>
      <div data-reveal="" style="background:#fff;border:1px solid #eaecf1;border-radius:18px;padding:28px 26px;position:relative">
        <div style="font-size:2.4rem;font-weight:800;letter-spacing:-.04em;color:#dbe4f5;line-height:1">03</div>
        <h3 style="font-size:1.1rem;font-weight:700;margin:10px 0 8px">Build &amp; review</h3>
        <p style="font-size:.93rem;color:#6b7280;line-height:1.6">We build it fast, then you review. We refine until it's exactly right.</p>
      </div>
      <div data-reveal="" style="background:#fff;border:1px solid #eaecf1;border-radius:18px;padding:28px 26px;position:relative">
        <div style="font-size:2.4rem;font-weight:800;letter-spacing:-.04em;color:#2563eb;line-height:1">04</div>
        <h3 style="font-size:1.1rem;font-weight:700;margin:10px 0 8px">Launch &amp; care</h3>
        <p style="font-size:.93rem;color:#6b7280;line-height:1.6">You go live, and we keep it secure, fast, and updated every month after.</p>
      </div>
    </div>
  </div>
</section>`;

function headHtml({ seoTitle, metaDescription, canonicalPath, ogType = 'website', jsonLd = [] }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ENQBQ14V19"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ENQBQ14V19');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seoTitle)}</title>
<meta name="description" content="${esc(metaDescription)}">
<meta name="author" content="Josiah Proffit">
<link rel="canonical" href="${canonical}">

<link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
<link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicon-512.png">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">

<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(seoTitle)}">
<meta property="og:description" content="${esc(metaDescription)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}/assets/images/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(seoTitle)}">
<meta name="twitter:description" content="${esc(metaDescription)}">
<meta name="twitter:image" content="${SITE_URL}/assets/images/og-image.png">

<link rel="stylesheet" href="/assets/css/style.css">
${jsonLd.map((obj) => `<script type="application/ld+json">\n${JSON.stringify(obj)}\n</script>`).join('\n')}`;
}

function faqHtml(items) {
  return items
    .map(
      (f) => `
      <div data-faq="" style="border:1px solid #eaecf1;border-radius:16px;overflow:hidden;background:#fff;transition:border-color .2s ease,box-shadow .2s ease" style-hover="border-color:#dde3ee;box-shadow:0 6px 18px rgba(16,24,40,.05)">
        <button data-faq-toggle="" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;background:none;border:none;cursor:pointer;text-align:left;font-family:inherit">
          <span style="font-size:1rem;font-weight:600;color:#0e1116">${esc(f.q)}</span>
          <span data-faq-icon="" style="flex-shrink:0;width:24px;height:24px;border-radius:8px;background:#eef4ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:500;transition:transform .25s ease;transform:rotate(0deg)">+</span>
        </button>
        <div data-faq-body="" style="max-height:0px;overflow:hidden;transition:max-height .3s ease">
          <p style="padding:0 22px 20px;font-size:.95rem;color:#6b7280;line-height:1.7">${esc(f.a)}</p>
        </div>
      </div>`
    )
    .join('\n');
}

function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

function heroBlock(label) {
  return `<div style="width:100%;aspect-ratio:21/9;background:${CARD_GRADIENT};display:flex;align-items:center;justify-content:center;position:relative">
      <div style="position:absolute;inset:0;background-image:linear-gradient(#ffffff14 1px,transparent 1px),linear-gradient(90deg,#ffffff14 1px,transparent 1px);background-size:32px 32px"></div>
      <span style="position:relative;font-size:clamp(1.5rem,3.6vw,2.3rem);font-weight:800;color:rgba(255,255,255,.92);letter-spacing:-.02em;text-align:center;padding:0 32px">${esc(label)}</span>
    </div>`;
}

function ctaBlock() {
  return `<div style="max-width:820px;margin:0 auto;padding:0 24px clamp(56px,7vw,80px)">
  <div style="position:relative;background:linear-gradient(155deg,#0f1b3d,#142a63 55%,#1d4ed8);border-radius:24px;padding:clamp(28px,4vw,40px);overflow:hidden;box-shadow:0 24px 54px rgba(16,30,80,.28);text-align:center">
    <div style="position:absolute;top:-90px;right:-70px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(91,139,245,.4),transparent 65%)"></div>
    <div style="position:relative">
      <h3 style="font-size:1.5rem;font-weight:800;letter-spacing:-.02em;color:#fff">Ready for a website that actually works for your business?</h3>
      <p style="font-size:1rem;color:rgba(255,255,255,.78);line-height:1.6;margin-top:10px;max-width:480px;margin-left:auto;margin-right:auto">Plans starting at $399 to design and launch, from $97/month for hosting, security, and care. No contracts, ever.</p>
      <a href="/#contact" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#1d4ed8;font-size:1rem;font-weight:700;padding:14px 26px;border-radius:13px;margin-top:22px;transition:transform .2s ease,box-shadow .2s ease;box-shadow:0 10px 24px rgba(0,0,0,.16)" style-hover="transform:translateY(-2px);box-shadow:0 16px 34px rgba(0,0,0,.26)">Get a Free Quote</a>
    </div>
  </div>
</div>`;
}

function relatedCard(href, kicker, title) {
  return `
      <a href="${href}" style="display:block;background:#fff;border:1px solid #eaecf1;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 24px 54px rgba(16,24,40,.12);border-color:#dde3ee">
        <div style="height:110px;overflow:hidden;background:${CARD_GRADIENT};display:flex;align-items:center;justify-content:center">
          <span style="font-size:1.4rem;font-weight:800;color:rgba(255,255,255,.85);letter-spacing:-.02em">Proffit<span style="opacity:.7">.</span></span>
        </div>
        <div style="padding:16px 18px 20px">
          <div style="display:inline-block;background:#eef4ff;color:#2563eb;font-size:.7rem;font-weight:700;border-radius:100px;padding:3px 10px;margin-bottom:9px">${esc(kicker)}</div>
          <div style="font-size:1rem;font-weight:700;letter-spacing:-.01em">${esc(title)}</div>
        </div>
      </a>`;
}

function pageShell({ head, body, active = null }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
</head>
<body>
<div style="overflow-x:hidden">
${navHtml(active)}
${body}
${FOOTER}
</div>
${FB_BUBBLE}
<script src="/assets/js/site.js"></script>
<script src="/assets/js/chatbot.js" defer></script>
</body>
</html>
`;
}

// ---------- Service pages ----------

function renderServicePage(svc) {
  const head = headHtml({
    seoTitle: `${svc.seoTitle} | Proffit Marketing`,
    metaDescription: svc.metaDescription,
    canonicalPath: `/services/${svc.slug}.html`,
    ogType: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: svc.title,
        name: svc.title,
        description: svc.metaDescription,
        provider: { '@type': 'ProfessionalService', name: 'Proffit Marketing', telephone: '+19043974279', url: SITE_URL },
        areaServed: { '@type': 'City', name: 'Jacksonville' },
      },
      faqJsonLd(svc.faq),
    ],
  });

  const includedHtml = svc.included
    .map((item) => `<div style="display:flex;gap:10px;align-items:flex-start;font-size:.95rem;color:#3d4452;line-height:1.5">${checkIcon()}${esc(item)}</div>`)
    .join('\n          ');

  const processHtml = svc.process
    .map(
      (step, i) => `
        <div data-reveal="" style="background:#fff;border:1px solid #eaecf1;border-radius:18px;padding:24px">
          <div style="width:34px;height:34px;border-radius:10px;background:#eef4ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-weight:800;margin-bottom:14px">${i + 1}</div>
          <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:8px">${esc(step.title)}</h3>
          <p style="font-size:.92rem;color:#6b7280;line-height:1.6">${esc(step.body)}</p>
        </div>`
    )
    .join('\n');

  const relatedServices = svc.relatedServiceSlugs
    .map((slug) => {
      const s = serviceBySlug.get(slug);
      if (!s) return '';
      return relatedCard(`/services/${s.slug}.html`, s.kicker, s.title);
    })
    .join('\n');

  const relatedBlogs = svc.relatedBlogSlugs
    .map((slug) => {
      const p = postBySlug.get(slug);
      if (!p) return '';
      return relatedCard(`/blog/${p.slug}.html`, p.category, p.title);
    })
    .join('\n');

  const body = `
<article>
<header style="padding:clamp(40px,6vw,64px) 0 0">
  <div style="max-width:820px;margin:0 auto;padding:0 24px">
    <a href="/services/" style="display:inline-flex;align-items:center;gap:6px;font-size:.88rem;font-weight:600;color:#2563eb;margin-bottom:22px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>All Services</a>
    <div style="display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;background:#eef4ff;padding:6px 12px;border-radius:100px;margin-bottom:18px">${esc(svc.kicker)}</div>
    <h1 style="font-size:clamp(2rem,4.6vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.1">${esc(svc.title)}</h1>
    <p style="font-size:1.1rem;color:#5b6472;line-height:1.6;margin-top:16px;max-width:640px">${esc(svc.tagline)}</p>
  </div>
</header>

<div style="max-width:1040px;margin:32px auto 0;padding:0 24px">
  <div style="border-radius:22px;overflow:hidden;box-shadow:0 20px 50px rgba(16,24,40,.12)">
    ${heroBlock(svc.title)}
  </div>
</div>

<div style="max-width:820px;margin:0 auto;padding:clamp(48px,6vw,72px) 24px 0" class="article-content">
  ${svc.intro.map((p) => `<p>${esc(p)}</p>`).join('\n  ')}

  <h2>What's included</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 22px;margin:20px 0 32px">
          ${includedHtml}
  </div>

  <h2>Why it matters</h2>
  <p>${esc(svc.whyItMatters)}</p>

  <h2>How it works</h2>
</div>

<div style="max-width:1040px;margin:24px auto 0;padding:0 24px">
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px">
${processHtml}
  </div>
</div>

<div style="max-width:820px;margin:clamp(48px,6vw,72px) auto 0;padding:0 24px">
  <h2 style="font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin-bottom:20px">Frequently asked questions</h2>
  <div style="display:grid;gap:12px">
${faqHtml(svc.faq)}
  </div>
</div>

${ctaBlock()}
</article>

<section style="padding:0 0 clamp(72px,9vw,116px);background:#fafbfc;border-top:1px solid #f0f1f5">
  <div style="max-width:1200px;margin:0 auto;padding:clamp(56px,7vw,80px) 24px 0">
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:28px">Related services</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px;margin-bottom:48px">
${relatedServices}
    </div>
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:28px">Related guides</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px">
${relatedBlogs}
    </div>
  </div>
</section>`;

  return pageShell({ head, body, active: 'services' });
}

function renderServicesIndex() {
  const head = headHtml({
    seoTitle: `Website Design & Marketing Services | Proffit Marketing`,
    metaDescription: `Every service Proffit Marketing offers for Jacksonville-area small businesses, website design, redesigns, e-commerce, local SEO, Google Business Profile management, hosting, and ongoing care.`,
    canonicalPath: `/services/`,
  });

  const cards = services
    .map(
      (s) => `
      <a href="/services/${s.slug}.html" data-reveal="" style="display:block;background:#fff;border:1px solid #eaecf1;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 24px 54px rgba(16,24,40,.12);border-color:#dde3ee">
        <div style="padding:22px 22px 24px">
          <div style="display:inline-block;background:#eef4ff;color:#2563eb;font-size:.7rem;font-weight:700;border-radius:100px;padding:3px 10px;margin-bottom:12px">${esc(s.kicker)}</div>
          <div style="font-size:1.1rem;font-weight:700;letter-spacing:-.01em;line-height:1.3">${esc(s.title)}</div>
          <div style="font-size:.88rem;color:#6b7280;margin-top:8px;line-height:1.5">${esc(s.tagline)}</div>
        </div>
      </a>`
    )
    .join('\n');

  const body = `
<header style="position:relative;padding:clamp(56px,8vw,104px) 0 clamp(48px,6vw,72px)">
  <div style="position:relative;z-index:1;max-width:780px;margin:0 auto;padding:0 24px;text-align:center">
    <div data-reveal="" style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #e7eaf0;border-radius:100px;padding:6px 14px;font-size:.78rem;font-weight:600;color:#3d4452;box-shadow:0 2px 8px rgba(16,24,40,.04)">
      <span style="display:inline-flex;align-items:center;gap:5px;background:#eef4ff;color:#2563eb;border-radius:100px;padding:3px 9px">Services</span>
      Every piece, across 3 plans
    </div>
    <h1 data-reveal="" style="font-size:clamp(2.4rem,5.2vw,3.6rem);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:22px 0 0">Website Design & Marketing Services</h1>
    <p data-reveal="" style="font-size:clamp(1.05rem,1.5vw,1.15rem);color:#5b6472;line-height:1.65;max-width:620px;margin:20px auto 0">Every one of these is part of our Starter, Growth, and Authority plans, explore the specific piece you're looking for, or <a href="/pricing/" style="color:#2563eb;font-weight:600">see the full pricing</a>.</p>
  </div>
</header>
${SERVICES_INTRO}
<section style="padding:0 0 clamp(72px,9vw,116px)">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div data-reveal="" style="text-align:center;max-width:680px;margin:0 auto 40px">
      <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);font-weight:800;letter-spacing:-.02em">Every service, in detail</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
${cards}
    </div>
  </div>
</section>
${WHY_PROFFIT}
${HOW_IT_WORKS}
${ctaBlock()}`;

  return pageShell({ head, body, active: 'services' });
}

// ---------- Location pages ----------

const STANDARD_INCLUDED = [
  `Custom website design, no templates`,
  `Copywriting included`,
  `Hosting, security, and backups`,
  `Mobile-first, fast-loading build`,
  `Local SEO and Google Business Profile alignment`,
  `Ongoing care from $97/mo, no contracts`,
];

function renderLocationPage(loc) {
  const head = headHtml({
    seoTitle: loc.seoTitle,
    metaDescription: loc.metaDescription,
    canonicalPath: `/locations/${loc.slug}.html`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Website Design',
        name: `Website Design in ${loc.city}, FL`,
        description: loc.metaDescription,
        provider: { '@type': 'ProfessionalService', name: 'Proffit Marketing', telephone: '+19043974279', url: SITE_URL },
        areaServed: { '@type': 'City', name: loc.city, containedInPlace: { '@type': 'AdministrativeArea', name: loc.county } },
      },
      faqJsonLd(loc.faq),
    ],
  });

  const includedHtml = STANDARD_INCLUDED.map(
    (item) => `<div style="display:flex;gap:10px;align-items:flex-start;font-size:.95rem;color:#3d4452;line-height:1.5">${checkIcon()}${esc(item)}</div>`
  ).join('\n          ');

  const relatedBits = [];
  if (loc.relatedBlogSlug) {
    const p = postBySlug.get(loc.relatedBlogSlug);
    if (p) relatedBits.push(relatedCard(`/blog/${p.slug}.html`, p.category, p.title));
  }
  for (const slug of loc.relatedIndustrySlugs) {
    const p = postBySlug.get(slug);
    if (p) relatedBits.push(relatedCard(`/blog/${p.slug}.html`, p.category, p.title));
  }

  const body = `
<article>
<header style="padding:clamp(40px,6vw,64px) 0 0">
  <div style="max-width:820px;margin:0 auto;padding:0 24px">
    <a href="/locations/" style="display:inline-flex;align-items:center;gap:6px;font-size:.88rem;font-weight:600;color:#2563eb;margin-bottom:22px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>All Service Areas</a>
    <div style="display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2563eb;background:#eef4ff;padding:6px 12px;border-radius:100px;margin-bottom:18px">${esc(loc.county)}</div>
    <h1 style="font-size:clamp(2rem,4.6vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.1">Website Design in ${esc(loc.city)}, FL</h1>
    <p style="font-size:1.1rem;color:#5b6472;line-height:1.6;margin-top:16px;max-width:640px">${esc(loc.tagline)}</p>
  </div>
</header>

<div style="max-width:1040px;margin:32px auto 0;padding:0 24px">
  <div style="border-radius:22px;overflow:hidden;box-shadow:0 20px 50px rgba(16,24,40,.12)">
    ${heroBlock(loc.city)}
  </div>
</div>

<div style="max-width:820px;margin:0 auto;padding:clamp(48px,6vw,72px) 24px 0" class="article-content">
  ${loc.intro.map((p) => `<p>${esc(p)}</p>`).join('\n  ')}

  <div style="background:#fafbfc;border:1px solid #eef0f4;border-left:3px solid #2563eb;border-radius:12px;padding:20px 24px;margin:28px 0">
    <p style="margin:0;font-size:.95rem;color:#3d4452;line-height:1.7">${esc(loc.localNote)}</p>
  </div>

  <h2>What ${esc(loc.city)} businesses get</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 22px;margin:20px 0 12px">
          ${includedHtml}
  </div>
</div>

<div style="max-width:820px;margin:clamp(48px,6vw,72px) auto 0;padding:0 24px">
  <h2 style="font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin-bottom:20px">Frequently asked questions</h2>
  <div style="display:grid;gap:12px">
${faqHtml(loc.faq)}
  </div>
</div>

${ctaBlock()}
</article>

<section style="padding:0 0 clamp(72px,9vw,116px);background:#fafbfc;border-top:1px solid #f0f1f5">
  <div style="max-width:1200px;margin:0 auto;padding:clamp(56px,7vw,80px) 24px 0">
    <h2 style="font-size:clamp(1.5rem,3vw,2rem);font-weight:800;letter-spacing:-.03em;margin-bottom:28px">Guides for ${esc(loc.city)} businesses</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px">
${relatedBits.join('\n')}
    </div>
  </div>
</section>`;

  return pageShell({ head, body });
}

function renderLocationsIndex() {
  const head = headHtml({
    seoTitle: `Service Areas | Proffit Marketing, Northeast Florida`,
    metaDescription: `Proffit Marketing builds websites for small businesses throughout Northeast Florida, Jacksonville, the Beaches, St. Johns, Clay, and Nassau County communities.`,
    canonicalPath: `/locations/`,
  });

  const cards = locations
    .map(
      (l) => `
      <a href="/locations/${l.slug}.html" data-reveal="" style="display:block;background:#fff;border:1px solid #eaecf1;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.04);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease" style-hover="transform:translateY(-6px);box-shadow:0 24px 54px rgba(16,24,40,.12);border-color:#dde3ee">
        <div style="padding:22px 22px 24px">
          <div style="display:inline-block;background:#eef4ff;color:#2563eb;font-size:.7rem;font-weight:700;border-radius:100px;padding:3px 10px;margin-bottom:12px">${esc(l.county)}</div>
          <div style="font-size:1.1rem;font-weight:700;letter-spacing:-.01em;line-height:1.3">${esc(l.city)}</div>
        </div>
      </a>`
    )
    .join('\n');

  const body = `
<header style="position:relative;padding:clamp(56px,8vw,104px) 0 clamp(48px,6vw,72px)">
  <div style="position:relative;z-index:1;max-width:780px;margin:0 auto;padding:0 24px;text-align:center">
    <div data-reveal="" style="display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #e7eaf0;border-radius:100px;padding:6px 14px;font-size:.78rem;font-weight:600;color:#3d4452;box-shadow:0 2px 8px rgba(16,24,40,.04)">
      <span style="display:inline-flex;align-items:center;gap:5px;background:#eef4ff;color:#2563eb;border-radius:100px;padding:3px 9px">Service Areas</span>
      Northeast Florida
    </div>
    <h1 data-reveal="" style="font-size:clamp(2.4rem,5.2vw,3.6rem);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:22px 0 0">Where We Work</h1>
    <p data-reveal="" style="font-size:clamp(1.05rem,1.5vw,1.15rem);color:#5b6472;line-height:1.65;max-width:620px;margin:20px auto 0">Based in Jacksonville, building websites for small businesses throughout Duval, St. Johns, Clay, and Nassau County.</p>
  </div>
</header>
<section style="padding:0 0 clamp(72px,9vw,116px)">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px">
${cards}
    </div>
  </div>
</section>`;

  return pageShell({ head, body });
}

function buildSitemap() {
  const staticUrls = ['/', '/blog/', '/services/', '/our-work/', '/pricing/', '/faq/', '/locations/'];
  const postUrls = allPosts.map((p) => `/blog/${p.slug}.html`);
  const serviceUrls = services.map((s) => `/services/${s.slug}.html`);
  const locationUrls = locations.map((l) => `/locations/${l.slug}.html`);
  const urls = [...staticUrls, ...postUrls, ...serviceUrls, ...locationUrls];
  const body = urls.map((u) => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// --- run ---
mkdirSync(path.join(ROOT, 'services'), { recursive: true });
mkdirSync(path.join(ROOT, 'locations'), { recursive: true });

for (const svc of services) {
  writeFileSync(path.join(ROOT, 'services', `${svc.slug}.html`), renderServicePage(svc));
}
writeFileSync(path.join(ROOT, 'services', 'index.html'), renderServicesIndex());

for (const loc of locations) {
  writeFileSync(path.join(ROOT, 'locations', `${loc.slug}.html`), renderLocationPage(loc));
}
writeFileSync(path.join(ROOT, 'locations', 'index.html'), renderLocationsIndex());

writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap());

console.log(`Built ${services.length} service pages + services/index.html`);
console.log(`Built ${locations.length} location pages + locations/index.html`);
console.log(`Rewrote sitemap.xml with ${4 + allPosts.length + services.length + locations.length} URLs`);
