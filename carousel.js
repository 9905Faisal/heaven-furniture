/* Chained Spring Arc Carousel — full-screen, scroll-linked version.
   The carousel wrapper is pinned (position: sticky) inside a tall
   .csa-scroll-stage. As the visitor scrolls down through that
   stage, scroll progress (0 to 1) is mapped directly to how far
   the cards have swept through the arc — "scroll down, images
   move" — instead of the original standalone demo's approach of
   capturing every wheel event on the whole page. */
document.addEventListener("DOMContentLoaded", () => {
  const GAP_ANGLE = 16;
  const CARD_COUNT = 10;

  const CARD_NAMES = [
    "BED",
    "CRADEL",
    "DINING TABLE",
    "DROWER",
    "SOFA",
    "OFFICE TABLE",
    "COFFEE TABLE",
    "SOFA",
    "MIRROR TABLE",
    "SHOWCASE"
  ];

  const stage = document.getElementById("csaStage");
  const wrapper = document.getElementById("csaWrapper");
  const pivot = document.getElementById("csaPivot");
  const cardsEl = Array.from(document.querySelectorAll(".csa-card"));
  const globalLabel = document.getElementById("csaGlobalLabel");
  const glNum = document.getElementById("csaGlNum");
  const glName = document.getElementById("csaGlName");
  const scrollHint = document.getElementById("csaScrollHint");

  if (
    !stage ||
    !wrapper ||
    !pivot ||
    cardsEl.length !== CARD_COUNT ||
    !globalLabel ||
    !glNum ||
    !glName
  ) {
    console.warn("Carousel: required elements are missing.");
    return;
  }

  let currentFocusedIndex = -1;
  let isIntro = true;
  let introFanning = false;
  let hasEnteredView = false;

  const cards = [];
  for (let i = 0; i < CARD_COUNT; i++) {
    cards.push({ angle: 0, velocity: 0 });
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function getRadius() {
    const value = getComputedStyle(wrapper)
      .getPropertyValue("--csa-radius")
      .trim();
    const radius = parseFloat(value);
    return Number.isFinite(radius) ? radius : 800;
  }

  // 0 at the top of the stage, 1 once it has been scrolled all
  // the way through (i.e. the sticky wrapper is about to release).
  function getScrollProgress() {
    const rect = stage.getBoundingClientRect();
    const total = stage.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    const scrolled = -rect.top;
    return Math.min(1, Math.max(0, scrolled / total));
  }

  if (prefersReducedMotion) {
    isIntro = false;
    pivot.style.animation = "none";
    pivot.style.opacity = "1";
    pivot.style.transform = "none";
    globalLabel.style.opacity = "1";
  } else if ("IntersectionObserver" in window) {
    const introObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEnteredView) {
            hasEnteredView = true;
            pivot.classList.add("csa-in-view");
            setTimeout(() => {
              introFanning = true;
            }, 1000);
            if (scrollHint) {
              setTimeout(() => {
                scrollHint.classList.add("csa-visible");
              }, 1400);
            }
            introObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    introObserver.observe(wrapper);
  } else {
    pivot.classList.add("csa-in-view");
    setTimeout(() => {
      introFanning = true;
    }, 1000);
  }

  function updatePhysics() {
    let targetCenter = 0;

    if (!isIntro) {
      const progress = getScrollProgress();
      targetCenter = progress * (CARD_COUNT - 1);

      if (scrollHint && progress > 0.02) {
        scrollHint.classList.remove("csa-visible");
      }
    }

    let allSettled = true;

    for (let i = 0; i < CARD_COUNT; i++) {
      const card = cards[i];
      const target = isIntro
        ? introFanning
          ? i * GAP_ANGLE
          : card.angle
        : (i - targetCenter) * GAP_ANGLE;

      const stiffness = isIntro ? 0.01 : 0.12;
      const damping = isIntro ? 0.88 : 0.72;

      const force = (target - card.angle) * stiffness;
      card.velocity += force;
      card.velocity *= damping;
      card.angle += card.velocity;

      if (
        isIntro &&
        (Math.abs(target - card.angle) > 0.5 || Math.abs(card.velocity) > 0.5)
      ) {
        allSettled = false;
      }
    }

    if (isIntro && introFanning && allSettled) {
      isIntro = false;
      globalLabel.style.opacity = "1";
    }

    const radius = getRadius();
    let minAbsAngle = Infinity;
    let closestIndex = 0;

    cardsEl.forEach((element, index) => {
      const angle = cards[index].angle;

      element.style.transform = `rotate(${angle}deg) translateY(-${radius}px)`;

      const absAngle = Math.abs(angle);

      if (absAngle < minAbsAngle) {
        minAbsAngle = absAngle;
        closestIndex = index;
      }
    });

    if (!isIntro && closestIndex !== currentFocusedIndex) {
      if (currentFocusedIndex >= 0) {
        cardsEl[currentFocusedIndex].classList.remove("focused");
      }

      currentFocusedIndex = closestIndex;
      cardsEl[currentFocusedIndex].classList.add("focused");

      glNum.textContent = String(closestIndex + 1).padStart(2, "0");
      glName.textContent = CARD_NAMES[closestIndex];
    }

    requestAnimationFrame(updatePhysics);
  }

  requestAnimationFrame(updatePhysics);
});
