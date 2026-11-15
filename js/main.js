import { animate, inView, stagger } from "./vendor/motion-11.11.13.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const EASE = [0.23, 1, 0.32, 1];

window.__moraReady = true;

const nav = $("#nav");
const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();
$("#year").textContent = new Date().getFullYear();

const manifesto = $("#manifesto");
const fullText = manifesto.textContent.replace(/\s+/g, " ").trim();
const wrapWords = (text) =>
  text.replace(/\S+/g, (w) => `<span class="w">${w}</span>`);
manifesto.innerHTML = [...manifesto.childNodes]
  .map((n) => (n.nodeType === 3 ? wrapWords(n.textContent.replace(/\s+/g, " ")) : `<mark>${wrapWords(n.textContent)}</mark>`))
  .join("")
  .trim();
manifesto.setAttribute("aria-label", fullText);
[...manifesto.children].forEach((c) => c.setAttribute("aria-hidden", "true"));

if (reduceMotion || !window.gsap) {
  root.classList.remove("motion-ready");
} else {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "expo.out" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to(".hero__title .line > span", { y: 0, duration: 0.6, stagger: 0.05 })
    .fromTo(".stage__disc", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5 }, 0)
    .fromTo(
      ".stage__item",
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.06 },
      0.08,
    )
    .fromTo(
      ".sticker",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, rotation: (i) => (i ? 4 : -4), duration: 0.4, stagger: 0.05, ease: "back.out(1.8)" },
      0.4,
    )
    .fromTo("[data-hero-fade]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04 }, 0.25);

  tl.add(() => {
    $$(".sticker").forEach((el, i) => {
      gsap.to(el, { y: i ? 6 : -6, duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.fromTo(
        el,
        { rotation: i ? 4 : -4 },
        { rotation: i ? -4 : 4, duration: 1.9 + i * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 },
      );
    });
  });

  if (finePointer) {
    const stage = $(".hero__stage");
    const layers = $$("[data-depth]", stage).map((el) => ({
      depth: parseFloat(el.dataset.depth),
      x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      y: el.classList.contains("sticker") ? null : gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    }));
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
      layers.forEach((l) => {
        l.x(nx * 22 * l.depth);
        l.y && l.y(ny * 16 * l.depth);
      });
    });
    hero.addEventListener("pointerleave", () => layers.forEach((l) => (l.x(0), l.y && l.y(0))));
  }

  gsap.to(".hero__stage", {
    yPercent: 10,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  const mWords = $$("#manifesto .w");
  const marks = $$("#manifesto mark");
  const STEP = 0.1;
  gsap.set(mWords, { opacity: 0.18 });
  gsap.set(marks, { backgroundSize: "0% 100%", color: "#e8cfaf" });
  const mtl = gsap.timeline({
    scrollTrigger: {
      trigger: ".manifesto",
      start: "top 65%",
      end: "bottom 70%",
      scrub: 0.6,
    },
  });
  mWords.forEach((w, i) => mtl.to(w, { opacity: 1, duration: 0.3, ease: "none" }, i * STEP));
  marks.forEach((m) => {
    const inner = $$(".w", m);
    const at = mWords.indexOf(inner[0]) * STEP + 0.1;
    const dur = Math.max(0.35, inner.length * STEP);
    mtl.to(m, { backgroundSize: "100% 100%", duration: dur, ease: "power1.inOut" }, at);
    mtl.to(m, { color: "#0b0b16", duration: dur * 0.6, ease: "none" }, at + dur * 0.2);
  });

  $$("[data-reveal]").forEach((el) => {
    inView(
      el,
      () => {
        const media = $$(".product__media img", el);
        animate(el, { opacity: [0, 1] }, { duration: 0.4, ease: EASE });
        if (media.length) {
          animate(media, { y: [32, 0], opacity: [0, 1] }, { duration: 0.6, delay: stagger(0.08), ease: EASE });
        }
        animate(
          $$(".product__body > *, .more > *", el),
          { opacity: [0, 1], y: [16, 0] },
          { duration: 0.6, delay: stagger(0.05, { startDelay: 0.12 }), ease: EASE },
        );
      },
      { margin: "0px 0px -15% 0px" },
    );
  });
}

if (!reduceMotion) {
  const ctaLogo = $(".cta__logo");
  inView(
    ctaLogo,
    () => {
      animate(ctaLogo, { opacity: [0, 1] }, { duration: 0.35 });
      animate(ctaLogo, { scale: [0.55, 1] }, { type: "spring", duration: 0.9, bounce: 0.35 });
    },
    { margin: "0px 0px -20% 0px" },
  );
}

if (!reduceMotion && finePointer) {
  $$(".btn").forEach((btn) => {
    btn.addEventListener("pointerenter", () =>
      animate(btn, { scale: 1.04 }, { type: "spring", stiffness: 400, damping: 18 }),
    );
    btn.addEventListener("pointerleave", () =>
      animate(btn, { scale: 1 }, { type: "spring", stiffness: 400, damping: 22 }),
    );
  });
}
