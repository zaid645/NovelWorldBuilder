// caching.js
const CACHE_NAME = 'novel-lore-cache-v2';

const cacheManager = {
  // 1. Tambahkan flag status untuk mengunci eksekusi ganda
  isChecking: false, 
  
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
   * Mengambil metadata dari server langsung (menggunakan HEAD request)
   */
  async getNetworkMetadata(url) {
    if (!navigator.onLine) return null;

    let cleanUrl = url === './' ? './index.html' : url;
    try {
      let response = await fetch(`${cleanUrl}?t=${Date.now()}`, { method: 'HEAD', cache: 'no-cache' });
      
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

  hasChanged(cached, network) {
    if (!cached) return true;
    if (!network) return false;

    if (cached.etag && network.etag) return cached.etag !== network.etag;
    if (cached.lastModified && network.lastModified) return cached.lastModified !== network.lastModified;
    if (cached.contentLength && network.contentLength) return cached.contentLength !== network.contentLength;

    return false;
  },

  /**
   * Memeriksa pembaruan khusus untuk file index.html sebagai indikator update sistem
   */
  async checkForUpdate() {
    // Jika sedang dalam proses pengecekan, abaikan instruksi berikutnya
    if (this.isChecking) return;
    this.isChecking = true;

    // Ambil elemen tombol untuk dinonaktifkan sementara (mencegah spam click)
    const updateBtn = document.getElementById('btnCheckUpdate');
    if (updateBtn) {
      updateBtn.disabled = true;
      updateBtn.innerText = "Memeriksa...";
    }

    if (!navigator.onLine) {
      this.showAlert("Gagal memeriksa pembaruan. Anda sedang offline.", "error");
      this.resetCheckingState(updateBtn);
      return;
    }

    if (!('caches' in window)) {
      this.showAlert("Browser Anda tidak mendukung fitur caching modern.", "warning");
      this.resetCheckingState(updateBtn);
      return;
    }

    try {
      this.showAlert("Memeriksa pembaruan di server...", "info");

      const cache = await caches.open(CACHE_NAME);
      // GANTI ./index.html MENJADI ./sw.js
      const cachedMeta = await this.getCacheMetadata(cache, './sw.js');
      const networkMeta = await this.getNetworkMetadata('./sw.js');

      if (this.hasChanged(cachedMeta, networkMeta)) {
        this.showAlert("Mendeteksi versi baru! Memperbarui sistem...", "info");
        
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
            console.log('[Cache] Service worker diperbarui.');
          }
        }

        // GANTI fetch dan cache.put untuk memperbarui sw.js di dalam cache storage
        const response = await fetch(`./sw.js?t=${Date.now()}`, { cache: 'reload' });
        if (response.ok) {
          await cache.put('./sw.js', response);
        }

        this.showAlert("Sistem berhasil diperbarui! Memuat ulang...", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } else {
        this.showAlert("Aplikasi Anda sudah menggunakan versi terbaru.", "success");
        this.resetCheckingState(updateBtn);
      }
    

    } catch (error) {
      console.error("[Cache] Gagal melakukan pembaruan:", error);
      this.showAlert("Gagal memperbarui sistem cache.", "error");
      this.resetCheckingState(updateBtn);
    }
  },

  // Fungsi pembantu untuk mengembalikan status tombol dan flag
  resetCheckingState(button) {
    this.isChecking = false;
    if (button) {
      button.disabled = false;
      button.innerText = "Cek Pembaruan Sistem";
    }
  },

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

// Event listener otomasi UI & Registrasi Service Worker
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('[Cache] Service Worker aktif!', reg.scope))
      .catch((err) => console.error('[Cache] Registrasi gagal:', err));
  }

  const updateBtn = document.getElementById('btnCheckUpdate');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      cacheManager.checkForUpdate();
    });
  }

  if (!navigator.onLine) {
    setTimeout(() => {
      cacheManager.showAlert("Aplikasi berjalan dalam Mode Offline. Data dimuat dari memori lokal.", "warning");
    }, 1000);
  }

  window.addEventListener('online', () => {
    cacheManager.showAlert("Koneksi internet terhubung kembali.", "success");
  });

  window.addEventListener('offline', () => {
    cacheManager.showAlert("Koneksi terputus. Berpindah ke Mode Offline.", "warning");
  });
});