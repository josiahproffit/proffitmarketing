/* Sparkle Home Cleaning — shared site behavior */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".mobile-panel");
  var overlay = document.querySelector(".mobile-overlay");
  var closeBtn = document.querySelector(".mobile-panel-close");

  function openMenu() {
    panel.classList.add("open");
    overlay.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    panel.classList.remove("open");
    overlay.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (toggle && panel && overlay) {
    toggle.addEventListener("click", function () {
      panel.classList.contains("open") ? closeMenu() : openMenu();
    });
    overlay.addEventListener("click", closeMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    document.querySelectorAll(".mobile-panel a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      item.closest(".faq-list") && item.closest(".faq-list").querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        answer.style.maxHeight = null;
        question.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Active nav link highlighting */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* Quote form handling (contact page) */
  var quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var requiredFields = quoteForm.querySelectorAll("[required]");
      var valid = true;
      requiredFields.forEach(function (field) {
        if (!field.value || (field.type === "checkbox" && false)) {
          if (!field.value) valid = false;
        }
      });
      if (!valid) {
        quoteForm.reportValidity();
        return;
      }
      quoteForm.style.display = "none";
      var success = document.getElementById("form-success");
      if (success) {
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }

  /* Set current year in footer */
  document.querySelectorAll(".current-year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
