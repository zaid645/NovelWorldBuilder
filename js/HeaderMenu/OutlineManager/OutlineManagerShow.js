import { ChapterOutlineForm } from './OutlineManagerForm.js';

export const ChapterOutlineModule = {
    // State internal UI
    currentArcId: null,
    editingChapterId: null,
    
    // State Global untuk File Attachment AI
    attachedFile: {
        fileName: '',
        content: ''
    },

    initChapterOutlineUI(arcId) {
        this.currentArcId = arcId;
        this.editingChapterId = null;
    },

    renderChapterOutline() {
        // Bersihkan store yatim terlebih dahulu
        ChapterOutlineForm.cleanInvalidArcStores.call(this);

        const arcs = (this.data && Array.isArray(this.data.arcs)) ? this.data.arcs : [];

        // Auto-assign Arc pertama jika currentArcId belum valid/tersedia
        if ((!this.currentArcId || !arcs.some(a => a.id === this.currentArcId)) && arcs.length > 0) {
            this.currentArcId = arcs[0].id;
        }

        let html = '';

        if (arcs.length === 0) {
            html = `
                <div class="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md">
                    <strong>Peringatan:</strong> Belum ada Arc cerita yang dibuat. Silakan buat Arc terlebih dahulu pada menu <b>Manajemen Arc Cerita</b>.
                </div>`;
            return html;
        }

        const currentArc = arcs.find(a => a.id === this.currentArcId);
        const chapters = currentArc ? ChapterOutlineForm.getChapters.call(this, this.currentArcId) : [];
        const subarcs = currentArc ? (currentArc.subarcs || []) : [];

        const chapterOffset = ChapterOutlineForm.getChapterOffset.call(this, this.currentArcId);

        html = `
            <div id="chapterOutlineContainer">
                <div class="chapter-outline-module shadow-md rounded-lg p-4 bg-slate-800 text-slate-100 border border-slate-700">
                    
                    <!-- Top Control Bar: Arc Selector & Global Attachment -->
                    <div class="bg-slate-900 p-3 rounded-md border border-slate-700 mb-4 flex flex-wrap gap-4 justify-between items-center">
                        <!-- Arc Dropdown Selector -->
                        <div class="flex items-center gap-2 flex-1 min-w-[280px]">
                            <label for="arcSelectDropdown" class="font-bold text-sm text-indigo-400 whitespace-nowrap">Pilih Arc Cerita:</label>
                            <select id="arcSelectDropdown" class="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded focus:ring-2 focus:ring-indigo-500 transition-all">
                                ${arcs.map(a => `<option value="${a.id}" ${a.id === this.currentArcId ? 'selected' : ''}>${this.escapeHtml(a.name)}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Input Offsite BAB -->
                        <div class="flex items-center gap-2 bg-slate-800 p-1.5 px-3 rounded border border-slate-700" title="Jumlah bab awal dari luar sistem (misal: isi 5 maka urutan bab mulai dari BAB 6)">
                            <label for="inputChapterOffset" class="text-xs text-slate-400 font-semibold whitespace-nowrap">Offsite BAB:</label>
                            <input 
                                type="number" 
                                id="inputChapterOffset" 
                                min="0" 
                                value="${this.data?.chapterOffset || 0}" 
                                class="w-16 bg-slate-900 border border-slate-600 text-white text-xs p-1 rounded text-center focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>

                        <!-- Attach File Global (Persist antar-Arc) -->
                        <div class="flex items-center gap-2 bg-slate-800 p-1.5 px-3 rounded border border-slate-700">
                            <span class="text-xs text-slate-400 font-semibold">📎 File Pengetahuan AI:</span>
                            ${this.attachedFile.fileName ? `
                                <span class="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                                    ${this.escapeHtml(this.attachedFile.fileName)}
                                    <button id="btnDetachFile" class="text-rose-400 font-bold hover:text-rose-300 ml-1" title="Lepas File">✕</button>
                                </span>
                            ` : `
                                <label class="cursor-pointer bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 px-2 py-1 rounded border border-slate-500 transition-colors">
                                    + Attach .txt
                                    <input type="file" id="inputKnowledgeFile" accept=".txt" class="hidden" />
                                </label>
                            `}
                        </div>
                    </div>

                    <!-- Header Component -->
                    <div class="flex flex-wrap justify-between items-center mb-4 border-b border-slate-700 pb-3 gap-2">
                        <h3 class="text-xl font-bold">Outline BAB: <span class="text-indigo-400">${this.escapeHtml(currentArc ? currentArc.name : '')}</span></h3>
                        <div class="flex flex-wrap gap-2">
                            ${chapters.length > 0 ? `
                                <button id="btnDeleteAllChapters" class="btn bg-rose-700 text-white px-3 py-1.5 rounded hover:bg-rose-800 text-sm transition-all active:scale-95">
                                    🗑️ Hapus Semua BAB
                                </button>
                            ` : ''}
                            <button id="btnToggleAiForm" class="btn bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 text-sm transition-all active:scale-95">
                                ✨ Generate AI Outline
                            </button>
                            <button id="btnToggleManualForm" class="btn bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 text-sm transition-all active:scale-95">
                                + Tambah BAB Manual
                            </button>
                        </div>
                    </div>

                    <!-- Panel Generator AI (Dengan Animasi Transisi) -->
                    <div id="aiFormPanel" class="panel-box bg-slate-900 border border-purple-500/30 p-4 rounded-md mb-4 hidden transition-all duration-300 ease-in-out transform origin-top opacity-0 scale-y-95">
                        <h4 class="font-bold text-purple-400 mb-2">✨ Generator Outline Bab (AI Lead Architect)</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label class="block text-sm font-semibold mb-1">Target Sub-arc (Opsional):</label>
                                <select id="aiSubarcSelect" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded">
                                    <option value="">-- Pilih Sub-arc --</option>
                                    ${subarcs.map(s => `<option value="${s.id}">${this.escapeHtml(s.name)}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-1">Kirim Bab Sebelumnya Sebagai Konteks:</label>
                                <select id="aiPrevCountSelect" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded">
                                    <option value="0">Tidak ada (Bab Berdiri Sendiri)</option>
                                    <option value="1">1 Bab Terakhir</option>
                                    <option value="2" selected>2 Bab Terakhir (Rekomendasi)</option>
                                    <option value="3">3 Bab Terakhir</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="block text-sm font-semibold mb-1">Instruksi Khusus / Prompt Tambahan (Opsional):</label>
                            <textarea id="aiUserPrompt" rows="2" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded" placeholder="Contoh: Fokuskan bab ini pada pertempuran di benteng..."></textarea>
                        </div>

                        <div class="flex justify-end gap-2">
                            <button id="btnCancelAi" class="btn bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition-all">Batal</button>
                            <button id="btnExecuteAi" class="btn bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 transition-all">
                                ✨ Mulai Generate AI
                            </button>
                        </div>
                    </div>

                    <!-- Form Editor Bab Manual / Preview AI (Dengan Animasi Transisi) -->
                    <div id="chapterEditorPanel" class="panel-box bg-slate-900 border border-slate-700 p-4 rounded-md mb-4 hidden transition-all duration-300 ease-in-out transform origin-top opacity-0 scale-y-95">
                        <h4 id="editorTitle" class="font-bold text-slate-200 mb-2">Form Editor Bab</h4>
                        <div class="mb-3">
                            <label class="block text-sm font-semibold mb-1">Judul Bab:</label>
                            <input type="text" id="inputChapterTitle" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded" placeholder="BAB 1: Permulaan" />
                        </div>
                        <div class="mb-3">
                            <label class="block text-sm font-semibold mb-1">Konten / Treatment Outline:</label>
                            <textarea id="inputChapterContent" rows="12" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded font-mono text-xs leading-relaxed"></textarea>
                        </div>
                        <div class="flex justify-end gap-2">
                            <button id="btnCancelEditor" class="btn bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition-all">Batal</button>
                            <button id="btnSaveChapter" class="btn bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 transition-all">Simpan Bab</button>
                        </div>
                    </div>

                    <!-- Daftar Bab (Khusus Arc Terpilih) -->
                    <div class="chapter-list space-y-3">
                        ${chapters.length === 0 
                            ? `<div class="text-center py-8 text-slate-400 italic border-2 border-dashed border-slate-700 rounded-md">Belum ada outline bab khusus untuk Arc ini.</div>` 
                            : chapters.map((chap, index) => `
                                <div class="chapter-card border border-slate-700 rounded-md p-4 bg-slate-900 shadow-sm hover:border-slate-600 transition-all" data-id="${chap.id}">
                                    <div class="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                                        
                                        <h4 class="font-bold text-lg text-indigo-400">#${chapterOffset + index + 1}. ${this.escapeHtml(chap.title)}</h4>
                                        <div class="flex gap-2">
                                            <!-- Tombol Salin/Copy Baru -->
                                            <button class="btn-copy-chap text-xs bg-slate-700 text-slate-200 px-2.5 py-1 rounded hover:bg-slate-600 transition-all flex items-center gap-1 active:scale-95" data-id="${chap.id}" title="Salin Konten BAB (1 Newline)">
                                                📋 Salin
                                            </button>
                                            <button class="btn-edit-chap text-xs bg-amber-600 text-white px-2.5 py-1 rounded hover:bg-amber-700 transition-all active:scale-95" data-id="${chap.id}">Edit</button>
                                            <button class="btn-delete-chap text-xs bg-rose-600 text-white px-2.5 py-1 rounded hover:bg-rose-700 transition-all active:scale-95" data-id="${chap.id}">Hapus</button>
                                        </div>
                                    </div>
                                    <!-- Konten BAB: Font lebih kecil (text-xs), tanpa indentasi (indent-0), dan leluasa dibaca -->
                                    <p class="chapter-content whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 w-full" style="text-align: left !important; text-indent: 0 !important; margin: 0 !important; align-self: flex-start !important;">${this.escapeHtml(chap.content || '(Belum ada konten)')} </p>
                                </div>
                            `).join('')
                        }
                    </div>

                </div>
            </div>
        `;

        setTimeout(() => this.attachChapterUIEvents(), 0);
        return html;
    },

    attachChapterUIEvents() {
        const aiPanel = document.getElementById('aiFormPanel');
        const editorPanel = document.getElementById('chapterEditorPanel');

        // Helper Animasi Panel
        const showPanel = (panel) => {
            if (!panel) return;
            panel.classList.remove('hidden');
            requestAnimationFrame(() => {
                panel.classList.remove('opacity-0', 'scale-y-95');
                panel.classList.add('opacity-100', 'scale-y-100');
            });
        };

        const hidePanel = (panel) => {
            if (!panel) return;
            panel.classList.remove('opacity-100', 'scale-y-100');
            panel.classList.add('opacity-0', 'scale-y-95');
            setTimeout(() => panel.classList.add('hidden'), 300);
        };

        // 1. Switch Arc Dropdown Event
        document.getElementById('arcSelectDropdown')?.addEventListener('change', (e) => {
            this.currentArcId = e.target.value;
            this.editingChapterId = null;
            this.outlineRefreshUI();
        });

        // Event Handler Offsite BAB (Persist ke Data)
        document.getElementById('inputChapterOffset')?.addEventListener('change', (e) => {
            const value = parseInt(e.target.value, 10);
            const newOffset = isNaN(value) || value < 0 ? 0 : value;

            if (!this.data) this.data = {};
            
            // Pastikan tersimpan sebagai angka
            this.data.chapterOffset = newOffset;

            // Panggil persistence method
            if (typeof this.saveData === 'function') {
                this.saveData();
            } else if (typeof app !== 'undefined' && typeof app.saveData === 'function') {
                app.saveData();
            }

            ChapterOutlineForm.showNotification.call(this, "Offsite BAB berhasil diperbarui!", "success");
            this.outlineRefreshUI();
        });

        // 2. Attach File .txt Event
        document.getElementById('inputKnowledgeFile')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
                ChapterOutlineForm.showNotification.call(this, "Hanya berkas .txt yang diperbolehkan!", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                this.attachedFile = {
                    fileName: file.name,
                    content: event.target.result
                };
                ChapterOutlineForm.showNotification.call(this, `Berkas "${file.name}" berhasil dihubungkan!`, "success");
                this.outlineRefreshUI();
            };
            reader.readAsText(file);
        });

        // 3. Detach File Event
        document.getElementById('btnDetachFile')?.addEventListener('click', () => {
            this.attachedFile = { fileName: '', content: '' };
            ChapterOutlineForm.showNotification.call(this, "Berkas pengetahuan dilepas.", "info");
            this.outlineRefreshUI();
        });

        // 4. Hapus Semua BAB Event
        document.getElementById('btnDeleteAllChapters')?.addEventListener('click', () => {
            if (confirm("Apakah Anda yakin ingin MENGHAPUS SEMUA BAB dalam Arc ini? Tindakan ini tidak dapat dibatalkan.")) {
                ChapterOutlineForm.deleteAllChapters.call(this, this.currentArcId);
                this.outlineRefreshUI();
            }
        });

        // Toggle UI Panels
        document.getElementById('btnToggleAiForm')?.addEventListener('click', () => {
            if (aiPanel?.classList.contains('hidden')) {
                hidePanel(editorPanel);
                showPanel(aiPanel);
            } else {
                hidePanel(aiPanel);
            }
        });

        document.getElementById('btnToggleManualForm')?.addEventListener('click', () => {
            this.editingChapterId = null;
            document.getElementById('editorTitle').innerText = "Tambah Bab Manual";
            document.getElementById('inputChapterTitle').value = "";
            document.getElementById('inputChapterContent').value = "";
            hidePanel(aiPanel);
            showPanel(editorPanel);
        });

        document.getElementById('btnCancelAi')?.addEventListener('click', () => hidePanel(aiPanel));
        document.getElementById('btnCancelEditor')?.addEventListener('click', () => hidePanel(editorPanel));

        // Save & Execute Event
        document.getElementById('btnSaveChapter')?.addEventListener('click', () => this.handleSaveChapter());
        document.getElementById('btnExecuteAi')?.addEventListener('click', () => this.handleExecuteAi());

        // Item Delegation Events
        document.querySelectorAll('.btn-copy-chap').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCopyChapter(e.currentTarget.getAttribute('data-id')));
        });

        document.querySelectorAll('.btn-edit-chap').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOpenEditChapter(e.currentTarget.getAttribute('data-id')));
        });

        document.querySelectorAll('.btn-delete-chap').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteChapter(e.currentTarget.getAttribute('data-id')));
        });
    },

    async handleExecuteAi() {
        const btn = document.getElementById('btnExecuteAi');
        const subarcId = document.getElementById('aiSubarcSelect').value;
        const prevCount = parseInt(document.getElementById('aiPrevCountSelect').value) || 0;
        const userPrompt = document.getElementById('aiUserPrompt').value;

        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Memproses AI...";

        const options = {
            subarcId: subarcId || null,
            previousChaptersCount: prevCount,
            userPrompt: userPrompt,
            attachedKnowledge: this.attachedFile.content
        };

        const result = await ChapterOutlineForm.generateChapterOutlineAi.call(this, this.currentArcId, options);

        btn.disabled = false;
        btn.innerHTML = originalText;

        if (result) {
            const aiPanel = document.getElementById('aiFormPanel');
            const editorPanel = document.getElementById('chapterEditorPanel');

            if (aiPanel) aiPanel.classList.add('hidden');
            this.editingChapterId = null;
            document.getElementById('editorTitle').innerText = "Review Hasil AI - Tambah Bab Baru";
            document.getElementById('inputChapterTitle').value = result.suggestedTitle;
            document.getElementById('inputChapterContent').value = result.content;
            
            if (editorPanel) {
                editorPanel.classList.remove('hidden', 'opacity-0', 'scale-y-95');
                editorPanel.classList.add('opacity-100', 'scale-y-100');
                editorPanel.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    /**
     * Handler Fitur Salin Teks BAB (Membersihkan \n beruntun menjadi 1 \n)
     */
    handleCopyChapter(chapterId) {
        const chapters = ChapterOutlineForm.getChapters.call(this, this.currentArcId);
        const chapter = chapters.find(c => c.id === chapterId);

        if (!chapter || !chapter.content) {
            ChapterOutlineForm.showNotification.call(this, "Tidak ada konten untuk disalin.", "error");
            return;
        }

        // Membersihkan \r\n dan mengubah \n beruntun (\n\n+) menjadi 1 \n saja
        const cleanedContent = chapter.content
            .replace(/\r\n/g, '\n')
            .replace(/\n+/g, '\n')
            .trim();

        navigator.clipboard.writeText(cleanedContent)
            .then(() => {
                ChapterOutlineForm.showNotification.call(this, `Konten ${chapter.title} berhasil disalin (format 1 newline)!`, "success");
            })
            .catch(err => {
                ChapterOutlineForm.showNotification.call(this, "Gagal menyalin teks: " + err.message, "error");
            });
    },

    handleSaveChapter() {
        // Sinkronisasi offset dari input DOM sebelum proses simpan
        const offsetInput = document.getElementById('inputChapterOffset');
        if (offsetInput && this.data) {
            const offsetVal = parseInt(offsetInput.value, 10);
            this.data.chapterOffset = isNaN(offsetVal) || offsetVal < 0 ? 0 : offsetVal;
        }

        const title = document.getElementById('inputChapterTitle').value;
        const content = document.getElementById('inputChapterContent').value;

        if (!title.trim()) {
            ChapterOutlineForm.showNotification.call(this, "Judul Bab tidak boleh kosong.", "error");
            return;
        }

        if (this.editingChapterId) {
            ChapterOutlineForm.updateChapterManual.call(this, this.currentArcId, this.editingChapterId, title, content);
        } else {
            ChapterOutlineForm.addChapterManual.call(this, this.currentArcId, title, content);
        }

        this.outlineRefreshUI();
    },

    handleOpenEditChapter(chapterId) {
        const chapters = ChapterOutlineForm.getChapters.call(this, this.currentArcId);
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        this.editingChapterId = chapterId;
        document.getElementById('editorTitle').innerText = `Edit Bab: ${chapter.title}`;
        document.getElementById('inputChapterTitle').value = chapter.title;
        document.getElementById('inputChapterContent').value = chapter.content;

        const aiPanel = document.getElementById('aiFormPanel');
        const editorPanel = document.getElementById('chapterEditorPanel');

        if (aiPanel) aiPanel.classList.add('hidden');
        if (editorPanel) {
            editorPanel.classList.remove('hidden', 'opacity-0', 'scale-y-95');
            editorPanel.classList.add('opacity-100', 'scale-y-100');
            editorPanel.scrollIntoView({ behavior: 'smooth' });
        }
    },

    handleDeleteChapter(chapterId) {
        if (confirm("Apakah Anda yakin ingin menghapus outline bab ini?")) {
            ChapterOutlineForm.deleteChapter.call(this, this.currentArcId, chapterId);
            this.outlineRefreshUI();
        }
    },

    /**
     * Helper Method: Memperbarui DOM secara langsung tanpa berpindah modul
     */
    outlineRefreshUI() {
        const container = document.getElementById('chapterOutlineContainer')?.parentElement 
                       || document.getElementById('contentArea') 
                       || document.querySelector('main');

        if (container) {
            container.innerHTML = this.renderChapterOutline();
        }
    },

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};