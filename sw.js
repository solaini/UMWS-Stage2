/*
@reviewCache is the static name for the new cache version
Updates to fetch event are leveraging code from Google's website on the service worker
found at: https://developers.google.com/web/fundamentals/primers/service-workers/
*/


//Generates a random reviewCache value for updates
let cacheValue = Math.floor(Math.random() * 10000);
let reviewCache = `stage3-${cacheValue}`;
console.log(reviewCache);
// let reviewCache = 'stage2-v8';



//            'package.json',


self.addEventListener('install', function(event){
    event.waitUntil(
    caches.open(reviewCache).then(function(cache) {
        return cache.addAll([
            '/',
            'index.html',
            'restaurant.html',
            'img/',
            'css/styles.css',
            '/js/dbhelper.js',
            '/js/main.js',
            '/js/idb.js',
            '/js/restaurant_info.js',
            'data/',
            'favicon.ico'
        ]).catch(error => console.log(`Cache error: ${error}`));
        })
    );
});


//Compare cache to previous version after install and remove
//Old Cache's
self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.filter(function(cacheName){
                    return cacheName.startsWith('stage3-') && cacheName != reviewCache;
        }).map(function(cacheName) {
            return caches.delete(cacheName);
            })
        )      
        })
    )
});





self.addEventListener('fetch', function(event){
    //Don't cache any data from restaurants/reviews
    if (event.request.url.includes("/restaurants/") || event.request.url.includes("/reviews/")) {
        console.log(`Fetch Event skipped`);
        event.respondWith(fetch(event.request, {cache: "no-store"}));
        return;
    }

    event.respondWith(caches
        .match(event.request)
        .then(db_response => {
        return (db_response || fetch(event.request)
        .then(response => {
        return caches.open(reviewCache).then(cache => {
                cache.put(event.request, response.clone());
            return response;
            });
        }).catch(error => {
        return new Response("No internet connection detected.", {
            status: 404,
            statusText: "No internet connection detected."
        });
        }));
    }));
});

