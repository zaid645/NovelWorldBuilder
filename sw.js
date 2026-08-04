// sw.js
const CACHE_NAME = 'novel-lore-cache-v3';

const LOCAL_ASSETS = [
  // Index
  './',
  './index.html',
  './sw.js',
  './caching.js',
  './favicon.ico',
  './favicon.svg',

  // MAIN
  './js/MainScript.js',

  // HELPER
  './js/BackgroundWorker/DefaultData.json',
  './js/BackgroundWorker/CustomModal.js',
  './js/BackgroundWorker/ManagerData.js',
  './js/BackgroundWorker/ManagerExportImportBasic.js',
  './js/BackgroundWorker/ManagerUiBasic.js',
  './js/BackgroundWorker/MarkdownExportHelper.js',

  // FANTASI
  './js/FantasyComponent/DataCleaner.js',
  // - Item
  './js/FantasyComponent/Item/Item.js',
  './js/FantasyComponent/Item/ItemExport.js',
  './js/FantasyComponent/Item/ItemFloating.js',
  './js/FantasyComponent/Item/ItemForm.js',
  './js/FantasyComponent/Item/ItemTag.js',
  './js/FantasyComponent/Item/ItemView.js',
  // - Pet
  './js/FantasyComponent/Pet/Pet.js',
  './js/FantasyComponent/Pet/PetExport.js',
  './js/FantasyComponent/Pet/PetFloating.js',
  './js/FantasyComponent/Pet/PetForm.js',
  './js/FantasyComponent/Pet/PetTag.js',
  './js/FantasyComponent/Pet/PetView.js',
  // - Skill
  './js/FantasyComponent/Skill/Skill.js',
  './js/FantasyComponent/Skill/SkillExport.js',
  './js/FantasyComponent/Skill/SkillFloating.js',
  './js/FantasyComponent/Skill/SkillForm.js',
  './js/FantasyComponent/Skill/SkillTag.js',
  './js/FantasyComponent/Skill/SkillView.js',
  // - race
  './js/FantasyComponent/Race/Race.js',
  './js/FantasyComponent/Race/RaceFloating.js',
  './js/FantasyComponent/Race/RaceForm.js',
  './js/FantasyComponent/Race/RaceView.js',

  // HEADER
  './js/HeaderMenu/DataSharing.js',
  './js/HeaderMenu/WatakList.js',
  // - NovelBasicInfo
  './js/HeaderMenu/NovelBasicInfo/NovelBasicInfo.js',
  './js/HeaderMenu/NovelBasicInfo/NovelBasicInfoExport.js',
  './js/HeaderMenu/NovelBasicInfo/NovelBasicInfoExportJson.js',
  './js/HeaderMenu/NovelBasicInfo/NovelBasicInfoExportMd.js',
  './js/HeaderMenu/NovelBasicInfo/NovelBasicInfoForm.js',
  './js/HeaderMenu/NovelBasicInfo/NovelBasicInfoShow.js',
  // - ArcInfo
  './js/HeaderMenu/ArcInfo/ArcInfo.js',
  './js/HeaderMenu/ArcInfo/ArcInfoExport.js',
  './js/HeaderMenu/ArcInfo/ArcInfoFormAi.js',
  './js/HeaderMenu/ArcInfo/ArcInfoFormArc.js',
  './js/HeaderMenu/ArcInfo/ArcInfoFormSub.js',
  './js/HeaderMenu/ArcInfo/ArcInfoShow.js',
  // - AI Enchanter
  './js/HeaderMenu/AIEnchanter/AIEnchanter.js',
  './js/HeaderMenu/AIEnchanter/AIEnchantCore.js',
  './js/HeaderMenu/AIEnchanter/AIEnchanterDebug.js',
  './js/HeaderMenu/AIEnchanter/AIEnchanterForm.js',
  './js/HeaderMenu/AIEnchanter/AIEnchanterShow.js',

  // UNIVERSE COMPONENT
  './js/UniverseComponent/UniverseLore.js',

  // - Basic Universe
  './js/UniverseComponent/BasicUniverse/BasicUniverse.js',
  './js/UniverseComponent/BasicUniverse/BasicUniverseShow.js',
  './js/UniverseComponent/BasicUniverse/BasicUniverseExport.js',
  './js/UniverseComponent/BasicUniverse/BasicUniverseExportJson.js',
  './js/UniverseComponent/BasicUniverse/BasicUniverseExportMd.js',
  // - Universe Character
  './js/UniverseComponent/UniverseCharacter/UniverseCharacter.js',
  './js/UniverseComponent/UniverseCharacter/UniverseCharacterCategory.js',
  './js/UniverseComponent/UniverseCharacter/UniverseCharacterFormAi.js',
  './js/UniverseComponent/UniverseCharacter/UniverseCharacterFormMain.js',
  './js/UniverseComponent/UniverseCharacter/UniverseCharacterFormOuter.js',
  './js/UniverseComponent/UniverseCharacter/UniverseCharacterFormSub.js',
  './js/UniverseComponent/UniverseCharacter/UniverseCharacterShow.js',
  // - Universe monster
  './js/UniverseComponent/UniverseMonster/UniverseMonster.js',
  './js/UniverseComponent/UniverseMonster/UniverseMonsterCategory.js',
  './js/UniverseComponent/UniverseMonster/UniverseMonsterFormAi.js',
  './js/UniverseComponent/UniverseMonster/UniverseMonsterFormMain.js',
  './js/UniverseComponent/UniverseMonster/UniverseMonsterFormOuter.js',
  './js/UniverseComponent/UniverseMonster/UniverseMonsterFormSub.js',
  './js/UniverseComponent/UniverseMonster/UniverseMonsterShow.js',
  // - Universe Location
  './js/UniverseComponent/UniverseLocation/UniverseLocation.js',
  './js/UniverseComponent/UniverseLocation/UniverseLocationForm.js',
  './js/UniverseComponent/UniverseLocation/UniverseLocationFormAi.js',
  './js/UniverseComponent/UniverseLocation/UniverseLocationShow.js'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
  'https://unpkg.com/dexie@latest/dist/modern/dexie.mjs'
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

// STRATEGI: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
  // Hanya proses request bertipe GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika koneksi sukses, perbarui cache secara otomatis
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika jaringan gagal (offline), ambil dari cache
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});