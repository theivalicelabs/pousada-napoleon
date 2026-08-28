(() => {
  const WHATSAPP_PHONE = "5519982737717";
  const WHATSAPP_MESSAGE =
    "Olá! Vim pelo site www.pousadanapoleon.com.br e gostaria de informações sobre hospedagem ou reserva.";
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  document.querySelectorAll('a[href*="wa.me/5519982737717"]').forEach((link) => {
    link.href = WHATSAPP_URL;
  });

  const header = document.querySelector(".header");
  const navToggle = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#nav");
  const navOverlay = document.querySelector("#nav-overlay");
  const navLinks = document.querySelectorAll(".nav__link[href^='#']");
  const sections = [...document.querySelectorAll("main section[id]")];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ========================================
     Mobile navigation
     ======================================== */
  const isMobileNav = () => window.matchMedia("(max-width: 768px)").matches;
  const EDGE_PX = 28;
  const SWIPE_PX = 56;

  const setMenuOpen = (open) => {
    if (!nav || !navToggle || !navOverlay) return;
    if (open && !isMobileNav()) return;

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);

    if (open) {
      navOverlay.hidden = false;
      requestAnimationFrame(() => navOverlay.classList.add("is-open"));
      document.body.style.overflow = "hidden";
    } else {
      navOverlay.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(() => {
        if (!navOverlay.classList.contains("is-open")) navOverlay.hidden = true;
      }, 350);
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const isMenuOpen = () => Boolean(nav?.classList.contains("is-open"));

  if (navToggle && nav && navOverlay) {
    navToggle.addEventListener("click", () => {
      setMenuOpen(!isMenuOpen());
    });

    navOverlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (!isMobileNav()) closeMenu();
    });

    /* Edge swipe open (left edge → right) / swipe close (right → left) */
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeFromEdge = false;

    document.addEventListener(
      "touchstart",
      (event) => {
        if (!isMobileNav() || event.touches.length !== 1) return;
        const touch = event.touches[0];
        swipeStartX = touch.clientX;
        swipeStartY = touch.clientY;
        swipeFromEdge = !isMenuOpen() && swipeStartX <= EDGE_PX;
      },
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      (event) => {
        if (!isMobileNav() || event.changedTouches.length !== 1) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - swipeStartX;
        const dy = touch.clientY - swipeStartY;
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) <= Math.abs(dy)) return;

        if (!isMenuOpen() && swipeFromEdge && dx > 0) {
          setMenuOpen(true);
          return;
        }

        if (isMenuOpen() && dx < 0) {
          closeMenu();
        }
      },
      { passive: true }
    );
  }

  /* ========================================
     Active nav link on scroll
     ======================================== */
  const setActiveLink = () => {
    if (!sections.length) return;

    const headerOffset = (header?.offsetHeight || 72) + 8;
    const viewportBottom = window.innerHeight;
    let currentId = sections[0].id;

    const contactSection = document.querySelector("#contato");
    if (contactSection) {
      const contactRect = contactSection.getBoundingClientRect();
      if (contactRect.top < viewportBottom * 0.72) {
        currentId = "contato";
      } else {
        for (const section of sections) {
          if (section.id === "contato") continue;
          const top = section.getBoundingClientRect().top;
          if (top - headerOffset <= 0) currentId = section.id;
        }
      }
    } else {
      for (const section of sections) {
        const top = section.getBoundingClientRect().top;
        if (top - headerOffset <= 0) currentId = section.id;
      }
    }

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  /* ========================================
     Smooth scroll
     ======================================== */
  const scrollToHash = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;

    const behavior = prefersReducedMotion ? "auto" : "smooth";

    if (hash === "#inicio") {
      window.scrollTo({ top: 0, behavior });
    } else {
      const headerOffset = header?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior });
    }

    history.pushState(null, "", hash);
    setActiveLink();
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      if (!document.querySelector(hash)) return;

      event.preventDefault();

      const menuWasOpen = isMenuOpen();
      if (menuWasOpen) closeMenu();

      /* After unlock overflow, defer scroll so mobile actually moves */
      if (menuWasOpen) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => scrollToHash(hash));
        });
      } else {
        scrollToHash(hash);
      }
    });
  });

  /* ========================================
     Reveal on scroll
     ======================================== */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ========================================
     Gallery carousel
     ======================================== */
  const carousel = document.querySelector("[data-carousel]");
  const track = carousel?.querySelector(".gallery__track");
  const slides = carousel ? [...carousel.querySelectorAll(".gallery__slide")] : [];
  const prevBtn = carousel?.querySelector("[data-carousel-prev]");
  const nextBtn = carousel?.querySelector("[data-carousel-next]");
  const dotsRoot = carousel?.querySelector(".gallery__dots");
  const viewport = carousel?.querySelector(".gallery__viewport");

  let index = 0;
  let slidesPerView = 3;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let dragOffset = 0;
  let hasDragged = false;

  const getGap = () => {
    if (!track) return 24;
    const styles = getComputedStyle(track);
    return parseFloat(styles.columnGap || styles.gap) || 24;
  };

  const getSlideWidth = () => {
    if (!slides.length) return 0;
    return slides[0].getBoundingClientRect().width + getGap();
  };

  const maxIndex = () => Math.max(0, slides.length - slidesPerView);

  const updateDots = () => {
    if (!dotsRoot) return;
    const buttons = [...dotsRoot.querySelectorAll("button")];
    buttons.forEach((btn, i) => {
      const active = i === index;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  };

  const renderDots = () => {
    if (!dotsRoot) return;
    dotsRoot.innerHTML = "";
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__dot";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `Ir para o grupo ${i + 1}`);
      btn.addEventListener("click", () => goTo(i));
      dotsRoot.appendChild(btn);
    }
    updateDots();
  };

  const applyTransform = (animate = true) => {
    if (!track) return;
    if (!animate || prefersReducedMotion) track.style.transition = "none";
    else track.style.transition = "";
    currentTranslate = -index * getSlideWidth();
    track.style.transform = `translate3d(${currentTranslate + dragOffset}px, 0, 0)`;
  };

  const goTo = (nextIndex) => {
    index = Math.max(0, Math.min(nextIndex, maxIndex()));
    dragOffset = 0;
    applyTransform(true);
    updateDots();
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === maxIndex();
  };

  const updateSlidesPerView = () => {
    const width = window.innerWidth;
    if (width <= 768) slidesPerView = 1;
    else if (width <= 1100) slidesPerView = 2;
    else slidesPerView = 3;
    if (carousel) carousel.style.setProperty("--slides-per-view", String(slidesPerView));
    if (index > maxIndex()) index = maxIndex();
    renderDots();
    goTo(index);
  };

  if (carousel && track && slides.length) {
    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    const onPointerDown = (clientX) => {
      isDragging = true;
      hasDragged = false;
      startX = clientX;
      dragOffset = 0;
      viewport?.classList.add("is-dragging");
      track.style.transition = "none";
    };

    const onPointerMove = (clientX) => {
      if (!isDragging) return;
      dragOffset = clientX - startX;
      if (Math.abs(dragOffset) > 6) hasDragged = true;
      track.style.transform = `translate3d(${currentTranslate + dragOffset}px, 0, 0)`;
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      viewport?.classList.remove("is-dragging");
      const threshold = getSlideWidth() * 0.22;
      if (dragOffset < -threshold) goTo(index + 1);
      else if (dragOffset > threshold) goTo(index - 1);
      else goTo(index);
      window.setTimeout(() => {
        hasDragged = false;
      }, 40);
    };

    viewport?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onPointerDown(e.clientX);
    });
    window.addEventListener("mousemove", (e) => onPointerMove(e.clientX));
    window.addEventListener("mouseup", onPointerUp);

    viewport?.addEventListener(
      "touchstart",
      (e) => onPointerDown(e.touches[0].clientX),
      { passive: true }
    );
    viewport?.addEventListener(
      "touchmove",
      (e) => onPointerMove(e.touches[0].clientX),
      { passive: true }
    );
    viewport?.addEventListener("touchend", onPointerUp);

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
  }

  /* ========================================
     Global lightbox (hero, history, gallery)
     ======================================== */
  const lightbox = document.querySelector("#lightbox");
  const lightboxImg = lightbox?.querySelector("#lightbox-img");
  const lightboxCaption = lightbox?.querySelector("#lightbox-caption");
  const lightboxCounter = lightbox?.querySelector("#lightbox-counter");
  const lightboxCloseBtns = lightbox ? [...lightbox.querySelectorAll("[data-lightbox-close]")] : [];
  const lightboxPrev = lightbox?.querySelector("[data-lightbox-prev]");
  const lightboxNext = lightbox?.querySelector("[data-lightbox-next]");

  const contentImages = [
    ...document.querySelectorAll(
      ".hero__media img, .history__figure img, .gallery__slide img"
    ),
  ];

  let lbIndex = 0;
  let lbTouchX = 0;
  let lightboxOpen = false;

  const updateLightbox = () => {
    const img = contentImages[lbIndex];
    if (!img || !lightboxImg) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "Imagem ampliada";
    if (lightboxCaption) lightboxCaption.textContent = img.alt || "";
    if (lightboxCounter) {
      lightboxCounter.textContent = `${lbIndex + 1} / ${contentImages.length}`;
    }
  };

  const openLightbox = (startIndex) => {
    if (!lightbox || !contentImages.length) return;
    if (nav?.classList.contains("is-open")) closeMenu();

    lbIndex = Math.max(0, Math.min(startIndex, contentImages.length - 1));
    updateLightbox();
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightboxOpen = true;
    lightbox.querySelector(".lightbox__close")?.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxOpen) return;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxOpen = false;
  };

  const stepLightbox = (delta) => {
    if (!contentImages.length) return;
    lbIndex = (lbIndex + delta + contentImages.length) % contentImages.length;
    updateLightbox();
  };

  contentImages.forEach((img, i) => {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", `Ampliar imagem: ${img.alt || "foto"}`);

    img.addEventListener("click", (event) => {
      if (img.closest(".gallery__slide") && hasDragged) {
        event.preventDefault();
        return;
      }
      openLightbox(i);
    });

    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(i);
      }
    });
  });

  lightboxCloseBtns.forEach((btn) => btn.addEventListener("click", closeLightbox));
  lightboxPrev?.addEventListener("click", () => stepLightbox(-1));
  lightboxNext?.addEventListener("click", () => stepLightbox(1));

  document.addEventListener("keydown", (event) => {
    if (!lightboxOpen) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });

  lightbox?.querySelector(".lightbox__figure")?.addEventListener(
    "touchstart",
    (event) => {
      lbTouchX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lightbox?.querySelector(".lightbox__figure")?.addEventListener(
    "touchend",
    (event) => {
      if (!lightboxOpen) return;
      const dx = event.changedTouches[0].clientX - lbTouchX;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) stepLightbox(1);
      else stepLightbox(-1);
    },
    { passive: true }
  );

  /* ========================================
     Header elevation + active link
     ======================================== */
  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
    setActiveLink();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
