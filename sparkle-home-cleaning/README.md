# Sparkle Home Cleaning — Website

A fictional residential cleaning company website for Daytona Beach, FL, built as a portfolio demo. Static HTML/CSS/JS, no build step, no dependencies.

## What's inside

```
sparkle-home-cleaning/
├── index.html                       Home
├── about.html                       About
├── residential-cleaning.html        Service page
├── deep-cleaning.html               Service page
├── move-in-move-out-cleaning.html   Service page
├── pricing.html                     Packages (no prices, quote-based)
├── service-areas.html               Daytona Beach, Ormond Beach, Port Orange, Holly Hill, South Daytona
├── faq.html                         ~17 FAQs with FAQPage schema
├── contact.html                     Full quote request form
├── 404.html
├── sitemap.xml
├── robots.txt
└── assets/
    ├── css/style.css                Full design system
    ├── js/main.js                   Nav, scroll reveal, FAQ accordion, form handling
    └── images/                      (empty — see "Images" below)
```

## Publishing to GitHub Pages

1. Create a new GitHub repository (public, for Pages to work on the free tier).
2. Drag and drop everything **inside** this `sparkle-home-cleaning` folder into the repo root (not the folder itself — `index.html` should sit at the repo's top level).
3. Commit the files.
4. In the repo, go to **Settings → Pages**, set the source to the `main` branch, root folder, and save.
5. Your site will publish at `https://<your-username>.github.io/<repo-name>/`.

If you want a custom domain later, add a `CNAME` file containing just your domain name, and update `<link rel="canonical">`, the Open Graph `og:url` tags, the JSON-LD schema `url`/`@id` fields, `sitemap.xml`, and `robots.txt` to match your real domain (they currently all point to the placeholder `https://sparklehomecleaningdaytona.com`).

## Images

Most photo slots are still a styled placeholder (`.img-ph` — a soft pink/blue gradient panel with an icon and caption). Five slots (the ones with the highest visual impact: the homepage hero, the three service preview thumbnails, the "Why Choose Us" photo, and the main image on each of the three service pages, plus About's story photo) are already wired up as real `<img>` tags (`.img-photo`) pointing at filenames below — **drop files with these exact names into `assets/images/` and they'll appear automatically, no code changes needed:**

| Filename | Used on | Suggested subject |
|---|---|---|
| `assets/images/sink-scrubbing.jpg` | Home (services preview), Move In/Out Cleaning | Gloved hands scrubbing a kitchen sink |
| `assets/images/counter-spray.jpg` | Home (hero, services preview), Deep Cleaning | Spraying/wiping a countertop |
| `assets/images/mop-floor.jpg` | Home (services preview), Residential Cleaning | Mop + bucket on a floor |
| `assets/images/faucet-wipe.jpg` | Home (Why Choose Us), About (story) | Wiping a bathroom/kitchen fixture |
| `assets/images/og-image.jpg` | Every page's Open Graph tag | 1200×630 social-share image |

Any square-format photo works well since these slots use a 1:1 or 16:10 crop (`object-fit: cover` handles the rest). Recommended minimum size: ~1200px on the long edge.

**Remaining placeholders** (team headshots on About, the 5 city photos on Service Areas, and the before/after pairs on the three service pages) are intentionally left as-is — they need different subject matter (real headshots, real Daytona-area photos, genuine dirty-vs-clean pairs) that reused cleaning-action shots wouldn't do justice to. To finish those:

1. Drop the photo into `assets/images/`.
2. Replace the relevant `<div class="img-ph ...">...</div>` block with:
   ```html
   <div class="img-photo ratio-square">
     <img src="assets/images/your-photo.jpg" alt="..." loading="lazy">
   </div>
   ```
   (swap `ratio-square` for whichever ratio class — `ratio-wide`, `ratio-tall`, `ratio-banner`, or `small` — the placeholder it's replacing used), reusing the text from the placeholder's `.ph-label` as a starting point for your `alt` text.

**Licensing note:** if you're sourcing stock photos, make sure whatever you use is licensed for commercial use. A watermarked preview (e.g. an "Unsplash+" preview you haven't purchased) isn't usable — the watermark won't go away once it's in the page.

## The contact form

The quote request form on `contact.html` is fully built out (all fields from the spec, validation, and a success state) but has **no backend** — it's a static site. To make it actually deliver leads, wire the `<form id="quote-form">` up to a form backend such as:

- [Formspree](https://formspree.io) — add `action="https://formspree.io/f/yourFormId"` and `method="POST"` to the form tag.
- Netlify Forms — if hosting on Netlify instead of GitHub Pages, add `data-netlify="true"` and a hidden `form-name` input.
- A custom endpoint of your choice.

Right now, submitting shows a client-side "Thanks!" success message via `assets/js/main.js` without sending data anywhere.

## Design system

Colors, spacing, radii, and shadows are defined as CSS custom properties at the top of `assets/css/style.css` — change the brand colors there (`--pink`, `--blue`, etc.) to re-theme the whole site at once.
