// =====================================================
// PRODUCT DATABASE
//
// IMPORTANTE:
// Questo file si trova dentro /prodotto/.
// Per raggiungere /immagini/ usiamo quindi ../immagini/
// =====================================================

const PRODUCTS = {

    acciaio: {
        title: 'Acciaio',
        kicker: 'Steel / Additive Manufacturing',
        image: '../immagini/anello-acciaio.png',
        description: 'Una geometria complessa realizzata in acciaio attraverso tecnologie di manifattura additiva, pensata per combinare resistenza, precisione e libertà progettuale.',
        material: 'Steel',
        process: '3D Metal Binder Jet',
        application: 'Jewellery / Accessories'
    },

    platino: {
        title: 'Platino',
        kicker: 'Platinum / Precious Metal',
        image: '../immagini/anello-platino.png',
        description: 'Una struttura organica e leggera che sfrutta la libertà geometrica della manifattura additiva applicata a un metallo prezioso.',
        material: 'Platinum',
        process: '3D Metal Binder Jet',
        application: 'High Jewellery'
    },

    titanio: {
        title: 'Titanio',
        kicker: 'Titanium / Lightweight Metal',
        image: '../immagini/anello-titanio.png',
        description: 'Leggerezza e complessità geometrica si incontrano in una struttura progettata per valorizzare le caratteristiche del titanio.',
        material: 'Titanium',
        process: '3D Metal Binder Jet',
        application: 'Jewellery / Fashion'
    },

    oro: {
        title: 'Oro',
        kicker: 'Gold / Precious Metal',
        image: '../immagini/anello-oro.png',
        description: 'La manifattura additiva applicata all’oro permette di esplorare strutture organiche e geometrie difficili da ottenere attraverso processi tradizionali.',
        material: 'Gold',
        process: '3D Metal Binder Jet',
        application: 'Fine Jewellery'
    },

    bronzo: {
        title: 'Bronzo',
        kicker: 'Bronze / Creative Metal',
        image: '../immagini/anello-bronzo.png',
        description: 'Una soluzione versatile per sperimentare forme, superfici e strutture tridimensionali nel mondo del design e degli accessori.',
        material: 'Bronze',
        process: '3D Metal Binder Jet',
        application: 'Jewellery / Design'
    },

    argento: {
        title: 'Argento',
        kicker: 'Silver / Precious Metal',
        image: '../immagini/anello-argento.png',
        description: 'Una superficie brillante incontra una geometria lattice complessa, progettata attraverso processi digitali e realizzata in metallo.',
        material: 'Silver',
        process: '3D Metal Binder Jet',
        application: 'Jewellery'
    }

};


// =====================================================
// READ URL
// Esempio: prodotto.html?material=oro
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const slug =
    params.get('material');

const product =
    PRODUCTS[slug] ||
    PRODUCTS.acciaio;


// =====================================================
// ELEMENTS
// =====================================================

const image =
    document.getElementById('productImage');

const kicker =
    document.getElementById('productKicker');

const title =
    document.getElementById('productTitle');

const description =
    document.getElementById('productDescription');

const material =
    document.getElementById('productMaterial');

const process =
    document.getElementById('productProcess');

const application =
    document.getElementById('productApplication');


// =====================================================
// POPULATE PAGE
// =====================================================

if (image) {
    image.src = product.image;
    image.alt = `Anello in ${product.title}`;
}

if (kicker) {
    kicker.textContent = product.kicker;
}

if (title) {
    title.textContent = product.title;
}

if (description) {
    description.textContent = product.description;
}

if (material) {
    material.textContent = product.material;
}

if (process) {
    process.textContent = product.process;
}

if (application) {
    application.textContent = product.application;
}


document.title =
    `${product.title} — Legor 3D Metal Hub`;