(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs(".menu-toggle");
    var panel = qs(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = qs(".hero");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dots button", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function initFilters() {
    var form = qs(".filter-bar");
    var list = qs(".filter-list");
    if (!form || !list) {
      return;
    }
    var input = qs("[name='q']", form);
    var region = qs("[name='region']", form);
    var year = qs("[name='year']", form);
    var cards = qsa(".movie-card", list);
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input && q) {
      input.value = q;
    }
    function apply() {
      var qv = normalize(input && input.value);
      var rv = normalize(region && region.value);
      var yv = normalize(year && year.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.category,
          card.dataset.year
        ].join(" "));
        var ok = true;
        if (qv && text.indexOf(qv) === -1) {
          ok = false;
        }
        if (rv && normalize(card.dataset.region).indexOf(rv) === -1) {
          ok = false;
        }
        if (yv && normalize(card.dataset.year) !== yv) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
      });
    }
    [input, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function loadHls() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var existing = document.querySelector("script[data-hls]");
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls", "true");
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer(options) {
    var video = qs("#movieVideo");
    var cover = qs("#playCover");
    if (!video || !options || !options.source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(options.source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = options.source;
        }
      }).catch(function () {
        video.src = options.source;
      });
    }
    function play() {
      attach().then(function () {
        if (cover) {
          cover.hidden = true;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      });
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
