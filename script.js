/* ═══════════════════════════════════════════════════════════════
   EGYPTIAN DIGITAL WEDDING INVITATION — JAVASCRIPT
   ═══════════════════════════════════════════════════════════════ */

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  EDIT SECTION — Update these values for your wedding        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const CONFIG = {
  // Couple names (also update in index.html for display)
  groomName: 'أحمد',
  brideName: 'غدير',

  // Wedding date & time (used for countdown)
  // Format: Year, Month (0-indexed), Day, Hour, Minute
  weddingDate: new Date(2026, 5, 30, 20, 0, 0), // 30 June 2026, 8:00 PM

  // Venue details (also editable in index.html)
  venueName: 'قاعة أوسيل',

  // Google Maps link — replace with your venue's Google Maps URL
  mapsUrl: 'https://maps.app.goo.gl/vY2dTSQebTJRkfvw6',

  // Asset paths
  musicPath: 'assets/music.mp3',
  coupleImagePath: 'assets/couple.jpg',
  venueImagePath: 'assets/venue.jpg',

  // RSVP API — must run via server (npm start)
  // EDIT: Change if API is hosted elsewhere
  rsvpApiUrl: '/api/rsvp',
};

/* ═══════════════════════════════════════════════════════════════
   DOM READY
   ═══════════════════════════════════════════════════════════════ */
let startMusicWithSound = null;

document.addEventListener('DOMContentLoaded', () => {
  initMusicPlayer();
  initSiteGate();
  initHeroScrollPerf();
  initCountdown();
  initScrollReveal();
  initVenueLinks();
  initCoupleImage();
  initVenueImage();
  initRsvp();
});

/* ═══════════════════════════════════════════════════════════════
   SITE GATE — Opening screen fixed until "اضغط للدخول"
   ═══════════════════════════════════════════════════════════════ */
function initSiteGate() {
  const html = document.documentElement;
  const overlay = document.getElementById('opening-overlay');
  const heroContent = document.querySelector('.hero-content');
  const musicBtn = document.getElementById('music-btn');
  if (!overlay) return;

  html.classList.add('site-locked');

  let entered = false;

  function enterInvitation() {
    if (entered) return;

    // Play first — must stay inside the click/tap handler (iOS + Android)
    if (startMusicWithSound) startMusicWithSound();

    entered = true;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');

    html.classList.remove('site-locked');
    html.classList.add('site-unlocked');

    if (heroContent) heroContent.classList.add('hero-visible');
    if (musicBtn) musicBtn.classList.add('is-visible');
  }

  overlay.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    enterInvitation();
  }, { once: true });

  const blockScroll = (e) => {
    if (!entered) e.preventDefault();
  };

  window.addEventListener('wheel', blockScroll, { passive: false });
  window.addEventListener('touchmove', blockScroll, { passive: false });
}

/* ═══════════════════════════════════════════════════════════════
   HERO SCROLL PERFORMANCE
   ═══════════════════════════════════════════════════════════════ */
function initHeroScrollPerf() {
  const hero = document.getElementById('hero');
  const scrollHint = document.querySelector('.hero-scroll-hint');
  if (!hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      hero.classList.toggle('is-scrolled', !entry.isIntersecting);
    },
    { threshold: 0.15 }
  );
  observer.observe(hero);

  if (scrollHint) {
    scrollHint.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(scrollHint.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════════════════════════════════════════ */
function initCountdown() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const countdownGrid = document.getElementById('countdown-grid');
  const countdownDone = document.getElementById('countdown-done');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  let intervalId = null;

  function showCountdownComplete() {
    if (countdownGrid) countdownGrid.hidden = true;
    if (countdownDone) {
      countdownDone.hidden = false;
      countdownDone.classList.add('visible');
    }
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function updateCountdown() {
    const now = new Date();
    const diff = CONFIG.weddingDate.getTime() - now.getTime();

    if (diff <= 0) {
      showCountdownComplete();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = padNumber(days);
    hoursEl.textContent = padNumber(hours);
    minutesEl.textContent = padNumber(minutes);
    secondsEl.textContent = padNumber(seconds);
  }

  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);
}

function padNumber(num) {
  return num < 10 ? '0' + num : String(num);
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  // Skip hero — handled by opening animation
  const observerTargets = Array.from(reveals).filter(
    (el) => !el.closest('#hero')
  );

  if (!observerTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  observerTargets.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   VENUE LINKS — Google Maps & WhatsApp
   ═══════════════════════════════════════════════════════════════ */
function initVenueLinks() {
  const mapsBtn = document.getElementById('maps-btn');
  const venueNameEl = document.getElementById('venue-name');

  if (venueNameEl) venueNameEl.textContent = CONFIG.venueName;

  if (mapsBtn && CONFIG.mapsUrl) {
    mapsBtn.href = CONFIG.mapsUrl;
  }
}

/* ═══════════════════════════════════════════════════════════════
   COUPLE IMAGE — Graceful fallback if missing
   ═══════════════════════════════════════════════════════════════ */
function initCoupleImage() {
  const wrap = document.getElementById('couple-image-wrap');
  const img = document.getElementById('couple-image');

  if (!wrap || !img) return;

  function hideImage() {
    wrap.hidden = true;
    img.removeAttribute('src');
  }

  function showImage() {
    if (img.naturalWidth > 0) {
      wrap.hidden = false;
    }
  }

  img.addEventListener('error', hideImage);
  img.addEventListener('load', showImage);

  // Re-trigger load check (handles cached, missing, or already-failed states)
  if (img.complete) {
    if (img.naturalWidth > 0) {
      showImage();
    } else {
      hideImage();
    }
  } else {
    const currentSrc = img.getAttribute('src') || CONFIG.coupleImagePath;
    img.src = currentSrc;
  }
}

/* ═══════════════════════════════════════════════════════════════
   VENUE IMAGE — Graceful fallback if missing
   ═══════════════════════════════════════════════════════════════ */
function initVenueImage() {
  const wrap = document.getElementById('venue-image-wrap');
  const img = document.getElementById('venue-image');

  if (!wrap || !img) return;

  function hideImage() {
    wrap.hidden = true;
    img.removeAttribute('src');
  }

  img.addEventListener('error', hideImage);
  img.addEventListener('load', () => {
    if (img.naturalWidth > 0) wrap.hidden = false;
  });

  if (img.complete) {
    if (img.naturalWidth > 0) wrap.hidden = false;
    else hideImage();
  }
}

/* ═══════════════════════════════════════════════════════════════
   MUSIC PLAYER — Graceful fallback if missing
   ═══════════════════════════════════════════════════════════════ */
function initMusicPlayer() {
  const musicBtn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  const playIcon = musicBtn?.querySelector('.music-icon--play');
  const pauseIcon = musicBtn?.querySelector('.music-icon--pause');

  if (!musicBtn || !audio) return;

  let isPlaying = false;
  let musicAvailable = false;
  let wantsToPlay = false;
  let blobUrl = null;

  musicBtn.classList.add('unavailable');
  musicBtn.setAttribute('aria-label', 'جاري تحميل الموسيقى');

  function setPlayingState(playing) {
    isPlaying = playing;
    musicBtn.classList.toggle('playing', playing);

    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;

    musicBtn.setAttribute(
      'aria-label',
      playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'
    );
  }

  function enableMusic() {
    musicAvailable = true;
    musicBtn.classList.remove('unavailable');
    musicBtn.setAttribute('aria-label', 'تشغيل الموسيقى');
  }

  function disableMusic() {
    musicAvailable = false;
    audio.pause();
    musicBtn.classList.add('unavailable');
    musicBtn.setAttribute('aria-label', 'الموسيقى غير متوفرة');
    musicBtn.title = 'الموسيقى غير متوفرة';
    setPlayingState(false);
  }

  function tryPlayNow() {
    audio.muted = false;
    audio.volume = 1;

    const playAttempt = audio.play();
    if (!playAttempt) {
      setPlayingState(!audio.paused);
      return playAttempt;
    }

    playAttempt
      .then(() => {
        wantsToPlay = false;
        setPlayingState(true);
      })
      .catch(() => {
        wantsToPlay = true;
        setPlayingState(false);
      });

    return playAttempt;
  }

  function playFromUserGesture() {
    wantsToPlay = true;
    enableMusic();
    tryPlayNow();
  }

  function retryWhenReady() {
    if (!wantsToPlay || isPlaying) return;
    tryPlayNow();
  }

  startMusicWithSound = playFromUserGesture;

  audio.addEventListener('error', disableMusic);
  audio.addEventListener('loadedmetadata', enableMusic);
  audio.addEventListener('canplay', retryWhenReady);
  audio.addEventListener('canplaythrough', retryWhenReady);

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      wantsToPlay = false;
      audio.pause();
      setPlayingState(false);
    } else {
      playFromUserGesture();
    }
  });

  prefetchMusicBlob();

  async function prefetchMusicBlob() {
    try {
      const blob = window.__musicPrefetch
        ? await window.__musicPrefetch
        : await (await fetch(CONFIG.musicPath)).blob();

      blobUrl = URL.createObjectURL(blob);
      audio.src = blobUrl;
      audio.load();
      enableMusic();
      retryWhenReady();
    } catch (err) {
      const sourceEl = audio.querySelector('source');
      if (sourceEl && sourceEl.src) {
        audio.src = sourceEl.src;
      } else {
        audio.src = CONFIG.musicPath;
      }
      audio.load();
      enableMusic();
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   RSVP — Counter with one confirmation per IP (server-side)
   ═══════════════════════════════════════════════════════════════ */
function initRsvp() {
  const countEl = document.getElementById('rsvp-count');
  const btn = document.getElementById('rsvp-btn');
  const btnText = document.getElementById('rsvp-btn-text');
  const messageEl = document.getElementById('rsvp-message');
  const noteEl = document.getElementById('rsvp-note');
  const offlineEl = document.getElementById('rsvp-offline');

  if (!countEl || !btn) return;

  let isSubmitting = false;

  function setConfirmedState(count) {
    countEl.textContent = count;
    btn.disabled = true;
    btn.classList.add('rsvp-btn--done');
    if (btnText) btnText.textContent = 'تم التأكيد';
    if (noteEl) noteEl.hidden = true;
    if (messageEl) {
      messageEl.hidden = false;
      messageEl.textContent = 'شكراً! تم تأكيد حضورك بنجاح ♥';
      messageEl.classList.add('rsvp-message--success');
    }
  }

  function setAvailableState(count) {
    countEl.textContent = count;
    btn.disabled = false;
    btn.classList.remove('rsvp-btn--done');
    if (btnText) btnText.textContent = 'أؤكد حضوري';
    if (messageEl) messageEl.hidden = true;
    if (noteEl) noteEl.hidden = false;
  }

  function showOffline() {
    countEl.textContent = '—';
    btn.disabled = true;
    if (offlineEl) offlineEl.hidden = false;
    if (noteEl) noteEl.hidden = true;
  }

  async function fetchStatus() {
    const res = await fetch(CONFIG.rsvpApiUrl);
    if (!res.ok) throw new Error('fetch failed');
    return res.json();
  }

  async function loadRsvp() {
    try {
      const data = await fetchStatus();
      if (data.confirmed) {
        setConfirmedState(data.count);
      } else {
        setAvailableState(data.count);
      }
    } catch {
      showOffline();
    }
  }

  btn.addEventListener('click', async () => {
    if (isSubmitting || btn.disabled) return;

    isSubmitting = true;
    btn.disabled = true;
    if (btnText) btnText.textContent = 'جاري التأكيد...';

    try {
      const res = await fetch(CONFIG.rsvpApiUrl, { method: 'POST' });
      const data = await res.json();

      if (res.status === 409 || data.confirmed) {
        setConfirmedState(data.count);
        if (res.status === 409 && messageEl) {
          messageEl.hidden = false;
          messageEl.textContent = 'تم تأكيد حضورك مسبقاً ♥';
          messageEl.classList.add('rsvp-message--info');
        }
        return;
      }

      if (!res.ok) throw new Error('submit failed');

      setConfirmedState(data.count);
      countEl.classList.add('rsvp-counter-pop');
      setTimeout(() => countEl.classList.remove('rsvp-counter-pop'), 600);
    } catch {
      if (btnText) btnText.textContent = 'أؤكد حضوري';
      btn.disabled = false;
      if (messageEl) {
        messageEl.hidden = false;
        messageEl.textContent = 'حدث خطأ، حاول مرة أخرى';
        messageEl.classList.add('rsvp-message--error');
      }
    } finally {
      isSubmitting = false;
    }
  });

  loadRsvp();
}
