const CACHE_NAME = 'novel-lore-cache-v2';

// Daftar semua file yang ingin dipantau dan disimpan ke dalam cache lokal browser
const ASSETS_TO_CACHE = [
  './',
  './index.html',
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
  './js/HeaderMenu/WatakList.js',
  './js/UniverseComponent/BasicUniverse.js',
  './js/UniverseComponent/UniverseCharacter.js',
  './js/UniverseComponent/UniverseLocation.js',
  './js/UniverseComponent/UniverseLore.js'
];

const cacheManager = {
  
  /**
   * Mengambil informasi metadata dari berkas yang tersimpan di dalam Cache
   */
  async getCacheMetadata(cache, url) {
    try {
      const cachedResponse = await cache.match(url);
      if (!cachedResponse) return null;
      
      return {
        etag: cachedResponse.headers.get('etag'),
        lastModified: cachedResponse.headers.get('last-modified'),
        contentLength: cachedResponse.headers.get('content-length')
      };
    } catch (e) {
      console.warn(`[Cache] Gagal membaca metadata cache untuk: ${url}`, e);
      return null;
    }
  },

  /**
   * Mengambil metadata dari server langsung tanpa mengunduh seluruh isi konten (menggunakan HEAD request)
   */
  async getNetworkMetadata(url) {
    const cleanUrl = url === './' ? './index.html' : url;
    try {
      // Mencoba HEAD request terlebih dahulu karena sangat ringan (hanya mengambil header)
      let response = await fetch(`${cleanUrl}?t=${Date.now()}`, { method: 'HEAD', cache: 'no-cache' });
      
      // Fallback ke GET jika server tidak mendukung HEAD (misal memicu error 405)
      if (!response.ok) {
        response = await fetch(`${cleanUrl}?t=${Date.now()}`, { method: 'GET', cache: 'no-cache' });
      }

      if (response.ok) {
        return {
          etag: response.headers.get('etag'),
          lastModified: response.headers.get('last-modified'),
          contentLength: response.headers.get('content-length')
        };
      }
    } catch (e) {
      console.warn(`[Cache] Gagal memeriksa metadata jaringan untuk: ${url}`, e);
    }
    return null;
  },

  /**
   * Logika pembanding untuk menentukan apakah berkas di server berbeda dengan yang di cache
   */
  hasChanged(cached, network) {
    // Jika belum ada di cache, anggap berubah (harus diunduh)
    if (!cached) return true;
    // Jika gagal mengambil data jaringan, pertahankan berkas cache yang ada
    if (!network) return false;

    // 1. Bandingkan ETag (Penanda unik hash berkas dari server)
    if (cached.etag && network.etag) {
      return cached.etag !== network.etag;
    }
    // 2. Bandingkan tanggal modifikasi terakhir
    if (cached.lastModified && network.lastModified) {
      return cached.lastModified !== network.lastModified;
    }
    // 3. Bandingkan ukuran berkas sebagai fallback terakhir
    if (cached.contentLength && network.contentLength) {
      return cached.contentLength !== network.contentLength;
    }

    // Jika server tidak mengirimkan header pembanding sama sekali, berasumsi tidak berubah
    // untuk mencegah loop pengunduhan tanpa batas.
    return false;
  },


  /**
   * Fungsi utama untuk membandingkan semua berkas dan memperbarui hanya yang mengalami perubahan
   */
  async checkForUpdate() {
    if (!('caches' in window)) {
      this.showAlert("Browser Anda tidak mendukung fitur caching modern.", "warning");
      return;
    }

    try {
      this.showAlert("Memeriksa status versi setiap berkas di server...", "info");

      const cache = await caches.open(CACHE_NAME);
      const filesToUpdate = [];

      // Lakukan pengecekan metadata untuk semua berkas secara paralel agar sangat cepat
      const checkPromises = ASSETS_TO_CACHE.map(async (url) => {
        const cachedMeta = await this.getCacheMetadata(cache, url);
        const networkMeta = await this.getNetworkMetadata(url);

        if (this.hasChanged(cachedMeta, networkMeta)) {
          filesToUpdate.push(url);
        }
      });

      await Promise.all(checkPromises);


      // JIKA TIDAK ADA PERUBAHAN
      if (filesToUpdate.length === 0) {
        this.showAlert("Aplikasi Anda sudah menggunakan versi terbaru. Tidak ada perubahan.", "success");
        return; 
      }

      // JIKA TERDETEKSI PERUBAHAN
      this.showAlert(`Mendeteksi ${filesToUpdate.length} berkas diperbarui. Mengunduh versi terbaru...`, "info");

      // Unduh hanya berkas-berkas yang terdeteksi berubah saja
      const downloadPromises = filesToUpdate.map(async (url) => {
        try {
          const cleanUrl = url === './' ? './index.html' : url;
          const response = await fetch(`${cleanUrl}?t=${Date.now()}`, {
            cache: 'reload'
          });

          if (response.ok) {
            // Timpa berkas lama di dalam cache dengan versi yang baru saja diunduh
            await cache.put(url, response);
            console.log(`[Cache] Berhasil memperbarui berkas: ${url}`);
          } else {
            console.warn(`[Cache] Gagal mengunduh berkas baru (${response.status}): ${url}`);
          }
        } catch (err) {
          console.warn(`[Cache] Galat saat mencoba memperbarui berkas: ${url}`, err);
        }
      });

      await Promise.all(downloadPromises);

      this.showAlert("Sistem berhasil diperbarui! Memuat ulang halaman...", "success");

      // Lakukan hard reload terprogram untuk menerapkan perubahan berkas di memori browser
      setTimeout(() => {
        const currentUrl = window.location.href.split('?')[0];
        window.location.href = `${currentUrl}?update=${Date.now()}`;
      }, 1500);

    } catch (error) {
      console.error("[Cache] Gagal melakukan pembaruan diferensial:", error);
      this.showAlert("Gagal memperbarui sistem cache secara diferensial.", "error");
    }
  },


  /**
   * Fungsi pembantu untuk memicu notifikasi visual aplikasi
   */
  showAlert(msg, type = 'info') {
    if (window.app && typeof window.app.showAlert === 'function') {
      window.app.showAlert(msg, type);
    } else {
      const banner = document.getElementById('alertBanner');
      if (banner) {
        banner.innerText = msg;
        banner.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg transition-opacity duration-300 z-50 ${
          type === 'error' ? 'bg-rose-600' : (type === 'warning' ? 'bg-yellow-600' : 'bg-emerald-600')
        } text-white`;
        banner.classList.remove('opacity-0');
        setTimeout(() => banner.classList.add('opacity-0'), 4000);
      }
    }
  }
};


// =========================================================================
// OLAH EVENT LISTENER OTOMATIS
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const updateBtn = document.getElementById('btnCheckUpdate');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      cacheManager.checkForUpdate();
    });
  }
});