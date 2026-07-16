// Lightweight, fully client-side sales-assistant chat widget. No backend,
// no API keys, no third-party AI service. Knowledge is drawn from every
// page of the real site (services, pricing, FAQ, policies). Intent is
// classified in two stages: a small rule-based router disambiguates the
// cases that plain keyword scoring gets wrong (chatbot pricing vs website
// pricing, industry statements), then a keyword-scored lookup across
// FAQ_DATA handles everything else. Anything unmatched, or any message
// that signals real buying intent, surfaces the same Formspree-backed
// lead form the main contact form uses, tagged so leads are identifiable.
(function () {
  'use strict';

  var FORMSPREE_URL = 'https://formspree.io/f/mojbnkjb';

  function normalize(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function hasAny(norm, words) {
    for (var i = 0; i < words.length; i++) {
      if (norm.indexOf(normalize(words[i])) !== -1) return true;
    }
    return false;
  }

  var FAQ_DATA = [
    {
      id: 'pricing',
      keywords: ['price', 'pricing', 'cost', 'how much', 'expensive', 'plans', 'packages', 'rates'],
      answer:
        "We have three website plans:\n• Starter, $399 setup + $97/mo\n• Growth, $799 setup + $147/mo\n• Authority, $1,499 setup + $247/mo\n\nEvery plan includes hosting, security, and no long-term contract. The AI Chatbot is a separate add-on, $149 setup + $49/mo, if you want that too.",
      link: { label: 'See full pricing', href: '/pricing/' },
      showForm: true,
      formButtonLabel: 'Get a personalized quote',
    },
    {
      id: 'starter',
      keywords: ['starter', 'basic plan', 'cheapest', 'entry level', 'lowest price'],
      answer: "Starter is $399 setup + $97/month: up to 5 pages, mobile-friendly design, contact form, Google Maps integration, payment integration available, hosting, SSL, security monitoring, backups, speed optimization, SEO & analytics setup, and small content edits anytime.",
      link: { label: 'See full pricing', href: '/pricing/' },
    },
    {
      id: 'growth',
      keywords: ['growth plan', 'growth package', 'most popular'],
      answer: "Growth is $799 setup + $147/month: everything in Starter, plus up to 10 pages, advanced on-page SEO, Google Business Profile optimization, AI search optimization, a blog, lead tracking, and priority support.",
      link: { label: 'See full pricing', href: '/pricing/' },
    },
    {
      id: 'authority',
      keywords: ['authority plan', 'top tier', 'best plan', 'dominate', 'highest plan'],
      answer: "Authority is $1,499 setup + $247/month: everything in Growth, plus unlimited pages, competitor SEO research, 10 SEO blog posts, a review generation system, conversion optimization, custom landing pages, and quarterly strategy calls.",
      link: { label: 'See full pricing', href: '/pricing/' },
    },
    {
      id: 'chatbot-pricing',
      keywords: ['chatbot pricing', 'chatbot cost', 'chatbot price', 'cost of the chatbot', 'price of the chatbot'],
      answer:
        "AI Chatbot Pricing\n\n• $149 one-time setup\n• $49/month managed hosting\n\nIncluded:\n• AI chatbot installation\n• Hosting\n• Ongoing maintenance\n• Knowledge updates when needed\n• Reliable uptime\n• Support\n\nIt can be added on its own or paired with any website plan.",
      link: { label: 'AI Website Chatbot', href: '/services/ai-website-chatbot.html' },
      showForm: true,
      formButtonLabel: 'Get my AI chatbot',
    },
    {
      id: 'bundle-pricing',
      keywords: ['website and chatbot price', 'website and the chatbot cost'],
      answer:
        "The AI Chatbot stacks on top of any website plan, just add $149 to the setup fee and $49 to the monthly fee. For example: Starter + Chatbot is $548 setup, then $146/month total. Same math works with Growth or Authority, tell me which plan you're considering and I'll do the exact numbers.",
      link: { label: 'See full pricing', href: '/pricing/' },
      showForm: true,
      formButtonLabel: 'Get a personalized quote',
    },
    {
      id: 'chatbot-features',
      keywords: [
        'what does the chatbot include', 'what does the ai chatbot include', "what's included with the chatbot",
        'whats included with the chatbot', 'chatbot features', 'what comes with the chatbot', 'what does the chatbot do',
        'what features does the chatbot have', 'what features does the ai chatbot have', 'features of the chatbot',
        'features of the ai chatbot', 'what are the chatbot features',
      ],
      answer:
        "The AI Chatbot includes:\n• AI chatbot installation\n• Full customization for your business\n• A lead intake form built right into the chat\n• Booking and consultation intake when appropriate\n• A business FAQ knowledge base, like this one\n• Objection handling for common customer concerns\n• 24/7 lead capture, even when you're closed\n• Ongoing hosting and maintenance\n\nIt's built to answer questions instantly and catch leads you'd otherwise miss, and it works even better paired with one of our managed website plans.",
      link: { label: 'AI Website Chatbot', href: '/services/ai-website-chatbot.html' },
      showForm: true,
      formButtonLabel: 'Get my AI chatbot',
    },
    {
      id: 'timeline',
      keywords: ['long', 'time', 'launch', 'fast', 'quick', 'turnaround', 'weeks', 'when'],
      answer: "Starter sites typically launch in 2-3 weeks, Growth in 3-4 weeks, and Authority in 4-6 weeks, depending on how quickly we get content and feedback back and forth.",
    },
    {
      id: 'contract',
      keywords: ['contract', 'cancel', 'commitment', 'lock in', 'month to month'],
      answer: "No, every plan is month-to-month. No long-term contracts, cancel anytime.",
    },
    {
      id: 'ownership',
      keywords: ['own', 'ownership', 'is it mine', 'do i keep'],
      answer: "Your website is part of a managed subscription. While you're an active client, we handle hosting, security, updates, and your domain so you don't have to. If you'd like to own the site outright, we offer a one-time buyout, we rebuild it on WordPress and transfer full ownership to you.",
    },
    {
      id: 'buyout',
      keywords: ['buyout', 'buy out', 'buy the website', 'purchase the website', 'own it outright', 'wordpress'],
      answer: "Yes, we offer a website buyout option. If you'd like to own your website outright instead of staying on the monthly plan, we rebuild it on WordPress and transfer full ownership to you for a one-time fee of $3,000.",
    },
    {
      id: 'service-area',
      keywords: ['area', 'location', 'jacksonville', 'serve', 'near me', 'city', 'florida', 'st augustine', 'orange park', 'ponte vedra'],
      answer: "We're based in Jacksonville, FL and serve businesses throughout Northeast Florida, Jacksonville, the Beaches, St. Augustine, Orange Park, Ponte Vedra Beach, Fernandina Beach, and surrounding Duval, St. Johns, Clay, and Nassau County communities.",
      link: { label: 'See all service areas', href: '/locations/' },
    },
    {
      id: 'redesign',
      keywords: ['redesign', 'old site', 'update site', 'existing website', 'outdated', 'site is outdated', 'website is old', 'site looks old'],
      answer: "Yes, that's one of our most common projects. We audit your current site first and use proper redirects so your existing Google rankings carry over to the new one. What bothers you most about it right now, how it looks, how slow it is, or that it's just not bringing in leads?",
      link: { label: 'Learn about redesigns', href: '/services/website-redesign-services.html' },
    },
    {
      id: 'more-customers',
      keywords: ['need more customers', 'get more customers', 'more leads', 'more clients', 'grow my business', 'increase sales', 'get more business', "i'm not getting enough leads", 'not getting enough leads'],
      answer: "Happy to help with that. A couple quick questions: do you already have a website, and when people find you online right now, do they usually call, text, or fill out a form? That'll help point you toward the right fix, whether it's a new site, stronger SEO, or the AI chatbot catching leads after hours.",
    },
    {
      id: 'text-me',
      keywords: ['want people to text me', 'people to text me', 'customers to text me', 'let people text me', 'text me instead of calling', 'want a text option', 'let customers text'],
      answer: "The AI Chatbot is built for exactly that, it sits on your site so visitors can message you anytime, even after hours, and it captures their info as a lead automatically. Want details on the chatbot, or were you thinking of SMS/text messaging specifically?",
      link: { label: 'AI Website Chatbot', href: '/services/ai-website-chatbot.html' },
    },
    {
      id: 'not-on-google',
      keywords: ["isn't showing on google", 'not showing on google', 'not showing up on google', "can't find my business on google", 'cant find my business on google', 'not ranking', 'not on google', 'not on the first page', "don't show up on google", 'dont show up on google'],
      answer: "That's usually a mix of two things: your Google Business Profile setup and your website's on-page SEO. Both are included starting on our Growth plan, and we also offer standalone Google Business Profile management. Do you already have a Google Business Profile claimed, or are you starting from scratch?",
      link: { label: 'Google Business Profile management', href: '/services/google-business-profile-management.html' },
    },
    {
      id: 'ecommerce',
      keywords: ['sell', 'store', 'ecommerce', 'e-commerce', 'payment', 'checkout', 'products online', 'shop'],
      answer: "Yes, payment integration is available starting on the Starter plan, and we build full e-commerce stores with secure checkout for businesses that need a full product catalog.",
      link: { label: 'E-commerce websites', href: '/services/ecommerce-website-design.html' },
    },
    {
      id: 'seo',
      keywords: ['seo', 'rank', 'google ranking', 'search engine', 'local seo'],
      answer: "Yes, on-page SEO is included in every plan, work other agencies bill hundreds to thousands a month for as a separate service. Growth/Authority add advanced SEO, Google Business Profile optimization, and AI search optimization on top.",
      link: { label: 'Local SEO services', href: '/services/local-seo-services.html' },
    },
    {
      id: 'ai-chatbot',
      keywords: ['chatbot', 'ai chatbot', 'get this chatbot', 'chatbot for my business', 'ai assistant for my website', 'chat bot', 'get a chatbot', 'ai employee'],
      answer: "You're actually talking to it right now. The AI Website Chatbot is $149 one-time setup and $49/month, and it's trained specifically on your business so it can answer questions, capture leads, and book appointments 24/7, even after you close for the day. It works as a standalone add-on, but it performs best paired with one of our managed website plans, since we can integrate it seamlessly and keep everything running together.",
      link: { label: 'AI Website Chatbot', href: '/services/ai-website-chatbot.html' },
    },
    {
      id: 'why-monthly',
      keywords: [
        'why pay monthly', 'why not just buy', 'cheaper to buy', 'worth it', 'why subscription', 'why is hosting monthly',
        'why is there a monthly fee', 'what does the monthly payment cover', 'what does the monthly fee cover',
        'why monthly fee', 'whats the monthly fee for', "what's the monthly fee for", 'why do i have to pay monthly',
      ],
      answer:
        "We don't just build a site and disappear, a business website needs ongoing attention to actually perform. Google tends to favor sites that stay active: regular updates and fresh content signal that a business is active, even something as small as publishing a blog post helps. Your monthly plan covers that work, SEO upkeep, security, backups, and content updates, plus hosting and support, so you're never stuck finding a developer when something breaks. We can't promise specific rankings, nobody honestly can, but landing even one extra customer from better visibility usually covers the monthly cost several times over.",
    },
    {
      id: 'hosting',
      keywords: ['hosting', 'host', 'security', 'backup', 'ssl'],
      answer: "Yes, fast, secure hosting, an SSL certificate, security monitoring, and automatic backups are included in every plan. No separate hosting bill.",
    },
    {
      id: 'edits',
      keywords: ['edit', 'update my site', 'change my site', 'myself', 'make changes'],
      answer: "Small content edits (text, photos, hours, pricing) are included in every plan, just reach out and we'll make the change for you. We also check in monthly to see if you'd like any edits or tweaks.",
    },
    {
      id: 'getting-started',
      keywords: ['what do i need', 'how do i start', 'process', 'what happens after i sign up', 'getting started', 'do i need a domain'],
      answer: "Just fill out the quote form and we'll call you to talk it through. You don't need a domain, that's included in your plan and we register it for you. Send over your logo and photos if you have them; if not, we offer logo design for $50 (3 options to choose from) or can use stock photos. The more content you already have, the more tailored we can make your site, but it's not required to get started. Want me to grab your info right now so Josiah can call you?",
      showForm: true,
      formButtonLabel: 'Get my free quote',
    },
    {
      id: 'book-consultation',
      keywords: [
        'book', 'booking', 'book a call', 'book a consultation', 'book an appointment', 'schedule', 'schedule a call',
        'schedule a consultation', 'set up a call', 'set up a time', 'consultation', 'appointment', 'speak with someone',
        'can we talk', 'can i talk to you', 'can i talk to josiah', 'talk to josiah', 'can someone call me',
        'can you call me', 'have someone call me',
      ],
      answer: "Happy to help you get that booked. Drop your info below and Josiah will personally reach out to schedule a quick call.",
      showForm: true,
      formButtonLabel: 'Book my consultation',
    },
    {
      id: 'ready-to-start',
      keywords: [
        "let's do it", 'lets do it', "i'm ready", 'im ready', 'i am ready', 'sign me up', 'sounds good',
        "let's go", 'lets go', 'i want a website', 'i need a website', 'get me a website', 'build me a website',
        'i want in', "i'm interested", 'im interested', 'yes please', "let's get started", 'lets get started',
        'help me get a website', 'help me get started', 'help me book', 'i need help getting started',
        "i'd like to get started", 'id like to get started', 'i would like to get started', 'what are the next steps',
        'whats the next step', "what's the next step", 'whats next', "what's next",
      ],
      answer: "Love it, let's make it happen! Drop your info below and Josiah will reach out to get things moving.",
      showForm: true,
      formButtonLabel: "Let's get started",
    },
    {
      id: 'logo-pricing',
      keywords: ['logo cost', 'logo price', 'how much is a logo', 'do you make logos', 'logo design cost'],
      answer: "Yes, logo design is $50 and includes 3 different options to choose from.",
      link: { label: 'Logo & Brand Identity Design', href: '/services/logo-and-branding.html' },
    },
    {
      id: 'revisions',
      keywords: ['revisions', 'how many changes', 'design changes', 'rounds of revisions', 'dont like the design'],
      answer: "We'll send you a rough draft and work through revisions with you until the site matches the agreed-upon vision, no fixed limit on rounds during the design process. Once you're live, we check in monthly for any edits or tweaks.",
    },
    {
      id: 'payment-process',
      keywords: ['how do i pay', 'payment process', 'when do i pay', 'pay upfront', 'payment method'],
      answer: "You pay the setup fee upfront via a secure payment link once you approve the design direction. We then collect your content, build the site, and go through revisions. The monthly plan only starts once your site actually goes live, not at signup.",
    },
    {
      id: 'guarantee',
      keywords: ['guarantee', 'refund', 'money back', 'satisfaction'],
      answer: "There's no formal money-back guarantee, but we work with you through revisions until the site matches the agreed-upon vision before it launches, and every plan is cancel-anytime with no long-term contract.",
    },
    {
      id: 'upgrade-downgrade',
      keywords: ['upgrade my plan', 'downgrade', 'switch plans', 'change plans', 'upgrade', 'upgrade later'],
      answer: "Yes. Upgrades take effect immediately, we build out the extra pages and features and you start paying the higher rate right away. Downgrades take effect at your next billing cycle, and anything beyond the lower plan's limits gets unpublished.",
    },
    {
      id: 'missed-payment',
      keywords: ['missed payment', 'late payment', 'payment failed', 'site go down if i dont pay', 'miss a payment', "what happens if i miss", "what happens if i don't pay", "what happens if i dont pay"],
      answer: "You get a 7-day grace period to update your payment method, and your site stays online during that window while we reach out to collect. If payment still isn't received after that, the site may be temporarily suspended until the account is current, then restored promptly once payment goes through.",
    },
    {
      id: 'rush',
      keywords: ['rush', 'expedited', 'faster turnaround', 'asap', 'sooner'],
      answer: "Yes, when our schedule allows. Rush builds run about 50% faster than the normal timeline for a $200 fee. It's not guaranteed for every project since it depends on our current workload, but ask and we'll let you know.",
    },
    {
      id: 'platform',
      keywords: ['wordpress', 'what platform', 'built on', 'locked in', 'technology', 'website builder'],
      answer: "We build custom sites with modern HTML, CSS, and JavaScript (with AI-assisted development), not bulky themes or page builders, so it's fast and responsive. Your site is fully managed by us while you're on a plan; if you'd rather own it outright, we offer a WordPress buyout option.",
    },
    {
      id: 'objection-have-website',
      keywords: ['i already have a website', 'already have a site', 'i have a website already', 'existing website already'],
      answer: "No problem, plenty of our clients come to us with an existing site. Is it more that it's not bringing in enough leads, or that it just feels outdated? We do full redesigns that keep your existing Google rankings intact, and we can also add the AI chatbot to a site you already have.",
    },
    {
      id: 'objection-expensive',
      keywords: ['too expensive', "can't afford", 'cant afford', 'out of my budget', "that's a lot", 'thats a lot', 'pricey', 'a bit much'],
      answer: "Totally fair to ask. Compare it to hiring separately for hosting, security, SEO, and a developer on call, that alone often runs more than our monthly plan, and it's already bundled in. Which matters more to you right now, the upfront setup or the monthly cost? I can point you toward the plan that fits best.",
    },
    {
      id: 'objection-no-chatbot',
      keywords: ["i don't need a chatbot", 'dont need a chatbot', 'no chatbot', "don't need the chatbot", 'skip the chatbot', "don't want a chatbot", 'dont want a chatbot'],
      answer: "That's okay, it's optional, not required with any website plan. Out of curiosity, how do you currently handle questions when you're not available, after hours, weekends, holidays? The chatbot mainly helps businesses that get missed calls or messages outside business hours.",
    },
    {
      id: 'objection-no-time',
      keywords: ["i don't have time", 'dont have time', 'no time for this', 'too busy', "i'm too busy", 'im too busy'],
      answer: "Totally understandable, most of our clients don't either. That's actually the point, we handle content collection, design, and setup, it takes maybe an hour of your time total across the whole process. What would make this easiest for you, a quick call, or a short form whenever you get a chance?",
    },
    {
      id: 'objection-not-sure',
      keywords: ["not sure it'll work", 'not sure it will work', 'not sure this will work', 'does this actually work', 'will this even work', 'skeptical', 'will this help my business'],
      answer: "Fair question. We can't promise specific rankings or results, nobody honestly can, but an actively managed site with real SEO behind it consistently outperforms a neglected one over time, and the chatbot specifically catches leads you'd otherwise miss after hours. What outcome matters most to you, more calls, more quote requests, or just looking more established online?",
    },
    {
      id: 'contact',
      keywords: ['contact', 'quote', 'get started', 'talk to someone', 'call you', 'hire you', 'sign up', 'i need a quote', 'i need help', "i'd like a quote", 'id like a quote', 'i would like a quote'],
      answer: "Happy to help. Drop your info below and Josiah will personally reach out, or fill out the full quote form if you'd rather.",
      link: { label: 'Get a free quote', href: '/#contact' },
      showForm: true,
      formButtonLabel: 'Get my free quote',
    },
    {
      id: 'phone',
      keywords: ['phone', 'phone number', 'your number'],
      answer: "(904) 397-4279, Mon-Fri, 9-5 ET.",
    },
    {
      id: 'migration',
      keywords: ['wix', 'squarespace', 'godaddy', 'migrate', 'switch platform', 'transfer my site'],
      answer: "Yes, we can migrate your domain and rebuild your site on faster, more reliable hosting without losing your existing rankings.",
      link: { label: 'Website migration', href: '/services/website-migration.html' },
    },
    {
      id: 'who',
      keywords: ['who runs', 'founder', 'owner', 'josiah', 'who are you'],
      answer: "Proffit Marketing is founded and run by Josiah Proffit, based in Jacksonville, FL.",
    },
    {
      id: 'work',
      keywords: ['examples', 'portfolio', 'see your work', 'past work', 'reviews', 'testimonials'],
      answer: "Check out the Our Work section for real sites we've built for local businesses.",
      link: { label: 'See our work', href: '/our-work/' },
    },
    {
      id: 'blog',
      keywords: ['blog', 'articles', 'guides', 'read more'],
      answer: "Our blog covers website design, SEO, and marketing guides for local businesses.",
      link: { label: 'Visit the blog', href: '/blog/' },
    },
    {
      id: 'email',
      keywords: ['email', 'email address'],
      answer: "josiahproffit@gmail.com, we reply within 24 hours.",
    },
  ];

  var QUICK_REPLIES = [
    { label: 'How much does a website cost?', id: 'pricing' },
    { label: "What's the AI chatbot cost?", id: 'chatbot-pricing' },
    { label: 'How long does it take?', id: 'timeline' },
    { label: 'How do I get started?', id: 'contact' },
  ];

  var GREETING = "Hi! I'm the Proffit Marketing assistant. Ask me about website pricing, the AI chatbot, services, or timelines, or tap a question below.";
  var FALLBACK = "I don't have an exact answer for that yet. Want to leave your info so we can follow up personally?";

  // ---------- Intent classification ----------
  // Plain keyword scoring alone gets a few things wrong (chatbot pricing
  // questions matching the generic website-pricing entry, for example), so
  // these two routers run first and force a specific, correct answer before
  // falling through to the keyword-scored FAQ_DATA lookup below.

  var CHATBOT_WORDS = ['chatbot', 'chat bot', 'ai chat', 'ai assistant', 'ai employee'];
  var WEBSITE_WORDS = ['website', 'web site', 'site', 'web design'];
  var PRICE_WORDS = ['price', 'pricing', 'cost', 'how much', 'rate', 'rates', 'fee', 'fees'];
  var BUNDLE_WORDS = ['both', 'bundle', 'together', 'and a website', 'and the website', 'with a website', 'plus a website', 'combined', 'total cost'];
  var EXCLUSIVITY_WORDS = [
    'only want', 'just want', 'just the chatbot', 'only the chatbot', 'not the website', "don't need a website",
    'dont need a website', 'without a website', 'no website needed', 'just need the chatbot', 'just need chatbot',
  ];
  var TIER_WORDS = { starter: ['starter'], growth: ['growth'], authority: ['authority'] };

  function classifyPricingIntent(text) {
    var norm = ' ' + normalize(text) + ' ';
    var hasChatbot = hasAny(norm, CHATBOT_WORDS);
    var hasPrice = hasAny(norm, PRICE_WORDS);
    if (hasChatbot) {
      if (hasPrice && (hasAny(norm, BUNDLE_WORDS) || hasAny(norm, WEBSITE_WORDS))) return findById('bundle-pricing');
      if (hasPrice || hasAny(norm, EXCLUSIVITY_WORDS)) return findById('chatbot-pricing');
      return null;
    }
    if (hasPrice) {
      if (hasAny(norm, TIER_WORDS.starter)) return findById('starter');
      if (hasAny(norm, TIER_WORDS.growth)) return findById('growth');
      if (hasAny(norm, TIER_WORDS.authority)) return findById('authority');
    }
    return null;
  }

  // Industry statements ("I own a pressure washing company") need the
  // matched industry name interpolated into the response, so this can't be
  // a static FAQ_DATA entry, it's built dynamically instead.
  var INDUSTRY_MAP = [
    ['window cleaning', 'window cleaning', 'website-design-for-window-cleaning-companies'],
    ['pressure washing', 'pressure washing', 'website-design-for-pressure-washing-companies'],
    ['tree service', 'tree service', 'website-design-for-tree-services'],
    ['tree removal', 'tree service', 'website-design-for-tree-services'],
    ['roofing', 'roofing', 'website-design-for-roofers'],
    ['roofer', 'roofing', 'website-design-for-roofers'],
    ['plumbing', 'plumbing', 'website-design-for-plumbers'],
    ['plumber', 'plumbing', 'website-design-for-plumbers'],
    ['hvac', 'HVAC', 'website-design-for-hvac-companies'],
    ['electrician', 'electrical', 'website-design-for-electricians'],
    ['electrical', 'electrical', 'website-design-for-electricians'],
    ['landscap', 'landscaping', 'website-design-for-landscapers'],
    ['cleaning company', 'cleaning', 'website-design-for-cleaning-companies'],
    ['cleaning business', 'cleaning', 'website-design-for-cleaning-companies'],
    ['cleaning service', 'cleaning', 'website-design-for-cleaning-companies'],
    ['painting', 'painting', 'website-design-for-painting-contractors'],
    ['painter', 'painting', 'website-design-for-painting-contractors'],
    ['concrete', 'concrete', 'website-design-for-concrete-contractors'],
    ['fence', 'fencing', 'website-design-for-fence-companies'],
    ['law firm', 'legal', 'website-design-for-law-firms'],
    ['lawyer', 'legal', 'website-design-for-law-firms'],
    ['attorney', 'legal', 'website-design-for-law-firms'],
    ['dentist', 'dental', 'website-design-for-dentists'],
    ['dental', 'dental', 'website-design-for-dentists'],
    ['chiropract', 'chiropractic', 'website-design-for-chiropractors'],
    ['med spa', 'med spa', 'website-design-for-med-spas'],
    ['medspa', 'med spa', 'website-design-for-med-spas'],
    ['gym', 'fitness', 'website-design-for-gyms'],
    ['fitness', 'fitness', 'website-design-for-gyms'],
    ['realtor', 'real estate', 'website-design-for-realtors'],
    ['real estate', 'real estate', 'website-design-for-realtors'],
    ['restaurant', 'restaurant', 'website-design-for-restaurants'],
    ['auto detail', 'auto detailing', 'website-design-for-auto-detailers'],
  ];
  var INDUSTRY_CUES = [
    'i own', 'i have a', 'i run', 'my business', "i'm a", 'im a', 'we are a', 'we run a', 'i am a',
    'do you build', 'do you work with', 'do you do websites for', 'website for my', 'website for a',
  ];

  function classifyIndustry(text) {
    var norm = ' ' + normalize(text) + ' ';
    if (hasAny(norm, PRICE_WORDS)) return null;
    if (!hasAny(norm, INDUSTRY_CUES)) return null;
    for (var i = 0; i < INDUSTRY_MAP.length; i++) {
      var row = INDUSTRY_MAP[i];
      if (norm.indexOf(normalize(row[0])) !== -1) {
        var label = row[1];
        var blogSlug = row[2];
        return {
          id: 'industry-' + blogSlug,
          answer:
            label.charAt(0).toUpperCase() + label.slice(1) +
            " businesses are exactly who we build for. Most " + label +
            " clients care most about fast-loading pages, clear calls to action, and showing up when local customers search for " +
            label + " near them. I can point you to our full guide, or grab your info so Josiah can look at what would work best for your business.",
          link: { label: 'Website design for ' + label, href: '/blog/' + blogSlug + '.html' },
        };
      }
    }
    return null;
  }

  function findBestMatch(input) {
    var norm = ' ' + normalize(input) + ' ';
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < FAQ_DATA.length; i++) {
      var entry = FAQ_DATA[i];
      var score = 0;
      for (var j = 0; j < entry.keywords.length; j++) {
        var kw = normalize(entry.keywords[j]);
        if (kw && norm.indexOf(kw) !== -1) score += kw.split(' ').length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return best;
  }

  function classifyIntent(text) {
    return classifyPricingIntent(text) || classifyIndustry(text) || findBestMatch(text);
  }

  function findById(id) {
    for (var i = 0; i < FAQ_DATA.length; i++) {
      if (FAQ_DATA[i].id === id) return FAQ_DATA[i];
    }
    return null;
  }

  var STORAGE_KEY = 'pf-chat-log-v1';
  var OPEN_KEY = 'pf-chat-open-v1';

  function loadLog() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLog(log) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch (e) {}
  }

  function el(tag, styleText, html) {
    var e = document.createElement(tag);
    if (styleText) e.style.cssText = styleText;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function init() {
    if (document.getElementById('pf-chat-bubble')) return;

    var log = loadLog() || [{ role: 'bot', text: GREETING, showQuickReplies: true }];
    var isOpen = sessionStorage.getItem(OPEN_KEY) === '1';
    var showLeadForm = false;
    var lastUnansweredQuestion = '';
    var leadFormButtonLabel = 'Send my question';

    // ---------- Bubble ----------
    var bubble = el(
      'button',
      'position:fixed;bottom:24px;right:24px;z-index:61;width:56px;height:56px;border-radius:50%;background:#2563eb;border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(37,99,235,.4);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;padding:0'
    );
    bubble.id = 'pf-chat-bubble';
    bubble.setAttribute('aria-label', 'Chat with us');
    bubble.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
    bubble.addEventListener('mouseenter', function () {
      bubble.style.transform = 'translateY(-3px) scale(1.06)';
      bubble.style.boxShadow = '0 16px 34px rgba(37,99,235,.5)';
    });
    bubble.addEventListener('mouseleave', function () {
      bubble.style.transform = 'none';
      bubble.style.boxShadow = '0 10px 24px rgba(37,99,235,.4)';
    });

    // ---------- Panel ----------
    var panel = el(
      'div',
      'position:fixed;bottom:160px;right:24px;z-index:62;width:min(360px, calc(100vw - 48px));max-height:min(520px, 70vh);background:#fff;border-radius:20px;box-shadow:0 24px 54px rgba(16,24,40,.22);display:none;flex-direction:column;overflow:hidden;border:1px solid #eaecf1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'
    );
    panel.id = 'pf-chat-panel';

    var header = el(
      'div',
      'padding:16px 18px;border-bottom:1px solid #eef0f4;display:flex;align-items:center;justify-content:space-between;background:#fafbfc;flex-shrink:0'
    );
    header.innerHTML =
      '<div><div style="font-size:.95rem;font-weight:700;color:#0e1116">Proffit Marketing</div><div style="font-size:.78rem;color:#6b7280;margin-top:2px">Usually replies within 24 hours</div></div>';
    var closeBtn = el(
      'button',
      'width:28px;height:28px;border-radius:8px;border:none;background:#f5f6f8;color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0'
    );
    closeBtn.setAttribute('aria-label', 'Close chat');
    closeBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
    header.appendChild(closeBtn);

    var messagesEl = el(
      'div',
      'flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:200px'
    );

    var inputRow = el(
      'div',
      'padding:12px;border-top:1px solid #eef0f4;display:flex;gap:8px;flex-shrink:0;background:#fff'
    );
    var input = el(
      'input',
      'flex:1;padding:10px 13px;border:1px solid #e4e7ee;border-radius:11px;font-family:inherit;font-size:.88rem;outline:none'
    );
    input.type = 'text';
    input.placeholder = 'Ask a question...';
    var sendBtn = el(
      'button',
      'width:38px;height:38px;flex-shrink:0;border-radius:10px;border:none;background:#2563eb;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center'
    );
    sendBtn.setAttribute('aria-label', 'Send');
    sendBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';
    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(inputRow);

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    // ---------- Rendering ----------
    function botBubbleHtml(text, link) {
      var html =
        '<div style="max-width:88%;align-self:flex-start;background:#eef4ff;color:#0e1116;padding:10px 14px;border-radius:14px 14px 14px 4px;font-size:.87rem;line-height:1.55;white-space:pre-line">' +
        escapeHtml(text);
      if (link) {
        html +=
          '<a href="' +
          link.href +
          '" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-weight:700;color:#2563eb;font-size:.85rem">' +
          escapeHtml(link.label) +
          ' <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>';
      }
      html += '</div>';
      return html;
    }

    function userBubbleHtml(text) {
      return (
        '<div style="max-width:88%;align-self:flex-end;background:#2563eb;color:#fff;padding:10px 14px;border-radius:14px 14px 4px 14px;font-size:.87rem;line-height:1.55">' +
        escapeHtml(text) +
        '</div>'
      );
    }

    function quickRepliesHtml() {
      var html = '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:2px">';
      QUICK_REPLIES.forEach(function (q) {
        html +=
          '<button data-quick="' +
          q.id +
          '" style="background:#fff;border:1px solid #dbe4f5;color:#2563eb;font-size:.8rem;font-weight:600;padding:7px 12px;border-radius:100px;cursor:pointer;font-family:inherit">' +
          escapeHtml(q.label) +
          '</button>';
      });
      html += '</div>';
      return html;
    }

    function leadFormHtml() {
      var fieldStyle = 'padding:9px 12px;border:1px solid #e4e7ee;border-radius:9px;font-family:inherit;font-size:.85rem;outline:none;width:100%;box-sizing:border-box;background:#fff';
      return (
        '<div id="pf-lead-form" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:14px;padding:14px;display:grid;gap:8px">' +
        '<div style="font-size:.78rem;color:#6b7280;margin-bottom:2px">Just a few details and Josiah will reach out.</div>' +
        '<input id="pf-lead-name" type="text" placeholder="Your name" style="' + fieldStyle + '">' +
        '<input id="pf-lead-phone" type="tel" placeholder="Phone number" style="' + fieldStyle + '">' +
        '<input id="pf-lead-email" type="email" placeholder="Email (optional)" style="' + fieldStyle + '">' +
        '<select id="pf-lead-method" style="' + fieldStyle + '">' +
        '<option value="Either">Prefer we call or text?</option>' +
        '<option value="Call">Call me</option>' +
        '<option value="Text">Text me</option>' +
        '</select>' +
        '<select id="pf-lead-time" style="' + fieldStyle + '">' +
        '<option value="Anytime">Best time to reach you? Anytime</option>' +
        '<option value="Morning">Morning</option>' +
        '<option value="Afternoon">Afternoon</option>' +
        '<option value="Evening">Evening</option>' +
        '</select>' +
        '<textarea id="pf-lead-desc" rows="2" placeholder="Tell us a bit about your business or project (optional)" style="' + fieldStyle + ';resize:vertical;font-family:inherit"></textarea>' +
        '<button id="pf-lead-submit" style="background:#2563eb;color:#fff;border:none;padding:10px;border-radius:9px;font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit">' + escapeHtml(leadFormButtonLabel) + '</button>' +
        '</div>'
      );
    }

    function render() {
      messagesEl.innerHTML = '';
      log.forEach(function (msg) {
        var wrap = document.createElement('div');
        if (msg.role === 'bot') {
          wrap.innerHTML = botBubbleHtml(msg.text, msg.link);
        } else {
          wrap.innerHTML = userBubbleHtml(msg.text);
        }
        messagesEl.appendChild(wrap.firstChild);
        if (msg.showQuickReplies) {
          var qr = document.createElement('div');
          qr.innerHTML = quickRepliesHtml();
          messagesEl.appendChild(qr.firstChild);
        }
      });
      if (showLeadForm) {
        var lf = document.createElement('div');
        lf.innerHTML = leadFormHtml();
        messagesEl.appendChild(lf.firstChild);
        wireLeadForm();
      }
      messagesEl.scrollTop = messagesEl.scrollHeight;
      attachQuickReplyHandlers();
      saveLog(log);
    }

    function attachQuickReplyHandlers() {
      var btns = messagesEl.querySelectorAll('[data-quick]');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var entry = findById(btn.getAttribute('data-quick'));
          if (!entry) return;
          handleUserMessage(btn.textContent, entry);
        });
      });
    }

    function wireLeadForm() {
      var submitBtn = document.getElementById('pf-lead-submit');
      if (!submitBtn) return;
      submitBtn.addEventListener('click', function () {
        var nameEl = document.getElementById('pf-lead-name');
        var phoneEl = document.getElementById('pf-lead-phone');
        var emailEl = document.getElementById('pf-lead-email');
        var name = nameEl.value.trim();
        var phone = phoneEl.value.trim();
        var email = emailEl.value.trim();
        var method = document.getElementById('pf-lead-method').value;
        var bestTime = document.getElementById('pf-lead-time').value;
        var desc = document.getElementById('pf-lead-desc').value.trim();
        var phoneDigits = phone.replace(/\D/g, '').length;
        var validPhone = phoneDigits >= 7;
        var validEmail = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!name || !validPhone || !validEmail) {
          if (!name) nameEl.style.borderColor = '#e5484d';
          if (!validPhone) phoneEl.style.borderColor = '#e5484d';
          if (!validEmail) emailEl.style.borderColor = '#e5484d';
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        var payload = {
          Name: name,
          Phone: phone,
          'Preferred Contact Method': method,
          'Best Time to Reach': bestTime,
          'Project Description': desc || lastUnansweredQuestion,
          Message: lastUnansweredQuestion,
          Source: 'Chatbot widget',
        };
        if (email) {
          payload.Email = email;
          payload._replyto = email;
        }
        fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            showLeadForm = false;
            if (res.ok) {
              log.push({
                role: 'bot',
                text: "Perfect, thank you! I'll pass this along to Josiah, and he'll reach out during your preferred time using your preferred contact method.",
              });
            } else {
              log.push({ role: 'bot', text: "Something went wrong sending that. Feel free to call us at (904) 397-4279 instead." });
            }
            render();
          })
          .catch(function () {
            showLeadForm = false;
            log.push({ role: 'bot', text: "Connection error. Feel free to call us at (904) 397-4279 instead." });
            render();
          });
      });
    }

    function handleUserMessage(text, matchedEntry) {
      log.push({ role: 'user', text: text });
      var match = matchedEntry || classifyIntent(text);
      if (match) {
        log.push({ role: 'bot', text: match.answer, link: match.link });
        if (match.showForm) {
          lastUnansweredQuestion = text;
          showLeadForm = true;
          leadFormButtonLabel = match.formButtonLabel || 'Book my consultation';
        }
      } else {
        lastUnansweredQuestion = text;
        log.push({ role: 'bot', text: FALLBACK });
        showLeadForm = true;
        leadFormButtonLabel = 'Send my question';
      }
      render();
    }

    function submitInput() {
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      handleUserMessage(text, null);
    }

    sendBtn.addEventListener('click', submitInput);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitInput();
    });

    function setOpen(open) {
      isOpen = open;
      panel.style.display = open ? 'flex' : 'none';
      try {
        sessionStorage.setItem(OPEN_KEY, open ? '1' : '0');
      } catch (e) {}
      if (open) input.focus();
    }

    bubble.addEventListener('click', function () {
      setOpen(!isOpen);
    });
    closeBtn.addEventListener('click', function () {
      setOpen(false);
    });

    render();
    setOpen(isOpen);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
