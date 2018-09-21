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






self.addEventListener('install', function(event){
    event.waitUntil(
    caches.open(reviewCache).then(function(cache) {
        return cache.addAll([
            '/',
            'img/',
            'css/styles.css',
            '/js/',
            'index.html',
            'restaurant.html',
            'package.json',
            'data/'
        ]);
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

// self.addEventListener('fetch', function(event){
//     //Don't cache any data from restaurants/reviews
//     if (event.request.url.includes("/restaurants/") || event.request.url.includes("/reviews/")) {
//         event.respondWith(fetch(event.request, {cache: "no-store"}));
//         return;
//     }
    
//     event.respondWith(
//         caches.match(event.request).then(function(response){
//             //Returns repsonse if cache is found
//             if(response) return response;
//         const fetchRequest = event.request.clone();
//             //console.log(response.json());
//         return fetch(fetchRequest).then(
//             function(response){
//                 if(!response || response.status !== 200 || response.type !=='basic'){
//                     return response;
//                 }

//                 let responseToCache = response.clone();

//                 caches.open(reviewCache).then(function(cache){
//                     cache.put(event.request, responseToCache);
//                 })
//             }
//         )    
//     })
//     );
// });

self.addEventListener('fetch', function(event){
    //Don't cache any data from restaurants/reviews
    if (event.request.url.includes("/restaurants/") || event.request.url.includes("/reviews/")) {
        event.respondWith(fetch(event.request, {cache: "no-store"}));
        return;
    }
    
    
    event.respondWith(caches.match(event.request, {ignoreSearch: true}).then(function (db_response) {
        //Returns repsonse if cache is found
        if (db_response && db_response.type === "basic") {
            console.log("found in db");
            return db_response;
        }
        
        return fetch(event.request).then(function (response) {
            console.log("made a fetch");
            let responseToCache = response.clone();

            caches
                .open(reviewCache)
                .then(function (cache) {
                    cache.put(event.request, responseToCache);
                })
            return response;
        })
        }));
})


