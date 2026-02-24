export function parallaxSlide() {
    const section = document.querySelector('.showcase--stills_block');
    if (!section) return;

    const upCols = section.querySelectorAll('.cards-wrapper.upslide');
    const downCols = section.querySelectorAll('.cards-wrapper.downslide');

    const TRAVEL = 120;
    let ticking = false;

    function getProgress() {
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;
        const total = windowH + rect.height;
        const current = windowH - rect.top;
        return Math.min(Math.max(current / total, 0), 1);
    }

    function applyParallax() {
        const p = getProgress();
        const offset = (p - 0.5) * TRAVEL * 2;
        upCols.forEach(col => { col.style.transform = `translateY(${-offset}px)`; });
        downCols.forEach(col => { col.style.transform = `translateY(${offset}px)`; });
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(applyParallax);
            ticking = true;
        }
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', onScroll, { passive: true });
                    applyParallax();
                } else {
                    window.removeEventListener('scroll', onScroll);
                }
            });
        },
        { rootMargin: '200px 0px 200px 0px' }
    );
    observer.observe(section);
}


// export function fluidStack() {
//     const stack = document.querySelector(".stack--block");
//     const cards = Array.from(document.querySelectorAll(".stack--item"));

//     const baseY = -40;
//     const stepY = 15;

//     function applyStack() {
//         cards.forEach((card, i) => {
//             const y = baseY - (i * stepY);

//             const depthFactor = 0.12;

//             const scale = 1 / (1 + i * depthFactor);

//             card.style.transform = `
//       translate(-50%, ${y}%)
//       scale(${scale})
//     `;

//             card.style.zIndex = cards.length - i;
//         });
//     }

//     applyStack();

//     function rotateStack() {
//         const first = cards.shift();
//         cards.push(first);
//         applyStack();
//     }

//     stack.addEventListener("click", rotateStack);
// }


export function fluidStack() {
    const stack = document.querySelector(".stack--block");
    const cards = Array.from(document.querySelectorAll(".stack--item"));

    if (!stack || !cards.length) return;

    const N = cards.length;

    const baseY = -40;
    const stepY = 15;
    const depthFactor = 0.12;

    let time = 0;
    let speed = 0.008; // lower = slower
    let rafId = null;
    let isInView = false;

    // ----------------------------
    // Core animation loop
    // ----------------------------
    function animate() {
        time += speed;

        cards.forEach((card, i) => {

            // Infinite modular depth
            let depth = (i - time) % N;
            if (depth < 0) depth += N;

            const y = baseY - depth * stepY;
            const scale = 1 / (1 + depth * depthFactor);

            card.style.transform = `
                translate(-50%, ${y}%)
                scale(${scale})
            `;

            card.style.zIndex = N - Math.floor(depth);
        });

        if (isInView) {
            rafId = requestAnimationFrame(animate);
        }
    }

    // ----------------------------
    // Intersection Observer
    // ----------------------------
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!isInView) {
                        isInView = true;
                        animate();
                    }
                } else {
                    isInView = false;
                    cancelAnimationFrame(rafId);
                }
            });
        },
        { threshold: 0.2 }
    );

    observer.observe(stack);
}