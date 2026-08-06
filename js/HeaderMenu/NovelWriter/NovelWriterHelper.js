export const NovelWriterHelper = {
    clearOutput() {
        this.state.outputContent = "";
        const outputArea = document.getElementById('novel-output-area');
        if (outputArea) outputArea.value = "";
        app.NovelWriterModule.updateWordCountUI(outputArea.value);
        app.NovelWriterModule.novelWriterSaveState();
        this.showNotification("Output novel telah dibersihkan.", "info");

    },

    copyOutputToClipboard() {
        if (!this.state.outputContent.trim()) {
            return this.showNotification("Belum ada teks novel untuk disalin!", "error");
        }

        // Normalisasi line break (\r\n -> \n) lalu ganti pemisah baris ganda/bertumpuk menjadi tepat satu \n
        const cleanedText = this.state.outputContent
            .replace(/\r\n/g, '\n')  // Mengubah line-ending Windows menjadi standar \n
            .replace(/\n+/g, '\n')   // Mengubah 2 atau lebih \n berurutan menjadi 1 \n saja
            .trim();

        navigator.clipboard.writeText(cleanedText)
            .then(() => this.showNotification("Teks novel berhasil disalin ke clipboard!", "success"))
            .catch(err => console.error("Gagal menyalin teks: ", err));
    },

    downloadOutputAsTxt(filename = "Hasil_Novel.txt") {
        if (!this.state.outputContent.trim()) {
            return this.showNotification("Belum ada teks novel untuk di-download!", "error");
        }
        const blob = new Blob([this.state.outputContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    // UI Toast Notification tanpa alert()
    showNotification(message, type = 'info') {
        let toastContainer = document.getElementById('nw-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'nw-toast-container';
            toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const bgColors = {
            success: 'bg-emerald-800 border-emerald-600 text-emerald-100',
            error: 'bg-rose-800 border-rose-600 text-rose-100',
            info: 'bg-indigo-800 border-indigo-600 text-indigo-100'
        };

        toast.className = `p-3 rounded-lg border shadow-xl text-xs flex items-center justify-between gap-3 transition-all duration-300 transform translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="font-bold opacity-70 hover:opacity-100">✕</button>
        `;

        toastContainer.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        });

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    },
}