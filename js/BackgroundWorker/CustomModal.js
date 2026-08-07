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
    },

    showPromptModal(options) {
        const modalId = 'promptModal_' + Date.now();
        const modalHtml = `
        <div id="${modalId}" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-300">
            <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6 transform scale-95 transition-transform duration-300">
                <h3 class="text-lg font-bold text-slate-100 mb-2">${options.title || 'Ubah Nama'}</h3>
                <div class="mb-3 text-sm text-slate-300">${options.content || ''}</div>
                
                <!-- Line edit / Text Input -->
                <div class="mb-5">
                    <input type="text" id="${modalId}_input" 
                        value="${options.defaultValue || ''}" 
                        placeholder="${options.placeholder || 'Masukkan nama baru...'}" 
                        class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition" />
                </div>

                <div class="flex justify-end space-x-3 pt-2">
                    <button id="${modalId}_cancel" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm transition text-white">Batal</button>
                    <button id="${modalId}_confirm" class="px-4 py-2 ${options.confirmColor || 'bg-indigo-600 hover:bg-indigo-500'} text-white font-medium rounded text-sm transition shadow-lg">${options.confirmText || 'Simpan'}</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalEl = document.getElementById(modalId);
        const inputEl = document.getElementById(`${modalId}_input`);
        const btnCancel = document.getElementById(`${modalId}_cancel`);
        const btnConfirm = document.getElementById(`${modalId}_confirm`);

        // Animasi masuk & Otomatis fokus ke input teks
        setTimeout(() => {
            modalEl.classList.remove('opacity-0');
            modalEl.children[0].classList.remove('scale-95');
            inputEl.focus();
            inputEl.select(); // Memilih semua teks agar mudah langsung diketik ulang
        }, 10);

        const close = () => {
            modalEl.classList.add('opacity-0');
            modalEl.children[0].classList.add('scale-95');
            setTimeout(() => modalEl.remove(), 300);
        };

        btnCancel.onclick = () => { 
            close(); 
            if (options.onCancel) options.onCancel(); 
        };

        btnConfirm.onclick = () => {
            const inputValue = inputEl.value.trim();
            if (options.onConfirm) {
                // Mengirimkan nilai input ke callback onConfirm
                const shouldClose = options.onConfirm(inputValue);
                if (shouldClose !== false) close();
            } else {
                close();
            }
        };

        // Menutupi kebutuhan submit saat menekan tombol Enter pada keyboard
        inputEl.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                btnConfirm.click();
            }
        });
    }
}