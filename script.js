// =====================================================
// PROCESS ANIMATION
// Polvere metallica -> anello durante lo scroll
// =====================================================

(() => {

    // -------------------------------------------------
    // ELEMENTI HTML
    // -------------------------------------------------

    const track = document.getElementById('processo');
    const canvas = document.getElementById('c');
    const chips = document.getElementById('chips');
    const dotsEl = document.getElementById('dots');

    if (!track || !canvas) {
        console.error('Animazione processo: #processo o #anelli non trovato.');
        return;
    }

    const ctx = canvas.getContext('2d');

    const panels = [
        ...track.querySelectorAll('.panel')
    ];


    // -------------------------------------------------
    // DOTS DI NAVIGAZIONE
    // -------------------------------------------------

    if (dotsEl) {

        panels.forEach(() => {
            const dot = document.createElement('i');
            dotsEl.appendChild(dot);
        });

    }

    const dots = dotsEl
        ? [...dotsEl.children]
        : [];


    // -------------------------------------------------
    // CONFIGURAZIONE
    // -------------------------------------------------

    const mobile = window.innerWidth < 700;

    const PARTICLE_COUNT = mobile
        ? 2600
        : 5200;

    const random = Math.random;

    const reduceMotion = window
        .matchMedia('(prefers-reduced-motion: reduce)')
        .matches;


    // -------------------------------------------------
    // UTILITY
    // -------------------------------------------------

    const clamp = (value, min = 0, max = 1) => {
        return Math.min(
            max,
            Math.max(min, value)
        );
    };


    const ease = (t) => {

        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;

    };


    // -------------------------------------------------
    // MATERIALI
    // -------------------------------------------------

    const metals = {

        'Acciaio 316L': [170, 177, 186],

        'Bronzo': [208, 132, 62],

        'Argento 925': [226, 229, 234],

        'Platino 950': [190, 200, 214]

    };


    let currentColor = [
        ...metals['Acciaio 316L']
    ];

    let targetColor = [
        ...currentColor
    ];


    // -------------------------------------------------
    // BOTTONI MATERIALI
    // -------------------------------------------------

    if (chips) {

        Object.keys(metals).forEach((metal, index) => {

            const button = document.createElement('button');

            button.textContent = metal;

            button.setAttribute(
                'aria-pressed',
                index === 0
            );


            button.addEventListener('click', () => {

                targetColor = [
                    ...metals[metal]
                ];


                [...chips.children].forEach((child) => {

                    child.setAttribute(
                        'aria-pressed',
                        child === button
                    );

                });

            });


            chips.appendChild(button);

        });

    }


    // -------------------------------------------------
    // CREAZIONE PARTICELLE
    //
    // Ogni particella possiede:
    //
    // s  = posizione iniziale nella polvere
    // t  = posizione finale nell'anello
    // n  = normale della superficie dell'anello
    // sn = normale iniziale della polvere
    // -------------------------------------------------

    const particles = [];


    for (let i = 0; i < PARTICLE_COUNT; i++) {

        const gem = i < PARTICLE_COUNT * 0.14;

        let target;
        let normal;


        // ---------------------------------------------
        // PIETRA
        // ---------------------------------------------

        if (gem) {

            let a = random();
            let b = random();

            if (a + b > 1) {
                a = 1 - a;
                b = 1 - b;
            }


            const c = 1 - a - b;

            const sx = random() < 0.5 ? -1 : 1;
            const sy = random() < 0.5 ? -1 : 1;
            const sz = random() < 0.5 ? -1 : 1;


            target = [

                sx * a * 0.42,

                1.3 + sy * c * 0.34,

                sz * b * 0.42

            ];


            const normalLength = Math.hypot(
                sx / 0.42,
                sy / 0.34,
                sz / 0.42
            );


            normal = [

                sx / 0.42 / normalLength,

                sy / 0.34 / normalLength,

                sz / 0.42 / normalLength

            ];

        }


        // ---------------------------------------------
        // FASCIA DELL'ANELLO
        // ---------------------------------------------

        else {

            const u = random() * Math.PI * 2;
            const v = random() * Math.PI * 2;

            const radius =
                1 +
                0.11 * Math.cos(v);


            target = [

                radius * Math.cos(u),

                radius * Math.sin(u),

                0.17 * Math.sin(v)

            ];


            normal = [

                Math.cos(v) * Math.cos(u),

                Math.cos(v) * Math.sin(u),

                Math.sin(v)

            ];

        }


        // ---------------------------------------------
        // POSIZIONE INIZIALE NELLA POLVERE
        // ---------------------------------------------

        const radius =
            Math.sqrt(random()) * 1.5;

        const angle =
            random() * Math.PI * 2;

        const height =
            Math.pow(
                1 - radius / 1.5,
                1.3
            ) * 0.9;


        const start = [

            radius * Math.cos(angle),

            -1.35 +
            height *
            (0.55 + 0.45 * random()),

            radius *
            Math.sin(angle) *
            0.8

        ];


        const startNormalLength = Math.hypot(
            start[0],
            1.2,
            start[2]
        );


        particles.push({

            s: start,

            t: target,

            n: normal,

            sn: [

                start[0] / startNormalLength,

                1.2 / startNormalLength,

                start[2] / startNormalLength

            ],

            gem,

            d:
                clamp(
                    (target[1] + 1.2) / 2.7
                ) * 0.5 +
                random() * 0.09,

            ph:
                random() *
                Math.PI *
                2,

            sw:
                (random() < 0.5 ? -1 : 1) *
                (0.6 + random() * 0.8)

        });

    }


    // -------------------------------------------------
    // STATO ANIMAZIONE
    // -------------------------------------------------

    let width;
    let height;
    let dpr;

    let scrollProgress = 0;
    let smoothProgress = 0;

    let mouseX = 0;
    let smoothMouseX = 0;


    // -------------------------------------------------
    // CANVAS SIZE
    // -------------------------------------------------

    function resizeCanvas() {

        dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );


        width =
            canvas.width =
            window.innerWidth * dpr;


        height =
            canvas.height =
            window.innerHeight * dpr;

    }


    window.addEventListener(
        'resize',
        resizeCanvas
    );

    resizeCanvas();


    // -------------------------------------------------
    // MOVIMENTO MOUSE
    // -------------------------------------------------

    window.addEventListener(
        'pointermove',
        (event) => {

            mouseX =
                event.clientX /
                window.innerWidth -
                0.5;

        }
    );


    // -------------------------------------------------
    // LETTURA SCROLL
    // -------------------------------------------------

    function readScroll() {

        const rect =
            track.getBoundingClientRect();


        const availableScroll =
            track.offsetHeight -
            window.innerHeight;


        scrollProgress = clamp(
            -rect.top /
            availableScroll
        );


        // ---------------------------------------------
        // PANEL ATTIVO
        // ---------------------------------------------

        const activePanel = Math.min(

            panels.length - 1,

            Math.floor(
                scrollProgress *
                panels.length
            )

        );


        panels.forEach(
            (panel, index) => {

                panel.classList.toggle(
                    'on',
                    index === activePanel
                );

            }
        );


        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    'on',
                    index === activePanel
                );

            }
        );

    }


    window.addEventListener(
        'scroll',
        readScroll,
        { passive: true }
    );

    readScroll();


    // -------------------------------------------------
    // DIREZIONE LUCE
    // -------------------------------------------------

    const light = [
        0.4,
        0.7,
        0.6
    ];


    const lightLength =
        Math.hypot(...light);


    light[0] /= lightLength;
    light[1] /= lightLength;
    light[2] /= lightLength;


    // -------------------------------------------------
    // LOOP ANIMAZIONE
    // -------------------------------------------------

    function frame(milliseconds) {

        requestAnimationFrame(frame);


        // ---------------------------------------------
        // DISEGNA SOLO QUANDO LA SEZIONE È VISIBILE
        // ---------------------------------------------

        const rect =
            track.getBoundingClientRect();


        if (
            rect.bottom < 0 ||
            rect.top > window.innerHeight
        ) {
            return;
        }


        // ---------------------------------------------
        // TEMPO
        // ---------------------------------------------

        const time = reduceMotion
            ? 0
            : milliseconds * 0.001;


        // Scroll smussato

        smoothProgress +=
            (scrollProgress - smoothProgress) *
            0.08;


        // Mouse smussato

        smoothMouseX +=
            (mouseX - smoothMouseX) *
            0.05;


        // ---------------------------------------------
        // TRANSIZIONE COLORE MATERIALE
        // ---------------------------------------------

        for (let i = 0; i < 3; i++) {

            currentColor[i] +=
                (
                    targetColor[i] -
                    currentColor[i]
                ) * 0.08;

        }


        // ---------------------------------------------
        // PARAMETRI SCENA
        // ---------------------------------------------

        const morph = clamp(
            (smoothProgress - 0.06) /
            0.6
        );


        const scale =
            Math.min(width, height) *
            (
                mobile
                    ? 0.27
                    : 0.3
            );


        const centerX =
            width *
            (
                mobile
                    ? 0.5
                    : 0.64
            );


        const centerY =
            height *
            (
                mobile
                    ? 0.4
                    : 0.5
            );


        const cameraY =
            -0.7 +
            0.95 *
            ease(morph);


        const rotation =
            smoothProgress * 2.4 +
            time * 0.35 +
            smoothMouseX * 0.9;


        const cosRotation =
            Math.cos(rotation);

        const sinRotation =
            Math.sin(rotation);


        const tilt = 0.28;

        const cosTilt =
            Math.cos(tilt);

        const sinTilt =
            Math.sin(tilt);


        // ---------------------------------------------
        // PULIZIA CANVAS
        // ---------------------------------------------

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // ---------------------------------------------
        // DISEGNO PARTICELLE
        // ---------------------------------------------

        for (const particle of particles) {

            const progress = ease(
                clamp(
                    (
                        morph * 1.7 -
                        particle.d
                    ) / 0.7
                )
            );


            const inverseProgress =
                1 - progress;


            // -----------------------------------------
            // MORPH POLVERE -> ANELLO
            // -----------------------------------------

            let x =
                particle.s[0] +
                (
                    particle.t[0] -
                    particle.s[0]
                ) * progress;


            let y =
                particle.s[1] +
                (
                    particle.t[1] -
                    particle.s[1]
                ) * progress +
                Math.sin(
                    Math.PI * progress
                ) * 0.5;


            let z =
                particle.s[2] +
                (
                    particle.t[2] -
                    particle.s[2]
                ) * progress;


            // -----------------------------------------
            // MOVIMENTO DURANTE LA TRASFORMAZIONE
            // -----------------------------------------

            const swirl =
                Math.sin(
                    Math.PI * progress
                ) *
                particle.sw;


            if (swirl) {

                const cosSwirl =
                    Math.cos(swirl);

                const sinSwirl =
                    Math.sin(swirl);


                const rotatedX =
                    x * cosSwirl -
                    z * sinSwirl;


                z =
                    x * sinSwirl +
                    z * cosSwirl;


                x = rotatedX;

            }


            // Movimento minimo della polvere

            x +=
                Math.sin(
                    time * 1.3 +
                    particle.ph
                ) *
                0.008 *
                inverseProgress;


            y +=
                Math.cos(
                    time * 1.1 +
                    particle.ph
                ) *
                0.006 *
                inverseProgress;


            // -----------------------------------------
            // NORMALI
            // -----------------------------------------

            const nx =
                particle.sn[0] +
                (
                    particle.n[0] -
                    particle.sn[0]
                ) * progress;


            const ny =
                particle.sn[1] +
                (
                    particle.n[1] -
                    particle.sn[1]
                ) * progress;


            const nz =
                particle.sn[2] +
                (
                    particle.n[2] -
                    particle.sn[2]
                ) * progress;


            // -----------------------------------------
            // ROTAZIONE 3D
            // -----------------------------------------

            const X =
                x * cosRotation +
                z * sinRotation;


            let Z =
                -x * sinRotation +
                z * cosRotation;


            const Y =
                y * cosTilt -
                Z * sinTilt;


            Z =
                y * sinTilt +
                Z * cosTilt;


            // -----------------------------------------
            // ROTAZIONE NORMALE
            // -----------------------------------------

            const NX =
                nx * cosRotation +
                nz * sinRotation;


            let NZ =
                -nx * sinRotation +
                nz * cosRotation;


            const NY =
                ny * cosTilt -
                NZ * sinTilt;


            NZ =
                ny * sinTilt +
                NZ * cosTilt;


            // -----------------------------------------
            // ILLUMINAZIONE
            // -----------------------------------------

            const dot =
                (
                    NX * light[0] +
                    NY * light[1] +
                    NZ * light[2]
                ) /
                (
                    Math.hypot(
                        NX,
                        NY,
                        NZ
                    ) || 1
                );


            // -----------------------------------------
            // PROSPETTIVA
            // -----------------------------------------

            const perspective =
                4.6 /
                (4.6 - Z);


            const px =
                centerX +
                X *
                scale *
                perspective;


            const py =
                centerY -
                (
                    Y -
                    cameraY
                ) *
                scale *
                perspective;


            // -----------------------------------------
            // LUMINOSITÀ
            // -----------------------------------------

            let brightness =
                0.45 +
                0.75 *
                Math.max(
                    0,
                    dot
                );


            if (particle.gem) {

                brightness +=
                    Math.pow(
                        Math.max(
                            0,
                            dot
                        ),
                        6
                    ) *
                    0.7 *
                    progress;

            }


            // -----------------------------------------
            // COLORE PARTICELLA
            // -----------------------------------------

            const grey = 150;


            const red =
                (
                    grey +
                    (
                        currentColor[0] -
                        grey
                    ) *
                    progress
                ) *
                brightness;


            const green =
                (
                    grey +
                    4 +
                    (
                        currentColor[1] -
                        grey -
                        4
                    ) *
                    progress
                ) *
                brightness;


            const blue =
                (
                    grey +
                    8 +
                    (
                        currentColor[2] -
                        grey -
                        8
                    ) *
                    progress
                ) *
                brightness;


            ctx.fillStyle = `
                rgb(
                    ${clamp(red, 0, 255) | 0},
                    ${clamp(green, 0, 255) | 0},
                    ${clamp(blue, 0, 255) | 0}
                )
            `;


            // -----------------------------------------
            // DIMENSIONE PARTICELLA
            // -----------------------------------------

            const particleSize =
                (
                    mobile
                        ? 1.3
                        : 1.6
                ) *
                dpr *
                perspective *
                (
                    particle.gem
                        ? 1.15
                        : 1
                );


            ctx.fillRect(
                px,
                py,
                particleSize,
                particleSize
            );

        }

    }


    // -------------------------------------------------
    // AVVIO
    // -------------------------------------------------

    requestAnimationFrame(frame);

})();

// =====================================================
// PROCESS ANIMATION
// Polvere metallica -> anello durante lo scroll
// =====================================================

// Sei anelli (uno per materiale) che scorrono lateralmente mentre si scorre la pagina in verticale
// =====================================================
// PROCESSO 1
// MATERIAL IMAGE CAROUSEL
//
// Sostituisce gli anelli a particelle
// con immagini PNG reali.
//
// Lo scroll:
// - sposta gli oggetti orizzontalmente
// - ingrandisce quello centrale
// - mantiene una leggera animazione
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const track =
        document.getElementById('processo1');

    const cv =
        document.getElementById('anelli');


    if (!track || !cv) {
        return;
    }


    const ctx =
        cv.getContext('2d');


    // =================================================
    // MATERIALI + IMMAGINI + SLUG
    // =================================================

    const items = [

        {
            name: 'Platino',
            slug: 'platino',
            image: 'immagini/pendente-platino.png'
        },

        {
            name: 'Titanio',
            slug: 'titanio',
            image: 'immagini/pendente-metallo.png'
        },

        {
            name: 'Oro',
            slug: 'oro',
            image: 'immagini/pendente2.png'
        },

        {
            name: 'Acciaio',
            slug: 'acciaio',
            image: 'immagini/pendente-argento.png'
        },

        {
            name: 'Bronzo',
            slug: 'bronzo',
            image: 'immagini/pendente-bronzo.png'
        },

        {
            name: 'Argento',
            slug: 'argento',
            image: 'immagini/pendente-ferro.png'
        }

    ];


    const n =
        items.length;


    let mob =
        innerWidth < 700;


    const reduce =
        matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    // =================================================
    // UTILITY
    // =================================================

    const cl = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const lerp = (
        a,
        b,
        t
    ) => {

        return (
            a +
            (b - a) * t
        );

    };


    // =================================================
    // LOAD IMAGES
    // =================================================

    const images =

        items.map(
            item => {

                const image =
                    new Image();


                image.decoding =
                    'async';


                image.onload =
                    () => {

                        console.log(
                            'Loaded:',
                            item.name
                        );

                    };


                image.onerror =
                    () => {

                        console.warn(
                            'Image missing:',
                            item.image
                        );

                    };


                image.src =
                    item.image;


                return image;

            }
        );


    // =================================================
    // RANDOM OBJECT VARIATION
    // =================================================

    const objectData =

        items.map(
            (_, index) => {

                return {

                    rotation:

                        (
                            index % 2 === 0
                                ? 1
                                : -1
                        )

                        *

                        (
                            0.025 +
                            Math.random() * 0.035
                        ),


                    phase:

                        Math.random() *
                        Math.PI *
                        2

                };

            }
        );


    // =================================================
    // CANVAS
    // =================================================

    let W;
    let H;
    let dpr;


    let p = 0;
    let sp = 0;


    function size() {

        mob =
            innerWidth < 700;


        dpr =

            Math.min(
                devicePixelRatio || 1,
                2
            );


        W =
            cv.width =
                Math.round(
                    innerWidth * dpr
                );


        H =
            cv.height =
                Math.round(
                    innerHeight * dpr
                );

    }


    addEventListener(
        'resize',
        size
    );


    size();


    // =================================================
    // SCROLL
    // =================================================

    function read() {

        const rect =
            track.getBoundingClientRect();


        const available =

            Math.max(

                1,

                track.offsetHeight -
                innerHeight

            );


        p =

            cl(
                -rect.top /
                available
            );

    }


    addEventListener(
        'scroll',
        read,
        {
            passive: true
        }
    );


    read();


    // =================================================
    // CLICK AREAS
    // =================================================

    const pendantHitAreas = [];


    // =================================================
    // PLACEHOLDER
    // =================================================

    function drawMissingImage(
        cx,
        cy,
        size,
        name
    ) {

        ctx.save();


        ctx.strokeStyle =
            'rgba(120,125,132,.22)';


        ctx.lineWidth =
            1 * dpr;


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            size * 0.32,
            0,
            Math.PI * 2
        );


        ctx.stroke();


        ctx.fillStyle =
            'rgba(120,125,132,.55)';


        ctx.textAlign =
            'center';


        ctx.font =
            `${11 * dpr}px Jost, system-ui, sans-serif`;


        ctx.fillText(
            `${name} - image missing`,
            cx,
            cy
        );


        ctx.restore();

    }


    // =================================================
    // DRAW IMAGE
    // =================================================

    function drawMaterialImage(
        index,
        cx,
        cy,
        size,
        near,
        time,
        dx
    ) {

        const image =
            images[index];


        if (
            !image ||
            !image.complete ||
            !image.naturalWidth
        ) {

            drawMissingImage(
                cx,
                cy,
                size,
                items[index].name
            );

            return;

        }


        // =================================================
        // DIMENSIONI
        // =================================================

        const ratio =

            image.naturalWidth /
            image.naturalHeight;


        const drawHeight =
            size;


        const drawWidth =

            drawHeight *
            ratio;


        // =================================================
        // MOVIMENTO
        // =================================================

        const movement =

            reduce

                ? 0

                : Math.sin(

                    time * 0.65 +
                    objectData[index].phase

                );


        const floatY =

            movement *
            7 *
            dpr;


        // =================================================
        // ROTAZIONE
        // =================================================

        const targetRotation =

            objectData[index]
                .rotation

            +

            dx *
            0.055;


        const rotation =

            targetRotation *

            (
                1 -
                near * 0.70
            );


        // =================================================
        // FAKE DEPTH
        // =================================================

        const perspectiveX =

            lerp(
                0.86,
                1,
                near
            );


        const perspectiveY =

            lerp(
                0.94,
                1,
                near
            );


        // =================================================
        // OPACITY
        // =================================================

        const alpha =

            lerp(
                0.38,
                1,
                near
            );


        // =================================================
        // DRAW
        // =================================================

        ctx.save();


        ctx.globalAlpha =
            alpha;


        ctx.translate(
            cx,
            cy + floatY
        );


        ctx.rotate(
            rotation
        );


        ctx.scale(
            perspectiveX,
            perspectiveY
        );


        ctx.shadowColor =

            `rgba(
                0,
                0,
                0,
                ${0.04 + near * 0.08}
            )`;


        ctx.shadowBlur =

            (
                8 +
                near * 18
            )

            *
            dpr;


        ctx.shadowOffsetY =

            5 *
            dpr;


        ctx.drawImage(

            image,

            -drawWidth / 2,
            -drawHeight / 2,

            drawWidth,
            drawHeight

        );


        ctx.restore();


        // =================================================
        // CLICK AREA
        // =================================================

        /*
            Salviamo una zona rettangolare attorno
            all'immagine visualizzata.

            Usiamo le dimensioni già scalate dalla
            falsa prospettiva.
        */

        const hitWidth =

            drawWidth *
            perspectiveX;


        const hitHeight =

            drawHeight *
            perspectiveY;


        pendantHitAreas.push({

            index,

            item:
                items[index],

            x:

                cx -
                hitWidth / 2,

            y:

                cy +
                floatY -
                hitHeight / 2,

            width:
                hitWidth,

            height:
                hitHeight,

            alpha

        });

    }


    // =================================================
    // HIT TEST
    // =================================================

    function getPendantAtPointer(
        event
    ) {

        const rect =
            cv.getBoundingClientRect();


        const scaleX =

            cv.width /
            rect.width;


        const scaleY =

            cv.height /
            rect.height;


        const x =

            (
                event.clientX -
                rect.left
            )

            *
            scaleX;


        const y =

            (
                event.clientY -
                rect.top
            )

            *
            scaleY;


        /*
            Partiamo dall'ultimo disegnato.

            Utile se due pendenti si sovrappongono.
        */

        for (

            let i =
                pendantHitAreas.length - 1;

            i >= 0;

            i--

        ) {

            const area =
                pendantHitAreas[i];


            if (
                x >= area.x &&
                x <= area.x + area.width &&

                y >= area.y &&
                y <= area.y + area.height
            ) {

                return area;

            }

        }


        return null;

    }


    // =================================================
    // HOVER
    // =================================================

    cv.addEventListener(
        'pointermove',
        event => {

            const pendant =

                getPendantAtPointer(
                    event
                );


            cv.style.cursor =

                pendant

                    ? 'pointer'

                    : 'default';

        }
    );


    cv.addEventListener(
        'pointerleave',
        () => {

            cv.style.cursor =
                'default';

        }
    );


    // =================================================
    // CLICK + REDIRECT
    // =================================================

    cv.addEventListener(
        'click',
        event => {

            const pendant =

                getPendantAtPointer(
                    event
                );


            if (!pendant) {
                return;
            }


            const slug =
                pendant.item.slug;


            if (!slug) {
                return;
            }


            // =================================================
            // PAGINA UNICA PER TUTTI I PENDENTI
            // =================================================

            const destination =

                `/prodotto-pendente/prodotto-pendente.html?material=${
                    encodeURIComponent(
                        slug
                    )
                }`;


            console.log(
                'Redirect pendente:',
                destination
            );


            window.location.assign(
                destination
            );

        }
    );


    // =================================================
    // FRAME
    // =================================================

    function frame(ms) {

        requestAnimationFrame(
            frame
        );


        const rc =
            track.getBoundingClientRect();


        if (
            rc.bottom < 0 ||
            rc.top > innerHeight
        ) {

            pendantHitAreas.length =
                0;


            cv.style.cursor =
                'default';


            return;

        }


        // =================================================
        // SMOOTH SCROLL
        // =================================================

        sp +=

            (
                p -
                sp
            )

            *
            0.1;


        const time =

            reduce

                ? 0

                : ms * 0.001;


        // =================================================
        // CURRENT ITEM
        // =================================================

        const c =

            -0.8 +

            sp *

            (
                n -
                1 +
                1.6
            );


        // =================================================
        // SPACING
        // =================================================

        const gap =

            W *

            (
                mob
                    ? 0.70
                    : 0.34
            );


        const base =

            Math.min(
                W,
                H
            )

            *

            (
                mob
                    ? 0.43
                    : 0.50
            );


        // =================================================
        // CLEAR
        // =================================================

        ctx.clearRect(
            0,
            0,
            W,
            H
        );


        /*
            Importantissimo:
            eliminiamo le aree cliccabili del frame
            precedente.
        */

        pendantHitAreas.length =
            0;


        ctx.textAlign =
            'center';


        // =================================================
        // OBJECTS
        // =================================================

        for (
            let k = 0;
            k < n;
            k++
        ) {

            const dx =
                k - c;


            const cx =

                W / 2 +

                dx *
                gap;


            // =================================================
            // FUORI SCHERMO
            // =================================================

            if (
                Math.abs(
                    cx -
                    W / 2
                )

                >
                W * 0.8
            ) {

                continue;

            }


            // =================================================
            // DISTANZA DAL CENTRO
            // =================================================

            const near =

                1 -

                cl(

                    Math.abs(dx) /
                    1.4

                );


            // =================================================
            // SIZE
            // =================================================

            const imageHeight =

                base *

                (
                    0.72 +
                    0.34 *
                    near
                );


            // =================================================
            // VERTICAL POSITION
            // =================================================

            const cy =

                H * 0.47

                +

                Math.sin(
                    dx * 1.2
                )

                *
                H *
                0.07;


            // =================================================
            // IMAGE
            // =================================================

            drawMaterialImage(

                k,

                cx,
                cy,

                imageHeight,

                near,

                time,

                dx

            );


            // =================================================
            // LABEL
            // =================================================

            ctx.save();


            ctx.globalAlpha =

                0.35 +
                0.65 *
                near;


            ctx.fillStyle =
                'rgb(60,60,60)';


            ctx.font =

                `${
                    near > 0.6
                        ? 500
                        : 300
                } ${
                    (
                        15 +
                        near * 5
                    ) *
                    dpr
                }px Jost, system-ui, sans-serif`;


            ctx.fillText(

                items[k].name,

                cx,

                cy +

                imageHeight *
                0.62

            );


            ctx.restore();

        }

    }


    // =================================================
    // START
    // =================================================

    requestAnimationFrame(
        frame
    );

})();

// =====================================================
// MATERIALS — REAL RING IMAGES
//
// 1. Acciaio parte al centro
// 2. Gli altri materiali nascono dal centro
// 3. Si distribuiscono nello spazio
// 4. Usiamo PNG reali al posto delle particelle
// =====================================================

(() => {

    // =====================================================
    // ELEMENTI
    // =====================================================

    const track =
        document.getElementById('processo2');

    const canvas =
        document.getElementById('anelli1');


    if (!track || !canvas) {

        console.error(
            'Materials animation: #processo2 o #anelli1 non trovato.'
        );

        return;
    }


    const ctx =
        canvas.getContext('2d');


    // =====================================================
    // UTILITY
    // =====================================================

    const clamp = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const easeOut = t => {

        t = clamp(t);

        return (
            1 -
            Math.pow(
                1 - t,
                3
            )
        );

    };


    // =====================================================
    // MATERIALI
    //
    // slug = parametro passato a prodotto.html
    // image = PNG dell'anello
    // =====================================================

    const materials = [

        {
            name: 'Steel',
            slug: 'acciaio',
            image: 'immagini/anello-acciaio.png'
        },

        {
            name: 'Platinum',
            slug: 'platino',
            image: 'immagini/anello-platino.png'
        },

        {
            name: 'Titanium',
            slug: 'titanio',
            image: 'immagini/anello-titanio.png'
        },

        {
            name: 'Gold',
            slug: 'oro',
            image: 'immagini/anello-oro.png'
        },

        {
            name: 'Bronze',
            slug: 'bronzo',
            image: 'immagini/anello-bronzo.png'
        },

        {
            name: 'Silver',
            slug: 'argento',
            image: 'immagini/anello-argento.png'
        }

    ];


    // =====================================================
    // CARICAMENTO IMMAGINI
    // =====================================================

    const images =

        materials.map(
            material => {

                const image =
                    new Image();


                image.decoding =
                    'async';


                image.onload = () => {

                    console.log(
                        'Ring loaded:',
                        material.name
                    );

                };


                image.onerror = () => {

                    console.warn(
                        'Ring image missing:',
                        material.image
                    );

                };


                image.src =
                    material.image;


                return image;

            }
        );


    // =====================================================
    // CONFIGURAZIONE
    // =====================================================

    let mobile =
        window.innerWidth < 700;


    const random =
        Math.random;


    const reduceMotion =

        window
            .matchMedia(
                '(prefers-reduced-motion: reduce)'
            )
            .matches;


    // =====================================================
    // VARIAZIONE DEGLI ANELLI
    // =====================================================

    const randomness =

        materials.map(
            (_, index) => {

                if (index === 0) {

                    return {

                        x: 0,

                        y: 0,

                        rotation: 0,

                        phase:
                            random() *
                            Math.PI *
                            2

                    };

                }


                return {

                    x:

                        (
                            random() -
                            0.5
                        )

                        *
                        0.045,


                    y:

                        (
                            random() -
                            0.5
                        )

                        *
                        0.055,


                    rotation:

                        (
                            random() -
                            0.5
                        )

                        *
                        0.16,


                    phase:

                        random() *
                        Math.PI *
                        2

                };

            }
        );


    // =====================================================
    // CANVAS
    // =====================================================

    let width;
    let height;
    let dpr;


    function resizeCanvas() {

        mobile =
            window.innerWidth < 700;


        dpr =

            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        width =

            window.innerWidth *
            dpr;


        height =

            window.innerHeight *
            dpr;


        canvas.width =
            Math.round(width);


        canvas.height =
            Math.round(height);


        canvas.style.width =
            `${window.innerWidth}px`;


        canvas.style.height =
            `${window.innerHeight}px`;

    }


    window.addEventListener(
        'resize',
        resizeCanvas
    );


    resizeCanvas();


    // =====================================================
    // SCROLL
    // =====================================================

    let progress =
        0;


    let smoothProgress =
        0;


    function readScroll() {

        const rect =
            track.getBoundingClientRect();


        const scrollLength =

            Math.max(

                1,

                track.offsetHeight -
                window.innerHeight

            );


        progress =

            clamp(

                -rect.top /
                scrollLength

            );

    }


    window.addEventListener(
        'scroll',
        readScroll,
        {
            passive: true
        }
    );


    readScroll();


    // =====================================================
    // AREE CLICCABILI
    //
    // Vengono ricreate a ogni frame.
    // Un anello viene inserito QUI solo quando
    // il suo nome è visibile.
    // =====================================================

    const ringHitAreas = [];


    // =====================================================
    // POSIZIONI FINALI
    // =====================================================

    function getTargets() {

        if (mobile) {

            return [

                // Steel
                {
                    x: 0,
                    y: 0
                },

                // Platinum
                {
                    x: -0.27,
                    y: 0.24
                },

                // Titanium
                {
                    x: 0.27,
                    y: -0.20
                },

                // Gold
                {
                    x: -0.16,
                    y: -0.28
                },

                // Bronze
                {
                    x: 0.28,
                    y: 0.24
                },

                // Silver
                {
                    x: 0,
                    y: 0.36
                }

            ];

        }


        return [

            // Steel
            {
                x: 0,
                y: 0
            },

            // Platinum
            {
                x: -0.30,
                y: 0.23
            },

            // Titanium
            {
                x: 0.31,
                y: -0.21
            },

            // Gold
            {
                x: -0.08,
                y: -0.31
            },

            // Bronze
            {
                x: 0.33,
                y: 0.23
            },

            // Silver
            {
                x: -0.31,
                y: -0.20
            }

        ];

    }


    // =====================================================
    // DRAW RING
    // =====================================================

    function drawRing({

        material,

        index,

        centerX,
        centerY,

        size,

        alpha,

        time,

        spread,

        labelAlpha

    }) {

        const image =
            images[index];


        // =================================================
        // IMMAGINE NON DISPONIBILE
        // =================================================

        if (
            !image ||
            !image.complete ||
            !image.naturalWidth
        ) {

            return;

        }


        // =================================================
        // DIMENSIONI
        // =================================================

        const ratio =

            image.naturalWidth /
            image.naturalHeight;


        const imageHeight =

            size *

            (
                mobile
                    ? 2.55
                    : 2.70
            );


        const imageWidth =

            imageHeight *
            ratio;


        // =================================================
        // FLOAT
        // =================================================

        const floatY =

            reduceMotion

                ? 0

                :

                Math.sin(

                    time *
                    (
                        0.42 +
                        index *
                        0.035
                    )

                    +

                    randomness[index]
                        .phase

                )

                *

                5 *
                dpr;


        // =================================================
        // ROTAZIONE
        // =================================================

        const rotation =

            reduceMotion

                ? 0

                :

                randomness[index]
                    .rotation

                +

                Math.sin(

                    time *
                    0.24

                    +

                    index *
                    0.7

                )

                *
                0.025

                +

                spread *
                (
                    index -
                    2.5
                )

                *
                0.006;


        // =================================================
        // BREATHING
        // =================================================

        const breathing =

            reduceMotion

                ? 1

                :

                1 +

                Math.sin(

                    time *
                    0.30

                    +

                    index

                )

                *
                0.006;


        // =================================================
        // DRAW IMAGE
        // =================================================

        ctx.save();


        ctx.globalAlpha =
            alpha;


        ctx.translate(

            centerX,

            centerY +
            floatY

        );


        ctx.rotate(
            rotation
        );


        ctx.scale(
            breathing,
            breathing
        );


        // -------------------------------------------------
        // OMBRA
        // -------------------------------------------------

        ctx.shadowColor =

            `rgba(
                0,
                0,
                0,
                ${
                    0.06 +
                    spread *
                    0.06
                }
            )`;


        ctx.shadowBlur =

            (
                10 +
                spread *
                12
            )

            *
            dpr;


        ctx.shadowOffsetY =

            5 *
            dpr;


        // -------------------------------------------------
        // PNG
        // -------------------------------------------------

        ctx.drawImage(

            image,

            -imageWidth / 2,

            -imageHeight / 2,

            imageWidth,

            imageHeight

        );


        ctx.restore();


        // =================================================
        // CLICK AREA
        //
        // IMPORTANTE:
        // viene creata SOLO quando il nome appare.
        // Quindi prima di labelAlpha > 0.01
        // l'anello NON esiste per il sistema di click.
        // =================================================

        if (
            labelAlpha >
            0.01
        ) {

            ringHitAreas.push({

                index,

                material,

                x:

                    centerX -

                    (
                        imageWidth *
                        breathing
                    )

                    /
                    2,

                y:

                    centerY +

                    floatY -

                    (
                        imageHeight *
                        breathing
                    )

                    /
                    2,

                width:

                    imageWidth *
                    breathing,

                height:

                    imageHeight *
                    breathing

            });

        }


        // =================================================
        // LABEL
        // =================================================

        if (
            labelAlpha >
            0.01
        ) {

            ctx.save();


            ctx.globalAlpha =

                alpha *
                labelAlpha;


            ctx.textAlign =
                'center';


            ctx.fillStyle =
                'rgb(55, 57, 60)';


            ctx.font =

                `400 ${
                    (
                        mobile
                            ? 12
                            : 15
                    )

                    *
                    dpr
                }px Jost, system-ui, sans-serif`;


            ctx.fillText(

                material.name,

                centerX,

                centerY +

                imageHeight *
                0.57

            );


            ctx.restore();

        }

    }


    // =====================================================
    // HIT TEST
    // =====================================================

    function getRingAtPointer(
        event
    ) {

        const rect =
            canvas.getBoundingClientRect();


        /*
            Il mouse usa coordinate CSS.

            Il canvas invece usa coordinate moltiplicate
            per DPR.

            Le convertiamo nello stesso sistema.
        */

        const scaleX =

            canvas.width /
            rect.width;


        const scaleY =

            canvas.height /
            rect.height;


        const x =

            (
                event.clientX -
                rect.left
            )

            *
            scaleX;


        const y =

            (
                event.clientY -
                rect.top
            )

            *
            scaleY;

        for (

            let i =
                ringHitAreas.length - 1;

            i >= 0;

            i--

        ) {

            const area =
                ringHitAreas[i];


            if (

                x >= area.x &&

                x <=
                area.x +
                area.width &&


                y >= area.y &&

                y <=
                area.y +
                area.height

            ) {

                return area;

            }

        }


        return null;

    }


    // =====================================================
    // HOVER
    // =====================================================

    canvas.addEventListener(
        'pointermove',
        event => {

            const ring =

                getRingAtPointer(
                    event
                );


            canvas.style.cursor =

                ring

                    ? 'pointer'

                    : 'default';

        }
    );


    canvas.addEventListener(
        'pointerleave',
        () => {

            canvas.style.cursor =
                'default';

        }
    );


    // =====================================================
    // CLICK
    // =====================================================

    canvas.addEventListener(
        'click',
        event => {

            const ring =

                getRingAtPointer(
                    event
                );


            if (!ring) {
                return;
            }


            const slug =
                ring.material.slug;


            if (!slug) {

                console.warn(
                    'Slug materiale mancante:',
                    ring.material
                );

                return;

            }

            const destination =
            `/prodotto/prodotto.html?material=${encodeURIComponent(slug)}`;

            console.log(
                'Redirect verso:',
                destination
            );

            window.location.assign(
                destination
            );  
        }
    );


    // =====================================================
    // ANIMATION LOOP
    // =====================================================

    function frame(
        milliseconds
    ) {

        requestAnimationFrame(
            frame
        );


        const rect =
            track.getBoundingClientRect();


        // =================================================
        // SEZIONE NON VISIBILE
        // =================================================

        if (

            rect.bottom < 0 ||

            rect.top >
            window.innerHeight

        ) {

            ringHitAreas.length =
                0;


            canvas.style.cursor =
                'default';


            return;

        }


        // =================================================
        // TIME
        // =================================================

        const time =

            reduceMotion

                ? 0

                : milliseconds *
                  0.001;


        // =================================================
        // SMOOTH SCROLL
        // =================================================

        smoothProgress +=

            (
                progress -
                smoothProgress
            )

            *
            0.075;


        // =================================================
        // SPREAD
        // =================================================

        const spread =

            easeOut(

                clamp(

                    (
                        smoothProgress -
                        0.07
                    )

                    /

                    0.70

                )

            );


        // =================================================
        // LABELS
        //
        // Quando questa animazione parte,
        // iniziano anche a diventare cliccabili.
        // =================================================

        const labels =

            easeOut(

                clamp(

                    (
                        smoothProgress -
                        0.38
                    )

                    /

                    0.28

                )

            );


        const targets =
            getTargets();


        // =================================================
        // CLEAR
        // =================================================

        ctx.clearRect(

            0,
            0,

            width,
            height

        );


        /*
            FONDAMENTALE.

            Eliminiamo le coordinate del frame precedente
            e le ricostruiamo in base alle posizioni attuali.
        */

        ringHitAreas.length =
            0;


        // =================================================
        // BASE SIZE
        // =================================================

        const baseSize =

            Math.min(
                width,
                height
            )

            *

            (
                mobile
                    ? 0.135
                    : 0.115
            );


        // =================================================
        // MATERIALI
        // =================================================

        materials.forEach(
            (
                material,
                index
            ) => {

                const main =
                    index === 0;


                // =========================================
                // DELAY
                // =========================================

                const delay =

                    main

                        ? 0

                        :

                        (
                            index -
                            1
                        )

                        *
                        0.055;


                // =========================================
                // LOCAL SPREAD
                // =========================================

                const localSpread =

                    main

                        ? spread

                        :

                        easeOut(

                            clamp(

                                (
                                    spread -
                                    delay
                                )

                                /

                                (
                                    1 -
                                    delay
                                )

                            )

                        );


                // =========================================
                // POSIZIONE FINALE
                // =========================================

                const targetX =

                    targets[index].x

                    +

                    randomness[index].x;


                const targetY =

                    targets[index].y

                    +

                    randomness[index].y;


                // =========================================
                // CENTRO ATTUALE
                //
                // Tutti partono dal centro.
                // =========================================

                const centerX =

                    width /
                    2

                    +

                    targetX *
                    width *
                    localSpread;


                const centerY =

                    height /
                    2

                    +

                    targetY *
                    height *
                    localSpread;


                // =========================================
                // SIZE
                // =========================================

                let size;


                if (main) {

                    size =

                        baseSize *

                        (
                            1.25 -

                            spread *
                            0.18
                        );

                }

                else {

                    size =

                        baseSize *

                        (
                            1.08 -

                            localSpread *
                            0.18
                        );

                }


                // =========================================
                // OPACITY
                // =========================================

                const alpha =

                    main

                        ? 1

                        :

                        clamp(

                            localSpread *
                            1.8

                        );


                // =========================================
                // DRAW
                // =========================================

                drawRing({

                    material,

                    index,

                    centerX,

                    centerY,

                    size,

                    alpha,

                    time,

                    spread:
                        localSpread,


                    /*
                        Questa è la parte importante.

                        Il valore passato a ogni anello
                        controlla SIA il nome
                        SIA il momento in cui diventa
                        cliccabile.
                    */

                    labelAlpha:

                        labels *
                        localSpread

                });

            }
        );

    }


    // =====================================================
    // START
    // =====================================================

    requestAnimationFrame(
        frame
    );

})();

// =====================================================
// LAYER BUILD — POWDER -> REAL PENDANT IMAGE
//
// IMPORTANTE:
// La polvere NON rimane come immagine finale.
//
// 1. All'inizio esistono solo particelle.
// 2. Le particelle si avvicinano alla posizione
//    che avranno nel pendente.
// 3. Quando raggiungono il layer corretto,
//    le particelle scompaiono.
// 4. Al loro posto compare la PNG REALE.
// 5. Alla fine rimane solo l'immagine originale.

// E' STATO RIPRISTINATO IL CODICE ORIGINALE, C
// CHE ERA STATO SOSTITUITO DA UN ALTRO CHE NON FUNZIONAVA.
// =====================================================

(() => {

    // -------------------------------------------------
    // ELEMENTI
    // -------------------------------------------------

    const track =
        document.getElementById('layer-build');

    const canvas =
        document.getElementById('layerCanvas');

    const counter =
        document.getElementById('layerCurrent');


    if (!track || !canvas) {
        return;
    }


    const ctx =
        canvas.getContext('2d');


    // -------------------------------------------------
    // CONFIG
    // -------------------------------------------------

    const LAYER_COUNT = 200;

    let mobile =
        window.innerWidth < 700;


    const POINT_COUNT =
        mobile
            ? 3200
            : 6500;


    const random =
        Math.random;


    const reduceMotion =
        window
            .matchMedia(
                '(prefers-reduced-motion: reduce)'
            )
            .matches;


    // Colore materiale
    const METAL = [
        170,
        177,
        186
    ];


    // -------------------------------------------------
    // UTILITY
    // -------------------------------------------------

    const clamp = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const easeInOut = (t) => {

        return t < 0.5

            ? 4 * t * t * t

            : 1 -
                Math.pow(
                    -2 * t + 2,
                    3
                ) / 2;

    };


    const easeOut = (t) => {

        return 1 -
            Math.pow(
                1 - t,
                3
            );

    };


    // -------------------------------------------------
    // MODELLO ANELLO
    // -------------------------------------------------

    const model = [];

    let minY = Infinity;
    let maxY = -Infinity;


    for (
        let i = 0;
        i < POINT_COUNT;
        i++
    ) {

        const gem =
            i <
            POINT_COUNT *
            0.14;


        let position;
        let normal;


        // =================================================
        // PIETRA
        // =================================================

        if (gem) {

            let a = random();
            let b = random();


            if (a + b > 1) {

                a = 1 - a;
                b = 1 - b;

            }


            const c =
                1 - a - b;


            const sx =
                random() < 0.5
                    ? -1
                    : 1;


            const sy =
                random() < 0.5
                    ? -1
                    : 1;


            const sz =
                random() < 0.5
                    ? -1
                    : 1;


            position = [

                sx *
                a *
                0.42,

                1.3 +
                sy *
                c *
                0.34,

                sz *
                b *
                0.42

            ];


            const length =
                Math.hypot(

                    sx / 0.42,
                    sy / 0.34,
                    sz / 0.42

                );


            normal = [

                sx /
                0.42 /
                length,

                sy /
                0.34 /
                length,

                sz /
                0.42 /
                length

            ];

        }


        // =================================================
        // FASCIA ANELLO
        // =================================================

        else {

            const u =
                random() *
                Math.PI *
                2;


            const v =
                random() *
                Math.PI *
                2;


            const radius =
                1 +
                0.11 *
                Math.cos(v);


            position = [

                radius *
                Math.cos(u),

                radius *
                Math.sin(u) -
                0.25,

                0.17 *
                Math.sin(v)

            ];


            normal = [

                Math.cos(v) *
                Math.cos(u),

                Math.cos(v) *
                Math.sin(u),

                Math.sin(v)

            ];

        }


        minY =
            Math.min(
                minY,
                position[1]
            );


        maxY =
            Math.max(
                maxY,
                position[1]
            );


        model.push({

            position,

            normal,

            gem,

            layer: 0,

            layerY: 0

        });

    }


    // -------------------------------------------------
    // ASSEGNA OGNI PUNTO A UNO DEI 200 LAYER
    // -------------------------------------------------

    const modelHeight =
        maxY - minY;


    const verticalCenter =
        (
            minY +
            maxY
        ) / 2;


    model.forEach(
        (point) => {

            const normalizedY =

                (
                    point.position[1] -
                    minY
                )

                /

                modelHeight;


            const layer =

                Math.min(

                    LAYER_COUNT - 1,

                    Math.floor(
                        normalizedY *
                        LAYER_COUNT
                    )

                );


            point.layer =
                layer;


            point.layerY =

                minY +

                (
                    layer +
                    0.5
                )

                /

                LAYER_COUNT

                *

                modelHeight;

        }
    );


    // -------------------------------------------------
    // CANVAS
    // -------------------------------------------------

    let width;
    let height;
    let dpr;


    function resizeCanvas() {

        mobile =
            window.innerWidth < 700;


        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        width =
            canvas.width =
            window.innerWidth *
            dpr;


        height =
            canvas.height =
            window.innerHeight *
            dpr;

    }


    window.addEventListener(
        'resize',
        resizeCanvas
    );


    resizeCanvas();


    // -------------------------------------------------
    // SCROLL
    // -------------------------------------------------

    let progress = 0;

    let smoothProgress = 0;


    function readScroll() {

        const rect =
            track.getBoundingClientRect();


        const scrollLength =

            track.offsetHeight -
            window.innerHeight;


        progress =

            clamp(
                -rect.top /
                scrollLength
            );

    }


    window.addEventListener(
        'scroll',
        readScroll,
        {
            passive: true
        }
    );


    readScroll();


    // -------------------------------------------------
    // LUCE
    // -------------------------------------------------

    const light = [
        0.35,
        0.75,
        0.55
    ];


    const lightLength =
        Math.hypot(
            ...light
        );


    light[0] /= lightLength;
    light[1] /= lightLength;
    light[2] /= lightLength;


    // -------------------------------------------------
    // LOOP
    // -------------------------------------------------

    function frame(milliseconds) {

        requestAnimationFrame(frame);


        const rect =
            track.getBoundingClientRect();


        if (
            rect.bottom < 0 ||
            rect.top >
            window.innerHeight
        ) {

            return;

        }


        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        const time =
            reduceMotion

                ? 0

                : milliseconds *
                0.001;


        smoothProgress +=

            (
                progress -
                smoothProgress
            )

            *

            0.075;


        // -------------------------------------------------
        // BUILD PROGRESS
        // -------------------------------------------------

        const buildProgress =

            easeInOut(

                clamp(

                    (
                        smoothProgress -
                        0.04
                    )

                    /

                    0.78

                )

            );


        // -------------------------------------------------
        // FINAL REVEAL
        // -------------------------------------------------

        const reveal =

            easeOut(

                clamp(

                    (
                        smoothProgress -
                        0.82
                    )

                    /

                    0.18

                )

            );


        const activeLayer =

            Math.min(

                LAYER_COUNT - 1,

                Math.floor(
                    buildProgress *
                    LAYER_COUNT
                )

            );


        // -------------------------------------------------
        // COUNTER
        // -------------------------------------------------

        if (counter) {

            const currentLayer =

                Math.min(

                    LAYER_COUNT,

                    Math.floor(
                        buildProgress *
                        LAYER_COUNT
                    )

                );


            counter.textContent =

                String(
                    currentLayer
                )
                .padStart(
                    3,
                    '0'
                );

        }


        // -------------------------------------------------
        // POSIZIONE
        // -------------------------------------------------

        const centerX =

            width *

            (
                mobile
                    ? 0.5
                    : 0.67
            );


        const centerY =

            height *

            (
                mobile
                    ? 0.59
                    : 0.5
            );


        const scale =

            Math.min(
                width,
                height
            )

            *

            (
                mobile
                    ? 0.29
                    : 0.22
            );


        // -------------------------------------------------
        // MOVIMENTO 3D
        // -------------------------------------------------

        const rotation =

            -0.10 +

            reveal *
            (
                0.75 +
                time *
                0.30
            );


        const tilt =

            0.015 +

            reveal *
            0.30;


        const cosRotation =
            Math.cos(rotation);

        const sinRotation =
            Math.sin(rotation);

        const cosTilt =
            Math.cos(tilt);

        const sinTilt =
            Math.sin(tilt);


        // -------------------------------------------------
        // CLEAR
        // -------------------------------------------------

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // -------------------------------------------------
        // POSIZIONE DEL PIANO DI STAMPA
        // -------------------------------------------------

        const currentWorldY =

            minY +

            buildProgress *
            modelHeight;


        const relativePrintY =

            currentWorldY -
            verticalCenter;


        const printScreenY =

            centerY -

            relativePrintY *
            scale *
            cosTilt;


        // -------------------------------------------------
        // POWDER BED
        // -------------------------------------------------

        const bedWidth =
            scale *
            3.1;


        const powderGradient =

            ctx.createLinearGradient(
                0,
                printScreenY,
                0,
                printScreenY +
                scale *
                0.65
            );


        powderGradient.addColorStop(
            0,
            'rgba(160, 165, 172, 0.09)'
        );


        powderGradient.addColorStop(
            1,
            'rgba(160, 165, 172, 0)'
        );


        ctx.fillStyle =
            powderGradient;


        ctx.fillRect(

            centerX -
            bedWidth /
            2,

            printScreenY,

            bedWidth,

            scale *
            0.65

        );


        // -------------------------------------------------
        // LINEA DEL LAYER ATTIVO
        // -------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(

            centerX -
            bedWidth /
            2,

            printScreenY

        );


        ctx.lineTo(

            centerX +
            bedWidth /
            2,

            printScreenY

        );


        ctx.strokeStyle =

            `rgba(
                236,
                235,
                231,
                ${
                    0.18 +
                    buildProgress *
                    0.35
                }
            )`;


        ctx.lineWidth =
            1 *
            dpr;


        ctx.stroke();


        // Piccolo glow

        ctx.beginPath();


        ctx.moveTo(

            centerX -
            bedWidth *
            0.18,

            printScreenY

        );


        ctx.lineTo(

            centerX +
            bedWidth *
            0.18,

            printScreenY

        );


        ctx.strokeStyle =
            'rgba(236, 235, 231, 0.75)';


        ctx.lineWidth =
            1.4 *
            dpr;


        ctx.stroke();


        // -------------------------------------------------
        // DISEGNO ANELLO
        // -------------------------------------------------

        for (
            const point
            of model
        ) {

            if (
                point.layer >
                activeLayer
            ) {

                continue;

            }


            // -------------------------------------------------
            // GEOMETRIA
            // -------------------------------------------------

            let x =
                point.position[0];


            let y =

                point.layerY -
                verticalCenter;


            let z =
                point.position[2];


            let [
                nx,
                ny,
                nz
            ] =
                point.normal;


            // -------------------------------------------------
            // ROTAZIONE Y
            // -------------------------------------------------

            const X =

                x *
                cosRotation

                +

                z *
                sinRotation;


            let Z =

                -x *
                sinRotation

                +

                z *
                cosRotation;


            // -------------------------------------------------
            // TILT
            // -------------------------------------------------

            const Y =

                y *
                cosTilt

                -

                Z *
                sinTilt;


            Z =

                y *
                sinTilt

                +

                Z *
                cosTilt;


            // -------------------------------------------------
            // NORMALE
            // -------------------------------------------------

            const NX =

                nx *
                cosRotation

                +

                nz *
                sinRotation;


            let NZ =

                -nx *
                sinRotation

                +

                nz *
                cosRotation;


            const NY =

                ny *
                cosTilt

                -

                NZ *
                sinTilt;


            NZ =

                ny *
                sinTilt

                +

                NZ *
                cosTilt;


            // -------------------------------------------------
            // LUCE
            // -------------------------------------------------

            const dot =

                (
                    NX *
                    light[0]

                    +

                    NY *
                    light[1]

                    +

                    NZ *
                    light[2]
                )

                /

                (
                    Math.hypot(
                        NX,
                        NY,
                        NZ
                    ) || 1
                );


            const perspective =

                4.6 /

                (
                    4.6 -
                    Z
                );


            // -------------------------------------------------
            // LAYER APPENA STAMPATI
            // -------------------------------------------------

            const distanceFromPrintHead =

                activeLayer -
                point.layer;


            const freshLayer =

                clamp(

                    1 -

                    distanceFromPrintHead /
                    5

                );


            let brightness =

                0.42 +

                0.76 *
                Math.max(
                    0,
                    dot
                )

                +

                freshLayer *
                0.6;


            // -------------------------------------------------
            // PIETRA
            // -------------------------------------------------

            const color =

                point.gem

                    ? [
                        236,
                        243,
                        252
                    ]

                    : METAL;


            if (point.gem) {

                brightness +=

                    Math.pow(

                        Math.max(
                            0,
                            dot
                        ),

                        6

                    )

                    *

                    0.65;

            }


            // -------------------------------------------------
            // COLOR
            // -------------------------------------------------

            const red =

                clamp(
                    color[0] *
                    brightness,
                    0,
                    255
                ) | 0;


            const green =

                clamp(
                    color[1] *
                    brightness,
                    0,
                    255
                ) | 0;


            const blue =

                clamp(
                    color[2] *
                    brightness,
                    0,
                    255
                ) | 0;


            ctx.fillStyle =

                `rgb(
                    ${red},
                    ${green},
                    ${blue}
                )`;


            // -------------------------------------------------
            // SCREEN POSITION
            // -------------------------------------------------

            const px =

                centerX +

                X *
                scale *
                perspective;


            const py =

                centerY -

                Y *
                scale *
                perspective;


            // -------------------------------------------------
            // PARTICLE SIZE
            // -------------------------------------------------

            const particleSize =

                (
                    mobile
                        ? 1.35
                        : 1.6
                )

                *

                dpr

                *

                perspective

                *

                (
                    freshLayer > 0.2
                        ? 1.15
                        : 1
                );


            ctx.fillRect(

                px,

                py,

                particleSize,

                particleSize

            );

        }


        // -------------------------------------------------
        // LABEL LAYER ATTIVO
        // -------------------------------------------------

        if (
            buildProgress > 0.01 &&
            buildProgress < 0.99
        ) {

            ctx.textAlign =
                'right';


            ctx.fillStyle =
                'rgba(154, 159, 167, 0.7)';


            ctx.font =
                `${11 * dpr}px Jost, system-ui, sans-serif`;


            ctx.fillText(

                `LAYER ${
                    String(
                        activeLayer + 1
                    )
                    .padStart(
                        3,
                        '0'
                    )
                }`,

                centerX +
                bedWidth /
                2,

                printScreenY -
                12 *
                dpr

            );

        }

    }


    // -------------------------------------------------
    // START
    // -------------------------------------------------

    requestAnimationFrame(frame);

})();

// =====================================================
// BAG HARDWARE — REAL IMAGE ORBITING MATERIALS
//
// Moschettone reale centrale
// +
// nuclei metallici orbitanti.
//
// Click / tap:
// crossfade verso la PNG
// del materiale selezionato.
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const track =
        document.getElementById(
            'bag-material-orbit'
        );


    const canvas =
        document.getElementById(
            'bagMaterialOrbitCanvas'
        );


    const materialName =
        document.getElementById(
            'bagSelectedMaterial'
        );


    if (!track || !canvas) {
        return;
    }


    const ctx =
        canvas.getContext('2d');


    // =================================================
    // MATERIALS
    // =================================================

    const MATERIALS = [

        {
            name: 'Platinum',

            slug: 'platino',

            image:
                'immagini/pendente-platino.png',

            particle: [
                225,
                232,
                242
            ]
        },

        {
            name: 'Titanium',

            slug: 'titanio',

            image:
                'immagini/pendente-metallo.png',

            particle: [
                150,
                160,
                184
            ]
        },

        {
            name: 'Gold',

            slug: 'oro',

            image:
                'immagini/pendente2.png',

            particle: [
                255,
                214,
                116
            ]
        },

        {
            name: 'Steel',

            slug: 'acciaio',

            image:
                'immagini/pendente-argento.png',

            particle: [
                195,
                202,
                212
            ]
        },

        {
            name: 'Bronze',

            slug: 'bronzo',

            image:
                'immagini/pendente-bronzo.png',

            particle: [
                232,
                151,
                68
            ]
        },

        {
            name: 'Silver',

            slug: 'argento',

            image:
                'immagini/pendente-ferro.png',

            particle: [
                250,
                250,
                246
            ]
        }

    ];


    // =================================================
    // CONFIG
    // =================================================

    const TAU =
        Math.PI * 2;


    let mobile =
        window.innerWidth < 700;


    const NUCLEUS_PARTICLES =
        mobile
            ? 20
            : 34;


    const random =
        Math.random;


    const reduceMotion =

        window
            .matchMedia(
                '(prefers-reduced-motion: reduce)'
            )
            .matches;


    // =================================================
    // UTILITY
    // =================================================

    const lerp = (
        a,
        b,
        t
    ) => {

        return (
            a +
            (b - a) * t
        );

    };


    // =================================================
    // LOAD REAL IMAGES
    // =================================================

    const images =

        MATERIALS.map(
            material => {

                const image =
                    new Image();


                image.decoding =
                    'async';


                image.onload =
                    () => {

                        console.log(
                            'Loaded:',
                            material.name
                        );

                    };


                image.onerror =
                    () => {

                        console.warn(
                            'Image missing:',
                            material.image
                        );

                    };


                image.src =
                    material.image;


                return image;

            }
        );


    // =================================================
    // NUCLEUS PARTICLES
    // =================================================

    const nucleusModels =

        MATERIALS.map(
            () => {

                const particles =
                    [];


                for (
                    let i = 0;
                    i < NUCLEUS_PARTICLES;
                    i++
                ) {

                    particles.push({

                        angle:

                            random() *
                            TAU,


                        radius:

                            Math.pow(
                                random(),
                                0.65
                            ),


                        size:

                            0.7 +

                            random() *
                            1.7,


                        speed:

                            0.3 +

                            random() *
                            0.7,


                        depth:

                            0.4 +

                            random() *
                            0.6

                    });

                }


                return particles;

            }
        );


    // =================================================
    // CANVAS
    // =================================================

    let width;
    let height;
    let dpr;


    function resizeCanvas() {

        mobile =
            window.innerWidth < 700;


        dpr =

            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        width =
            window.innerWidth;


        height =
            window.innerHeight;


        canvas.width =

            Math.round(
                width *
                dpr
            );


        canvas.height =

            Math.round(
                height *
                dpr
            );


        canvas.style.width =
            `${width}px`;


        canvas.style.height =
            `${height}px`;


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    resizeCanvas();


    window.addEventListener(
        'resize',
        resizeCanvas
    );


    // =================================================
    // SELECTED MATERIAL
    // =================================================

    let selectedIndex =
        0;


    let previousIndex =
        0;


    let transition =
        1;


    function selectMaterial(
        index
    ) {

        if (
            index < 0 ||
            index >= MATERIALS.length
        ) {

            return;

        }


        if (
            index === selectedIndex
        ) {

            return;

        }


        previousIndex =
            selectedIndex;


        selectedIndex =
            index;


        transition =
            0;


        if (materialName) {

            materialName.textContent =

                MATERIALS[index]
                    .name;

        }

    }


    // =================================================
    // NUCLEUS POSITIONS
    // =================================================

    const nucleusPositions =
        [];


    function calculateNucleusPositions(
        time
    ) {

        nucleusPositions.length =
            0;


        const centerX =
            width * 0.5;


        const centerY =

            height *

            (
                mobile
                    ? 0.60
                    : 0.52
            );


        const radiusX =

            width *

            (
                mobile
                    ? 0.35
                    : 0.31
            );


        const radiusY =

            height *

            (
                mobile
                    ? 0.20
                    : 0.32
            );


        for (
            let i = 0;
            i < MATERIALS.length;
            i++
        ) {

            const baseAngle =

                i /
                MATERIALS.length *
                TAU;


            const angle =

                baseAngle +

                time *
                0.18;


            const depth =

                Math.sin(
                    angle
                );


            nucleusPositions.push({

                index:
                    i,

                angle,

                depth,

                x:

                    centerX +

                    Math.cos(
                        angle
                    )

                    *

                    radiusX,


                y:

                    centerY +

                    Math.sin(
                        angle
                    )

                    *

                    radiusY

            });

        }


        nucleusPositions.sort(
            (a, b) =>
                a.depth -
                b.depth
        );

    }


    // =================================================
    // HOVER / HIT AREA
    // =================================================

    let hoveredIndex =
        -1;


    let hardwareHitArea =
        null;


    // =================================================
    // DRAW NUCLEUS
    // =================================================

    function drawNucleus(
        nucleus,
        time
    ) {

        const material =

            MATERIALS[
                nucleus.index
            ];


        const particles =

            nucleusModels[
                nucleus.index
            ];


        const selected =

            nucleus.index ===
            selectedIndex;


        const hovered =

            nucleus.index ===
            hoveredIndex;


        // ---------------------------------------------
        // DEPTH
        // ---------------------------------------------

        const depthScale =

            lerp(

                0.72,

                1.18,

                (
                    nucleus.depth +
                    1
                )

                /

                2

            );


        const interactionScale =

            selected
                ? 1.22
                : hovered
                    ? 1.13
                    : 1;


        const radius =

            (
                mobile
                    ? 22
                    : 27
            )

            *

            depthScale

            *

            interactionScale;


        // =================================================
        // HALO
        // =================================================

        const halo =

            ctx.createRadialGradient(

                nucleus.x,
                nucleus.y,
                0,

                nucleus.x,
                nucleus.y,
                radius * 2.6

            );


        halo.addColorStop(

            0,

            `rgba(
                ${material.particle[0]},
                ${material.particle[1]},
                ${material.particle[2]},
                ${
                    selected
                        ? 0.20
                        : hovered
                            ? 0.13
                            : 0.07
                }
            )`

        );


        halo.addColorStop(
            1,
            'rgba(255,255,255,0)'
        );


        ctx.fillStyle =
            halo;


        ctx.beginPath();


        ctx.arc(

            nucleus.x,
            nucleus.y,

            radius *
            2.6,

            0,
            TAU

        );


        ctx.fill();


        // =================================================
        // PARTICLES
        // =================================================

        for (
            const particle
            of particles
        ) {

            const angle =

                particle.angle +

                time *
                particle.speed *
                0.7;


            const distance =

                particle.radius *
                radius;


            const px =

                nucleus.x +

                Math.cos(
                    angle
                )

                *

                distance;


            const py =

                nucleus.y +

                Math.sin(
                    angle
                )

                *

                distance *
                0.72;


            const alpha =

                (
                    0.35 +

                    particle.depth *
                    0.55
                )

                *

                (
                    nucleus.depth > 0
                        ? 1
                        : 0.72
                );


            ctx.fillStyle =

                `rgba(
                    ${material.particle[0]},
                    ${material.particle[1]},
                    ${material.particle[2]},
                    ${alpha}
                )`;


            const particleSize =

                particle.size *

                depthScale *

                interactionScale;


            ctx.fillRect(

                px -
                particleSize / 2,

                py -
                particleSize / 2,

                particleSize,
                particleSize

            );

        }


        // =================================================
        // CORE
        // =================================================

        ctx.beginPath();


        ctx.arc(

            nucleus.x,
            nucleus.y,

            selected
                ? 3.8
                : 2.6,

            0,
            TAU

        );


        ctx.fillStyle =

            `rgb(
                ${material.particle[0]},
                ${material.particle[1]},
                ${material.particle[2]}
            )`;


        ctx.fill();


        // =================================================
        // ACTIVE / HOVER CIRCLE
        // =================================================

        if (
            selected ||
            hovered
        ) {

            ctx.beginPath();


            ctx.arc(

                nucleus.x,
                nucleus.y,

                radius +
                8,

                0,
                TAU

            );


            ctx.strokeStyle =

                `rgba(
                    ${material.particle[0]},
                    ${material.particle[1]},
                    ${material.particle[2]},
                    ${
                        selected
                            ? 0.65
                            : 0.28
                    }
                )`;


            ctx.lineWidth =
                1;


            ctx.stroke();

        }


        // =================================================
        // LABEL
        // =================================================

        ctx.textAlign =
            'center';


        ctx.font =

            `${
                mobile
                    ? 9
                    : 10
            }px Jost, system-ui, sans-serif`;


        ctx.fillStyle =

            selected

                ? 'rgba(236,235,231,0.95)'

                : hovered

                    ? 'rgba(236,235,231,0.82)'

                    : 'rgba(154,159,167,0.65)';


        ctx.fillText(

            material.name
                .toUpperCase(),

            nucleus.x,

            nucleus.y +
            radius +
            22

        );

    }


    // =================================================
    // FALLBACK HARDWARE
    // =================================================

    function drawFallbackHardware(
        materialIndex,
        alpha,
        time
    ) {

        const material =

            MATERIALS[
                materialIndex
            ];


        const cx =
            width * 0.5;


        const cy =

            height *

            (
                mobile
                    ? 0.60
                    : 0.52
            );


        const scale =

            Math.min(
                width,
                height
            )

            *

            (
                mobile
                    ? 0.19
                    : 0.22
            );


        // ---------------------------------------------
        // AREA CLICCABILE FALLBACK
        // ---------------------------------------------

        hardwareHitArea = {

            x:
                cx -
                scale * 0.75,

            y:
                cy -
                scale * 0.95,

            width:
                scale * 1.5,

            height:
                scale * 2

        };


        ctx.save();


        ctx.globalAlpha =
            alpha;


        ctx.translate(
            cx,
            cy
        );


        ctx.rotate(

            Math.sin(
                time * 0.28
            )

            *

            0.025

        );


        ctx.scale(
            scale,
            scale
        );


        ctx.strokeStyle =

            `rgb(
                ${material.particle[0]},
                ${material.particle[1]},
                ${material.particle[2]}
            )`;


        ctx.lineWidth =
            0.055;


        ctx.lineCap =
            'round';


        ctx.lineJoin =
            'round';


        // MAIN BODY

        ctx.beginPath();


        ctx.ellipse(

            0,
            -0.12,

            0.52,
            0.72,

            0,

            0.45,
            TAU - 0.45

        );


        ctx.stroke();


        // GATE

        ctx.beginPath();


        ctx.moveTo(
            0.46,
            -0.38
        );


        ctx.lineTo(
            0.44,
            0.40
        );


        ctx.stroke();


        // CONNECTION

        ctx.beginPath();


        ctx.moveTo(
            0,
            0.60
        );


        ctx.lineTo(
            0,
            0.78
        );


        ctx.stroke();


        // EYE

        ctx.beginPath();


        ctx.ellipse(

            0,
            0.92,

            0.21,
            0.14,

            0,

            0,
            TAU

        );


        ctx.stroke();


        ctx.restore();

    }


    // =================================================
    // DRAW REAL IMAGE
    // =================================================

    function drawHardwareImage(
        index,
        alpha,
        time
    ) {

        if (
            alpha <=
            0.001
        ) {

            return;

        }


        const image =
            images[index];


        // ---------------------------------------------
        // PNG NOT AVAILABLE
        // ---------------------------------------------

        if (
            !image ||
            !image.complete ||
            !image.naturalWidth
        ) {

            drawFallbackHardware(
                index,
                alpha,
                time
            );


            return;

        }


        const centerX =
            width * 0.5;


        const centerY =

            height *

            (
                mobile
                    ? 0.60
                    : 0.52
            );


        // =================================================
        // DIMENSIONE
        // =================================================

        const desiredHeight =

            Math.min(
                width,
                height
            )

            *

            (
                mobile
                    ? 0.39
                    : 0.50
            );


        const ratio =

            image.naturalWidth /
            image.naturalHeight;


        const drawHeight =
            desiredHeight;


        const drawWidth =

            drawHeight *
            ratio;


        // =================================================
        // SUBTLE FLOAT
        // =================================================

        const floatY =

            reduceMotion

                ? 0

                : Math.sin(
                    time * 0.55
                ) * 5;


        const rotation =

            reduceMotion

                ? 0

                : Math.sin(
                    time * 0.24
                ) * 0.025;


        const breathe =

            reduceMotion

                ? 1

                : 1 +

                  Math.sin(
                      time * 0.38
                  ) *

                  0.008;


        // =================================================
        // DRAW
        // =================================================

        ctx.save();


        ctx.globalAlpha =
            alpha;


        ctx.translate(

            centerX,

            centerY +
            floatY

        );


        ctx.rotate(
            rotation
        );


        ctx.scale(
            breathe,
            breathe
        );


        ctx.shadowColor =
            'rgba(0,0,0,0.28)';


        ctx.shadowBlur =
            20;


        ctx.shadowOffsetY =
            7;


        ctx.drawImage(

            image,

            -drawWidth / 2,
            -drawHeight / 2,

            drawWidth,
            drawHeight

        );


        ctx.restore();


        // =================================================
        // AREA CLICCABILE PENDENTE
        // =================================================

        hardwareHitArea = {

            x:

                centerX -

                (
                    drawWidth *
                    breathe
                )

                / 2,


            y:

                centerY +
                floatY -

                (
                    drawHeight *
                    breathe
                )

                / 2,


            width:

                drawWidth *
                breathe,


            height:

                drawHeight *
                breathe

        };

    }


    // =================================================
    // DRAW CENTRAL OBJECT
    // =================================================

    function drawHardware(
        time
    ) {

        transition =

            lerp(
                transition,
                1,
                0.075
            );


        if (
            transition >
            0.995
        ) {

            transition =
                1;

        }


        // ---------------------------------------------
        // VECCHIO MATERIALE
        // ---------------------------------------------

        if (
            transition <
            1
        ) {

            drawHardwareImage(

                previousIndex,

                1 -
                transition,

                time

            );

        }


        // ---------------------------------------------
        // NUOVO MATERIALE
        // ---------------------------------------------

        drawHardwareImage(

            selectedIndex,

            transition,

            time

        );

    }


    // =================================================
    // HIT TEST MATERIALI
    // =================================================

    function getHitMaterial(
        x,
        y
    ) {

        let hit =
            -1;


        let closest =
            Infinity;


        for (
            const nucleus
            of nucleusPositions
        ) {

            const distance =

                Math.hypot(

                    x -
                    nucleus.x,

                    y -
                    nucleus.y

                );


            const hitRadius =

                mobile
                    ? 42
                    : 48;


            if (
                distance <
                hitRadius

                &&

                distance <
                closest
            ) {

                closest =
                    distance;


                hit =
                    nucleus.index;

            }

        }


        return hit;

    }


    // =================================================
    // HIT TEST PENDENTE
    // =================================================

    function isHardwareHit(
        x,
        y
    ) {

        if (!hardwareHitArea) {
            return false;
        }


        return (

            x >=
            hardwareHitArea.x

            &&

            x <=
            hardwareHitArea.x +
            hardwareHitArea.width

            &&

            y >=
            hardwareHitArea.y

            &&

            y <=
            hardwareHitArea.y +
            hardwareHitArea.height

        );

    }


    // =================================================
    // POINTER MOVE
    // =================================================

    canvas.addEventListener(
        'pointermove',
        event => {

            const rect =
                canvas.getBoundingClientRect();


            const x =

                event.clientX -
                rect.left;


            const y =

                event.clientY -
                rect.top;


            // -----------------------------------------
            // MATERIALI ORBITANTI
            // -----------------------------------------

            hoveredIndex =

                getHitMaterial(
                    x,
                    y
                );


            // -----------------------------------------
            // PENDENTE CENTRALE
            // -----------------------------------------

            const overHardware =

                isHardwareHit(
                    x,
                    y
                );


            // -----------------------------------------
            // CURSOR
            // -----------------------------------------

            canvas.style.cursor =

                (
                    hoveredIndex >= 0 ||
                    overHardware
                )

                    ? 'pointer'

                    : 'default';

        }
    );


    // =================================================
    // POINTER LEAVE
    // =================================================

    canvas.addEventListener(
        'pointerleave',
        () => {

            hoveredIndex =
                -1;


            canvas.style.cursor =
                'default';

        }
    );


    // =================================================
    // CLICK
    // =================================================

    canvas.addEventListener(
        'click',
        event => {

            const rect =
                canvas.getBoundingClientRect();


            const x =

                event.clientX -
                rect.left;


            const y =

                event.clientY -
                rect.top;


            // =================================================
            // CLICK SU MATERIALE ORBITANTE
            // =================================================

            const materialIndex =

                getHitMaterial(
                    x,
                    y
                );


            if (
                materialIndex >= 0
            ) {

                selectMaterial(
                    materialIndex
                );


                /*
                    Se clicchiamo un materiale orbitante
                    cambiamo semplicemente il materiale.

                    NON facciamo ancora il redirect.
                */

                return;

            }


            // =================================================
            // CLICK SUL PENDENTE
            // =================================================

            if (
                !isHardwareHit(
                    x,
                    y
                )
            ) {

                return;

            }


            // =================================================
            // MATERIALE ATTUALMENTE SELEZIONATO
            // =================================================

            const material =

                MATERIALS[
                    selectedIndex
                ];


            if (
                !material ||
                !material.slug
            ) {

                return;

            }


            // =================================================
            // REDIRECT
            // =================================================

            const destination =

                `/prodotto-pendente/prodotto-pendente.html?material=${
                    encodeURIComponent(
                        material.slug
                    )
                }`;


            console.log(
                'Redirect pendente:',
                destination
            );


            window.location.assign(
                destination
            );

        }
    );


    // =================================================
    // LOOP
    // =================================================

    function frame(
        milliseconds
    ) {

        requestAnimationFrame(
            frame
        );


        const rect =
            track.getBoundingClientRect();


        if (
            rect.bottom < 0 ||
            rect.top > window.innerHeight
        ) {

            hardwareHitArea =
                null;


            hoveredIndex =
                -1;


            canvas.style.cursor =
                'default';


            return;

        }


        const time =

            reduceMotion

                ? 0

                : milliseconds *
                  0.001;


        // =================================================
        // CLEAR
        // =================================================

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
            Ricreiamo l'area cliccabile
            a ogni frame.
        */

        hardwareHitArea =
            null;


        // =================================================
        // ORBITS
        // =================================================

        calculateNucleusPositions(
            time
        );


        const behind =

            nucleusPositions.filter(
                nucleus =>
                    nucleus.depth < 0
            );


        const front =

            nucleusPositions.filter(
                nucleus =>
                    nucleus.depth >= 0
            );


        // =================================================
        // BACK MATERIALS
        // =================================================

        for (
            const nucleus
            of behind
        ) {

            drawNucleus(
                nucleus,
                time
            );

        }


        // =================================================
        // REAL PENDANT IMAGE
        // =================================================

        drawHardware(
            time
        );


        // =================================================
        // FRONT MATERIALS
        // =================================================

        for (
            const nucleus
            of front
        ) {

            drawNucleus(
                nucleus,
                time
            );

        }

    }


    // =================================================
    // START
    // =================================================

    if (materialName) {

        materialName.textContent =
            MATERIALS[0].name;

    }


    requestAnimationFrame(
        frame
    );

})();

// =====================================================
// LATTICE PENDANT
// POWDER -> FRAME -> LATTICE -> FINISHED PENDANT
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const track =
        document.getElementById(
            'lattice-pendant'
        );

    const canvas =
        document.getElementById(
            'latticePendantCanvas'
        );

    if (!track || !canvas) {
        return;
    }

    const ctx =
        canvas.getContext('2d');

    const storyNumber =
        document.getElementById(
            'latticePendantNumber'
        );

    const storyKicker =
        document.getElementById(
            'latticePendantKicker'
        );

    const storyTitle =
        document.getElementById(
            'latticePendantTitle'
        );

    const storyText =
        document.getElementById(
            'latticePendantText'
        );

    const phaseEl =
        document.getElementById(
            'latticePendantPhase'
        );

    const percentEl =
        document.getElementById(
            'latticePendantPercent'
        );

    const dots =
        track.querySelectorAll(
            '.lattice-pendant-dots i'
        );


    // =================================================
    // UTILITY
    // =================================================

    const random =
        Math.random;

    const clamp = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(min, value)
        );

    };

    const lerp = (
        a,
        b,
        t
    ) => {

        return a + (b - a) * t;

    };

    const smoothStep = (t) => {

        t = clamp(t);

        return (
            t * t * (3 - 2 * t)
        );

    };


    // =================================================
    // STORY
    // =================================================

    const STORIES = [

        {
            number: '01',
            kicker: 'Metal powder',
            title: 'It starts<br>with matter.',
            text:
                'La polvere metallica rappresenta il punto di partenza per una geometria leggera, aperta e strutturalmente sofisticata.'
        },

        {
            number: '02',
            kicker: 'Pendant frame',
            title: 'Form defines<br>the silhouette.',
            text:
                'Si costruisce prima il telaio esterno del pendente, definendo volume, bordo e presenza visiva.'
        },

        {
            number: '03',
            kicker: 'Internal lattice',
            title: 'Lightness meets<br>complexity.',
            text:
                'All’interno compare una struttura lattice che alleggerisce il pezzo e comunica complessità geometrica.'
        },

        {
            number: '04',
            kicker: 'Finished pendant',
            title: 'From powder<br>to design.',
            text:
                'Il risultato è un pendente tridimensionale con struttura interna aperta, difficile da ottenere con metodi tradizionali.'
        }

    ];


    let activeStory =
        -1;


    function updateStory(index) {

        if (index === activeStory) {
            return;
        }

        activeStory = index;

        const data =
            STORIES[index];

        storyNumber.textContent =
            data.number;

        storyKicker.textContent =
            data.kicker;

        storyTitle.innerHTML =
            data.title;

        storyText.textContent =
            data.text;

        dots.forEach(
            (dot, dotIndex) => {

                dot.classList.toggle(
                    'is-active',
                    dotIndex === index
                );

            }
        );

    }


    // =================================================
    // CANVAS
    // =================================================

    let width;
    let height;
    let dpr;
    let mobile =
        window.innerWidth < 700;


    function resizeCanvas() {

        mobile =
            window.innerWidth < 700;

        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        width =
            window.innerWidth;

        height =
            window.innerHeight;

        canvas.width =
            Math.round(width * dpr);

        canvas.height =
            Math.round(height * dpr);

        canvas.style.width =
            `${width}px`;

        canvas.style.height =
            `${height}px`;

        ctx.setTransform(
            dpr, 0, 0, dpr, 0, 0
        );

    }


    // =================================================
    // GEOMETRY
    // =================================================

    const OUTER_RX = 0.92;
    const OUTER_RY = 1.18;

    const INNER_RX = 0.63;
    const INNER_RY = 0.89;

    const DEPTH = 0.16;


    // ---------------------------------------------
    // FRAME
    // ---------------------------------------------

    function samplePendantFrame() {

        const mode =
            random();

        // front / back annulus
        if (mode < 0.46) {

            const angle =
                random() *
                Math.PI * 2;

            const innerScaleX =
                INNER_RX / OUTER_RX;

            const innerScaleY =
                INNER_RY / OUTER_RY;

            const innerScale =
                Math.min(
                    innerScaleX,
                    innerScaleY
                );

            const s =
                Math.sqrt(
                    lerp(
                        innerScale * innerScale,
                        1,
                        random()
                    )
                );

            const x =
                OUTER_RX *
                Math.cos(angle) *
                s;

            const y =
                OUTER_RY *
                Math.sin(angle) *
                s;

            const front =
                random() > 0.5;

            const z =
                front
                    ? DEPTH
                    : -DEPTH;

            return {
                x, y, z,
                nx: 0,
                ny: 0,
                nz: front ? 1 : -1,
                part: 'frame'
            };

        }

        // outer wall
        if (mode < 0.74) {

            const angle =
                random() *
                Math.PI * 2;

            const x =
                OUTER_RX *
                Math.cos(angle);

            const y =
                OUTER_RY *
                Math.sin(angle);

            const z =
                lerp(
                    -DEPTH,
                    DEPTH,
                    random()
                );

            const nx0 =
                Math.cos(angle) / OUTER_RX;

            const ny0 =
                Math.sin(angle) / OUTER_RY;

            const l =
                Math.hypot(nx0, ny0) || 1;

            return {
                x, y, z,
                nx: nx0 / l,
                ny: ny0 / l,
                nz: 0,
                part: 'frame'
            };

        }

        // inner wall
        const angle =
            random() *
            Math.PI * 2;

        const x =
            INNER_RX *
            Math.cos(angle);

        const y =
            INNER_RY *
            Math.sin(angle);

        const z =
            lerp(
                -DEPTH,
                DEPTH,
                random()
            );

        const nx0 =
            -Math.cos(angle) / INNER_RX;

        const ny0 =
            -Math.sin(angle) / INNER_RY;

        const l =
            Math.hypot(nx0, ny0) || 1;

        return {
            x, y, z,
            nx: nx0 / l,
            ny: ny0 / l,
            nz: 0,
            part: 'frame'
        };

    }


    // ---------------------------------------------
    // BAIL
    // ---------------------------------------------

    function sampleBail() {

        const u =
            random() *
            Math.PI * 2;

        const v =
            random() *
            Math.PI * 2;

        const R = 0.24;
        const r = 0.07;
        const cy = 1.48;

        const x =
            (R + r * Math.cos(v)) *
            Math.cos(u);

        const y =
            cy +
            (R + r * Math.cos(v)) *
            Math.sin(u);

        const z =
            r * Math.sin(v);

        return {
            x, y, z,
            nx:
                Math.cos(u) *
                Math.cos(v),
            ny:
                Math.sin(u) *
                Math.cos(v),
            nz:
                Math.sin(v),
            part: 'bail'
        };

    }


    // ---------------------------------------------
    // CYLINDER AROUND 2D LINE
    // ---------------------------------------------

    function sampleTubeLine2D(
        x1,
        y1,
        x2,
        y2,
        radius
    ) {

        const t =
            random();

        const cx =
            lerp(x1, x2, t);

        const cy =
            lerp(y1, y2, t);

        let tx =
            x2 - x1;

        let ty =
            y2 - y1;

        const len =
            Math.hypot(tx, ty) || 1;

        tx /= len;
        ty /= len;

        const px = ty;
        const py = -tx;

        const phi =
            random() *
            Math.PI * 2;

        const cosPhi =
            Math.cos(phi);

        const sinPhi =
            Math.sin(phi);

        return {
            x:
                cx +
                px * radius * cosPhi,
            y:
                cy +
                py * radius * cosPhi,
            z:
                radius * sinPhi,
            nx:
                px * cosPhi,
            ny:
                py * cosPhi,
            nz:
                sinPhi,
            part: 'lattice'
        };

    }


    // ---------------------------------------------
    // LATTICE
    // ---------------------------------------------

    const latticeRods = [

        [-0.58, -0.56, -0.12, 0.78],
        [-0.28, -0.76,  0.30, 0.66],
        [ 0.08, -0.84,  0.56, 0.44],

        [ 0.58, -0.56,  0.12, 0.78],
        [ 0.28, -0.76, -0.30, 0.66],
        [-0.08, -0.84, -0.56, 0.44],

        [-0.58, -0.12,  0.58, -0.12],
        [-0.46,  0.26,  0.46, 0.26],
        [-0.28,  0.60,  0.28, 0.60]

    ];


    function sampleLattice() {

        const rod =
            latticeRods[
                Math.floor(
                    random() *
                    latticeRods.length
                )
            ];

        return sampleTubeLine2D(
            rod[0],
            rod[1],
            rod[2],
            rod[3],
            0.045
        );

    }


    // ---------------------------------------------
    // RANDOM TARGET
    // ---------------------------------------------

    function samplePendant() {

        const value =
            random();

        if (value < 0.54) {
            return samplePendantFrame();
        }

        if (value < 0.90) {
            return sampleLattice();
        }

        return sampleBail();

    }


    // =================================================
    // PARTICLES
    // =================================================

    let particles =
        [];


    function buildParticles() {

        particles = [];

        const count =
            mobile
                ? 2200
                : 4600;

        for (let i = 0; i < count; i++) {

            const target =
                samplePendant();

            const sx =
                lerp(
                    -2.6,
                    2.6,
                    random()
                );

            const sy =
                -1.64 +
                random() * 0.28;

            const sz =
                lerp(
                    -0.65,
                    0.65,
                    random()
                );

            let delay;

            if (target.part === 'frame') {
                delay =
                    random() * 0.14;
            }

            else if (target.part === 'lattice') {
                delay =
                    0.18 +
                    random() * 0.18;
            }

            else {
                delay =
                    0.38 +
                    random() * 0.12;
            }

            particles.push({

                sx,
                sy,
                sz,

                target,
                delay,

                phase:
                    random() *
                    Math.PI * 2,

                drift:
                    0.35 +
                    random() * 0.8,

                arc:
                    lerp(
                        -0.22,
                        0.22,
                        random()
                    ),

                size:
                    0.65 +
                    random() * 1.15

            });

        }

    }


    // =================================================
    // ROTATION
    // =================================================

    function rotatePoint(
        x,
        y,
        z,
        yaw,
        pitch,
        roll
    ) {

        // Y
        let cos =
            Math.cos(yaw);

        let sin =
            Math.sin(yaw);

        let X =
            x * cos +
            z * sin;

        let Z =
            -x * sin +
            z * cos;

        x = X;
        z = Z;

        // X
        cos =
            Math.cos(pitch);

        sin =
            Math.sin(pitch);

        let Y =
            y * cos -
            z * sin;

        Z =
            y * sin +
            z * cos;

        y = Y;
        z = Z;

        // Z
        cos =
            Math.cos(roll);

        sin =
            Math.sin(roll);

        X =
            x * cos -
            y * sin;

        Y =
            x * sin +
            y * cos;

        return {
            x: X,
            y: Y,
            z
        };

    }


    // =================================================
    // LIGHT
    // =================================================

    const light = [
        0.36,
        0.72,
        0.59
    ];

    const lightLength =
        Math.hypot(...light);

    light[0] /= lightLength;
    light[1] /= lightLength;
    light[2] /= lightLength;


    // =================================================
    // SCROLL
    // =================================================

    let progress = 0;
    let smoothProgress = 0;

    function readScroll() {

        const rect =
            track.getBoundingClientRect();

        const available =
            Math.max(
                1,
                track.offsetHeight -
                window.innerHeight
            );

        progress =
            clamp(
                -rect.top / available
            );

    }


    // =================================================
    // INIT
    // =================================================

    resizeCanvas();
    buildParticles();
    readScroll();

    window.addEventListener(
        'resize',
        () => {
            resizeCanvas();
            buildParticles();
            readScroll();
        }
    );

    window.addEventListener(
        'scroll',
        readScroll,
        { passive: true }
    );


    // =================================================
    // FRAME
    // =================================================

    function frame(milliseconds) {

        requestAnimationFrame(frame);

        const rect =
            track.getBoundingClientRect();

        if (
            rect.bottom < 0 ||
            rect.top > window.innerHeight
        ) {
            return;
        }

        const time =
            milliseconds * 0.001;

        smoothProgress +=
            (
                progress -
                smoothProgress
            ) * 0.065;

        const p =
            smoothProgress;


        // =============================================
        // STORY STEP
        // =============================================

        let storyIndex;

        if (p < 0.22) {
            storyIndex = 0;
        }

        else if (p < 0.48) {
            storyIndex = 1;
        }

        else if (p < 0.74) {
            storyIndex = 2;
        }

        else {
            storyIndex = 3;
        }

        updateStory(storyIndex);


        // =============================================
        // FORMATION
        // =============================================

        const formation =
            smoothStep(
                (p - 0.07) / 0.75
            );

        const finished =
            smoothStep(
                (p - 0.79) / 0.16
            );


        // =============================================
        // CLEAR
        // =============================================

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        // =============================================
        // SCENE
        // =============================================

        const centerX =
            width *
            (
                mobile
                    ? 0.5
                    : 0.67
            );

        const centerY =
            height *
            (
                mobile
                    ? 0.60
                    : 0.52
            );

        const scale =
            Math.min(
                width,
                height
            ) *
            (
                mobile
                    ? 0.17
                    : 0.19
            );


        const yaw =
            lerp(0, -0.38, formation) +
            time * 0.10 * finished;

        const pitch =
            lerp(0, 0.18, formation) +
            Math.sin(time * 0.18) * 0.03 * finished;

        const roll =
            Math.sin(time * 0.15) * 0.06 * finished;


        let formed =
            0;


        // =============================================
        // DRAW PARTICLES
        // =============================================

        for (const particle of particles) {

            const local =
                smoothStep(
                    clamp(
                        (
                            formation -
                            particle.delay
                        ) /
                        (
                            1 -
                            particle.delay
                        )
                    )
                );

            if (local > 0.98) {
                formed++;
            }

            // powder start
            const driftX =
                Math.sin(
                    time *
                    particle.drift +
                    particle.phase
                ) *
                0.025 *
                (1 - local);

            const driftY =
                Math.cos(
                    time *
                    particle.drift *
                    0.8 +
                    particle.phase
                ) *
                0.015 *
                (1 - local);

            const startPerspective =
                4.8 / (4.8 - particle.sz);

            const startX =
                centerX +
                (particle.sx + driftX) *
                scale *
                startPerspective;

            const startY =
                centerY -
                (particle.sy + driftY) *
                scale *
                startPerspective;

            // target
            const target =
                rotatePoint(
                    particle.target.x,
                    particle.target.y,
                    particle.target.z,
                    yaw,
                    pitch,
                    roll
                );

            const targetPerspective =
                4.8 / (4.8 - target.z);

            const targetX =
                centerX +
                target.x *
                scale *
                targetPerspective;

            const targetY =
                centerY -
                target.y *
                scale *
                targetPerspective;

            // trajectory
            const arc =
                Math.sin(
                    local * Math.PI
                );

            const px =
                lerp(
                    startX,
                    targetX,
                    local
                ) +
                arc *
                particle.arc *
                scale;

            const py =
                lerp(
                    startY,
                    targetY,
                    local
                ) -
                arc *
                scale *
                0.24;

            // normal
            const normal =
                rotatePoint(
                    particle.target.nx,
                    particle.target.ny,
                    particle.target.nz,
                    yaw,
                    pitch,
                    roll
                );

            const dot =
                (
                    normal.x * light[0] +
                    normal.y * light[1] +
                    normal.z * light[2]
                ) /
                (
                    Math.hypot(
                        normal.x,
                        normal.y,
                        normal.z
                    ) || 1
                );

            let brightness =
                0.40 +
                0.76 *
                Math.max(0, dot);

            brightness +=
                Math.pow(
                    Math.max(0, dot),
                    10
                ) *
                0.42 *
                finished;

            // material color
            const base =
                particle.target.part === 'lattice'
                    ? [198, 208, 222]
                    : particle.target.part === 'bail'
                        ? [212, 220, 230]
                        : [190, 199, 212];

            const powder =
                [140, 147, 156];

            const metalR =
                base[0] * brightness;

            const metalG =
                base[1] * brightness;

            const metalB =
                base[2] * brightness;

            const r =
                lerp(
                    powder[0],
                    metalR,
                    local
                );

            const g =
                lerp(
                    powder[1],
                    metalG,
                    local
                );

            const b =
                lerp(
                    powder[2],
                    metalB,
                    local
                );

            const alpha =
                lerp(
                    0.40,
                    1,
                    local
                );

            ctx.fillStyle =
                `rgba(${clamp(r, 0, 255) | 0}, ${clamp(g, 0, 255) | 0}, ${clamp(b, 0, 255) | 0}, ${alpha})`;

            const size =
                particle.size *
                lerp(
                    0.85,
                    targetPerspective,
                    local
                ) *
                (
                    mobile
                        ? 0.95
                        : 1.15
                );

            ctx.fillRect(
                px,
                py,
                size,
                size
            );

        }


        // =============================================
        // STATUS
        // =============================================

        if (p < 0.15) {
            phaseEl.textContent = 'POWDER';
        }

        else if (p < 0.48) {
            phaseEl.textContent = 'FRAME';
        }

        else if (p < 0.74) {
            phaseEl.textContent = 'LATTICE';
        }

        else if (p < 0.90) {
            phaseEl.textContent = 'FINISHING';
        }

        else {
            phaseEl.textContent = 'COMPLETE';
        }

        const percentage =
            Math.round(
                formed /
                particles.length *
                100
            );

        percentEl.textContent =
            `${String(percentage).padStart(2, '0')}%`;

    }


    // =================================================
    // START
    // =================================================

    requestAnimationFrame(frame);

})();

// =====================================================
// REAL IMAGE PENDANT — CIRCULAR GENERATION
//
// 1 pendente reale al centro
//
// Le copie:
// 1. nascono dal pendente centrale
// 2. seguono una traiettoria curva
// 3. assumono materiali differenti
// 4. si dispongono in cerchio
// 5. continuano a orbitare
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const track =
        document.getElementById(
            'pendant-circle'
        );

    const canvas =
        document.getElementById(
            'pcCanvas'
        );

    const counter =
        document.getElementById(
            'pcCount'
        );


    if (!track || !canvas) {
        return;
    }


    const ctx =
        canvas.getContext('2d');


    // =================================================
    // CONFIG
    // =================================================

    const OUTER =
        8;

    const TOTAL =
        OUTER + 1;

    const TAU =
        Math.PI * 2;

    const reduceMotion =
        matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;


    let mobile =
        innerWidth < 700;


    // =================================================
    // IMMAGINI MATERIALI
    // =================================================

    const MATERIALS = [

        {
            name: 'Silver',
            src:
                'immagini/pendente2.png'
        },

        {
            name: 'Gold',
            src:
                'immagini/pendente2.png'
        },

        {
            name: 'Bronze',
            src:
                'immagini/pendente2.png'
        },

        {
            name: 'Platinum',
            src:
                'immagini/pendente2.png'
        },

        {
            name: 'Steel',
            src:
                'immagini/pendente2.png'
        },

        {
            name: 'Titanium',
            src:
                'immagini/pendente2.png'
        }

    ];


    // =================================================
    // PRELOAD
    // =================================================

    const images =
    MATERIALS.map(material => {

        const image =
            new Image();

        image.onload = () => {
            console.log(
                'CARICATA:',
                material.name,
                material.src
            );
        };

        image.onerror = () => {
            console.error(
                'IMMAGINE NON TROVATA:',
                material.name,
                material.src
            );
        };

        image.src =
            material.src;

        return image;

    });


    // =================================================
    // UTILITY
    // =================================================

    const clamp = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const lerp = (
        a,
        b,
        t
    ) => {

        return (
            a +
            (b - a) * t
        );

    };


    const smooth = t => {

        t =
            clamp(t);

        return (
            t *
            t *
            (
                3 -
                2 * t
            )
        );

    };


    const easeOut = t => {

        return (

            1 -

            Math.pow(
                1 -
                clamp(t),
                3
            )

        );

    };


    const wrap = angle => {

        return Math.atan2(
            Math.sin(angle),
            Math.cos(angle)
        );

    };


    // =================================================
    // CANVAS
    // =================================================

    let W;
    let H;
    let dpr;


    function resize() {

        mobile =
            innerWidth < 700;


        dpr =
            Math.min(
                devicePixelRatio || 1,
                2
            );


        W =
            innerWidth;


        H =
            innerHeight;


        canvas.width =
            Math.round(
                W * dpr
            );


        canvas.height =
            Math.round(
                H * dpr
            );


        canvas.style.width =
            `${W}px`;


        canvas.style.height =
            `${H}px`;


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    resize();


    addEventListener(
        'resize',
        resize
    );


    // =================================================
    // SCROLL
    // =================================================

    let progress =
        0;


    let smoothP =
        0;


    function readScroll() {

        const rect =
            track.getBoundingClientRect();


        progress =

            clamp(

                -rect.top /

                Math.max(

                    1,

                    track.offsetHeight -
                    innerHeight

                )

            );

    }


    addEventListener(
        'scroll',
        readScroll,
        {
            passive: true
        }
    );


    readScroll();


    // =================================================
    // DRAW REAL PENDANT
    // =================================================

    function drawPendantImage(
        state
    ) {

        const image =
            images[
                state.materialIndex
            ];


        if (
            !image ||
            !image.complete ||
            !image.naturalWidth
        ) {

            return;

        }


        ctx.save();


        // ---------------------------------------------
        // OPACITY
        // ---------------------------------------------

        ctx.globalAlpha =
            state.alpha;


        // ---------------------------------------------
        // POSITION
        // ---------------------------------------------

        ctx.translate(
            state.cx,
            state.cy
        );


        // ---------------------------------------------
        // ROTATION AROUND SCREEN
        // ---------------------------------------------

        ctx.rotate(
            state.rotZ
        );


        // ---------------------------------------------
        // FAKE 3D TILT
        //
        // Con una fotografia 2D non possiamo fare
        // una vera rotazione 3D.
        //
        // Simuliamo la prospettiva comprimendo
        // leggermente X e Y.
        // ---------------------------------------------

        const fakeX =

            clamp(

                0.68 +

                Math.abs(
                    Math.cos(
                        state.rotY
                    )
                ) *
                0.32,

                0.68,
                1

            );


        const fakeY =

            clamp(

                0.82 +

                Math.abs(
                    Math.cos(
                        state.rotX
                    )
                ) *
                0.18,

                0.82,
                1

            );


        const depthScale =

            1 +

            state.depth *
            0.11;


        const scale =

            state.scale *
            depthScale;


        ctx.scale(

            scale *
            fakeX,

            scale *
            fakeY

        );


        // ---------------------------------------------
        // SHADOW / DEPTH
        // ---------------------------------------------

        ctx.shadowColor =

            'rgba(0, 0, 0, 0.30)';


        ctx.shadowBlur =

            state.central
                ? 20
                : 12;


        ctx.shadowOffsetY =
            6;


        // ---------------------------------------------
        // ORIGINAL IMAGE SIZE
        //
        // Usiamo dimensioni normalizzate:
        // circa 1 × 1.4
        // ---------------------------------------------

        const ratio =

            image.naturalHeight /
            image.naturalWidth;


        const baseWidth =
            1;


        const baseHeight =

            baseWidth *
            ratio;


        ctx.drawImage(

            image,

            -baseWidth / 2,
            -baseHeight / 2,

            baseWidth,
            baseHeight

        );


        ctx.restore();

    }


    // =================================================
    // MATERIAL LABEL
    // =================================================

    function drawMaterialLabel(
        state
    ) {

        if (
            state.alpha <
            0.55
        ) {

            return;

        }


        const material =

            MATERIALS[
                state.materialIndex
            ];


        ctx.save();


        ctx.globalAlpha =

            state.alpha *
            0.72;


        ctx.textAlign =
            'center';


        ctx.font =

            `${
                mobile
                    ? 8
                    : 10
            }px Jost, system-ui, sans-serif`;


        ctx.fillStyle =

            'rgba(236,235,231,0.70)';


        ctx.fillText(

            material.name
                .toUpperCase(),

            state.cx,

            state.cy +

            state.labelOffset

        );


        ctx.restore();

    }


    // =================================================
    // POSITION ON CIRCLE
    // =================================================

    function circleTarget(
        index,
        orbit
    ) {

        const angle =

            -Math.PI / 2

            +

            index /
            OUTER *
            TAU

            +

            orbit;


        const radiusX =

            W *

            (
                mobile
                    ? 0.32
                    : 0.28
            );


        const radiusY =

            H *

            (
                mobile
                    ? 0.22
                    : 0.30
            );


        return {

            angle,

            x:

                Math.cos(angle) *
                radiusX,

            y:

                Math.sin(angle) *
                radiusY,

            z:

                Math.sin(angle) *
                0.62

        };

    }


    // =================================================
    // FRAME
    // =================================================

    function frame(ms) {

        requestAnimationFrame(
            frame
        );


        const rect =
            track.getBoundingClientRect();


        if (
            rect.bottom < 0 ||
            rect.top > innerHeight
        ) {

            return;

        }


        const time =

            reduceMotion
                ? 0
                : ms * 0.001;


        smoothP +=

            (
                progress -
                smoothP
            )

            *
            0.07;


        ctx.clearRect(
            0,
            0,
            W,
            H
        );


        // =================================================
        // CENTER
        // =================================================

        const cx =
            W * 0.5;


        const cy =

            H *

            (
                mobile
                    ? 0.60
                    : 0.52
            );


        /*
            ATTENZIONE:

            ora il valore non rappresenta
            più la scala del modello 3D.

            È la scala Canvas della PNG.
        */

        const baseScale =

            Math.min(
                W,
                H
            )

            *

            (
                mobile
                    ? 0.105
                    : 0.135
            );


        // =================================================
        // GENERATION
        // =================================================

        const spread =

            smooth(

                (
                    smoothP -
                    0.06
                )

                /

                0.86

            );


        // Orbita sempre attiva

        const orbit =

            time *
            0.12;


        const states =
            [];


        let visible =
            1;


        // =================================================
        // CENTRAL PENDANT
        // =================================================

        states.push({

            cx,
            cy,

            scale:

                baseScale *
                1.55,

            rotX:
                0.16,

            rotY:

                -0.20 +

                Math.sin(
                    time *
                    0.25
                ) *
                0.08,

            rotZ:

                Math.sin(
                    time *
                    0.20
                ) *
                0.025,

            depth:
                0,

            alpha:
                1,

            // centrale = argento
            materialIndex:
                0,

            central:
                true,

            labelOffset:

                mobile
                    ? 112
                    : 150

        });


        // =================================================
        // OUTER COPIES
        // =================================================

        for (
            let i = 0;
            i < OUTER;
            i++
        ) {

            const delay =

                i /
                OUTER *
                0.65;


            const birth =

                easeOut(

                    (
                        spread -
                        delay
                    )

                    /

                    0.25

                );


            if (
                birth <=
                0.001
            ) {

                continue;

            }


            if (
                birth >
                0.15
            ) {

                visible =
                    i + 2;

            }


            const target =

                circleTarget(
                    i,
                    orbit
                );


            // =================================================
            // CURVED TRAJECTORY
            // =================================================

            const bend =

                Math.sin(
                    birth *
                    Math.PI
                )

                *

                Math.min(
                    W,
                    H
                )

                *
                0.075;


            const x =

                target.x *
                birth

                -

                Math.sin(
                    target.angle
                )

                *
                bend;


            const y =

                target.y *
                birth

                +

                Math.cos(
                    target.angle
                )

                *
                bend;


            // =================================================
            // ORIENTATION
            // =================================================

            const alternate =

                i % 2 === 0
                    ? 1
                    : -1;


            // =================================================
            // MATERIAL
            //
            // 0 silver
            // 1 gold
            // 2 bronze
            // 3 platinum
            // 4 steel
            // 5 titanium
            //
            // Poi ricominciamo.
            // =================================================

            const materialIndex =

                (
                    i +
                    1
                )

                %

                MATERIALS.length;


            states.push({

                cx:
                    cx + x,

                cy:
                    cy + y,

                scale:

                    baseScale *

                    lerp(
                        0.20,
                        0.83,
                        birth
                    ),

                rotX:

                    lerp(

                        0.16,

                        alternate *
                        0.50,

                        birth

                    ),

                rotY:

                    lerp(

                        -0.20,

                        alternate *
                        0.36,

                        birth

                    ),

                rotZ:

                    lerp(

                        0,

                        wrap(

                            -target.angle -
                            Math.PI / 2

                        ),

                        birth

                    ),

                depth:

                    target.z *
                    birth,

                alpha:

                    clamp(
                        birth *
                        1.7
                    ),

                materialIndex,

                central:
                    false,

                labelOffset:

                    mobile
                        ? 65
                        : 86

            });

        }


        // =================================================
        // DEPTH SORT
        // =================================================

        states.sort(
            (
                a,
                b
            ) => {

                return (
                    a.depth -
                    b.depth
                );

            }
        );


        // =================================================
        // DRAW IMAGES
        // =================================================

        for (
            const state
            of states
        ) {

            drawPendantImage(
                state
            );

        }


        // =================================================
        // LABELS
        // =================================================

        for (
            const state
            of states
        ) {

            drawMaterialLabel(
                state
            );

        }


        // =================================================
        // COUNTER
        // =================================================

        if (counter) {

            counter.textContent =

                `${
                    String(
                        visible
                    ).padStart(
                        2,
                        '0'
                    )
                } / ${
                    String(
                        TOTAL
                    ).padStart(
                        2,
                        '0'
                    )
                }`;

        }

    }


    // =================================================
    // START
    // =================================================

    requestAnimationFrame(
        frame
    );

})();

// =====================================================
// REAL IMAGE PENDANT — INTERACTIVE ROTATION
// 1 pendente reale al centro
// Possiamo ruotarlo con il mouse o il touch
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const section =
        document.getElementById(
            'pendant-interactive'
        );


    const stage =
        document.getElementById(
            'pendantInteractiveStage'
        );


    const image =
        document.getElementById(
            'pendantInteractiveImage'
        );


    const rotationXLabel =
        document.getElementById(
            'pendantRotationX'
        );


    const rotationYLabel =
        document.getElementById(
            'pendantRotationY'
        );


    if (
        !section ||
        !stage ||
        !image
    ) {

        return;

    }

    // =================================================
    // DISABLE NATIVE IMAGE DRAG
    // =================================================

    image.draggable =
        false;


    image.addEventListener(
        'dragstart',
        event => {

            event.preventDefault();

        }
    );


    stage.addEventListener(
        'dragstart',
        event => {

            event.preventDefault();

        }
    );

    // =================================================
    // CONFIG
    // =================================================

    const MAX_ROTATE_X =
        65;


    const MAX_ROTATE_Y =
        65;


    const MAX_MOVE_X =
        12;


    const MAX_MOVE_Y =
        8;


    const SMOOTHING =
        0.075;


    const reduceMotion =

        window
            .matchMedia(
                '(prefers-reduced-motion: reduce)'
            )
            .matches;


    // =================================================
    // STATE
    // =================================================

    let targetX =
        0;


    let targetY =
        0;


    let currentX =
        0;


    let currentY =
        0;


    // =================================================
    // UTILITY
    // =================================================

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }


    function lerp(
        current,
        target,
        amount
    ) {

        return (

            current +

            (
                target -
                current
            )

            *

            amount

        );

    }


    // =================================================
    // POINTER POSITION
    // =================================================

    function updatePointer(
        event
    ) {

        const rect =
            stage.getBoundingClientRect();


        const x =

            (
                event.clientX -
                rect.left
            )

            /

            rect.width;


        const y = (event.clientY - rect.top) / rect.height;

        targetY =

            clamp(
                (x - 0.5) * 2,
                -1,
                1
            );


        targetX =

            clamp(
                (y - 0.5) * 2,
                -1,
                1
            );

    }


    // =================================================
// DRAG STATE
// =================================================

let dragging =
    false;


// =================================================
// CHECK IF POINTER IS OVER IMAGE
// =================================================

function isPointerOverImage(
    event
) {

    const rect =
        image.getBoundingClientRect();


    return (

        event.clientX >= rect.left &&

        event.clientX <= rect.right &&

        event.clientY >= rect.top &&

        event.clientY <= rect.bottom

    );

}


// =================================================
// POINTER DOWN
// =================================================

stage.addEventListener(
    'pointerdown',
    event => {

        /*
            Il drag può iniziare SOLO
            se clicchiamo sul pendente.
        */

        if (
            !isPointerOverImage(
                event
            )
        ) {

            return;

        }


        event.preventDefault();


        dragging =
            true;


        stage.style.cursor =
            'grabbing';


        /*
            Catturiamo il puntatore sullo stage.

            Così possiamo continuare a muovere
            il pendente anche se durante il drag
            il mouse esce dall'immagine.
        */

        stage.setPointerCapture?.(
            event.pointerId
        );


        updatePointer(
            event
        );

    }
);


// =================================================
// POINTER MOVE
// =================================================

stage.addEventListener(
    'pointermove',
    event => {

        // -----------------------------------------
        // CURSOR
        // -----------------------------------------

        if (!dragging) {

            if (
                isPointerOverImage(
                    event
                )
            ) {

                stage.style.cursor =
                    'grab';

            }

            else {

                stage.style.cursor =
                    'default';

            }


            /*
                IMPORTANTISSIMO:

                se non stiamo trascinando
                NON aggiorniamo la rotazione.
            */

            return;

        }


        // -----------------------------------------
        // DRAG
        // -----------------------------------------

        event.preventDefault();


        updatePointer(
            event
        );

    }
);


// =================================================
// POINTER UP
// =================================================

stage.addEventListener(
    'pointerup',
    event => {

        if (!dragging) {
            return;
        }


        dragging =
            false;


        stage.releasePointerCapture?.(
            event.pointerId
        );


        if (
            isPointerOverImage(
                event
            )
        ) {

            stage.style.cursor =
                'grab';

        }

        else {

            stage.style.cursor =
                'default';

        }

    }
);


// =================================================
// POINTER CANCEL
// =================================================

stage.addEventListener(
    'pointercancel',
    () => {

        dragging =
            false;


        stage.style.cursor =
            'default';

    }
);


// =================================================
// POINTER LEAVE
// =================================================

stage.addEventListener(
    'pointerleave',
    () => {

        /*
            Se stiamo trascinando non fermiamo tutto,
            perché setPointerCapture mantiene
            il controllo del puntatore.
        */

        if (!dragging) {

            stage.style.cursor =
                'default';

        }

    }
);


    // =================================================
    // ANIMATION
    // =================================================

    function frame() {

        requestAnimationFrame(
            frame
        );


        // ---------------------------------------------
        // SECTION VISIBILITY
        // ---------------------------------------------

        const rect =
            section.getBoundingClientRect();


        const visible =

            rect.bottom > 0

            &&

            rect.top <
            window.innerHeight;


        if (!visible) {
            return;
        }


        // ---------------------------------------------
        // REDUCED MOTION
        // ---------------------------------------------

        if (
            reduceMotion
        ) {

            image.style.transform =
                'none';


            return;

        }


        // ---------------------------------------------
        // SMOOTH
        // ---------------------------------------------

        currentX =

            lerp(
                currentX,
                targetX,
                SMOOTHING
            );


        currentY =

            lerp(
                currentY,
                targetY,
                SMOOTHING
            );


        // ---------------------------------------------
        // ROTATIONS
        // ---------------------------------------------

        const rotateX =

            currentX *
            -MAX_ROTATE_X;


        const rotateY =

            currentY *
            MAX_ROTATE_Y;


        /*
            Piccola rotazione Z per rendere
            il movimento meno "robotico".
        */

        const rotateZ =

            currentY *
            3;


        // ---------------------------------------------
        // POSITION
        // ---------------------------------------------

        const moveX =

            currentY *
            MAX_MOVE_X;


        const moveY =

            currentX *
            MAX_MOVE_Y;


        // ---------------------------------------------
        // TRANSFORM
        // ---------------------------------------------

        image.style.transform =

            `
                translate3d(
                    ${moveX}px,
                    ${moveY}px,
                    30px
                )

                rotateX(
                    ${rotateX}deg
                )

                rotateY(
                    ${rotateY}deg
                )

                rotateZ(
                    ${rotateZ}deg
                )
            `;


        // ---------------------------------------------
        // READOUT
        // ---------------------------------------------

        if (
            rotationXLabel
        ) {

            rotationXLabel.textContent =

                `${
                    rotateX.toFixed(1)
                }°`;

        }


        if (
            rotationYLabel
        ) {

            rotationYLabel.textContent =

                `${
                    rotateY.toFixed(1)
                }°`;

        }

    }


    // =================================================
    // START
    // =================================================

    requestAnimationFrame(
        frame
    );

})();

// =====================================================
// SURFACE FINISHING — INTERACTIVE REVEAL
// 1 immagine reale al centro
// Possiamo trascinare il mouse per rivelare
// la finitura superficiale.
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const section =
        document.getElementById(
            'surface-finishing'
        );


    const stage =
        document.getElementById(
            'surfaceFinishingStage'
        );


    const status =
        document.getElementById(
            'surfaceFinishingStatus'
        );


    if (
        !section ||
        !stage
    ) {

        return;

    }


    // =================================================
    // IMAGES
    // =================================================

    const images =
        stage.querySelectorAll(
            'img'
        );


    images.forEach(
        image => {

            image.draggable =
                false;


            image.addEventListener(
                'dragstart',
                event => {

                    event.preventDefault();

                }
            );

        }
    );


    // =================================================
    // STATE
    // =================================================

    let dragging =
        false;


    let targetReveal =
        0.5;


    let currentReveal =
        0.5;


    const SMOOTHING =
        0.13;


    // =================================================
    // UTILITY
    // =================================================

    function clamp(
        value,
        min = 0,
        max = 1
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    }


    function lerp(
        a,
        b,
        t
    ) {

        return (
            a +
            (
                b -
                a
            ) *
            t
        );

    }


    // =================================================
    // UPDATE POSITION
    // =================================================

    function updateRevealFromPointer(
        event
    ) {

        const rect =
            stage.getBoundingClientRect();


        const position =

            (
                event.clientX -
                rect.left
            )

            /

            rect.width;


        targetReveal =
            clamp(
                position
            );

    }


    // =================================================
    // POINTER DOWN
    // =================================================

    stage.addEventListener(
        'pointerdown',
        event => {

            event.preventDefault();


            dragging =
                true;


            stage.classList.add(
                'is-dragging'
            );


            stage.setPointerCapture?.(
                event.pointerId
            );


            updateRevealFromPointer(
                event
            );

        }
    );


    // =================================================
    // POINTER MOVE
    // =================================================

    stage.addEventListener(
        'pointermove',
        event => {

            /*
                Senza click il mouse
                NON modifica la finitura.
            */

            if (!dragging) {

                /*
                    Cambiamo solo il cursore.
                */

                const rect =
                    stage.getBoundingClientRect();


                const x =

                    (
                        event.clientX -
                        rect.left
                    )

                    /

                    rect.width;


                /*
                    Facciamo apparire il cursore
                    di interazione solo nella zona
                    centrale dell'oggetto.
                */

                if (
                    x > 0.10 &&
                    x < 0.90
                ) {

                    stage.style.cursor =
                        'ew-resize';

                }

                else {

                    stage.style.cursor =
                        'default';

                }


                return;

            }


            event.preventDefault();


            updateRevealFromPointer(
                event
            );

        }
    );


    // =================================================
    // POINTER UP
    // =================================================

    stage.addEventListener(
        'pointerup',
        event => {

            if (!dragging) {
                return;
            }


            dragging =
                false;


            stage.classList.remove(
                'is-dragging'
            );


            stage.releasePointerCapture?.(
                event.pointerId
            );


            stage.style.cursor =
                'ew-resize';

        }
    );


    // =================================================
    // POINTER CANCEL
    // =================================================

    stage.addEventListener(
        'pointercancel',
        () => {

            dragging =
                false;


            stage.classList.remove(
                'is-dragging'
            );


            stage.style.cursor =
                'default';

        }
    );


    // =================================================
    // POINTER LEAVE
    // =================================================

    stage.addEventListener(
        'pointerleave',
        () => {

            if (!dragging) {

                stage.style.cursor =
                    'default';

            }

        }
    );


    // =================================================
    // ANIMATION
    // =================================================

    function frame() {

        requestAnimationFrame(
            frame
        );


        const rect =
            section.getBoundingClientRect();


        if (
            rect.bottom < 0 ||
            rect.top >
            window.innerHeight
        ) {

            return;

        }


        currentReveal =

            lerp(
                currentReveal,
                targetReveal,
                SMOOTHING
            );


        const percent =

            currentReveal *
            100;


        stage.style.setProperty(

            '--reveal',

            `${percent}%`

        );


        if (status) {

            status.textContent =

                `${Math.round(
                    percent
                )}%`;

        }

    }


    // =================================================
    // START
    // =================================================

    stage.style.setProperty(
        '--reveal',
        '50%'
    );


    requestAnimationFrame(
        frame
    );

})();

// =====================================================
// CAD -> RENDER
//
// Lightweight version:
// il wireframe viene calcolato UNA SOLA VOLTA.
// Durante lo scroll cambiamo solo gli stati visivi.
// =====================================================

// =====================================================
// CAD -> RENDER
// SMOOTH SCROLL VERSION
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const track =
        document.getElementById(
            'cad-render'
        );

    const canvas =
        document.getElementById(
            'cadWireframeCanvas'
        );

    const surface =
        document.getElementById(
            'cadSurfaceImage'
        );

    const finalImage =
        document.getElementById(
            'cadFinalImage'
        );

    const stageLabel =
        document.getElementById(
            'cadRenderStage'
        );

    const percentLabel =
        document.getElementById(
            'cadRenderPercent'
        );

    const description =
        document.getElementById(
            'cadRenderDescription'
        );

    const scan =
        track?.querySelector(
            '.cad-render-scan'
        );

    const grid =
        track?.querySelector(
            '.cad-render-grid'
        );

    const crosshair =
        track?.querySelector(
            '.cad-render-crosshair'
        );

    const object =
        track?.querySelector(
            '.cad-render-object'
        );

    const steps =
        track?.querySelectorAll(
            '.cad-render-steps span'
        );


    if (
        !track ||
        !canvas ||
        !surface ||
        !finalImage
    ) {
        return;
    }


    // =================================================
    // IMAGE
    // =================================================

    const SOURCE =
        'immagini/pendente2.png';


    const image =
        new Image();


    image.decoding =
        'async';


    // =================================================
    // UTILITY
    // =================================================

    const clamp = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const lerp = (
        a,
        b,
        amount
    ) => {

        return (
            a +
            (
                b -
                a
            ) *
            amount
        );

    };


    const smoothstep = value => {

        const t =
            clamp(value);

        return (
            t *
            t *
            (
                3 -
                2 *
                t
            )
        );

    };


    // =================================================
    // CREATE WIREFRAME
    // =================================================

    function createWireframe() {

        const sourceCanvas =
            document.createElement(
                'canvas'
            );


        const sourceCtx =
            sourceCanvas.getContext(
                '2d',
                {
                    willReadFrequently:
                        true
                }
            );


        const maxHeight =
            650;


        const ratio =

            image.naturalWidth /
            image.naturalHeight;


        const h =

            Math.min(
                maxHeight,
                image.naturalHeight
            );


        const w =

            Math.round(
                h *
                ratio
            );


        sourceCanvas.width =
            w;

        sourceCanvas.height =
            h;


        canvas.width =
            w;

        canvas.height =
            h;


        sourceCtx.drawImage(
            image,
            0,
            0,
            w,
            h
        );


        const source =

            sourceCtx.getImageData(
                0,
                0,
                w,
                h
            );


        const output =

            sourceCtx.createImageData(
                w,
                h
            );


        const input =
            source.data;


        const data =
            output.data;


        // =================================================
        // EDGE DETECTION
        // =================================================

        for (
            let y = 1;
            y < h - 1;
            y++
        ) {

            for (
                let x = 1;
                x < w - 1;
                x++
            ) {

                const i =

                    (
                        y *
                        w +
                        x
                    )

                    *
                    4;


                const alpha =
                    input[
                        i + 3
                    ];


                if (
                    alpha < 20
                ) {
                    continue;
                }


                const left =

                    (
                        input[i - 4] +
                        input[i - 3] +
                        input[i - 2]
                    )

                    /

                    3;


                const right =

                    (
                        input[i + 4] +
                        input[i + 5] +
                        input[i + 6]
                    )

                    /

                    3;


                const upIndex =

                    i -
                    w *
                    4;


                const downIndex =

                    i +
                    w *
                    4;


                const up =

                    (
                        input[upIndex] +
                        input[upIndex + 1] +
                        input[upIndex + 2]
                    )

                    /

                    3;


                const down =

                    (
                        input[downIndex] +
                        input[downIndex + 1] +
                        input[downIndex + 2]
                    )

                    /

                    3;


                const gx =
                    Math.abs(
                        right -
                        left
                    );


                const gy =
                    Math.abs(
                        down -
                        up
                    );


                let edge =

                    (
                        gx +
                        gy
                    )

                    *
                    1.35;


                const alphaLeft =
                    input[i - 1];


                const alphaRight =
                    input[i + 7];


                const alphaUp =
                    input[
                        upIndex + 3
                    ];


                const alphaDown =
                    input[
                        downIndex + 3
                    ];


                const alphaEdge =

                    Math.max(

                        Math.abs(
                            alpha -
                            alphaLeft
                        ),

                        Math.abs(
                            alpha -
                            alphaRight
                        ),

                        Math.abs(
                            alpha -
                            alphaUp
                        ),

                        Math.abs(
                            alpha -
                            alphaDown
                        )

                    );


                edge +=
                    alphaEdge *
                    1.4;


                if (
                    edge < 28
                ) {
                    continue;
                }


                const strength =

                    clamp(
                        edge /
                        160
                    );


                data[i] =
                    205;


                data[i + 1] =
                    220;


                data[i + 2] =
                    235;


                data[i + 3] =

                    Math.round(
                        strength *
                        235
                    );

            }

        }


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.putImageData(
            output,
            0,
            0
        );

    }


    image.onload =
        createWireframe;


    image.onerror =
        () => {

            console.error(
                'CAD Render: immagine non trovata',
                SOURCE
            );

        };


    image.src =
        SOURCE;


    // =================================================
    // STATES
    // =================================================

    const STATES = [

        {
            name:
                'WIREFRAME',

            text:
                'Everything starts from geometry.'
        },

        {
            name:
                'SURFACE',

            text:
                'The digital model becomes a continuous surface.'
        },

        {
            name:
                'MATERIAL',

            text:
                'Material properties are applied to the geometry.'
        },

        {
            name:
                'FINAL RENDER',

            text:
                'The digital object becomes a finished metal component.'
        }

    ];


    let currentState =
        0;


    // =================================================
    // TEXT CHANGE
    // =================================================

    function setState(
        index
    ) {

        if (
            index === currentState
        ) {
            return;
        }


        currentState =
            index;


        if (
            stageLabel
        ) {

            stageLabel.style.opacity =
                '0';


            stageLabel.style.transform =
                'translateY(4px)';


            setTimeout(
                () => {

                    stageLabel.textContent =
                        STATES[index].name;


                    stageLabel.style.opacity =
                        '1';


                    stageLabel.style.transform =
                        'translateY(0)';

                },
                110
            );

        }


        if (
            description
        ) {

            description.classList.add(
                'is-changing'
            );


            setTimeout(
                () => {

                    description.textContent =
                        STATES[index].text;


                    description.classList.remove(
                        'is-changing'
                    );

                },
                130
            );

        }


        steps?.forEach(
            (
                step,
                stepIndex
            ) => {

                step.classList.toggle(

                    'is-active',

                    stepIndex ===
                    index

                );

            }
        );

    }


    // =================================================
    // SCROLL PROGRESS
    // =================================================

    let targetProgress =
        0;


    let smoothProgress =
        0;


    let animationFrame =
        null;


    const SMOOTHING =
        0.035;


    function readScroll() {

        const rect =
            track.getBoundingClientRect();


        const distance =

            Math.max(

                1,

                track.offsetHeight -
                window.innerHeight

            );


        targetProgress =

            clamp(

                -rect.top /
                distance

            );


        startAnimation();

    }


    // =================================================
    // RENDER
    // =================================================

    function render(
        progress
    ) {

        // =================================================
        // PHASE PROGRESS
        // =================================================

        const surfaceProgress =smoothstep((progress -0.08) / 0.42);
        const materialProgress = smoothstep((progress - 0.32) / 0.44);
        const finalProgress = smoothstep((progress - 0.61) / 0.37);

        // =================================================
        // WIREFRAME
        // =================================================

        const wireOpacity =

            1 -

            finalProgress *
            0.92;


        canvas.style.opacity =

            String(
                wireOpacity
            );

        const wireScale =

            1 +

            surfaceProgress *
            0.018;


        canvas.style.transform =

            `
                translate(-50%, -50%)
                scale(${wireScale})
            `;


        canvas.style.filter =

            `
                drop-shadow(
                    0 0 ${
                        5 +
                        surfaceProgress *
                        7
                    }px
                    rgba(
                        210,
                        225,
                        240,
                        ${
                            0.09 +
                            surfaceProgress *
                            0.05
                        }
                    )
                )
            `;


        // =================================================
        // SURFACE
        // =================================================

        const surfaceOpacity =

            surfaceProgress *

            (
                1 -
                materialProgress *
                0.88
            );

        surface.style.opacity =

            String(
                surfaceOpacity
            );


        const surfaceScale =

            0.985 +

            surfaceProgress *
            0.025;


        surface.style.transform =

            `
                translate(-50%, -50%)
                scale(${surfaceScale})
            `;


        // =================================================
        // GOLD
        // =================================================

        const goldOpacity =

            Math.max(

                materialProgress *
                0.78,

                finalProgress

            );


        finalImage.style.opacity =

            String(
                goldOpacity
            );


        /*
            Leggerissima crescita durante
            il passaggio al render finale.
        */

        const finalScale =

            0.985 +

            finalProgress *
            0.025;


        const finalRotation =

            (
                materialProgress -
                0.5
            )

            *

            0.8;


        finalImage.style.transform =

            `
                translate(-50%, -50%)
                scale(${finalScale})
                rotate(${finalRotation}deg)
            `;


        finalImage.style.filter =

            `
                saturate(${
                    0.64 +
                    materialProgress *
                    0.20 +
                    finalProgress *
                    0.28
                })

                brightness(${
                    0.76 +
                    materialProgress *
                    0.10 +
                    finalProgress *
                    0.18
                })

                contrast(${
                    1.12 -
                    finalProgress *
                    0.07
                })

                drop-shadow(
                    0
                    ${
                        16 +
                        finalProgress *
                        14
                    }px
                    ${
                        20 +
                        finalProgress *
                        16
                    }px
                    rgba(
                        0,
                        0,
                        0,
                        ${
                            0.18 +
                            finalProgress *
                            0.12
                        }
                    )
                )
            `;


        // =================================================
        // OBJECT MOVEMENT
        // =================================================

        if (
            object
        ) {

            /*
                Un movimento verticale molto piccolo
                evita l'effetto "slide PowerPoint".
            */

            const moveY =

                (
                    progress -
                    0.5
                )

                *

                -10;


            object.style.transform =

                `
                    translate(
                        -50%,
                        -50%
                    )

                    translateY(
                        ${moveY}px
                    )
                `;

        }


        // =================================================
        // GRID
        // =================================================

        if (
            grid
        ) {

            /*
                Il CAD grid sparisce lentamente
                mentre l'oggetto diventa reale.
            */

            grid.style.opacity =

                String(

                    0.22 *

                    (
                        1 -
                        finalProgress *
                        0.85
                    )

                );


            grid.style.transform =

                `
                    scale(${
                        1 +
                        progress *
                        0.025
                    })
                `;

        }


        // =================================================
        // CROSSHAIR
        // =================================================

        if (
            crosshair
        ) {

            crosshair.style.opacity =

                String(

                    0.18 *

                    (
                        1 -
                        finalProgress *
                        0.90
                    )

                );

        }


        // =================================================
        // SCAN LINE
        // =================================================

        if (
            scan
        ) {

            const scanProgress =

                smoothstep(

                    (
                        progress -
                        0.08
                    )

                    /

                    0.72

                );


            const scanY =

                92 -

                scanProgress *
                84;


            scan.style.top =

                `${scanY}%`;


            /*
                Fade morbido in entrata/uscita.
            */

            const scanIn =

                smoothstep(

                    progress /
                    0.10

                );


            const scanOut =

                1 -

                smoothstep(

                    (
                        progress -
                        0.75
                    )

                    /

                    0.12

                );


            scan.style.opacity =

                String(

                    scanIn *
                    scanOut

                );

        }


        // =================================================
        // CURRENT STATE
        // =================================================

        let stateIndex =
            0;


        if (
            progress >= 0.25
        ) {

            stateIndex =
                1;

        }


        if (
            progress >= 0.50
        ) {

            stateIndex =
                2;

        }


        if (
            progress >= 0.76
        ) {

            stateIndex =
                3;

        }


        setState(
            stateIndex
        );


        // =================================================
        // PERCENTAGE
        // =================================================

        if (
            percentLabel
        ) {

            percentLabel.textContent =

                `${
                    String(

                        Math.round(
                            progress *
                            100
                        )

                    )
                    .padStart(
                        3,
                        '0'
                    )
                }%`;

        }

    }


    // =================================================
    // SMOOTH ANIMATION
    // =================================================

    function animate() {

        /*
            Invece di saltare immediatamente
            alla posizione dello scroll,
            inseguiamo progressivamente
            il nuovo valore.
        */

        smoothProgress =

            lerp(

                smoothProgress,

                targetProgress,

                SMOOTHING

            );


        render(
            smoothProgress
        );


        const difference =

            Math.abs(

                targetProgress -
                smoothProgress

            );


        /*
            Continuiamo ad animare solo finché
            serve davvero.

            Quindi NON abbiamo un loop infinito
            che consuma CPU.
        */

        if (
            difference >
            0.0003
        ) {

            animationFrame =

                requestAnimationFrame(
                    animate
                );

        }

        else {

            smoothProgress =
                targetProgress;


            render(
                smoothProgress
            );


            animationFrame =
                null;

        }

    }


    function startAnimation() {

        if (
            animationFrame !==
            null
        ) {
            return;
        }


        animationFrame =

            requestAnimationFrame(
                animate
            );

    }


    // =================================================
    // EVENTS
    // =================================================

    window.addEventListener(
        'scroll',
        readScroll,
        {
            passive:
                true
        }
    );


    window.addEventListener(
        'resize',
        () => {

            readScroll();

        }
    );


    // =================================================
    // INITIAL POSITION
    // =================================================

    const initialRect =
        track.getBoundingClientRect();


    const initialDistance =

        Math.max(

            1,

            track.offsetHeight -
            window.innerHeight

        );


    targetProgress =

        clamp(

            -initialRect.top /
            initialDistance

        );


    smoothProgress =
        targetProgress;


    render(
        smoothProgress
    );

})();

// =====================================================
// NEGATIVE SPACE REVEAL
//
// 01 -> volume pieno
// 02 -> carving
// 03 -> aperture / negative space
// 04 -> geometria finale
//
// Il volume pieno viene generato UNA SOLA VOLTA
// dall'immagine originale.
//
// Nessun canvas animato continuamente.
// =====================================================

(() => {

    // =================================================
    // ELEMENTS
    // =================================================

    const track =
        document.getElementById(
            'negative-space'
        );


    const object =
        document.getElementById(
            'negativeSpaceObject'
        );


    const solid =
        document.getElementById(
            'negativeSpaceSolid'
        );


    const finalImage =
        document.getElementById(
            'negativeSpaceFinal'
        );


    const status =
        document.getElementById(
            'negativeSpaceStatus'
        );


    const percent =
        document.getElementById(
            'negativeSpacePercent'
        );


    const description =
        document.getElementById(
            'negativeSpaceDescription'
        );


    const steps =
        track?.querySelectorAll(
            '.negative-space-steps span'
        );


    if (
        !track ||
        !object ||
        !solid ||
        !finalImage
    ) {

        return;

    }


    // =================================================
    // CONFIG
    // =================================================

    const SOURCE =
        'immagini/pendente2.png';


    const SMOOTHING =
        0.045;


    const ALPHA_THRESHOLD =
        18;


    // =================================================
    // UTILITY
    // =================================================

    const clamp = (
        value,
        min = 0,
        max = 1
    ) => {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    };


    const lerp = (
        a,
        b,
        amount
    ) => {

        return (
            a +
            (
                b -
                a
            ) *
            amount
        );

    };


    const smoothstep = value => {

        const t =
            clamp(value);


        return (

            t *
            t *
            (
                3 -
                2 *
                t
            )

        );

    };


    // =================================================
    // CREATE SOLID SILHOUETTE
    // =================================================

    const sourceImage =
        new Image();


    sourceImage.decoding =
        'async';


    sourceImage.onload =
        createSolidVersion;


    sourceImage.onerror =
        () => {

            console.error(
                'Negative Space: immagine non trovata',
                SOURCE
            );

        };


    sourceImage.src =
        SOURCE;


    function createSolidVersion() {

        /*
            Riduciamo la risoluzione perché
            questa operazione viene eseguita
            solamente una volta.
        */

        const maxHeight =
            700;


        const ratio =

            sourceImage.naturalWidth /
            sourceImage.naturalHeight;


        const h =

            Math.min(
                maxHeight,
                sourceImage.naturalHeight
            );


        const w =

            Math.max(
                1,
                Math.round(
                    h *
                    ratio
                )
            );


        const canvas =
            document.createElement(
                'canvas'
            );


        const ctx =
            canvas.getContext(
                '2d',
                {
                    willReadFrequently:
                        true
                }
            );


        canvas.width =
            w;

        canvas.height =
            h;


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.drawImage(
            sourceImage,
            0,
            0,
            w,
            h
        );


        const imageData =

            ctx.getImageData(
                0,
                0,
                w,
                h
            );


        const data =
            imageData.data;


        /*
            outside[index] = 1

            significa che quel pixel trasparente
            è collegato allo sfondo esterno.

            Tutti i pixel trasparenti NON collegati
            all'esterno sono quindi aperture interne
            del pendente.

            Sono proprio quelle che riempiamo.
        */

        const outside =
            new Uint8Array(
                w *
                h
            );


        const queue =
            new Int32Array(
                w *
                h
            );


        let head =
            0;


        let tail =
            0;


        // =================================================
        // ADD PIXEL TO FLOOD FILL
        // =================================================

        function enqueue(
            x,
            y
        ) {

            if (
                x < 0 ||
                y < 0 ||
                x >= w ||
                y >= h
            ) {

                return;

            }


            const index =

                y *
                w +
                x;


            if (
                outside[index]
            ) {

                return;

            }


            const alpha =

                data[
                    index *
                    4 +
                    3
                ];


            if (
                alpha >
                ALPHA_THRESHOLD
            ) {

                return;

            }


            outside[index] =
                1;


            queue[tail++] =
                index;

        }


        // =================================================
        // BORDERS
        // =================================================

        for (
            let x = 0;
            x < w;
            x++
        ) {

            enqueue(
                x,
                0
            );


            enqueue(
                x,
                h - 1
            );

        }


        for (
            let y = 0;
            y < h;
            y++
        ) {

            enqueue(
                0,
                y
            );


            enqueue(
                w - 1,
                y
            );

        }


        // =================================================
        // FLOOD FILL
        // =================================================

        while (
            head <
            tail
        ) {

            const index =
                queue[head++];


            const x =
                index %
                w;


            const y =

                Math.floor(
                    index /
                    w
                );


            enqueue(
                x + 1,
                y
            );


            enqueue(
                x - 1,
                y
            );


            enqueue(
                x,
                y + 1
            );


            enqueue(
                x,
                y - 1
            );

        }


        // =================================================
        // OUTPUT
        // =================================================

        const output =

            ctx.createImageData(
                w,
                h
            );


        const out =
            output.data;


        for (
            let y = 0;
            y < h;
            y++
        ) {

            /*
                Leggerissimo gradiente verticale,
                così il volume non sembra
                completamente piatto.
            */

            const vertical =

                y /
                Math.max(
                    1,
                    h - 1
                );


            const light =

                1.08 -

                vertical *
                0.20;


            for (
                let x = 0;
                x < w;
                x++
            ) {

                const pixelIndex =

                    y *
                    w +
                    x;


                const i =

                    pixelIndex *
                    4;


                const alpha =
                    data[
                        i + 3
                    ];


                const originalPixel =

                    alpha >
                    ALPHA_THRESHOLD;


                const internalVoid =

                    !outside[pixelIndex] &&
                    !originalPixel;


                /*
                    Disegniamo:

                    - materiale originale
                    - oppure aperture interne riempite

                    Non disegniamo lo sfondo esterno.
                */

                if (
                    !originalPixel &&
                    !internalVoid
                ) {

                    continue;

                }


                // =====================================
                // GOLD BASE
                // =====================================

                const baseR =
                    198 *
                    light;


                const baseG =
                    151 *
                    light;


                const baseB =
                    67 *
                    light;


                /*
                    Dove esiste già il pendente originale
                    manteniamo un po' della texture reale.

                    Dove prima c'era un buco,
                    creiamo metallo pieno.
                */

                if (
                    originalPixel
                ) {

                    const mix =
                        0.42;


                    out[i] =

                        Math.round(

                            baseR *
                            (
                                1 -
                                mix
                            )

                            +

                            data[i] *
                            mix

                        );


                    out[i + 1] =

                        Math.round(

                            baseG *
                            (
                                1 -
                                mix
                            )

                            +

                            data[i + 1] *
                            mix

                        );


                    out[i + 2] =

                        Math.round(

                            baseB *
                            (
                                1 -
                                mix
                            )

                            +

                            data[i + 2] *
                            mix

                        );


                    out[i + 3] =
                        Math.max(
                            alpha,
                            220
                        );

                }

                else {

                    out[i] =
                        Math.round(
                            baseR
                        );


                    out[i + 1] =
                        Math.round(
                            baseG
                        );


                    out[i + 2] =
                        Math.round(
                            baseB
                        );


                    out[i + 3] =
                        255;

                }

            }

        }


        ctx.clearRect(
            0,
            0,
            w,
            h
        );


        ctx.putImageData(
            output,
            0,
            0
        );


        solid.src =

            canvas.toDataURL(
                'image/png'
            );

    }


    // =================================================
    // STATES
    // =================================================

    const STATES = [

        {
            name:
                'SOLID VOLUME',

            text:
                'Il processo parte da un volume continuo.'
        },

        {
            name:
                'CARVING',

            text:
                'La geometria interna viene progressivamente liberata.'
        },

        {
            name:
                'NEGATIVE SPACE',

            text:
                'Cavità e aperture diventano parte integrante del design.'
        },

        {
            name:
                'FINAL GEOMETRY',

            text:
                'La manifattura additiva rende possibile una struttura complessa e leggera.'
        }

    ];


    let currentState =
        0;


    function setState(
        index
    ) {

        if (
            index ===
            currentState
        ) {

            return;

        }


        currentState =
            index;


        if (
            status
        ) {

            status.style.opacity =
                '0';


            status.style.transform =
                'translateY(4px)';


            setTimeout(
                () => {

                    status.textContent =
                        STATES[index].name;


                    status.style.opacity =
                        '1';


                    status.style.transform =
                        'translateY(0)';

                },
                100
            );

        }


        if (
            description
        ) {

            description.classList.add(
                'is-changing'
            );


            setTimeout(
                () => {

                    description.textContent =
                        STATES[index].text;


                    description.classList.remove(
                        'is-changing'
                    );

                },
                120
            );

        }


        steps?.forEach(
            (
                step,
                stepIndex
            ) => {

                step.classList.toggle(

                    'is-active',

                    stepIndex ===
                    index

                );

            }
        );

    }


    // =================================================
    // SCROLL
    // =================================================

    let targetProgress =
        0;


    let smoothProgress =
        0;


    let frameId =
        null;


    function readScroll() {

        const rect =
            track.getBoundingClientRect();


        const available =

            Math.max(

                1,

                track.offsetHeight -
                window.innerHeight

            );


        targetProgress =

            clamp(

                -rect.top /
                available

            );


        startAnimation();

    }


    // =================================================
    // RENDER
    // =================================================

    function render(
        progress
    ) {

        /*
            Lasciamo un piccolo momento iniziale
            in cui il pendente rimane completamente pieno.

            Poi parte la "scavatura".
        */

        const reveal =

            smoothstep(

                (
                    progress -
                    0.08
                )

                /

                0.84

            );


        const revealPercent =

            reveal *
            100;


        // =================================================
        // CLIPPING
        // =================================================

        object.style.setProperty(

            '--reveal',

            `${revealPercent}%`

        );


        // =================================================
        // SCAN LINE
        // =================================================

        const scanIn =

            smoothstep(

                progress /
                0.10

            );


        const scanOut =

            1 -

            smoothstep(

                (
                    progress -
                    0.88
                )

                /

                0.08

            );


        object.style.setProperty(

            '--scan-opacity',

            String(

                scanIn *
                scanOut

            )

        );


        // =================================================
        // FRAME
        // =================================================

        object.style.setProperty(

            '--frame-opacity',

            String(

                0.18 *

                (
                    1 -
                    reveal *
                    0.65
                )

            )

        );


        // =================================================
        // OBJECT MOVEMENT
        // =================================================

        const scale =

            0.965 +

            reveal *
            0.035;


        const moveY =

            (
                reveal -
                0.5
            )

            *
            -6;


        object.style.transform =

            `
                translateY(
                    ${moveY}px
                )

                scale(
                    ${scale}
                )
            `;


        // =================================================
        // STATUS
        // =================================================

        let stateIndex =
            0;


        if (
            reveal >=
            0.20
        ) {

            stateIndex =
                1;

        }


        if (
            reveal >=
            0.53
        ) {

            stateIndex =
                2;

        }


        if (
            reveal >=
            0.88
        ) {

            stateIndex =
                3;

        }


        setState(
            stateIndex
        );


        // =================================================
        // PERCENT
        // =================================================

        if (
            percent
        ) {

            percent.textContent =

                `${
                    String(

                        Math.round(
                            revealPercent
                        )

                    )
                    .padStart(
                        3,
                        '0'
                    )
                }%`;

        }

    }


    // =================================================
    // SMOOTH ANIMATION
    // =================================================

    function animate() {

        smoothProgress =

            lerp(

                smoothProgress,

                targetProgress,

                SMOOTHING

            );


        render(
            smoothProgress
        );


        const difference =

            Math.abs(

                targetProgress -
                smoothProgress

            );


        if (
            difference >
            0.00025
        ) {

            frameId =

                requestAnimationFrame(
                    animate
                );

        }

        else {

            smoothProgress =
                targetProgress;


            render(
                smoothProgress
            );


            frameId =
                null;

        }

    }


    function startAnimation() {

        if (
            frameId !==
            null
        ) {

            return;

        }


        frameId =

            requestAnimationFrame(
                animate
            );

    }


    // =================================================
    // EVENTS
    // =================================================

    window.addEventListener(
        'scroll',
        readScroll,
        {
            passive:
                true
        }
    );


    window.addEventListener(
        'resize',
        readScroll
    );


    // =================================================
    // INITIAL POSITION
    // =================================================

    const initialRect =
        track.getBoundingClientRect();


    const initialAvailable =

        Math.max(

            1,

            track.offsetHeight -
            window.innerHeight

        );


    targetProgress =

        clamp(

            -initialRect.top /
            initialAvailable

        );


    smoothProgress =
        targetProgress;


    render(
        smoothProgress
    );

})();

// =====================================================
// NEGATIVE SPACE REVEAL 1
//
// 01 WIREFRAME
// 02 SOLID VOLUME
// 03 NEGATIVE SPACE
// 04 FINAL IMAGE
// =====================================================

(() => {

    const track = document.getElementById('negative-space1');
    const object = document.getElementById('negativeSpaceObject1');
    const wireframe = document.getElementById('negativeSpaceWireframe1');
    const finalImage = document.getElementById('negativeSpaceFinal1');
    const status = document.getElementById('negativeSpaceStatus1');
    const percent = document.getElementById('negativeSpacePercent1');
    const description = document.getElementById('negativeSpaceDescription1');

    if (!track || !object || !wireframe || !finalImage) {
        return;
    }

    const SOURCE = 'immagini/pendente2.png';
    const SMOOTHING = 0.06;

    const clamp = (value, min = 0, max = 1) =>
        Math.min(max, Math.max(min, value));

    const lerp = (a, b, amount) =>
        a + (b - a) * amount;

    const sourceImage = new Image();
    sourceImage.decoding = 'async';

    sourceImage.onload = () => {
        createWireframe();
        readScroll();
    };

    sourceImage.onerror = () => {
        console.error('Immagine non trovata:', SOURCE);
    };

    sourceImage.src = SOURCE;

    function createWireframe() {
        const maxHeight = 580;
        const ratio = sourceImage.naturalWidth / sourceImage.naturalHeight;

        const h = Math.min(maxHeight, sourceImage.naturalHeight);
        const w = Math.max(1, Math.round(h * ratio));

        const sourceCanvas = document.createElement('canvas');
        const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });

        sourceCanvas.width = w;
        sourceCanvas.height = h;

        wireframe.width = w;
        wireframe.height = h;

        sourceCtx.drawImage(sourceImage, 0, 0, w, h);

        const source = sourceCtx.getImageData(0, 0, w, h);
        const output = sourceCtx.createImageData(w, h);

        const input = source.data;
        const data = output.data;

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const i = (y * w + x) * 4;
                const alpha = input[i + 3];

                if (alpha < 12) continue;

                const left = (input[i - 4] + input[i - 3] + input[i - 2]) / 3;
                const right = (input[i + 4] + input[i + 5] + input[i + 6]) / 3;

                const upIndex = i - w * 4;
                const downIndex = i + w * 4;

                const up = (input[upIndex] + input[upIndex + 1] + input[upIndex + 2]) / 3;
                const down = (input[downIndex] + input[downIndex + 1] + input[downIndex + 2]) / 3;

                const gx = Math.abs(right - left);
                const gy = Math.abs(down - up);

                let edge = (gx + gy) * 1.45;

                const alphaLeft = input[i - 1];
                const alphaRight = input[i + 7];
                const alphaUp = input[upIndex + 3];
                const alphaDown = input[downIndex + 3];

                const alphaEdge = Math.max(
                    Math.abs(alpha - alphaLeft),
                    Math.abs(alpha - alphaRight),
                    Math.abs(alpha - alphaUp),
                    Math.abs(alpha - alphaDown)
                );

                edge += alphaEdge * 1.45;

                if (edge < 25) continue;

                const strength = clamp(edge / 150);

                data[i] = 205;
                data[i + 1] = 220;
                data[i + 2] = 235;
                data[i + 3] = Math.round(strength * 235);
            }
        }

        const ctx = wireframe.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.putImageData(output, 0, 0);
    }

    let targetProgress = 0;
    let smoothProgress = 0;
    let frameId = null;

    function readScroll() {
        const rect = track.getBoundingClientRect();
        const available = Math.max(1, track.offsetHeight - window.innerHeight);

        targetProgress = clamp(-rect.top / available);
        startAnimation();
    }

    function render(progress) {
        /*
            Progress principale:
            la linea scende da 0% a 100%
        */
        const revealProgress = clamp((progress - 0.08) / 0.84);

        object.style.setProperty(
            '--reveal-progress',
            `${revealProgress * 100}%`
        );

        object.style.setProperty(
            '--scan-opacity',
            String(revealProgress > 0.01 && revealProgress < 0.995 ? 1 : 0)
        );

        /*
            Movimento leggero dell'oggetto
        */
        const scale = 0.98 + revealProgress * 0.02;
        const moveY = (0.5 - revealProgress) * 10;

        object.style.transform = `
            translateY(${moveY}px)
            scale(${scale})
        `;

        /*
            Wireframe: molto visibile all'inizio,
            poi cala gradualmente
        */
        wireframe.style.opacity = String(1 - revealProgress * 0.35);

        /*
            Immagine finale: aumenta leggermente anche come look
        */
        finalImage.style.filter = `
            saturate(${0.8 + revealProgress * 0.2})
            brightness(${0.88 + revealProgress * 0.12})
            contrast(${1 + revealProgress * 0.05})
            drop-shadow(
                0 ${18 + revealProgress * 10}px
                ${24 + revealProgress * 12}px
                rgba(0,0,0,${0.18 + revealProgress * 0.08})
            )
        `;

        /*
            Testi di stato
        */
        if (status) {
            if (revealProgress < 0.33) {
                status.textContent = 'WIREFRAME';
            } else if (revealProgress < 0.66) {
                status.textContent = 'TRANSITION';
            } else if (revealProgress < 0.98) {
                status.textContent = 'RENDER';
            } else {
                status.textContent = 'FINAL OBJECT';
            }
        }

        if (description) {
            if (revealProgress < 0.33) {
                description.textContent =
                    'The component starts as a technical drawing.';
            } else if (revealProgress < 0.66) {
                description.textContent =
                    'A vertical scan progressively transforms the drawing into a real object.';
            } else if (revealProgress < 0.98) {
                description.textContent =
                    'The upper area becomes the final rendered component.';
            } else {
                description.textContent =
                    'The transition is complete: the drawing is now a finished object.';
            }
        }

        if (percent) {
            percent.textContent = `${String(Math.round(revealProgress * 100)).padStart(3, '0')}%`;
        }
    }

    function animate() {
        smoothProgress = lerp(smoothProgress, targetProgress, SMOOTHING);
        render(smoothProgress);

        const difference = Math.abs(targetProgress - smoothProgress);

        if (difference > 0.00025) {
            frameId = requestAnimationFrame(animate);
        } else {
            smoothProgress = targetProgress;
            render(smoothProgress);
            frameId = null;
        }
    }

    function startAnimation() {
        if (frameId !== null) return;
        frameId = requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);

    readScroll();

})();