(function () {
  'use strict';

  // Sticky nav: shrink padding + add shadow after scrolling past the hero.
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var inner = nav.firstElementChild;
    var onScroll = function () {
      var y = window.scrollY || 0;
      nav.style.padding = '0';
      if (y > 20) {
        inner.style.padding = '12px 24px';
        nav.style.boxShadow = '0 6px 24px rgba(16,24,40,.07)';
      } else {
        inner.style.padding = '18px 24px';
        nav.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile hamburger menu.
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    var setOpen = function (open) {
      menu.style.display = open ? 'flex' : 'none';
    };
    toggle.addEventListener('click', function () {
      setOpen(menu.style.display === 'none' || !menu.style.display);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  // Scroll-reveal for [data-reveal] elements.
  function initReveal() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    if (reduce) {
      els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity .7s cubic-bezier(.2,.6,.2,1), transform .7s cubic-bezier(.2,.6,.2,1)';
    });
    var show = function (t) {
      if (!t || t.__revealed) return;
      t.__revealed = true;
      var sibs = t.parentElement ? Array.prototype.slice.call(t.parentElement.querySelectorAll(':scope > [data-reveal]')) : [];
      var idx = sibs.indexOf(t);
      t.style.transitionDelay = (Math.min(Math.max(0, idx), 8) * 70) + 'ms';
      t.style.opacity = '1';
      t.style.transform = 'none';
    };
    var revealInView = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach(function (el) {
        if (el.__revealed) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) show(el);
      });
    };
    revealInView();
    try {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { if (!el.__revealed) io.observe(el); });
    } catch (e) {}
    window.addEventListener('scroll', revealInView, { passive: true });
    setTimeout(function () { els.forEach(show); }, 1400);
  }

  // Elements carrying style-hover / style-focus swap in the extra inline
  // styles on interaction and restore the base style on the way out.
  function initStyleSwaps() {
    document.querySelectorAll('[style-hover]').forEach(function (el) {
      var base = el.getAttribute('style') || '';
      var hover = el.getAttribute('style-hover');
      el.addEventListener('mouseenter', function () { el.style.cssText = base + ';' + hover; });
      el.addEventListener('mouseleave', function () { el.style.cssText = base; });
    });
    document.querySelectorAll('[style-focus]').forEach(function (el) {
      var base = el.getAttribute('style') || '';
      var focus = el.getAttribute('style-focus');
      el.addEventListener('focus', function () { el.style.cssText = base + ';' + focus; });
      el.addEventListener('blur', function () { el.style.cssText = base; });
    });
  }

  // FAQ accordion — only one entry open at a time.
  function initFaq() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-faq]'));
    if (!items.length) return;
    var openIndex = -1;
    var apply = function () {
      items.forEach(function (item, i) {
        var body = item.querySelector('[data-faq-body]');
        var icon = item.querySelector('[data-faq-icon]');
        var isOpen = i === openIndex;
        if (body) body.style.maxHeight = isOpen ? '240px' : '0px';
        if (icon) {
          icon.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0deg)';
          icon.style.background = isOpen ? '#2563eb' : '#eef4ff';
          icon.style.color = isOpen ? '#fff' : '#2563eb';
        }
      });
    };
    items.forEach(function (item, i) {
      var btn = item.querySelector('[data-faq-toggle]');
      if (!btn) return;
      btn.addEventListener('click', function () {
        openIndex = openIndex === i ? -1 : i;
        apply();
      });
    });
    apply();
  }

  // Contact form — posts to Formspree, matches original validation/UX.
  function initContactForm() {
    var submitBtn = document.getElementById('cf-submit');
    if (!submitBtn) return;
    var formEl = document.getElementById('cf-form');
    var successEl = document.getElementById('cf-success');
    var validEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var get = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };

    submitBtn.addEventListener('click', function () {
      var email = get('cf-email').trim();
      var fname = get('cf-name').trim();
      var biz = get('cf-biz').trim();

      if (!fname || !biz || !validEmail(email)) {
        ['cf-name', 'cf-biz', 'cf-email'].forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          var bad = id === 'cf-email' ? !validEmail(email) : !el.value.trim();
          el.style.borderColor = bad ? '#e5484d' : '#e4e7ee';
        });
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var data = {
        'First Name': fname,
        'Business Name': biz,
        'Email': email,
        'Phone': get('cf-phone').trim(),
        'Situation': get('cf-situation'),
        'Notes': get('cf-notes').trim(),
        _replyto: email
      };

      fetch('https://formspree.io/f/mojbnkjb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (res.ok) {
          if (formEl) formEl.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Get my free quote';
          alert('Something went wrong. Please try again.');
        }
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get my free quote';
        alert('Connection error. Please try again.');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavScroll();
    initMobileMenu();
    initReveal();
    initStyleSwaps();
    initFaq();
    initContactForm();
  });
})();
