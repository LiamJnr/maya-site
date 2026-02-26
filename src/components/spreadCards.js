// export function spreadCards() {

//     function createSpread(count = 15) {
//         const container = document.getElementById("spread");

//         // Spread settings (tweak these)
//         const maxRotation = 80;  // total spread angle
//         const maxOffsetX = 700;  // horizontal spread distance
//         const maxOffsetY = 20;
//         // const depthStep = 1;     // z-index increment

//         for (let i = 0; i < count; i++) {
//             const card = document.createElement("div");
//             card.classList.add("spread--card");

//             const progress = i / (count - 1);     // 0 → 1
//             const centered = progress - 0.5;      // -0.5 → 0.5

//             const rotate = centered * maxRotation;
//             const offsetX = centered * maxOffsetX;
//             const offsetY = centered * maxOffsetY;
//             const z = Math.round((1 - Math.abs(centered)) * 100);

//             card.style.transform = `
//             translate(-50%, -50%)
//             translateX(${offsetX}px)
//             translateY(${offsetY}px)
//             rotate(${rotate}deg)
//         `;

//             card.style.zIndex = z;

//             container.appendChild(card);
//         }
//     }

//     createSpread(25);
// }



// export function spreadCards() {

//     function createSpread(count = 25) {
//         const container = document.getElementById("spread");
//         container.innerHTML = ""; // reset if re-run

//         // Arc settings
//         const totalAngle = 100;      // degrees of arc spread
//         const radius = 600;          // circle radius
//         const baseTilt = 0;          // optional extra tilt

//         for (let i = 0; i < count; i++) {
//             const card = document.createElement("div");
//             card.classList.add("spread--card");

//             // Normalized progress (0 → 1)
//             const progress = i / (count - 1);

//             // Convert to centered range (-0.5 → 0.5)
//             const centered = progress - 0.5;

//             // Convert to angle in radians
//             const angleDeg = centered * totalAngle;
//             const angle = angleDeg * (Math.PI / 180);

//             // Circular arc math
//             const x = Math.sin(angle) * radius;
//             const y = Math.cos(angle) * radius;

//             // Because we want the arc above center
//             const offsetY = radius - y;

//             // Depth layering
//             const z = Math.round((1 - Math.abs(centered)) * 100);

//             card.style.transform = `
//                 translate(-50%, -50%)
//                 translateX(${x}px)
//                 translateY(${offsetY}px)
//                 rotate(${angleDeg + baseTilt}deg)
//             `;

//             card.style.zIndex = z;

//             container.appendChild(card);
//         }
//     }

//     createSpread(25);
// }


// export function spreadCards() {

//     const container = document.getElementById("spread");
//     const section = document.querySelector(".spread--cards_cntnr");

//     const count = 25;
//     const totalAngle = 110;
//     const radius = 900;

//     const cards = [];

//     // Create cards
//     for (let i = 0; i < count; i++) {
//         const card = document.createElement("div");
//         card.classList.add("spread--card");
//         container.appendChild(card);
//         cards.push(card);
//     }

//     function update(spreadProgress) {

//         cards.forEach((card, i) => {

//             const progress = i / (count - 1);
//             const centered = progress - 0.5;

//             const targetAngle = centered * totalAngle;
//             const angle = (targetAngle * spreadProgress) * (Math.PI / 180);

//             const currentRadius = radius * spreadProgress;

//             const x = Math.sin(angle) * currentRadius;
//             const y = Math.cos(angle) * currentRadius;
//             const offsetY = currentRadius - y;

//             const rotate = targetAngle * spreadProgress;
//             const z = Math.round((1 - Math.abs(centered)) * 100);

//             card.style.transform = `
//                 translate(-50%, -50%)
//                 translateX(${x}px)
//                 translateY(${offsetY}px)
//                 rotate(${rotate}deg)
//                 rotateX(${8 * spreadProgress}deg)
//             `;

//             card.style.zIndex = z;
//         });
//     }

//     // Create dense thresholds for smooth progress
//     const thresholds = Array.from({ length: 101 }, (_, i) => i / 100);

//     const observer = new IntersectionObserver((entries) => {

//         entries.forEach(entry => {

//             if (entry.target !== section) return;

//             const ratio = entry.intersectionRatio;

//             // Optional easing
//             const eased = 1 - Math.pow(1 - ratio, 3);

//             update(eased);
//         });

//     }, {
//         threshold: thresholds
//     });

//     observer.observe(section);

//     // Initialize stacked state
//     update(0);
// }



// circular arc spread
// export function spreadCards() {
//     const container = document.getElementById("spread");
//     const section = document.querySelector(".spread--cards_cntnr");

//     // Guard clause in case elements don't exist on the page
//     if (!container || !section) return;

//     const count = 25;
//     const totalAngle = 110;
//     const radius = 900;
//     const TO_RAD = Math.PI / 180;

//     // 1. Use a DocumentFragment to minimize DOM reflows
//     const fragment = document.createDocumentFragment();
//     const cardsData = []; // Store pre-calculated values

//     for (let i = 0; i < count; i++) {
//         const card = document.createElement("div");
//         card.classList.add("spread--card");

//         // 2. Pre-calculate static values (Math that never changes during scroll)
//         const progress = i / (count - 1);
//         const centered = progress - 0.5;
//         const targetAngle = centered * totalAngle;
//         const targetAngleRad = targetAngle * TO_RAD;

//         // z-index doesn't change during scroll, so set it once here
//         const z = Math.round((1 - Math.abs(centered)) * 100);
//         card.style.zIndex = z;

//         fragment.appendChild(card);

//         // Save references and static math to use later
//         cardsData.push({ el: card, targetAngle, targetAngleRad });
//     }

//     // Append all cards at once
//     container.appendChild(fragment);

//     let ticking = false; // Flag for requestAnimationFrame

//     function update(spreadProgress) {
//         // 3. Decouple IntersectionObserver events from screen repaints
//         if (!ticking) {
//             requestAnimationFrame(() => {
//                 const currentRadius = radius * spreadProgress;
//                 const rotateX = 8 * spreadProgress;

//                 for (let i = 0; i < count; i++) {
//                     const data = cardsData[i];

//                     const angleRad = data.targetAngleRad * spreadProgress;
//                     const rotate = data.targetAngle * spreadProgress;

//                     const x = Math.sin(angleRad) * currentRadius;
//                     const y = Math.cos(angleRad) * currentRadius;
//                     const offsetY = currentRadius - y;

//                     // 4. Combine translates for slightly better parsing
//                     data.el.style.transform = `
//                         translate(-50%, -50%) 
//                         translate(${x}px, ${offsetY}px) 
//                         rotate(${rotate}deg) 
//                         rotateX(${rotateX}deg)
//                     `;
//                 }
//                 ticking = false;
//             });
//             ticking = true;
//         }
//     }

//     // 5. Initialize thresholds outside the observer callback
//     const thresholds = Array.from({ length: 101 }, (_, i) => i / 100);

//     const observer = new IntersectionObserver((entries) => {
//         // Since we only observe one element, we can grab the first entry safely
//         const entry = entries[0];
//         if (entry.isIntersecting || entry.intersectionRatio > 0) {
//             const ratio = entry.intersectionRatio;
//             const eased = 1 - Math.pow(1 - ratio, 3);
//             update(eased);
//         }
//     }, { threshold: thresholds });

//     observer.observe(section);
//     update(0);

//     // 6. Return a cleanup function to prevent memory leaks in SPAs
//     return () => {
//         observer.disconnect();
//     };
// }



// // cubic bezier spread
// export function spreadCards() {
//     const container = document.getElementById("spread");
//     const section = document.querySelector(".spread--cards_cntnr");

//     if (!container || !section) return;

//     const count = 25;
//     // Define the bounding box of the curve (relative to center)
//     const width = window.innerWidth * 0.8;
//     const height = window.innerHeight * 0.8;

//     // Define 4 points for the S-Curve: Top-Left to Bottom-Right
//     const P0 = { x: -width / 2, y: -height / 2 }; // Start (Top Left)
//     const P1 = { x: width / 2, y: -height / 2 }; // Control 1 (Pull Right)
//     const P2 = { x: -width / 2, y: height / 2 };  // Control 2 (Pull Left)
//     const P3 = { x: width / 2, y: height / 2 };  // End (Bottom Right)

//     const fragment = document.createDocumentFragment();
//     const cardsData = [];

//     for (let i = 0; i < count; i++) {
//         const card = document.createElement("div");
//         card.classList.add("spread--card");

//         const t = i / (count - 1); // Progression along the curve (0 to 1)

//         // Pre-calculate Bezier coefficients for this specific card
//         const cx0 = Math.pow(1 - t, 3);
//         const cx1 = 3 * Math.pow(1 - t, 2) * t;
//         const cx2 = 3 * (1 - t) * Math.pow(t, 2);
//         const cx3 = Math.pow(t, 3);

//         // Calculate final X and Y on the curve
//         const curveX = cx0 * P0.x + cx1 * P1.x + cx2 * P2.x + cx3 * P3.x;
//         const curveY = cx0 * P0.y + cx1 * P1.y + cx2 * P2.y + cx3 * P3.y;

//         // Subtle rotation: cards tilt as they move through the bend
//         const targetRotation = (t - 0.5) * 45;

//         card.style.zIndex = i; // Stack them linearly
//         fragment.appendChild(card);

//         cardsData.push({
//             el: card,
//             curveX,
//             curveY,
//             targetRotation
//         });
//     }

//     container.appendChild(fragment);

//     let ticking = false;

//     function update(spreadProgress) {
//         if (!ticking) {
//             requestAnimationFrame(() => {
//                 cardsData.forEach((data) => {
//                     // Interpolate from center (0,0) to curve position (curveX, curveY)
//                     const x = data.curveX * spreadProgress;
//                     const y = data.curveY * spreadProgress;
//                     const rot = data.targetRotation * spreadProgress;

//                     // Add a slight 3D perspective tilt
//                     const rotX = 10 * spreadProgress;

//                     data.el.style.transform = `
//                         translate(-50%, -50%) 
//                         translate3d(${x}px, ${y}px, 0)
//                         rotateZ(${rot}deg)
//                         rotateX(${rotX}deg)
//                     `;

//                     // Optional: Fade cards in as they spread
//                     data.el.style.opacity = Math.max(0.2, spreadProgress);
//                 });
//                 ticking = false;
//             });
//             ticking = true;
//         }
//     }

//     const thresholds = Array.from({ length: 101 }, (_, i) => i / 100);
//     const observer = new IntersectionObserver((entries) => {
//         const entry = entries[0];
//         if (entry.intersectionRatio > 0) {
//             // Cubic easing for smoother start/stop
//             const ratio = entry.intersectionRatio;
//             const eased = ratio < 0.5 ? 4 * ratio * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 3) / 2;
//             update(eased);
//         }
//     }, { threshold: thresholds });

//     observer.observe(section);
//     update(0);

//     return () => observer.disconnect();
// }


// // works - 001
// export function spreadCards() {
//     const container = document.getElementById("spread");
//     const section = document.querySelector(".spread--cards_cntnr");

//     if (!container || !section) return;

//     const count = 25;
//     const width = window.innerWidth * 0.8;
//     const height = window.innerHeight * 0.8;

//     const P0 = { x: -width / 2, y: -height / 2 };
//     const P1 = { x: width / 2, y: -height / 2 };
//     const P2 = { x: -width / 2, y: height / 2 };
//     const P3 = { x: width / 2, y: height / 2 };

//     const fragment = document.createDocumentFragment();

//     for (let i = 0; i < count; i++) {
//         const card = document.createElement("div");
//         card.classList.add("spread--card");

//         const t = i / (count - 1);

//         const cx0 = Math.pow(1 - t, 3);
//         const cx1 = 3 * Math.pow(1 - t, 2) * t;
//         const cx2 = 3 * (1 - t) * Math.pow(t, 2);
//         const cx3 = Math.pow(t, 3);

//         const curveX = cx0 * P0.x + cx1 * P1.x + cx2 * P2.x + cx3 * P3.x;
//         const curveY = cx0 * P0.y + cx1 * P1.y + cx2 * P2.y + cx3 * P3.y;
//         const targetRotation = (t - 0.5) * 45;

//         card.style.zIndex = i;

//         // Inject calculated positions as CSS variables
//         card.style.setProperty('--final-x', `${curveX}px`);
//         card.style.setProperty('--final-y', `${curveY}px`);
//         card.style.setProperty('--final-rotZ', `${targetRotation}deg`);
//         card.style.setProperty('--final-rotX', `10deg`);

//         // Add a slight stagger delay so they fly out in a wave
//         card.style.transitionDelay = `${i * 0.03}s`;

//         fragment.appendChild(card);
//     }

//     container.appendChild(fragment);

//     // Simplified Observer: Only triggers when the section enters/leaves view
//     const observer = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting) {
//             container.classList.add("is-spread");
//         } else {
//             // Optional: Remove class if you want them to collapse when scrolled away
//             container.classList.remove("is-spread");
//         }
//     }, {
//         threshold: 0.3 // Triggers when 30% of the section is visible
//     });

//     observer.observe(section);

//     return () => observer.disconnect();
// }



export function spreadCards() {
    const container = document.getElementById("spread");
    const section = document.querySelector(".spread--cards_cntnr");

    if (!container || !section) return;

    const count = 25;
    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.8;

    // P0 is our Top-Left corner
    const P0 = { x: -width / 2, y: -height / 2 };
    const P1 = { x: width / 2, y: -height / 2 };
    const P2 = { x: -width / 2, y: height / 2 };
    const P3 = { x: width / 2, y: height / 2 };

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const card = document.createElement("div");
        card.classList.add("spread--card");

        const t = i / (count - 1);

        const cx0 = Math.pow(1 - t, 3);
        const cx1 = 3 * Math.pow(1 - t, 2) * t;
        const cx2 = 3 * (1 - t) * Math.pow(t, 2);
        const cx3 = Math.pow(t, 3);

        const curveX = cx0 * P0.x + cx1 * P1.x + cx2 * P2.x + cx3 * P3.x;
        const curveY = cx0 * P0.y + cx1 * P1.y + cx2 * P2.y + cx3 * P3.y;
        const targetRotation = (t - 0.5) * 45;

        card.style.zIndex = i;

        // NEW: Tell the card where to start (Top Left)
        card.style.setProperty('--start-x', `${P0.x}px`);
        card.style.setProperty('--start-y', `${P0.y}px`);

        // Destination variables
        card.style.setProperty('--final-x', `${curveX}px`);
        card.style.setProperty('--final-y', `${curveY}px`);
        card.style.setProperty('--final-rotZ', `${targetRotation}deg`);
        card.style.setProperty('--final-rotX', `10deg`);

        // Stagger: card 0 moves first, card 24 moves last
        card.style.transitionDelay = `${i * 0.025}s`;

        fragment.appendChild(card);
    }

    container.appendChild(fragment);

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            container.classList.add("is-spread");
        } else {
            container.classList.remove("is-spread");
        }
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => observer.disconnect();
}