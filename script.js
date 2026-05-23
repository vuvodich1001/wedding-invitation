(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const d = weddingData;

  const imgUrl = (path) => encodeURI(path);
  const isMobile = () => window.matchMedia('(max-width: 47.9375rem)').matches;
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dedupe = (paths) => {
    const seen = new Set();
    return paths.filter((p) => {
      const key = p.split('/').pop();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const albumImages = dedupe(d.anhAlbum).map(imgUrl);

  const populate = () => {
    $('#heroGroom').textContent = d.chuRe;
    $('#heroBride').textContent = d.coDau;
    $('#heroDate').textContent = `${d.thuNgay} · ${d.ngayCuoi}`;

    $('#loiNgoCover').src = imgUrl(d.anhBia);
    $('#loiNgoCover').decoding = 'async';
    $('#loiNgoText').textContent = d.loiNgo;
    $('#nhaTrai').textContent = `Ông ${d.nhaTrai.cha} & Bà ${d.nhaTrai.me}`;
    $('#nhaTraiDiaChi').textContent = d.nhaTrai.diaChi;
    $('#nhaGai').textContent = `Ông ${d.nhaGai.cha} & Bà ${d.nhaGai.me}`;
    $('#nhaGaiDiaChi').textContent = d.nhaGai.diaChi;

    $('#gioLe').textContent = d.gioLeTanHon;
    $('#ngayLe').textContent = `${d.thuNgay} · ${d.ngayCuoi}`;
    $('#amLichLe').textContent = d.amLich;
    $('#gioTiec').textContent = d.gioToChuc;
    $('#tenNhaHang').textContent = d.nhaHang;
    $('#tenSanh').textContent = d.sanh;
    $('#diaChiNhaHang').textContent = d.diaChi;
    $('#ngayTiec').textContent = `${d.thuNgay} · ${d.ngayCuoi}`;
    $('#amLichTiec').textContent = d.amLich;
    $('#donKhach').textContent = d.donKhach;
    $('#khaiTiec').textContent = d.khaiTiec;
    $('#mapBtn').href = d.googleMap;

    $('#footerNames').textContent = `${d.chuRe} & ${d.coDau}`;
    $('#footerNhaTrai').textContent =
      `Ông ${d.nhaTrai.cha} & Bà ${d.nhaTrai.me}`;
    $('#footerNhaTraiDiaChi').textContent = d.nhaTrai.diaChi;
    $('#footerNhaGai').textContent = `Ông ${d.nhaGai.cha} & Bà ${d.nhaGai.me}`;
    $('#footerNhaGaiDiaChi').textContent = d.nhaGai.diaChi;
  };

  // ===== HERO — lazy slides, blur chỉ desktop, preload kế tiếp =====
  const initHero = () => {
    const container = $('#heroSlides');
    const images = d.anhHero.map(imgUrl);
    const mobile = isMobile();
    const reduceMotion = prefersReducedMotion();
    let current = 0;
    let timer = null;
    const slides = [];

    const loadSlide = (index) => {
      const slide = slides[index];
      if (!slide || slide.dataset.loaded === '1') return;

      const src = images[index];
      const img = slide.querySelector('.hero__slide-img');
      if (img) {
        img.src = src;
        img.dataset.loaded = '1';
      }

      const blur = slide.querySelector('.hero__slide-blur');
      if (blur) blur.style.backgroundImage = `url("${src}")`;

      slide.dataset.loaded = '1';
    };

    const preloadNext = (fromIndex) => {
      loadSlide((fromIndex + 1) % images.length);
    };

    images.forEach((_, i) => {
      const slide = document.createElement('div');
      slide.className = `hero__slide${i === 0 ? ' active' : ''}`;

      if (!mobile) {
        const blur = document.createElement('div');
        blur.className = 'hero__slide-blur';
        slide.appendChild(blur);
      }

      const img = document.createElement('img');
      img.className = 'hero__slide-img';
      img.alt = 'Ảnh cưới';
      img.decoding = 'async';
      if (i === 0) {
        img.loading = 'eager';
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.loading = 'lazy';
      }
      slide.appendChild(img);
      container.appendChild(slide);
      slides.push(slide);
    });

    loadSlide(0);
    preloadNext(0);

    const goTo = (next) => {
      slides[current].classList.remove('active');
      current = next;
      slides[current].classList.add('active');
      loadSlide(current);
      preloadNext(current);
    };

    const startTimer = () => {
      if (reduceMotion || images.length < 2) return;
      stopTimer();
      timer = window.setInterval(
        () => goTo((current + 1) % images.length),
        mobile ? 7000 : 5500,
      );
    };

    const stopTimer = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopTimer() : startTimer();
    });
  };

  // ===== COUNTDOWN =====
  const initCountdown = () => {
    const [dd, mm, yyyy] = d.ngayCuoi.split('/');
    const target = new Date(`${yyyy}-${mm}-${dd}T${d.gioToChuc}:00`).getTime();
    const els = {
      days: $('#cdDays'),
      hours: $('#cdHours'),
      minutes: $('#cdMinutes'),
      seconds: $('#cdSeconds'),
    };

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      els.days.textContent = String(Math.floor(diff / 864e5)).padStart(2, '0');
      els.hours.textContent = String(
        Math.floor((diff % 864e5) / 36e5),
      ).padStart(2, '0');
      els.minutes.textContent = String(
        Math.floor((diff % 36e5) / 6e4),
      ).padStart(2, '0');
      els.seconds.textContent = String(
        Math.floor((diff % 6e4) / 1e3),
      ).padStart(2, '0');
    };

    tick();
    let interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.clearInterval(interval);
        interval = null;
      } else if (!interval) {
        tick();
        interval = window.setInterval(tick, 1000);
      }
    });
  };

  // ===== MAP — chỉ mount khi scroll tới =====
  const initMap = () => {
    if (!d.googleMapEmbed || d.googleMapEmbed.includes('!1s0x0')) return;

    const wrap = $('#mapWrap');
    if (!wrap) return;

    const mount = () => {
      if (wrap.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.src = d.googleMapEmbed;
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      wrap.appendChild(iframe);
    };

    if (!('IntersectionObserver' in window)) {
      mount();
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          mount();
          obs.disconnect();
        }
      },
      { rootMargin: '120px' },
    );
    obs.observe(wrap);
  };

  // ===== GALLERY — lazy load + reveal một observer =====
  const initGallery = () => {
    const grid = $('#albumGrid');
    const items = [];
    const frag = document.createDocumentFragment();

    albumImages.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'gallery__item';
      const img = document.createElement('img');
      img.dataset.src = src;
      img.alt = `Ảnh cưới ${i + 1}`;
      img.decoding = 'async';
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => openLb(i));
      frag.appendChild(item);
      items.push(item);
    });

    grid.appendChild(frag);

    const loadItem = (item) => {
      const img = item.querySelector('img');
      if (!img || img.dataset.loaded === '1') return;
      img.src = img.dataset.src;
      img.dataset.loaded = '1';
    };

    const cols = () =>
      window.innerWidth < 768 ? 2 : window.innerWidth >= 1100 ? 4 : 3;

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => {
        loadItem(item);
        item.classList.add('vis');
      });
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const item = e.target;
          loadItem(item);
          const i = items.indexOf(item);
          if (i >= 0) {
            item.style.transitionDelay = `${(i % cols()) * 0.06}s`;
          }
          item.classList.add('vis');
          obs.unobserve(item);
        });
      },
      { threshold: 0.01, rootMargin: '180px 0px' },
    );

    items.forEach((item) => obs.observe(item));
  };

  // ===== LIGHTBOX =====
  let lbIdx = 0;
  const lbPreloaded = new Set();

  const preloadLb = (index) => {
    const src = albumImages[index];
    if (!src || lbPreloaded.has(src)) return;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    lbPreloaded.add(src);
  };

  const openLb = (i) => {
    lbIdx = i;
    $('#lightbox').classList.add('open');
    $('#lightbox').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderLb();
    preloadLb((lbIdx + 1) % albumImages.length);
    preloadLb((lbIdx - 1 + albumImages.length) % albumImages.length);
  };

  const closeLb = () => {
    $('#lightbox').classList.remove('open');
    $('#lightbox').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const renderLb = () => {
    $('#lbImg').src = albumImages[lbIdx];
    $('#lbCount').textContent = `${lbIdx + 1} / ${albumImages.length}`;
    lbPreloaded.add(albumImages[lbIdx]);
  };

  const lbPrev = () => {
    lbIdx = (lbIdx - 1 + albumImages.length) % albumImages.length;
    renderLb();
    preloadLb((lbIdx - 1 + albumImages.length) % albumImages.length);
  };

  const lbNext = () => {
    lbIdx = (lbIdx + 1) % albumImages.length;
    renderLb();
    preloadLb((lbIdx + 1) % albumImages.length);
  };

  const initLb = () => {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', lbPrev);
    $('#lbNext').addEventListener('click', lbNext);

    $('#lightbox').addEventListener('click', (e) => {
      if (!e.target.closest('.lb__img') && !e.target.closest('.lb__btn'))
        closeLb();
    });

    document.addEventListener('keydown', (e) => {
      if (!$('#lightbox').classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'ArrowRight') lbNext();
    });

    let tx = 0;
    $('#lightbox').addEventListener(
      'touchstart',
      (e) => {
        tx = e.changedTouches[0].screenX;
      },
      { passive: true },
    );
    $('#lightbox').addEventListener(
      'touchend',
      (e) => {
        const dx = tx - e.changedTouches[0].screenX;
        if (Math.abs(dx) > 50) dx > 0 ? lbNext() : lbPrev();
      },
      { passive: true },
    );
  };

  // ===== REVEAL =====
  const initReveal = () => {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach((el) => el.classList.add('vis'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
    );
    $$('.reveal').forEach((el) => obs.observe(el));
  };

  // ===== PETALS — pool tái sử dụng, tắt trên mobile =====
  const initPetals = () => {
    if (isMobile() || prefersReducedMotion()) return;

    const box = $('#petals-container');
    if (!box) return;

    const poolSize = 8;
    const pool = Array.from({ length: poolSize }, () => {
      const p = document.createElement('div');
      p.className = 'petal';
      box.appendChild(p);
      return p;
    });

    const resetPetal = (p) => {
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${12 + Math.random() * 6}s`;
      const size = 5 + Math.random() * 6;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.animationName = 'none';
      void p.offsetWidth;
      p.style.animationName = 'drift';
    };

    pool.forEach((p, i) => {
      p.addEventListener(
        'animationiteration',
        () => resetPetal(p),
        { passive: true },
      );
      window.setTimeout(() => resetPetal(p), i * 800);
    });
  };

  const initScroll = () => {
    $('#heroCta').addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('#loi-ngo').scrollIntoView({ behavior: 'smooth' });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    populate();
    initHero();
    initCountdown();
    initReveal();
    initGallery();
    initLb();
    initMap();
    initPetals();
    initScroll();
  });
})();
