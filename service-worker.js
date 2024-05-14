const DOC_CACHE_NAME = `DOC_CACHE`
let DOC_CACHE = null
const RES_CACHE_NAME = `RES_CACHE`
let RES_CACHE = null

const FORCE_ENABLE_CACHING = false;
const FORCE_DISABLE_CACHING = false;
const STOP_CACHING = self.registration.scope.includes("127.0.0.1") || self.registration.scope.includes("localhost:");

///////////////////////////////////
//       Utility functions       //
///////////////////////////////////

/**
 * Prints pretty, debug-like messages for local development.
 */
function debugLog(text, background="yellow", color="black !important") {
    if(self.registration.scope.includes("127.0.0.1")) {
        console.log(`%c${text}`, `color: ${color}; background-color: ${background};`);
    }
}

/**
 * Check if the given string ends with any of the strings given in the array `endings`.
 * @param {string} string 
 * @param {string[]} endings 
 */
function endsWithAny(string, endings) {
    return endings.some(ending => string.endsWith(ending));
}

///////////////////////////////////
//       Core caching logic      //
///////////////////////////////////

/**
 * Check if the given url points to a DOCUMENT.
 * @param {*} url 
 * @returns {boolean}
 * @deprecated It's always better to use `isResource()`
 */
function isDocument(url) {
    return endsWithAny(url, [".js", ".html", ".css", "/", "manifest.json"]);
}

/**
 * Check if the given url points to a RESOURCE.
 * @param {string} url 
 * @returns {boolean}
 */
function isResource(url) {
    if(url.includes("/music/")) return true;
    if(url.endsWith("manifest.json")) return true;

    return false;
}

/**
 * Saves a copy of the response to the given cache
 * @param {Request} request 
 * @param {Response} request 
 * @param {Cache} cache 
 */
function saveResponseToCache(request, response, cache) {
    let clone = response.clone()
    cache.put(request, clone)
}

/**
 * Perform a network fetch for the request, and if valid, saves it to the given cache.
 * @param {Request} request 
 * @param {Cache} cache 
 * @returns {Response}
 */
async function networkFetchAndSave(request, cache) {
    const response = await fetch(request);

    if(!response) return;
    if(response.status == 404) return;

    saveResponseToCache(request, response, cache)
    return response;
}

/**
 * Get a response to the given web request, using a custom caching policy.
 * @param {Event} request_event
 */
async function getRequest(request_event) {
    const request = request_event.request;
    const url = new URL(request.url).origin + new URL(request.url).pathname;

    // Always perform a network fetch for google analytics
    if(url.includes("/gtag/")) {
        return fetch(request)
    }
    
    // Initialize an empty document and resource cache
    if(DOC_CACHE === null || RES_CACHE === null) {
        DOC_CACHE = await caches.open(DOC_CACHE_NAME);
        RES_CACHE = await caches.open(RES_CACHE_NAME);
    }

    // If it's not a GET request, let it through.
    if(request.method !== "GET") {
        return fetch(request);
    }

    if(isResource(url)) {
        debugLog(`RES: ${url}`);
        let cache_match = await RES_CACHE.match(request, { ignoreVary: true });
        if(cache_match) {
            debugLog(`${url} returned as cache`, "rgb(0, 255, 128)");
            return cache_match;
        }
        
        // debugLog(`${url} wasn't in cache, so doing fetch`, "yellow")
        const response = networkFetchAndSave(request, RES_CACHE);
        return response;
    }
    else {
        /**
         * Document.
         * Network fetch and cache the response. If the fetch fails, try to find it in the cache.
         */

        debugLog(`DOC: ${url}`)

        return await fetch(request)
            .then(response => {
                // Save this response and return it
                saveResponseToCache(request, response, DOC_CACHE);
                return response;
            })
            .catch(async err => {
                // Try to find a cached response
                const cache_match = await DOC_CACHE.match(request, { ignoreVary: true });
                if(!cache_match) {
                    throw Error(`document could not be fetched: ${url}`);
                }
                return cache_match;
            });
    }

    return new Response(0);
}

///////////////////////////////////
//      Core event listeners     //
///////////////////////////////////

self.addEventListener("install", event => {
    debugLog("Service Worker Installed");

    self.skipWaiting();
});

self.addEventListener("activate", async event => {
    debugLog("Service Worker Activated");

    // Make service worker take control ASAP
    event.waitUntil((async () => {
        await clients.claim();
    })())
});

self.addEventListener("fetch", event => {
    event.respondWith((typeof(STOP_CACHING) !== 'undefined' && STOP_CACHING) ? fetch(event.request) : getRequest(event));
});