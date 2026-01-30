(() => {
  const bg = document.querySelector(".page-bg");
  if (!bg) return;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return;

  let raf = 0;

  const update = () => {
    raf = 0;
    const y = window.scrollY || window.pageYOffset || 0;
    bg.style.setProperty("--page-scroll", `${y}px`);
  };

  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
})();

