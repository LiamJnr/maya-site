export function parallaxSlide() {
    const section = document.querySelector('.showcase--stills_block');
    if (!section) return;

    const upCols = section.querySelectorAll('.cards-wrapper.upslide');
    const downCols = section.querySelectorAll('.cards-wrapper.downslide');

    // How many px to travel over the full scroll-through of the section
    const TRAVEL = 120;

    let ticking = false;

    function getProgress() {
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;

        // progress 0 = section bottom enters viewport bottom
        // progress 1 = section top exits viewport top
        const total = windowH + rect.height;
        const current = windowH - rect.top;

        return Math.min(Math.max(current / total, 0), 1);
    }

    function applyParallax() {
        const p = getProgress();

        // Centre the travel: at p=0.5 offset is 0, edges are ±TRAVEL
        const offset = (p - 0.5) * TRAVEL * 2;

        upCols.forEach(col => {
            col.style.transform = `translateY(${-offset}px)`;
        });

        downCols.forEach(col => {
            col.style.transform = `translateY(${offset}px)`;
        });

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(applyParallax);
            ticking = true;
        }
    }

    // Only attach scroll listener when the section is anywhere near the viewport
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', onScroll, { passive: true });
                    applyParallax(); // run once on enter
                } else {
                    window.removeEventListener('scroll', onScroll);
                }
            });
        },
        { rootMargin: '200px 0px 200px 0px' } // engage a little before entering view
    );

    observer.observe(section);
}