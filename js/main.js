(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Remove deprecated hero eyebrow line if present */
  document.querySelectorAll(".eyebrow").forEach(function (el) {
    el.remove();
  });

  /* Hero stat counters */
  var counterEls = document.querySelectorAll("[data-counter-target]");
  function runCounterAnimation() {
    if (!counterEls.length) return;

    counterEls.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-counter-target"), 10);
      if (Number.isNaN(target) || target < 0) return;

      var suffix = el.getAttribute("data-counter-suffix") || "";

      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }

      var duration = 1200;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var current = Math.floor(progress * target);
        el.textContent = current + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      }

      el.textContent = "0" + suffix;
      window.requestAnimationFrame(step);
    });
  }
  runCounterAnimation();

  /* Scroll progress bar */
  var progressBar = document.querySelector(".scroll-progress");
  function updateScrollProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || window.pageYOffset;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
    progressBar.style.transform = "scaleX(" + ratio + ")";
  }
  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* Scroll-triggered section reveals */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    if (reduceMotion) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var staggerEls = entry.target.querySelectorAll(".card, .feature-tile, .use-card, .team-card, .steps li");
              staggerEls.forEach(function (item, index) {
                item.style.transitionDelay = Math.min(index * 70, 320) + "ms";
              });
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Subtle tilt interaction for premium feel */
  var tiltCards = document.querySelectorAll(".tilt-card");
  if (!reduceMotion && tiltCards.length && window.matchMedia("(hover: hover)").matches) {
    tiltCards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var tiltY = (px - 0.5) * 8;
        var tiltX = (0.5 - py) * 8;
        card.style.setProperty("--tilt-x", tiltX.toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", tiltY.toFixed(2) + "deg");
        card.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
      });
    });
  }

  /* Poster lightbox */
  var openBtn = document.getElementById("open-poster");
  var dialog = document.getElementById("poster-dialog");
  if (!openBtn || !dialog) return;

  var closers = dialog.querySelectorAll("[data-modal-close]");

  function openModal() {
    dialog.removeAttribute("hidden");
    document.body.classList.add("modal-open");
    var closeEl = dialog.querySelector(".modal-close");
    if (closeEl) closeEl.focus();
  }

  function closeModal() {
    dialog.setAttribute("hidden", "");
    document.body.classList.remove("modal-open");
    openBtn.focus();
  }

  openBtn.addEventListener("click", openModal);

  closers.forEach(function (c) {
    c.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !dialog.hasAttribute("hidden")) {
      closeModal();
    }
  });
})();
