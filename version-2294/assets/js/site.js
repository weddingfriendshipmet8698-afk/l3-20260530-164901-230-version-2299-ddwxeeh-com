(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const topButton = document.querySelector('[data-back-top]');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('show', window.scrollY > 320);
    });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  function showSlide(index) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeSlide);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length) {
    showSlide(0);
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const yearSelect = document.querySelector('[data-year-select]');
  const typeSelect = document.querySelector('[data-type-select]');
  const cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  function filterCards() {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const y = yearSelect ? yearSelect.value : '';
    const t = typeSelect ? typeSelect.value : '';
    cards.forEach(function (card) {
      const hay = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
      const okQ = !q || hay.indexOf(q) !== -1;
      const okY = !y || card.getAttribute('data-year') === y;
      const okT = !t || card.getAttribute('data-type') === t;
      card.style.display = okQ && okY && okT ? '' : 'none';
    });
  }
  [searchInput, yearSelect, typeSelect].forEach(function (el) {
    if (el) el.addEventListener('input', filterCards);
  });
})();

function initPlayer(videoId, buttonId, overlayId, source) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const overlay = document.getElementById(overlayId);
  if (!video || !button || !overlay) return;
  let ready = false;
  function load() {
    if (!ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }
    overlay.classList.add('hidden');
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }
  button.addEventListener('click', load);
  overlay.addEventListener('click', load);
  video.addEventListener('click', function () {
    if (!ready || video.paused) load();
  });
}
