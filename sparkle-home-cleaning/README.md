# Amelia Shine Cleaning Services — Website

A residential and commercial cleaning company website for Amelia Shine Cleaning Services, serving Amelia Island, FL and Nassau County. Static HTML/CSS/JS, no build step, no dependencies.

## What's inside

```
sparkle-home-cleaning/
├── index.html                       Home
├── about.html                       About
├── residential-cleaning.html        Service page
├── deep-cleaning.html               Service page
├── move-in-move-out-cleaning.html   Service page
├── pricing.html                     Packages (no prices, quote-based)
├── service-areas.html               Amelia Island, Ormond Beach, Port Orange, Holly Hill, South Amelia Island
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

If you want a custom domain later, add a `CNAME` file containing just your domain name, and update `<link rel="canonical">`, the Open Graph `og:url` tags, the JSON-LD schema `url`/`@id` fields, `sitemap.xml`, and `robots.txt` to match your real domain (they currently all point to the placeholder `https://ameliashinecleaning.com`).

## Images

Most photo slots use real, bundled `<img>` tags (`.img-photo` — no external dependency, guaranteed to load):

| Filename | Used on |
|---|---|
| `assets/images/sink-scrubbing.jpg` | Home (services preview), Move In/Out Cleaning (lead photo) |
| `assets/images/counter-spray.jpg` | Home (hero, services preview), Deep Cleaning (lead photo) |
| `assets/images/mop-floor.jpg` | Home (services preview), Residential Cleaning (lead photo) |
| `assets/images/faucet-wipe.jpg` | Home (Why Choose Us), About (story photo) |
| `assets/images/stove-before.jpg` / `stove-after.jpg` | Residential Cleaning (before/after) |
| `assets/images/fridge-before.jpg` / `fridge-after.jpg` | Deep Cleaning (before/after) |
| `assets/images/kitchen-before.jpg` / `kitchen-after.jpg` | Move In/Out Cleaning (before/after) |
| `assets/images/og-image.jpg` (not yet added) | Every page's Open Graph tag |

`assets/images/bathtub-before.jpg` / `bathtub-after.jpg` and `office-before.jpg` / `office-after.jpg` are also in the folder (cropped and ready) but not currently placed on any page — spare before/after pairs if you want to swap one in or add a gallery later.

**No image, no placeholder:** the About page team cards and the Service Areas location sections were deliberately built without a photo slot — they're plain text (name/role/bio on About; heading/copy/CTA on Service Areas). If you want photos there later, wrap the desired spot in:
```html
<div class="img-photo ratio-square">
  <img src="assets/images/your-photo.jpg" alt="..." loading="lazy">
</div>
```
(`ratio-square` / `ratio-wide` / `ratio-tall` / `ratio-banner` control the crop.)

**Licensing note:** if you source more stock photos yourself, make sure they're licensed for commercial use. A watermarked preview (e.g. an "Unsplash+" preview you haven't purchased) isn't usable — the watermark won't go away once it's in the page.

## The contact form

The quote request form on `contact.html` is fully built out (all fields from the spec, validation, and a success state) but has **no backend** — it's a static site. To make it actually deliver leads, wire the `<form id="quote-form">` up to a form backend such as:

- [Formspree](https://formspree.io) — add `action="https://formspree.io/f/yourFormId"` and `method="POST"` to the form tag.
- Netlify Forms — if hosting on Netlify instead of GitHub Pages, add `data-netlify="true"` and a hidden `form-name` input.
- A custom endpoint of your choice.

Right now, submitting shows a client-side "Thanks!" success message via `assets/js/main.js` without sending data anywhere.

## Design system

Colors, spacing, radii, and shadows are defined as CSS custom properties at the top of `assets/css/style.css` — change the brand colors there (`--pink`, `--blue`, etc.) to re-theme the whole site at once.
