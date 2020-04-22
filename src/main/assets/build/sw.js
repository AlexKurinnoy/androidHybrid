const CACHE = 'census';
const STATIC_ASSETS = [
    './index.html',
    './css/app.css',
    './css/app.css.map',
    './js/app.js',
    './js/app.js.map',
    './js/euworker.js',
    './js/lib/eusw.js',
    './js/lib/euswll.js',
    './js/lib/common.js',
    './js/lib/euscp.js',
    './js/lib/euscpm.js',
    './js/lib/euscpt.js',
    './js/lib/euutils.js',
    './js/lib/selectize.js',
    './js/lib/fs/Blob.min.js',
    './js/lib/fs/FileSaver.js',
    './js/lib/qr/qrcodedecode.js',
    './js/lib/qr/reedsolomon.js',
    './data/dict/street.json',
    './data/dict/region.json',
    './data/dict/building.json',
    './data/dict/nationality.json',
    './data/dict/language.json',
    './data/dict/city.json',
    './data/dict/districts.json',
    './fonts/roboto-regular.woff2',
    './fonts/roboto-medium.woff2',
    './fonts/roboto-bold.woff2',    
    './fonts/roboto-regular.woff',
    './fonts/roboto-medium.woff',
    './fonts/roboto-bold.woff',
    './img/warning.svg',
    './img/sprite.svg',
    './img/member-warning.svg',
    './img/member-ok.svg',
    './img/member-error.svg',
    './img/info.svg',
    './img/error.svg',
    './img/logo-small.png',
    './img/stat.png',
    './img/member-info.png',
    './img/flag.png',
    './ver.txt',
    './data/t_statuses.json',
    './data/h_statuses.json',
    './data/poems.json',
    './manifest.json',
    './img/icons/icon-72x72.png',
    './img/icons/icon-96x96.png',
    './img/icons/icon-128x128.png',
    './img/icons/icon-144x144.png',
    './img/icons/icon-152x152.png',
    './img/icons/icon-192x192.png',
    './img/icons/icon-384x384.png',
    './img/icons/icon-512x512.png',
    './data/key/CACertificates.p7b',
    './publicCert.cer',
    './data/key/CAs.json'
];


// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) =>
            cache.addAll(STATIC_ASSETS))
    );
});

// при событии fetch, мы используем кэш, и только потом обновляем его данным с сервера
self.addEventListener('fetch', function(event) {
    console.log(event)
    let domen = event.request.referrer
    domen.split('/reg');
    domen.split('/ins');
    console.log(domen);
    // Мы используем `respondWith()`, чтобы мгновенно ответить без ожидания ответа с сервера.
    if ( event.request.url.indexOf('synchro') !== -1 ) {
        event.respondWith(fromNetwork(event.request));
    } else {
        event.respondWith(fromCache(event.request));
        // `waitUntil()` нужен, чтобы предотвратить прекращение работы worker'a до того как кэш обновиться.
        event.waitUntil(update(event.request));
    }
    
    
});
self.addEventListener('activate', (event) => {
    console.log(event)
});
function fromNetwork(request) {
    return new Promise((fulfill, reject) => {
        fetch(request).then((response) => {
            fulfill(response);
        }, reject);
    });
}

function fromCache(request) {
    return caches.open(CACHE).then((cache) =>
        cache.match(request).then((matching) =>
            matching || Promise.reject('no-match')
        ));
}

function update(request) {
    console.log(request)
    return caches.open(CACHE).then((cache) =>
        fetch(request).then((response) =>
            cache.put(request, response)
        )
    );
}
