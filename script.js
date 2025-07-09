document.addEventListener("DOMContentLoaded", () => {
	// --- GSAP & ScrollTrigger Setup ---
	gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

	// --- Custom Cursor ---
	const cursor = document.querySelector(".cursor");
	const h1 = document.querySelector("#hero-title");

	window.addEventListener("mousemove", (e) => {
		gsap.to(cursor, {
			duration: 0.3,
			x: e.clientX,
			y: e.clientY,
			xPercent: -50,
			yPercent: -50,
			ease: "power3.out",
		});
	});

	if (h1) {
		h1.addEventListener("mouseenter", () => {
			cursor.classList.add("hover");
		});
		h1.addEventListener("mouseleave", () => {
			cursor.classList.remove("hover");
		});
	}

	// --- GSAP ANIMATIONS ---

	// 1. Hero Animation
	gsap.from(".hero-line > span", {
		y: "110%",
		duration: 1,
		ease: "power4.out",
		stagger: 0.15,
		delay: 0.2,
	});
	gsap.from("#hero-subtitle", { duration: 1, y: 30, autoAlpha: 0, ease: "power3.out", delay: 0.8 });

	// 2. Generic Scroll-Triggered Fade-in Animation
	gsap.utils.toArray(".gs_reveal").forEach((elem) => {
		gsap.fromTo(
			elem,
			{ y: 60, autoAlpha: 0 },
			{
				duration: 1.5,
				y: 0,
				autoAlpha: 1,
				ease: "power3.out",
				scrollTrigger: {
					trigger: elem,
					start: "top 95%",
					toggleActions: "play none none none",
				},
			}
		);
	});

	// 3. Staggered Card Animations on Scroll
	gsap.from(".skill-card", {
		scrollTrigger: {
			trigger: "#skills-grid",
			start: "top 80%",
		},
		y: 50,
		opacity: 0,
		duration: 0.8,
		ease: "power3.out",
		stagger: 0.2,
	});

	gsap.from(".project-card", {
		scrollTrigger: {
			trigger: "#projects",
			start: "top 70%",
		},
		y: 100,
		opacity: 0,
		duration: 1,
		ease: "power3.out",
		stagger: 0.2,
	});

	// --- Smooth Scrolling for Navigation ---
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			gsap.to(window, { duration: 1.5, scrollTo: this.getAttribute("href"), ease: "power2.inOut" });
		});
	});

	// --- Simple styling for project tags ---
	document.querySelectorAll(".tech-tag").forEach((tag) => {
		tag.classList.add(
			"inline-block",
			"bg-zinc-200",
			"rounded-full",
			"px-3",
			"py-1",
			"text-sm",
			"font-medium",
			"text-zinc-700"
		);
	});
});
