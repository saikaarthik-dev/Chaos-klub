/* global gsap, ScrollTrigger, Lenis */

(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Lenis smooth scrolling
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // Anchor smoothing
  document.addEventListener("click", (e) => {
    const anchor = e.target?.closest?.("a[href^='#']");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -84 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });

    // Close mobile nav after click
    const navMenu = document.getElementById("navMenu");
    if (navMenu?.classList?.contains("show")) {
      const collapse = bootstrap?.Collapse?.getOrCreateInstance?.(navMenu);
      collapse?.hide?.();
    }
  });

  // GSAP animations
  if (typeof gsap === "undefined") return;
  gsap.defaults({ ease: "power2.out" });

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Hero intro (calm, cinematic)
  const heroTl = gsap.timeline({ defaults: { duration: 0.9 } });
  heroTl
    .from(".site-header .navbar", { y: -14, opacity: 0, duration: 0.8 })
    .from(".eyebrow", { y: 12, opacity: 0 }, "-=0.45")
    .from(".display-title", { y: 18, opacity: 0 }, "-=0.55")
    .from(".lead-subtitle", { y: 14, opacity: 0 }, "-=0.55")
    .from(".hero .btn", { y: 10, opacity: 0, stagger: 0.08, duration: 0.75 }, "-=0.55")
    .from(".hero-panel", { y: 14, opacity: 0, duration: 0.85 }, "-=0.7")
    .from(".hero-scroll-hint", { opacity: 0, duration: 0.9 }, "-=0.8");

  // Slow ambient shape drift
  const drift = (selector, opts) => {
    const el = document.querySelector(selector);
    if (!el) return;
    gsap.to(el, {
      x: opts.x,
      y: opts.y,
      duration: opts.duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  };
  if (!prefersReducedMotion) {
    drift(".shape-1", { x: 26, y: 18, duration: 10.5 });
    drift(".shape-2", { x: -22, y: 16, duration: 12.0 });
    drift(".shape-3", { x: 18, y: -20, duration: 13.0 });
    gsap.to(".scroll-line", { scaleY: 1.15, transformOrigin: "50% 50%", duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  // Scroll reveals
  const revealEls = gsap.utils.toArray(".reveal");
  gsap.set(revealEls, { opacity: 0, y: 22 });

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.batch(revealEls, {
      start: "top 84%",
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: "power2.out" }),
      once: true,
    });
  } else {
    gsap.to(revealEls, { opacity: 1, y: 0, duration: 0.9, stagger: 0.04 });
  }

  // Timeline line drawing
  const timelinePath = document.getElementById("timelinePath");
  if (timelinePath && typeof ScrollTrigger !== "undefined") {
    const length = timelinePath.getTotalLength();
    timelinePath.style.strokeDasharray = `${length}`;
    timelinePath.style.strokeDashoffset = `${length}`;

    gsap.to(timelinePath, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline",
        start: "top 78%",
        end: "bottom 30%",
        scrub: true,
      },
    });
  }

  // Registration form: Bootstrap validation + subtle success animation
  const form = document.getElementById("registrationForm");
  const successPanel = document.getElementById("successPanel");
  const successReset = document.getElementById("successReset");

  const showSuccess = () => {
    if (!successPanel) return;
    successPanel.hidden = false;

    // Animate checkmark (stroke reveal)
    const circle = successPanel.querySelector(".success-circle");
    const check = successPanel.querySelector(".success-check");
    if (circle && check) {
      const circleLen = circle.getTotalLength?.() ?? 0;
      const checkLen = check.getTotalLength?.() ?? 0;
      circle.style.strokeDasharray = `${circleLen}`;
      circle.style.strokeDashoffset = `${circleLen}`;
      check.style.strokeDasharray = `${checkLen}`;
      check.style.strokeDashoffset = `${checkLen}`;

      gsap.fromTo(
        successPanel,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
      gsap.to(circle, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" });
      gsap.to(check, { strokeDashoffset: 0, duration: 0.55, ease: "power2.out", delay: 0.12 });
    } else {
      gsap.fromTo(successPanel, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 });
    }
  };

  const resetSuccess = () => {
    if (!successPanel) return;
    successPanel.hidden = true;
    if (form) form.reset();
    form?.classList?.remove("was-validated");
  };

  if (successReset) successReset.addEventListener("click", resetSuccess);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        gsap.to(form, { x: -3, duration: 0.06, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" });
        return;
      }

      form.classList.add("was-validated");
      showSuccess();
    });
  }
})();
