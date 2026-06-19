(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length) {
      return;
    }
    var input = document.querySelector(".js-card-search");
    var type = document.querySelector(".js-card-type");
    var year = document.querySelector(".js-card-year");
    var region = document.querySelector(".js-card-region");
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input && q) {
      input.value = q;
    }
    function value(el) {
      return el ? el.value : "all";
    }
    function apply() {
      var words = input ? input.value.trim().toLowerCase() : "";
      var t = value(type);
      var y = value(year);
      var r = value(region);
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        if (words && (card.getAttribute("data-search") || "").indexOf(words) === -1) {
          ok = false;
        }
        if (t !== "all" && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        if (y !== "all" && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        if (r !== "all" && card.getAttribute("data-region") !== r) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    [input, type, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayer(videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !url) {
      return;
    }
    var attached = false;
    var hls = null;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }
      video.src = url;
    }
    function start() {
      attach();
      overlay.hidden = true;
      video.controls = true;
      var task = video.play();
      if (task && typeof task.catch === "function") {
        task.catch(function () {
          overlay.hidden = false;
        });
      }
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    setup: setupPlayer
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
