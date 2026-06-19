import { H as Hls } from './hls-vendor.js';

function setupPlayer(wrapper) {
  var video = wrapper.querySelector('video');
  var button = wrapper.querySelector('[data-player-start]');
  var source = wrapper.dataset.src || (video && video.dataset.src);
  var hlsInstance = null;
  var initialized = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();
    wrapper.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      playVideo();
    });
  }

  wrapper.addEventListener('click', function (event) {
    if (event.target === video) {
      return;
    }

    playVideo();
  });

  video.addEventListener('play', function () {
    wrapper.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (!video.seeking && video.currentTime === 0) {
      wrapper.classList.remove('is-playing');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
