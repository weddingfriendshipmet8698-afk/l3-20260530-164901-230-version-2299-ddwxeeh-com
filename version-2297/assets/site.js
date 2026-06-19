(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var localFilter = document.querySelector('[data-local-filter]');
  if (localFilter) {
    var input = localFilter.querySelector('[data-filter-input]');
    var year = localFilter.querySelector('[data-filter-year]');
    var type = localFilter.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function applyFilter() {
      var q = (input && input.value || '').trim().toLowerCase();
      var y = year && year.value || '';
      var t = type && type.value || '';
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        var yearMatch = !y || (card.dataset.year || '').indexOf(y) !== -1;
        var typeMatch = !t || card.dataset.type === t;
        var queryMatch = !q || text.indexOf(q) !== -1;
        card.style.display = yearMatch && typeMatch && queryMatch ? '' : 'none';
      });
    }

    [input, year, type].forEach(function (el) {
      if (el) el.addEventListener('input', applyFilter);
    });
  }

  var searchInput = document.getElementById('global-search');
  var searchResults = document.getElementById('search-results');
  var searchClear = document.getElementById('search-clear');

  function renderSearch() {
    if (!searchInput || !searchResults || typeof SITE_ITEMS === 'undefined') return;
    var q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '';
      return;
    }
    var source = typeof SITE_ITEMS !== 'undefined' ? SITE_ITEMS : [];
    var hits = source.filter(function (item) {
      return (item.b || '').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 10);

    searchResults.innerHTML = hits.map(function (item) {
      return '<a class="search-item" href="' + item.u + '">' +
        '<img src="' + item.i + '" alt="' + item.t.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.t + '</strong><span>' + item.m + '</span></span>' +
        '<em>查看</em>' +
        '</a>';
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderSearch);
  }
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      renderSearch();
      searchInput.focus();
    });
  }

  var video = document.getElementById('movie-video');
  var playButton = document.querySelector('[data-play-button]');

  function prepareVideo() {
    if (!video) return Promise.resolve();
    var stream = video.getAttribute('data-stream-url');
    if (!stream) return Promise.resolve();
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) video.src = stream;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsReady = true;
      }
      return Promise.resolve();
    }
    if (!video.src) video.src = stream;
    return Promise.resolve();
  }

  function startVideo() {
    prepareVideo().then(function () {
      var result = video.play();
      if (result && typeof result.then === 'function') {
        result.catch(function () {});
      }
      if (playButton) playButton.classList.add('hidden');
    });
  }

  if (video) {
    prepareVideo();
    video.addEventListener('click', startVideo);
    video.addEventListener('play', function () {
      if (playButton) playButton.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (playButton) playButton.classList.remove('hidden');
    });
  }
  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }
})();
