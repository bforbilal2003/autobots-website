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

  /* Team carousel with click + swipe navigation */
  var teamCarousel = document.querySelector("[data-team-carousel]");
  if (teamCarousel) {
    var teamTrack = teamCarousel.querySelector("[data-team-track]");
    var prevBtn = teamCarousel.querySelector("[data-team-prev]");
    var nextBtn = teamCarousel.querySelector("[data-team-next]");
    var dotsWrap = teamCarousel.querySelector("[data-team-dots]");

    var teamSlides = [
      {
        type: "team",
        name: "Muhammad Bilal Aslam",
        linkedin: "https://www.linkedin.com/in/bilal-aslam-giki",
        image: "assets/bilal.jpeg"
      },
      {
        type: "team",
        name: "Syed Ahmed Haseeb",
        linkedin: "https://www.linkedin.com/in/syedahmedhaseeb/",
        image: "assets/haseeb.jpeg"
      },
      {
        type: "team",
        name: "Muhammad Bilal",
        linkedin: "https://www.linkedin.com/in/muhammadbilalsvg/",
        image: "assets/babloo.jpeg"
      },
      {
        type: "team",
        name: "Muhammad Hassaan Shah",
        linkedin: "https://www.linkedin.com/in/hassaan-shah-148320269/",
        image: "assets/hassaan.jpeg"
      },
      {
        type: "advisor",
        name: "Hafiz Syed Ahmed Qasim",
        role: "Academic supervision, technical direction, and milestone review.",
        linkedin: "https://www.linkedin.com/in/syed-ahmed-qasim/",
        image: "assets/hafiz-ahmed-qasim-2026.png"
      },
      {
        type: "advisor",
        name: "Muhammad Ahmad Nawaz",
        role: "Co-supervision, methodology support, and evaluation guidance.",
        linkedin: "https://www.linkedin.com/in/m-ahmad-nawaz-524974112/",
        image: "assets/Ahmad%20Nawaz%20-%20Dec%202025.png"
      }
    ];

    var currentIndex = 0;
    var startX = 0;
    var deltaX = 0;

    function renderSlides() {
      var slidesMarkup = teamSlides
        .map(function (slide) {
          var badgeClass = slide.type === "advisor" ? "team-slide-badge team-slide-badge--advisor" : "team-slide-badge";
          var badgeText = slide.type === "advisor" ? "Advisor" : "Team Member";
          var advisorMetaBadge =
            slide.type === "advisor" ? '<span class="team-slide-badge team-slide-badge--advisor">Lecturer FCSE GIKI</span>' : "";
          var roleMarkup = slide.type === "advisor" ? '<p class="team-slide-role">' + slide.role + "</p>" : "";
          var badgesMarkup =
            '<div class="team-slide-badges">' +
            '<span class="' +
            badgeClass +
            '">' +
            badgeText +
            "</span>" +
            advisorMetaBadge +
            "</div>";
          return (
            '<article class="team-slide" role="group" aria-label="' +
            slide.name +
            '">' +
            '<div class="team-slide-image-wrap"><img src="' +
            slide.image +
            '" alt="' +
            slide.name +
            ' portrait" loading="lazy" decoding="async" /></div>' +
            '<div class="team-slide-body">' +
            badgesMarkup +
            "<h3>" +
            slide.name +
            "</h3>" +
            roleMarkup +
            '<a class="team-slide-link" href="' +
            slide.linkedin +
            '" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>' +
            "</div>" +
            "</article>"
          );
        })
        .join("");

      teamTrack.innerHTML = slidesMarkup;
      dotsWrap.innerHTML = "";
      teamSlides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "team-carousel-dot";
        dot.setAttribute("aria-label", "Go to slide " + (index + 1));
        dot.addEventListener("click", function () {
          goToSlide(index);
        });
        dotsWrap.appendChild(dot);
      });
    }

    function updateDots() {
      var dots = dotsWrap.querySelectorAll(".team-carousel-dot");
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + teamSlides.length) % teamSlides.length;
      teamTrack.style.transform = "translateX(" + -currentIndex * 100 + "%)";
      updateDots();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Touch swipe support for mobile/tablet interaction.
    teamTrack.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
        deltaX = 0;
      },
      { passive: true }
    );

    teamTrack.addEventListener(
      "touchmove",
      function (e) {
        deltaX = e.touches[0].clientX - startX;
      },
      { passive: true }
    );

    teamTrack.addEventListener("touchend", function () {
      if (Math.abs(deltaX) < 40) return;
      if (deltaX < 0) nextSlide();
      else prevSlide();
    });

    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);

    renderSlides();
    goToSlide(0);
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
