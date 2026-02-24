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


export function fluidStack() {
    const cardsContainer = document.querySelector('.stack--block');
    if (!cardsContainer) return;
    const cards = cardsContainer.querySelectorAll('.stack--item');

    // Default positions (matching CSS)
    const resetStyles = [
        { el: '.s-one', transform: 'translate(-50%, -40%) scale(1)' },
        { el: '.s-two', transform: 'translate(-50%, -60%) scale(0.92)' },
        { el: '.s-three', transform: 'translate(-50%, -75%) scale(0.84)' }
    ];

    cardsContainer.addEventListener('mouseenter', () => {
        cards.forEach((card, i) => {
            // Fanning effect: Shift each card down and slightly scale them
            // Using i * 40px to create staggered vertical offsets
            card.style.transform = `translate(-50%, calc(-50% + ${i * 50}px)) scale(${1 - i * 0.05})`;
        });
    });

    cardsContainer.addEventListener('mouseleave', () => {
        resetStyles.forEach(style => {
            const el = cardsContainer.querySelector(style.el);
            if (el) el.style.transform = style.transform;
        });
    });
}