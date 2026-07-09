document.addEventListener("DOMContentLoaded", () => {
	// --- GSAP & ScrollTrigger Setup ---
	gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const isTouch = window.matchMedia("(max-width: 768px)").matches;

	// --- Event Console: the page instruments itself ---
	// Interactions get pushed to a local dataLayer and rendered in the corner
	// console, the same pattern a tag management setup uses in production.
	window.dataLayer = window.dataLayer || [];
	const consoleEl = document.getElementById("event-console");
	const MAX_CONSOLE_LINES = 4;

	function pushEvent(name, detail) {
		window.dataLayer.push({ event: name, ...(detail ? { detail } : {}) });
		if (!consoleEl) return;
		const line = document.createElement("div");
		line.className = "console-line";
		line.textContent = detail ? `${name} · ${detail}` : name;
		consoleEl.appendChild(line);
		while (consoleEl.children.length > MAX_CONSOLE_LINES) {
			consoleEl.removeChild(consoleEl.firstChild);
		}
	}

	// --- Custom Cursor: accent dot + trailing ring ---
	const cursorDot = document.querySelector(".cursor-dot");
	const cursorRing = document.querySelector(".cursor-ring");

	if (!isTouch && !reducedMotion) {
		window.addEventListener("mousemove", (e) => {
			gsap.set([cursorDot, cursorRing], { opacity: 1 });
			gsap.to(cursorDot, { duration: 0.1, x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 });
			gsap.to(cursorRing, {
				duration: 0.45,
				x: e.clientX,
				y: e.clientY,
				xPercent: -50,
				yPercent: -50,
				ease: "power3.out",
			});
		});

		document.querySelectorAll("a, .glow-card").forEach((el) => {
			el.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
			el.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
		});
	}

	// --- Typed hero eyebrow ---
	const typedEl = document.getElementById("typed-line");
	const typedText = 'utag_data.push({ customer_name: "Thomas Mathiasen" })';

	if (typedEl) {
		if (reducedMotion) {
			typedEl.textContent = typedText;
			pushEvent("portfolio_view");
		} else {
			let i = 0;
			const type = () => {
				typedEl.textContent = typedText.slice(0, i);
				if (i <= typedText.length) {
					i++;
					setTimeout(type, 28);
				} else {
					pushEvent("portfolio_view");
				}
			};
			setTimeout(type, 500);
		}
	}

	// --- Hero dot-grid canvas: faint grid that brightens near the cursor ---
	const canvas = document.getElementById("grid-canvas");
	if (canvas) {
		const ctx = canvas.getContext("2d");
		const SPACING = 28;
		const mouse = { x: -9999, y: -9999 };
		let width, height, dpr;

		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = canvas.offsetWidth;
			height = canvas.offsetHeight;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		window.addEventListener("resize", resize);

		canvas.parentElement.addEventListener("mousemove", (e) => {
			const rect = canvas.getBoundingClientRect();
			mouse.x = e.clientX - rect.left;
			mouse.y = e.clientY - rect.top;
		});
		canvas.parentElement.addEventListener("mouseleave", () => {
			mouse.x = -9999;
			mouse.y = -9999;
		});

		const draw = (time) => {
			ctx.clearRect(0, 0, width, height);
			for (let x = SPACING; x < width; x += SPACING) {
				for (let y = SPACING; y < height; y += SPACING) {
					const dist = Math.hypot(x - mouse.x, y - mouse.y);
					const proximity = Math.max(0, 1 - dist / 180);
					// A slow ambient shimmer so the grid feels alive even without the cursor
					const ambient = 0.03 + 0.02 * Math.sin(time / 1600 + x * 0.02 + y * 0.015);
					const alpha = ambient + proximity * 0.4;
					ctx.fillStyle =
						proximity > 0.05 ? `rgba(69, 224, 190, ${alpha})` : `rgba(232, 236, 243, ${alpha})`;
					ctx.beginPath();
					ctx.arc(x, y, 1, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		};

		if (reducedMotion) {
			draw(0); // static faint grid
		} else {
			let rafId;
			const loop = (time) => {
				draw(time);
				rafId = requestAnimationFrame(loop);
			};
			// Only animate while the hero is on screen
			ScrollTrigger.create({
				trigger: "#hero",
				start: "top bottom",
				end: "bottom top",
				onEnter: () => (rafId = requestAnimationFrame(loop)),
				onEnterBack: () => (rafId = requestAnimationFrame(loop)),
				onLeave: () => cancelAnimationFrame(rafId),
				onLeaveBack: () => cancelAnimationFrame(rafId),
			});
			rafId = requestAnimationFrame(loop);
		}
	}

	// --- Card spotlight: track the cursor for the border glow ---
	if (!isTouch) {
		document.querySelectorAll(".glow-card").forEach((card) => {
			card.addEventListener("mousemove", (e) => {
				const rect = card.getBoundingClientRect();
				card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
				card.style.setProperty("--my", `${e.clientY - rect.top}px`);
			});
		});
	}

	// --- Header: hairline + blur once scrolled ---
	const header = document.getElementById("site-header");
	const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	// --- GSAP ANIMATIONS (skipped entirely under reduced motion) ---
	if (!reducedMotion) {
		// 1. Hero Animation
		gsap.from(".hero-line > span", {
			y: "110%",
			duration: 1,
			ease: "power4.out",
			stagger: 0.15,
			delay: 0.2,
		});
		gsap.from("#hero-subtitle", { duration: 1, y: 30, autoAlpha: 0, ease: "power3.out", delay: 0.9 });

		// 2. Generic Scroll-Triggered Fade-in Animation
		gsap.utils.toArray(".gs_reveal").forEach((elem) => {
			gsap.fromTo(
				elem,
				{ y: 60, autoAlpha: 0 },
				{
					duration: 1.2,
					y: 0,
					autoAlpha: 1,
					ease: "power3.out",
					scrollTrigger: {
						trigger: elem,
						start: "top 92%",
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
			stagger: 0.12,
		});

		gsap.from(".project-card", {
			scrollTrigger: {
				trigger: "#projects",
				start: "top 70%",
			},
			y: 80,
			opacity: 0,
			duration: 1,
			ease: "power3.out",
			stagger: 0.12,
		});
	}

	// --- Instrumentation: section views ---
	["about", "experience", "education", "skills", "projects", "contact"].forEach((id) => {
		ScrollTrigger.create({
			trigger: `#${id}`,
			start: "top 60%",
			once: true,
			onEnter: () => pushEvent("section_view", id),
		});
	});

	// Fade the console out when the footer arrives so the two never overlap
	if (consoleEl) {
		ScrollTrigger.create({
			trigger: "footer",
			start: "top bottom",
			onEnter: () => gsap.to(consoleEl, { autoAlpha: 0, duration: 0.3 }),
			onLeaveBack: () => gsap.to(consoleEl, { autoAlpha: 1, duration: 0.3 }),
		});
	}

	// --- Instrumentation: scroll depth ---
	const depths = [25, 50, 75, 100];
	const fired = new Set();
	window.addEventListener(
		"scroll",
		() => {
			const scrollable = document.documentElement.scrollHeight - window.innerHeight;
			if (scrollable <= 0) return;
			const pct = Math.round((window.scrollY / scrollable) * 100);
			depths.forEach((d) => {
				if (pct >= d && !fired.has(d)) {
					fired.add(d);
					pushEvent("scroll_depth", `${d}%`);
				}
			});
		},
		{ passive: true }
	);

	// --- Instrumentation: outbound clicks ---
	document.querySelectorAll("[data-event]").forEach((el) => {
		el.addEventListener("click", () => pushEvent(el.dataset.event));
	});

	// --- Smooth Scrolling for Navigation ---
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			const href = this.getAttribute("href");
			pushEvent("nav_click", href.slice(1));

			if (window.innerWidth > 768 && !reducedMotion) {
				gsap.to(window, { duration: 1.2, scrollTo: href, ease: "power2.inOut" });
			} else {
				const target = document.querySelector(href);
				if (target) {
					target.scrollIntoView();
				}
			}
		});
	});
});
