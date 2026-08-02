// Notifikasi pop up

export const CustomModal = {
     
    showCustomModal(options) {
        const modalId = 'customModal_' + Date.now();
        const modalHtml = `
        <div id="${modalId}" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 transform scale-95 transition-transform duration-300">
                <h3 class="text-lg font-bold text-slate-100 mb-2">${options.title}</h3>
                <div class="mb-5 text-sm text-slate-300">${options.content}</div>
                <div class="flex justify-end space-x-3 pt-2">
                    <button id="${modalId}_cancel" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm transition text-white">Batal</button>
                    <button id="${modalId}_confirm" class="px-4 py-2 ${options.confirmColor || 'bg-indigo-600 hover:bg-indigo-500'} text-white font-medium rounded text-sm transition shadow-lg">${options.confirmText || 'Simpan'}</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalEl = document.getElementById(modalId);
        const btnCancel = document.getElementById(`${modalId}_cancel`);
        const btnConfirm = document.getElementById(`${modalId}_confirm`);

        // Animasi masuk
        setTimeout(() => {
            modalEl.classList.remove('opacity-0');
            modalEl.children[0].classList.remove('scale-95');
        }, 10);

        const close = () => {
            modalEl.classList.add('opacity-0');
            modalEl.children[0].classList.add('scale-95');
            setTimeout(() => modalEl.remove(), 300);
        };

        btnCancel.onclick = () => { close(); if (options.onCancel) options.onCancel(); };
        btnConfirm.onclick = () => {
            if (options.onConfirm) {
                const shouldClose = options.onConfirm();
                if (shouldClose !== false) close();
            } else {
                close();
            }
        };
    }
}