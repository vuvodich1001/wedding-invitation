(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const d = weddingData;

  // ===== DEDUPLICATE =====
  const dedupe = (paths) => {
    const seen = new Set();
    return paths.filter((p) => {
      const key = p.split('/').pop();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const albumImages = dedupe(d.anhAlbum);

  // ===== POPULATE =====
  const populate = () => {
    $('#heroGroom').textContent = d.chuRe;
    $('#heroBride').textContent = d.coDau;
    $('#heroDate').textContent = `${d.thuNgay} · ${d.ngayCuoi}`;

    $('#loiNgoCover').src = d.anhBia;
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

  // ===== HERO SLIDESHOW =====
  const initHero = () => {
    const container = $('#heroSlides');
    const images = d.anhHero;
    let current = 0;
    const slides = [];

    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = `hero__slide${i === 0 ? ' active' : ''}`;

      const blur = document.createElement('div');
      blur.className = 'hero__slide-blur';
      blur.style.backgroundImage = `url(${src})`;

      const img = document.createElement('img');
      img.className = 'hero__slide-img';
      img.alt = 'Ảnh cưới';
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.src = src;

      slide.appendChild(blur);
      slide.appendChild(img);
      container.appendChild(slide);
      slides.push(slide);
    });

    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5500);
  };

  // ===== COUNTDOWN =====
  const initCountdown = () => {
    const [dd, mm, yyyy] = d.ngayCuoi.split('/');
    const target = new Date(`${yyyy}-${mm}-${dd}T${d.gioToChuc}:00`).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      $('#cdDays').textContent = String(Math.floor(diff / 864e5)).padStart(
        2,
        '0',
      );
      $('#cdHours').textContent = String(
        Math.floor((diff % 864e5) / 36e5),
      ).padStart(2, '0');
      $('#cdMinutes').textContent = String(
        Math.floor((diff % 36e5) / 6e4),
      ).padStart(2, '0');
      $('#cdSeconds').textContent = String(
        Math.floor((diff % 6e4) / 1e3),
      ).padStart(2, '0');
    };

    tick();
    setInterval(tick, 1000);
  };

  // ===== MAP =====
  const initMap = () => {
    if (!d.googleMapEmbed || d.googleMapEmbed.includes('!1s0x0')) return;
    const wrap = $('#mapWrap');
    const iframe = document.createElement('iframe');
    iframe.src = d.googleMapEmbed;
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    wrap.appendChild(iframe);
  };

  // ===== GALLERY =====
  const initGallery = () => {
    const grid = $('#albumGrid');
    albumImages.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'gallery__item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Ảnh cưới ${i + 1}`;
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => openLb(i));
      grid.appendChild(item);
    });
  };

  // ===== LIGHTBOX =====
  let lbIdx = 0;

  const openLb = (i) => {
    lbIdx = i;
    $('#lightbox').classList.add('open');
    $('#lightbox').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderLb();
  };

  const closeLb = () => {
    $('#lightbox').classList.remove('open');
    $('#lightbox').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const renderLb = () => {
    $('#lbImg').src = albumImages[lbIdx];
    $('#lbCount').textContent = `${lbIdx + 1} / ${albumImages.length}`;
  };

  const lbPrev = () => {
    lbIdx = (lbIdx - 1 + albumImages.length) % albumImages.length;
    renderLb();
  };
  const lbNext = () => {
    lbIdx = (lbIdx + 1) % albumImages.length;
    renderLb();
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
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    $$('.reveal').forEach((el) => obs.observe(el));
  };

  // ===== GALLERY STAGGER =====
  const initGalleryReveal = () => {
    const items = $$('.gallery__item');
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = [...items].indexOf(e.target);
            const cols =
              window.innerWidth < 768 ? 2 : window.innerWidth >= 1100 ? 4 : 3;
            e.target.style.transitionDelay = `${(i % cols) * 0.08}s`;
            e.target.classList.add('vis');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.04, rootMargin: '0px 0px -20px 0px' },
    );
    items.forEach((item) => obs.observe(item));
  };

  // ===== PETALS =====
  const initPetals = () => {
    const box = $('#petals-container');
    const n = window.innerWidth < 768 ? 6 : 10;
    const spawn = () => {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${11 + Math.random() * 7}s`;
      const size = `${5 + Math.random() * 7}px`;
      p.style.width = size;
      p.style.height = size;
      box.appendChild(p);
      p.addEventListener('animationend', () => {
        p.remove();
        spawn();
      });
    };
    for (let i = 0; i < n; i++) setTimeout(spawn, i * 900);
  };

  // ===== SCROLL =====
  const initScroll = () => {
    $('#heroCta').addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('#loi-ngo').scrollIntoView({ behavior: 'smooth' });
    });
  };

  // ===== BOOT =====
  document.addEventListener('DOMContentLoaded', () => {
    populate();
    initHero();
    initCountdown();
    initMap();
    initGallery();
    initLb();
    initReveal();
    initPetals();
    initScroll();
    requestAnimationFrame(initGalleryReveal);
  });
})();
