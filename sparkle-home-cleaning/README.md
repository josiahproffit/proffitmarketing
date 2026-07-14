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

Every photo on the site is a styled placeholder (`.img-ph` — a soft pink/blue gradient panel with an icon and caption) rather than a real photo. This keeps the repo dependency-free and avoids broken image links. To finish the site for a real launch:

1. Drop real photos into `assets/images/`.
2. Replace the relevant `<div class="img-ph ...">...</div>` blocks with `<img src="assets/images/your-photo.jpg" alt="...">`, reusing the descriptive text already in each `.ph-label` as your alt text starting point.
3. Also replace `assets/images/og-image.jpg` (referenced in every page's Open Graph tags) with a real 1200×630 social-share image.

## The contact form

The quote request form on `contact.html` is fully built out (all fields from the spec, validation, and a success state) but has **no backend** — it's a static site. To make it actually deliver leads, wire the `<form id="quote-form">` up to a form backend such as:

- [Formspree](https://formspree.io) — add `action="https://formspree.io/f/yourFormId"` and `method="POST"` to the form tag.
- Netlify Forms — if hosting on Netlify instead of GitHub Pages, add `data-netlify="true"` and a hidden `form-name` input.
- A custom endpoint of your choice.

Right now, submitting shows a client-side "Thanks!" success message via `assets/js/main.js` without sending data anywhere.

## Design system

Colors, spacing, radii, and shadows are defined as CSS custom properties at the top of `assets/css/style.css` — change the brand colors there (`--pink`, `--blue`, etc.) to re-theme the whole site at once.
