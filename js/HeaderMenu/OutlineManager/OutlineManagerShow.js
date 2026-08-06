import { ChapterOutlineForm } from './OutlineManagerForm.js';


export const ChapterOutlineModule = {
    // State internal untuk UI
    currentArcId: null,
    editingChapterId: null,

    /**
     * Inisialisasi tampilan Chapter Outline berdasarkan Arc yang dipilih
     * @param {string} arcId - ID Arc yang aktif
     */
    initChapterOutlineUI(arcId) {
        this.currentArcId = arcId;
        this.editingChapterId = null;
    },

    /**
     * Component Renderer Utama
     */
    renderChapterOutline() {
        // 1. Auto-assign Arc pertama jika currentArcId belum di-set
        if (!this.currentArcId && this.data && Array.isArray(this.data.arcs) && this.data.arcs.length > 0) {
            this.currentArcId = this.data.arcs[0].id;
        }

        let html = '';

        // 2. Validasi keberadaan Arc
        if (!ChapterOutlineForm.isValidArcId.call(this, this.currentArcId)) {
            html = `
                <div class="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md">
                    <strong>Peringatan:</strong> Belum ada Arc cerita yang dipilih. Silakan pilih atau buat Arc terlebih dahulu pada menu <b>Manajemen Arc Cerita</b>.
                </div>`;
        } else {
            const chapters = ChapterOutlineForm.getChapters.call(this, this.currentArcId);
            const arc = this.data.arcs.find(a => a.id === this.currentArcId);
            const subarcs = arc ? (arc.subarcs || []) : [];

            html = `
                <div id="chapterOutlineContainer">
                    <div class="chapter-outline-module shadow-md rounded-lg p-4 bg-slate-800 text-slate-100 border border-slate-700">
                        <!-- Header Component -->
                        <div class="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                            <h3 class="text-xl font-bold">Chapter Outline: ${this.escapeHtml(arc ? arc.name : '')}</h3>
                            <div class="flex gap-2">
                                <button id="btnToggleAiForm" class="btn btn-magic bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700">
                                    ✨ Generate AI Outline
                                </button>
                                <button id="btnToggleManualForm" class="btn btn-primary bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">
                                    + Tambah Bab Manual
                                </button>
                            </div>
                        </div>

                        <!-- Panel Generator AI (Hidden by default) -->
                        <div id="aiFormPanel" class="panel-box bg-slate-900 border border-purple-500/30 p-4 rounded-md mb-4 hidden">
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
                                        <option value="5">5 Bab Terakhir</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="block text-sm font-semibold mb-1">Instruksi Khusus / Prompt Tambahan (Opsional):</label>
                                <textarea id="aiUserPrompt" rows="2" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded" placeholder="Contoh: Fokuskan bab ini pada pertemuan tak terduga..."></textarea>
                            </div>

                            <div class="flex justify-end gap-2">
                                <button id="btnCancelAi" class="btn bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Batal</button>
                                <button id="btnExecuteAi" class="btn bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700">
                                    ✨ Mulai Generate AI
                                </button>
                            </div>
                        </div>

                        <!-- Form Editor Bab Manual / Preview AI -->
                        <div id="chapterEditorPanel" class="panel-box bg-slate-900 border border-slate-700 p-4 rounded-md mb-4 hidden">
                            <h4 id="editorTitle" class="font-bold text-slate-200 mb-2">Form Editor Bab</h4>
                            
                            <div class="mb-3">
                                <label class="block text-sm font-semibold mb-1">Judul Bab:</label>
                                <input type="text" id="inputChapterTitle" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded" placeholder="Contoh: BAB 1: Permulaan Konflik" />
                            </div>

                            <div class="mb-3">
                                <label class="block text-sm font-semibold mb-1">Konten / Treatment Outline:</label>
                                <textarea id="inputChapterContent" rows="12" class="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded font-mono text-sm" placeholder="Tuliskan outline bab atau hasil dari AI di sini..."></textarea>
                            </div>

                            <div class="flex justify-end gap-2">
                                <button id="btnCancelEditor" class="btn bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Batal</button>
                                <button id="btnSaveChapter" class="btn bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700">
                                    Simpan Bab
                                </button>
                            </div>
                        </div>

                        <!-- Daftar Bab (Output Display) -->
                        <div class="chapter-list space-y-3">
                            ${chapters.length === 0 
                                ? `<div class="text-center py-8 text-slate-400 italic border-2 border-dashed border-slate-700 rounded-md">Belum ada outline bab untuk Arc ini. Klik "Generate AI" atau "Tambah Bab Manual".</div>` 
                                : chapters.map((chap, index) => `
                                    <div class="chapter-card border border-slate-700 rounded-md p-4 bg-slate-900 shadow-sm" data-id="${chap.id}">
                                        <div class="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                                            <h4 class="font-bold text-lg text-indigo-400">#${index + 1}. ${this.escapeHtml(chap.title)}</h4>
                                            <div class="flex gap-2">
                                                <button class="btn-edit-chap text-sm bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700" data-id="${chap.id}">
                                                    Edit
                                                </button>
                                                <button class="btn-delete-chap text-sm bg-rose-600 text-white px-2 py-1 rounded hover:bg-rose-700" data-id="${chap.id}">
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                        <div class="chapter-content whitespace-pre-wrap font-mono text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
                                            ${this.escapeHtml(chap.content || '(Belum ada konten)')}
                                        </div>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. Pasang Event Listener setelah siklus eksekusi render DOM selesai
        setTimeout(() => this.attachChapterUIEvents(), 0);

        // 4. Return string HTML agar ManagerUiBasic dapat memasukkannya ke contentArea
        return html;
    },

    /**
     * Binding Event Listener Elemen DOM
     */
    attachChapterUIEvents() {
        const aiPanel = document.getElementById('aiFormPanel');
        const editorPanel = document.getElementById('chapterEditorPanel');

        // Toggle Form AI
        document.getElementById('btnToggleAiForm')?.addEventListener('click', () => {
            aiPanel?.classList.toggle('hidden');
            editorPanel?.classList.add('hidden');
        });

        // Toggle Form Manual
        document.getElementById('btnToggleManualForm')?.addEventListener('click', () => {
            this.editingChapterId = null;
            document.getElementById('editorTitle').innerText = "Tambah Bab Manual";
            document.getElementById('inputChapterTitle').value = "";
            document.getElementById('inputChapterContent').value = "";
            editorPanel?.classList.remove('hidden');
            aiPanel?.classList.add('hidden');
        });

        // Tombol Batal
        document.getElementById('btnCancelAi')?.addEventListener('click', () => aiPanel?.classList.add('hidden'));
        document.getElementById('btnCancelEditor')?.addEventListener('click', () => editorPanel?.classList.add('hidden'));

        // Eksekusi Simpan Bab Manual / Hasil Edit
        document.getElementById('btnSaveChapter')?.addEventListener('click', () => this.handleSaveChapter());

        // Eksekusi Generate AI
        document.getElementById('btnExecuteAi')?.addEventListener('click', () => this.handleExecuteAi());

        // Event Delegation untuk Edit dan Hapus Bab
        document.querySelectorAll('.btn-edit-chap').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chapId = e.currentTarget.getAttribute('data-id');
                this.handleOpenEditChapter(chapId);
            });
        });

        document.querySelectorAll('.btn-delete-chap').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chapId = e.currentTarget.getAttribute('data-id');
                this.handleDeleteChapter(chapId);
            });
        });
    },

    /**
     * Handler Eksekusi AI Generator
     */
    async handleExecuteAi() {
        const btn = document.getElementById('btnExecuteAi');
        const subarcId = document.getElementById('aiSubarcSelect').value;
        const prevCount = parseInt(document.getElementById('aiPrevCountSelect').value) || 0;
        const userPrompt = document.getElementById('aiUserPrompt').value;

        // UI Loading State
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Memproses AI...";

        const options = {
            subarcId: subarcId || null,
            previousChaptersCount: prevCount,
            userPrompt: userPrompt
        };

        // Panggil Logika AI dari ChapterOutlineForm
        const result = await ChapterOutlineForm.generateChapterOutlineAi.call(this, this.currentArcId, options);

        btn.disabled = false;
        btn.innerHTML = originalText;

        if (result) {
            // Tampilkan hasil AI ke Form Editor agar user dapat mereview sebelum menyimpan
            document.getElementById('aiFormPanel')?.classList.add('hidden');
            
            this.editingChapterId = null; // Sebagai bab baru
            document.getElementById('editorTitle').innerText = "Review Hasil AI - Tambah Bab Baru";
            document.getElementById('inputChapterTitle').value = result.suggestedTitle;
            document.getElementById('inputChapterContent').value = result.content;
            
            document.getElementById('chapterEditorPanel')?.classList.remove('hidden');
            document.getElementById('chapterEditorPanel')?.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Handler Menyimpan Data Bab (Tambah / Edit)
     */
    handleSaveChapter() {
        const title = document.getElementById('inputChapterTitle').value;
        const content = document.getElementById('inputChapterContent').value;

        if (!title.trim()) {
            ChapterOutlineForm.showNotification.call(this, "Judul Bab tidak boleh kosong.", "error");
            return;
        }

        if (this.editingChapterId) {
            // Update Bab
            ChapterOutlineForm.updateChapterManual.call(this, this.currentArcId, this.editingChapterId, title, content);
        } else {
            // Bab Baru
            ChapterOutlineForm.addChapterManual.call(this, this.currentArcId, title, content);
        }

        this.renderChapterOutline();
    },

    /**
     * Handler Membuka Editor untuk Edit Bab
     */
    handleOpenEditChapter(chapterId) {
        const chapters = ChapterOutlineForm.getChapters.call(this, this.currentArcId);
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        this.editingChapterId = chapterId;
        document.getElementById('editorTitle').innerText = `Edit Bab: ${chapter.title}`;
        document.getElementById('inputChapterTitle').value = chapter.title;
        document.getElementById('inputChapterContent').value = chapter.content;

        document.getElementById('aiFormPanel')?.classList.add('hidden');
        document.getElementById('chapterEditorPanel')?.classList.remove('hidden');
        document.getElementById('chapterEditorPanel')?.scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * Handler Hapus Bab
     */
    handleDeleteChapter(chapterId) {
        if (confirm("Apakah Anda yakin ingin menghapus outline bab ini?")) {
            ChapterOutlineForm.deleteChapter.call(this, this.currentArcId, chapterId);
            this.renderChapterOutline();
        }
    },

    /**
     * Utility Sanitasi String HTML
     */
    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};