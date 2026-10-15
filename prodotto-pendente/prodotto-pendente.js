// =====================================================
// PRODUCT DATABASE — PENDENTI
//
// Questo file si trova dentro:
//
// /prodotto-pendente/
//
// mentre le immagini si trovano dentro:
//
// /immagini/
//
// quindi usiamo:
//
// ../immagini/...
// =====================================================

const PRODUCTS = {


    // =================================================
    // PLATINO
    // =================================================

    platino: {

        title:
            'Platino',

        kicker:
            'Platinum / Precious Metal',

        image:
            '../immagini/pendente-platino.png',

        description:
            'Una struttura ornamentale complessa realizzata in platino, pensata per valorizzare geometrie leggere e dettagli difficili da ottenere con i processi tradizionali.',

        material:
            'Platinum',

        process:
            '3D Metal Binder Jet',

        application:
            'High Jewellery'

    },


    // =================================================
    // TITANIO
    // =================================================

    titanio: {

        title:
            'Titanio',

        kicker:
            'Titanium / Lightweight Metal',

        image:
            '../immagini/pendente-metallo.png',

        description:
            'Il titanio combina leggerezza, resistenza e libertà progettuale, permettendo di realizzare strutture complesse con un forte carattere tecnico e contemporaneo.',

        material:
            'Titanium',

        process:
            '3D Metal Binder Jet',

        application:
            'Jewellery / Fashion'

    },


    // =================================================
    // ORO
    // =================================================

    oro: {

        title:
            'Oro',

        kicker:
            'Gold / Precious Metal',

        image:
            '../immagini/pendente2.png',

        description:
            'La manifattura additiva applicata all’oro permette di esplorare forme organiche, reticoli e dettagli tridimensionali con una libertà geometrica molto elevata.',

        material:
            'Gold',

        process:
            '3D Metal Binder Jet',

        application:
            'Fine Jewellery'

    },


    // =================================================
    // ACCIAIO
    // =================================================

    acciaio: {

        title:
            'Acciaio',

        kicker:
            'Steel / Additive Manufacturing',

        image:
            '../immagini/pendente-argento.png',

        description:
            'Una soluzione resistente e versatile per la produzione di gioielli e accessori complessi, con geometrie progettate direttamente in digitale.',

        material:
            'Steel',

        process:
            '3D Metal Binder Jet',

        application:
            'Jewellery / Accessories'

    },


    // =================================================
    // BRONZO
    // =================================================

    bronzo: {

        title:
            'Bronzo',

        kicker:
            'Bronze / Creative Metal',

        image:
            '../immagini/pendente-bronzo.png',

        description:
            'Il bronzo permette di sperimentare superfici calde, forme articolate e dettagli decorativi, risultando particolarmente adatto a gioielleria e design creativo.',

        material:
            'Bronze',

        process:
            '3D Metal Binder Jet',

        application:
            'Jewellery / Design'

    },


    // =================================================
    // ARGENTO
    // =================================================

    argento: {

        title:
            'Argento',

        kicker:
            'Silver / Precious Metal',

        image:
            '../immagini/pendente-ferro.png',

        description:
            'Una superficie luminosa applicata a una geometria complessa, sviluppata per sfruttare la libertà formale offerta dalla manifattura additiva metallica.',

        material:
            'Silver',

        process:
            '3D Metal Binder Jet',

        application:
            'Jewellery'

    }

};


// =====================================================
// READ URL
//
// Esempi:
//
// prodotto-pendente.html?material=oro
//
// prodotto-pendente.html?material=platino
//
// prodotto-pendente.html?material=titanio
// =====================================================

const params =

    new URLSearchParams(
        window.location.search
    );


const slug =

    params.get(
        'material'
    );


// =====================================================
// SELECT PRODUCT
//
// Se il parametro non esiste,
// mostriamo Platino.
// =====================================================

const product =

    PRODUCTS[slug]

    ||

    PRODUCTS.platino;


// =====================================================
// ELEMENTS
// =====================================================

const image =

    document.getElementById(
        'productImage'
    );


const kicker =

    document.getElementById(
        'productKicker'
    );


const title =

    document.getElementById(
        'productTitle'
    );


const description =

    document.getElementById(
        'productDescription'
    );


const material =

    document.getElementById(
        'productMaterial'
    );


const process =

    document.getElementById(
        'productProcess'
    );


const application =

    document.getElementById(
        'productApplication'
    );


// =====================================================
// POPULATE PAGE
// =====================================================

if (image) {

    image.src =
        product.image;


    image.alt =
        `Pendente in ${product.title}`;

}


if (kicker) {

    kicker.textContent =
        product.kicker;

}


if (title) {

    title.textContent =
        product.title;

}


if (description) {

    description.textContent =
        product.description;

}


if (material) {

    material.textContent =
        product.material;

}


if (process) {

    process.textContent =
        product.process;

}


if (application) {

    application.textContent =
        product.application;

}


// =====================================================
// PAGE TITLE
// =====================================================

document.title =

    `${product.title} — Legor 3D Metal Hub`;