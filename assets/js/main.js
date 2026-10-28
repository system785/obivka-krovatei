/* ==========================================================================
   Обивка кроватей — interactions
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (selector, context) {
    return (context || document).querySelector(selector);
  };
  var $$ = function (selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  var PHONE = "+79119275337";
  var PHONE_PRETTY = "+7 (911) 927-53-37";
  var WHATSAPP = "https://wa.me/79119275337";

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header, progress, fab ---------- */
  var header = $("#header");
  var progress = $("#scrollProgress");
  var fab = $("#fab");
  var scrollQueued = false;

  function updateScrollUI() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }
    if (fab) fab.classList.toggle("is-visible", y > 620);
    scrollQueued = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!scrollQueued) {
        window.requestAnimationFrame(updateScrollUI);
        scrollQueued = true;
      }
    },
    { passive: true }
  );
  updateScrollUI();

  /* ---------- Mobile menu ---------- */
  var mobileMenu = $("#mobileMenu");
  var burger = $("#burger");
  var menuClose = $("#menuClose");
  var lastFocus = null;

  function openMenu() {
    if (!mobileMenu) return;
    lastFocus = document.activeElement;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    var first = $(".mobile-nav__link", mobileMenu);
    if (first) setTimeout(function () { first.focus(); }, 120);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  }

  if (burger) burger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (mobileMenu) {
    $$("a, button", mobileMenu).forEach(function (link) {
      link.addEventListener("click", function () {
        if (link.hasAttribute("data-open-lead") || link.hasAttribute("data-open-max")) return;
        closeMenu();
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealItems = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Counters ---------- */
  var counters = $$("[data-count]");

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var duration = 1500;
    var start = null;
    var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;

    function frame(time) {
      if (!start) start = time;
      var p = Math.min((time - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = target * eased;
      var formatted =
        decimals > 0
          ? value.toFixed(decimals).replace(".", ",")
          : Math.round(value).toLocaleString("ru-RU");
      el.textContent = formatted;
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-count"));
        el.textContent = target.toLocaleString("ru-RU");
      });
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) { counterObserver.observe(el); });
    }
  }

  /* ---------- Subtle parallax ---------- */
  if (!reduceMotion && window.innerWidth > 1024) {
    var parallaxItems = $$("[data-parallax]");
    if (parallaxItems.length) {
      var parallaxQueued = false;
      var runParallax = function () {
        parallaxItems.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
          var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
          el.style.setProperty("--py", (offset * 18).toFixed(2) + "px");
        });
        parallaxQueued = false;
      };
      window.addEventListener(
        "scroll",
        function () {
          if (!parallaxQueued) {
            window.requestAnimationFrame(runParallax);
            parallaxQueued = true;
          }
        },
        { passive: true }
      );
      runParallax();
    }
  }

  /* ---------- Active navigation ---------- */
  var navLinks = $$(".nav__link");
  var trackedSections = $$("main section[id]").filter(function (section) {
    return navLinks.some(function (link) {
      return link.getAttribute("href") === "#" + section.id;
    });
  });

  if (trackedSections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
    );
    trackedSections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Smooth anchors with fixed header offset ---------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      var headerOffset = window.innerWidth > 1024 ? 86 : 70;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", href);
    });
  });

  /* ---------- Modals ---------- */
  var openDialogs = [];

  function lockBody() {
    document.body.classList.add("is-locked");
  }

  function unlockBody() {
    if (!document.querySelector("dialog[open]") && !(mobileMenu && mobileMenu.classList.contains("is-open"))) {
      document.body.classList.remove("is-locked");
    }
  }

  function openDialog(id, options) {
    var dialog = document.getElementById(id);
    if (!dialog) return;
    options = options || {};
    if (options.service) {
      var select = $('select[name="service"]', dialog);
      if (select) select.value = options.service;
    }
    $$("dialog[open]").forEach(function (other) {
      if (other !== dialog) closeDialog(other);
    });
    if (typeof dialog.showModal === "function") {
      if (dialog.open) return;
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    if (openDialogs.indexOf(dialog) === -1) openDialogs.push(dialog);
    lockBody();
    var focusTarget = $("input, select, textarea, button", dialog);
    if (focusTarget) setTimeout(function () { focusTarget.focus(); }, 80);
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    openDialogs = openDialogs.filter(function (item) { return item !== dialog; });
    unlockBody();
  }

  $$("[data-open-lead]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (mobileMenu && mobileMenu.classList.contains("is-open")) closeMenu();
      openDialog("leadModal", { service: btn.getAttribute("data-service") || "" });
    });
  });

  $$("[data-open-max]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (mobileMenu && mobileMenu.classList.contains("is-open")) closeMenu();
      openDialog("maxModal");
    });
  });

  $$("dialog").forEach(function (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", function () {
      openDialogs = openDialogs.filter(function (item) { return item !== dialog; });
      unlockBody();
    });
    $$("[data-close]", dialog).forEach(function (btn) {
      btn.addEventListener("click", function () { closeDialog(dialog); });
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = openDialogs[openDialogs.length - 1];
    if (open) closeDialog(open);
  });

  /* ---------- Phone formatting ---------- */
  function formatPhone(value) {
    var digits = value.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.charAt(0) === "8") digits = "7" + digits.slice(1);
    if (digits.charAt(0) !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);
    var result = "+7";
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length >= 5) result += ") " + digits.slice(4, 7);
    if (digits.length >= 8) result += "-" + digits.slice(7, 9);
    if (digits.length >= 10) result += "-" + digits.slice(9, 11);
    return result;
  }

  $$('input[type="tel"]').forEach(function (input) {
    input.addEventListener("input", function () {
      var formatted = formatPhone(input.value);
      if (formatted !== input.value) input.value = formatted;
    });
    input.addEventListener("focus", function () {
      if (!input.value) input.value = "+7 (";
    });
    input.addEventListener("blur", function () {
      if (input.value === "+7 (" || input.value === "+7") input.value = "";
    });
  });

  /* ---------- Form validation and lead handoff ---------- */
  function setError(field, message) {
    field.classList.add("has-error");
    var error = $(".field__error", field);
    if (error && message) error.textContent = message;
  }

  function clearError(field) {
    field.classList.remove("has-error");
  }

  function validateForm(form) {
    var valid = true;
    var name = form.querySelector('input[name="name"]');
    var phone = form.querySelector('input[name="phone"]');
    var consent = form.querySelector('input[name="consent"]');

    if (name) {
      var nameField = name.closest(".field");
      if (name.value.trim().length < 2) {
        setError(nameField, "Укажите имя — как к вам обращаться");
        valid = false;
      } else clearError(nameField);
    }

    if (phone) {
      var phoneField = phone.closest(".field");
      var digits = phone.value.replace(/\D/g, "");
      if (digits.length < 11) {
        setError(phoneField, "Введите телефон полностью");
        valid = false;
      } else clearError(phoneField);
    }

    if (consent) {
      var consentWrap = consent.closest(".consent");
      if (!consent.checked) {
        if (consentWrap) consentWrap.classList.add("has-error");
        valid = false;
      } else if (consentWrap) consentWrap.classList.remove("has-error");
    }

    return valid;
  }

  $$("[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm(form)) {
        var firstError = $(".has-error input, .has-error select, .consent.has-error input", form);
        if (firstError) firstError.focus();
        return;
      }

      var wrap = form.closest("[data-form-wrap]") || form.parentNode;
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var service = String(data.get("service") || "Перетяжка кровати");
      var comment = String(data.get("comment") || "").trim();

      var lines = [
        "Заявка с сайта «Обивка кроватей»",
        "Имя: " + name,
        "Телефон: " + phone,
        "Услуга: " + service
      ];
      if (comment) lines.push("Комментарий: " + comment);
      lines.push("Страница: " + window.location.href);

      var message = lines.join("\n");
      var waLink = WHATSAPP + "?text=" + encodeURIComponent(message);

      if (wrap) {
        wrap.classList.add("is-sent");
        var success = $(".form-success", wrap);
        if (success) {
          var waButton = $("[data-success-whatsapp]", success);
          if (waButton) waButton.setAttribute("href", waLink);
        }
      }

      var modalBody = form.closest(".modal__body");
      if (modalBody) modalBody.scrollTop = 0;

      window.open(waLink, "_blank", "noopener,noreferrer");
    });

    $$("input, select, textarea", form).forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) clearError(field);
        if (input.name === "consent") {
          var consentWrap = input.closest(".consent");
          if (consentWrap) consentWrap.classList.remove("has-error");
        }
      });
    });
  });

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var label = $(".copy-btn__text", btn);
      var original = label ? label.textContent : "";
      function done() {
        if (label) {
          label.textContent = "Скопировано";
          setTimeout(function () { label.textContent = original; }, 2200);
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(function () {
          fallbackCopy(value, done);
        });
      } else {
        fallbackCopy(value, done);
      }
    });
  });

  function fallbackCopy(value, callback) {
    var textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); } catch (err) { /* noop */ }
    document.body.removeChild(textarea);
    if (callback) callback();
  }

  /* ---------- FAQ: only one open ---------- */
  $$(".faq__list").forEach(function (list) {
    var items = $$("details", list);
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightboxImage");
  var lightboxCaption = $("#lightboxCaption");
  var galleryItems = $$("[data-lightbox]");
  var currentIndex = 0;
  var lightboxLastFocus = null;

  function showLightbox(index) {
    if (!galleryItems.length || !lightbox) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentIndex];
    var src = item.getAttribute("data-src") || item.getAttribute("data-full");
    var caption = item.getAttribute("data-caption") || "";
    if (lightboxImage) {
      lightboxImage.src = src;
      lightboxImage.alt = caption || "Работа мастерской";
    }
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lockBody();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    unlockBody();
    if (lightboxLastFocus) lightboxLastFocus.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function (e) {
      if (item.tagName === "A") e.preventDefault();
      lightboxLastFocus = item;
      showLightbox(index);
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    var closeBtn = $(".lightbox__close", lightbox);
    var prevBtn = $(".lightbox__prev", lightbox);
    var nextBtn = $(".lightbox__next", lightbox);
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); showLightbox(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); showLightbox(currentIndex + 1); });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") showLightbox(currentIndex + 1);
  });

  /* ---------- Mobile bar body offset ---------- */
  if ($("#mobileBar")) document.body.classList.add("has-mobile-bar");

  /* ---------- External links safety ---------- */
  $$('a[target="_blank"]').forEach(function (link) {
    var rel = link.getAttribute("rel") || "";
    if (rel.indexOf("noopener") === -1) link.setAttribute("rel", (rel + " noopener noreferrer").trim());
  });
})();
