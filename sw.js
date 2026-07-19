// sw.js
const CACHE_NAME = 'novel-lore-cache-v3'; // Naikkan versi jika perlu membersihkan cache lama

const LOCAL_ASSETS = [
  './',
  './index.html',
  './sw.js',
  './caching.js',
  './favicon.ico',
  './favicon.svg',
  './js/DefaultData.json',
  './js/MainScript.js',
  './js/FantasyComponent/Item.js',
  './js/FantasyComponent/Pet.js',
  './js/FantasyComponent/Skill.js',
  './js/HeaderMenu/AIEnchanter.js',
  './js/HeaderMenu/ArcInfo.js',
  './js/HeaderMenu/NovelBasicInfo.js',
  './js/HeaderMenu/DataSharing.js',
  './js/HeaderMenu/WatakList.js',
  './js/UniverseComponent/BasicUniverse.js',
  './js/UniverseComponent/UniverseCharacter.js',
  './js/UniverseComponent/UniverseMonster.js',
  './js/UniverseComponent/UniverseLocation.js',
  './js/UniverseComponent/UniverseLore.js'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'
];

// Pemasangan aset saat instalasi
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Mencadangkan aset lokal...');
      await cache.addAll(LOCAL_ASSETS);

      console.log('[SW] Mencadangkan aset CDN...');
      const externalPromises = EXTERNAL_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url, { mode: 'no-cors' });
          await cache.put(url, response);
        } catch (err) {
          console.error(`[SW] Gagal mencadangkan CDN: ${url}`, err);
        }
      });
      return Promise.all(externalPromises);
    })
  );
  self.skipWaiting(); 
});

// Pembersihan cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Strategi Fetching cerdas
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // SOLUSI: Jika request mengandung query timestamp (?t=), langsung ambil dari Jaringan Server!
  if (url.searchParams.has('t')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});