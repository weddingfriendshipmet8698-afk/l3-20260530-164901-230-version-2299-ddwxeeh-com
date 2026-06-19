(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupBackTop() {
    var buttons = document.querySelectorAll('[data-back-top]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var grid = document.querySelector('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var searchInput = document.querySelector('[data-filter-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var matched = true;
        var text = cardText(card);

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (year && normalize(card.dataset.year) !== year) {
          matched = false;
        }

        if (type && normalize(card.dataset.type).indexOf(type) === -1) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var resultGrid = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (!form || !resultGrid || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function movieCard(movie) {
      return [
        '<article class="movie-card movie-card-compact">',
        '  <a class="poster-link" href="movie/' + movie.slug + '.html" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-layer">播放</span>',
        '    <span class="rating-badge">★ ' + movie.rating + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="movie/' + movie.slug + '.html">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-tags"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch(query) {
      var normalized = normalize(query);

      if (!normalized) {
        resultGrid.innerHTML = '';
        summary.textContent = '请输入关键词开始搜索。';
        return;
      }

      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.tags,
          movie.oneLine
        ].join(' ')).indexOf(normalized) !== -1;
      }).slice(0, 120);

      resultGrid.innerHTML = results.map(movieCard).join('');
      summary.textContent = results.length ? '找到 ' + results.length + ' 条相关影片。' : '没有找到匹配的影片。';
    }

    if (initialQuery) {
      input.value = initialQuery;
      runSearch(initialQuery);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      runSearch(query);
    });

    input.addEventListener('input', function () {
      runSearch(input.value);
    });
  }

  ready(function () {
    setupNavigation();
    setupBackTop();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();
