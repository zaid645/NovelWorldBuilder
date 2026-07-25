// caching.js
const CACHE_NAME = 'novel-lore-cache-v3';

const cacheManager = {
  isChecking: false,

  async checkForUpdate() {
    if (this.isChecking) return;
    this.isChecking = true;

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

    try {
      this.showAlert("Memeriksa pembaruan di server...", "info");

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }

      this.showAlert("Aplikasi siap diperbarui. Memuat ulang...", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (error) {
      console.error("[Cache] Gagal melakukan pembaruan:", error);
      this.showAlert("Gagal memperbarui sistem cache.", "error");
      this.resetCheckingState(updateBtn);
    }
  },

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