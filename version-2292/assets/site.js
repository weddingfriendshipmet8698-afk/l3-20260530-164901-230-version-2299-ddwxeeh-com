(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('.js-hero');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filters.forEach(function (input) {
      var target = document.querySelector(input.getAttribute('data-filter-input'));
      var empty = document.querySelector(input.getAttribute('data-empty-target'));
      if (!target) {
        return;
      }
      var items = Array.prototype.slice.call(target.querySelectorAll('[data-search]'));

      function apply() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var text = item.getAttribute('data-search').toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          item.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', apply);
      apply();
    });
  }

  function initQuerySearch() {
    var input = document.querySelector('[data-query-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    }
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('.play-cover');
      if (!video || !cover) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var hlsInstance = null;

      function load() {
        if (!video.dataset.ready) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.dataset.ready = '1';
        }
        cover.classList.add('is-hidden');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      cover.addEventListener('click', load);
      video.addEventListener('click', function () {
        if (video.paused) {
          load();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initQuerySearch();
    initPlayers();
  });
})();
