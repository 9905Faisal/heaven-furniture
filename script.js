/* HEAVEN FURNITURE MART — bug-fixed interactions */
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const loader = document.querySelector(".loader");
  const navbar = document.querySelector(".navbar");
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  const heroImage = document.querySelector(".hero-image img");
  const year = document.getElementById("year");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loader
  window.setTimeout(() => {
    if (loader) loader.classList.add("hide");
  }, reduceMotion ? 0 : 700);

  // Current year
  if (year) year.textContent = new Date().getFullYear();

  // Navbar
  const updateNavbar = () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 60);
  };
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  // Mobile menu with accessible state
  const closeMenu = () => {
    mobileMenu?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    mobileMenu?.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");
  };

  menuBtn?.addEventListener("click", () => {
    const isOpen = mobileMenu?.classList.toggle("open") ?? false;
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    mobileMenu?.setAttribute("aria-hidden", String(!isOpen));
    body.classList.toggle("menu-open", isOpen);
  });

  mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Scroll reveal
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("show"));
  }

  // Custom cursor
  if (cursor && cursorDot && window.matchMedia("(pointer:fine)").matches && !reduceMotion) {
    document.addEventListener("mousemove", event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursorDot.style.left = `${event.clientX}px`;
      cursorDot.style.top = `${event.clientY}px`;
    });

    document.querySelectorAll("a, button, .collection-card").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
    });
  }

  // Lightweight hero parallax; disabled for reduced motion and mobile
  if (heroImage && !reduceMotion) {
    const parallax = () => {
      if (window.innerWidth > 700 && window.scrollY < window.innerHeight) {
        heroImage.style.transform = `scale(1) translateY(${window.scrollY * 0.08}px)`;
      } else {
        heroImage.style.transform = "";
      }
    };
    window.addEventListener("scroll", parallax, { passive: true });
  }

  // Desktop collection tilt
  if (!reduceMotion) {
    document.querySelectorAll(".collection-card").forEach(card => {
      card.addEventListener("mousemove", event => {
        if (window.innerWidth < 900) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${y * -2}deg) rotateY(${x * 2}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Smooth anchors; browser handles hash changes correctly
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.pushState(null, "", id);
    });
  });

  // Active desktop nav
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        ));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Typewriter effect: types the quote out character by character,
  // like it's being typed live, once it scrolls into view.
  const typeTargets = document.querySelectorAll(".js-typewriter");
  if (typeTargets.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      typeTargets.forEach(el => {
        const fullText = el.textContent.trim();
        el.textContent = "";
        el.classList.add("is-typing");

        const typeObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            typeObserver.unobserve(entry.target);

            const speed = 65; // ms per character
            let i = 0;

            const typeNextChar = () => {
              i += 1;
              el.textContent = fullText.slice(0, i);

              if (i < fullText.length) {
                window.setTimeout(typeNextChar, speed);
              } else {
                el.classList.remove("is-typing");
                el.classList.add("done-typing");
              }
            };

            window.setTimeout(typeNextChar, 200);
          });
        }, { threshold: 0.4 });

        typeObserver.observe(el);
      });
    } else {
      // Reduced motion or no IntersectionObserver support: show
      // the full quote immediately, no animation.
      typeTargets.forEach(el => el.classList.add("done-typing"));
    }
  }
});
