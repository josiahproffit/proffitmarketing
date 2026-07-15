// Lightweight, fully client-side FAQ chat widget. No backend, no API keys,
// no third-party service, answers are matched by keyword against a small
// curated knowledge base drawn from the site's real pricing/services
// content, and anything unmatched falls through to the same Formspree
// endpoint the main contact form uses, tagged so leads are identifiable.
(function () {
  'use strict';

  var FORMSPREE_URL = 'https://formspree.io/f/mojbnkjb';

  var FAQ_DATA = [
    {
      id: 'pricing',
      keywords: ['price', 'pricing', 'cost', 'how much', 'expensive', 'plans', 'packages', 'rates'],
      answer: "We have three plans: Starter ($399 setup + $97/mo), Growth ($799 setup + $147/mo), and Authority ($1,499 setup + $247/mo). Every plan includes hosting, security, and no long-term contract.",
      link: { label: 'See full pricing', href: '/#pricing' },
    },
    {
      id: 'starter',
      keywords: ['starter', 'basic plan', 'cheapest', 'entry level', 'lowest price'],
      answer: "Starter is $399 setup + $97/month: up to 5 pages, mobile-friendly design, contact form, Google Maps integration, payment integration available, hosting, SSL, security monitoring, backups, speed optimization, SEO & analytics setup, and small content edits anytime.",
      link: { label: 'See full pricing', href: '/#pricing' },
    },
    {
      id: 'growth',
      keywords: ['growth plan', 'growth package', 'most popular'],
      answer: "Growth is $799 setup + $147/month: everything in Starter, plus up to 10 pages, advanced on-page SEO, Google Business Profile optimization, AI search optimization, a blog, lead tracking, and priority support.",
      link: { label: 'See full pricing', href: '/#pricing' },
    },
    {
      id: 'authority',
      keywords: ['authority plan', 'top tier', 'best plan', 'dominate', 'highest plan'],
      answer: "Authority is $1,499 setup + $247/month: everything in Growth, plus unlimited pages, competitor SEO research, 10 SEO blog posts, a review generation system, conversion optimization, custom landing pages, and quarterly strategy calls.",
      link: { label: 'See full pricing', href: '/#pricing' },
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
      keywords: ['redesign', 'old site', 'update site', 'existing website', 'outdated'],
      answer: "Yes, we audit your current site first and use proper redirects so your existing Google rankings carry over to the new site.",
      link: { label: 'Learn about redesigns', href: '/services/website-redesign-services.html' },
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
      id: 'why-monthly',
      keywords: ['why pay monthly', 'why not just buy', 'cheaper to buy', 'worth it', 'why subscription'],
      answer: "Because it works out better for you: no large upfront agency invoice, and your plan already includes hosting, security, software updates, and on-page SEO, all things other agencies bill separately for. You never have to find or pay a developer when something breaks, we just fix it.",
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
      answer: "Just fill out the quote form and we'll call you to talk it through. You don't need a domain, that's included in your plan and we register it for you. Send over your logo and photos if you have them; if not, we offer logo design for $50 (3 options to choose from) or can use stock photos. The more content you already have, the more tailored we can make your site, but it's not required to get started.",
      link: { label: 'Get a free quote', href: '/#contact' },
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
      keywords: ['upgrade my plan', 'downgrade', 'switch plans', 'change plans'],
      answer: "Yes. Upgrades take effect immediately, we build out the extra pages and features and you start paying the higher rate right away. Downgrades take effect at your next billing cycle, and anything beyond the lower plan's limits gets unpublished.",
    },
    {
      id: 'missed-payment',
      keywords: ['missed payment', 'late payment', 'payment failed', 'site go down if i dont pay'],
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
      id: 'contact',
      keywords: ['contact', 'quote', 'get started', 'talk to someone', 'call you', 'hire you', 'sign up'],
      answer: "Fill out the quote form and we'll set up a quick discovery call to talk through your business.",
      link: { label: 'Get a free quote', href: '/#contact' },
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
      link: { label: 'See our work', href: '/#work' },
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
    { label: 'How much does it cost?', id: 'pricing' },
    { label: 'How long does it take?', id: 'timeline' },
    { label: 'What areas do you serve?', id: 'service-area' },
    { label: 'How do I get started?', id: 'contact' },
  ];

  var GREETING = "Hi! I'm the Proffit Marketing assistant. Ask me about pricing, timelines, services, or service areas, or tap a question below.";
  var FALLBACK = "I don't have an exact answer for that yet. Want to leave your name and email so we can follow up personally?";

  function normalize(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function findBestMatch(input) {
    var norm = ' ' + normalize(input) + ' ';
    var best = null;
    var bestScore = 0;
    for (var i = 0; i < FAQ_DATA.length; i++) {
      var entry = FAQ_DATA[i];
      var score = 0;
      for (var j = 0; j < entry.keywords.length; j++) {
        var kw = entry.keywords[j];
        if (norm.indexOf(kw) !== -1) score += kw.split(' ').length;
      }
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    return best;
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
        '<div style="max-width:88%;align-self:flex-start;background:#eef4ff;color:#0e1116;padding:10px 14px;border-radius:14px 14px 14px 4px;font-size:.87rem;line-height:1.55">' +
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
      return (
        '<div id="pf-lead-form" style="background:#fafbfc;border:1px solid #eef0f4;border-radius:14px;padding:14px;display:grid;gap:8px">' +
        '<input id="pf-lead-name" type="text" placeholder="Your name" style="padding:9px 12px;border:1px solid #e4e7ee;border-radius:9px;font-family:inherit;font-size:.85rem;outline:none">' +
        '<input id="pf-lead-email" type="email" placeholder="Your email" style="padding:9px 12px;border:1px solid #e4e7ee;border-radius:9px;font-family:inherit;font-size:.85rem;outline:none">' +
        '<button id="pf-lead-submit" style="background:#2563eb;color:#fff;border:none;padding:10px;border-radius:9px;font-weight:700;font-size:.85rem;cursor:pointer;font-family:inherit">Send my question</button>' +
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
        var name = document.getElementById('pf-lead-name').value.trim();
        var email = document.getElementById('pf-lead-email').value.trim();
        var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!name || !validEmail) {
          if (!name) document.getElementById('pf-lead-name').style.borderColor = '#e5484d';
          if (!validEmail) document.getElementById('pf-lead-email').style.borderColor = '#e5484d';
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            'First Name': name,
            Email: email,
            Question: lastUnansweredQuestion,
            Source: 'Chatbot widget',
            _replyto: email,
          }),
        })
          .then(function (res) {
            showLeadForm = false;
            if (res.ok) {
              log.push({ role: 'bot', text: "Thanks, " + name + "! We got your question and will reply within 24 hours." });
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
      var match = matchedEntry || findBestMatch(text);
      if (match) {
        log.push({ role: 'bot', text: match.answer, link: match.link });
      } else {
        lastUnansweredQuestion = text;
        log.push({ role: 'bot', text: FALLBACK });
        showLeadForm = true;
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
