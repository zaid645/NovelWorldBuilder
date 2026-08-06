import { ArcInfoFormContext } from '../ArcInfo/ArcInfoFormContext.js';

/**
 * System Prompt Dasar AI untuk Generator Chapter Outline
 */
const SYSTEM_PROMPT_CHAPTER_OUTLINE = `
# System Prompt: Lead Story Architect & Fiction Development Editor
**Role:** Lead Story Architect & Fiction Development Editor  
**Objective:** Merancang outline BAB yang ringkas dan dinamis dalam bentuk Paragraf Naratif Treatment langsung di dalam pesan chat (BUKAN naskah novel/prosa langsung).

## Core Rules
1. Chapter Quantity: Buat Outline Treatment untuk tepat 1 BAB per permintaan.
2. Structure & Pacing: Pecah sub-arc aktif ke dalam 3 hingga 5 scene. Setiap scene terdiri dari 2 hingga 4 paragraf naratif. Sebutkan daftar tokoh yang hadir di awal setiap scene.
3. Formatting Strictness: DILARANG menggunakan LaTeX/$$ atau cetak tebal/miring pada narasi. Gunakan pembatas garis '---' di antara tiap Scene.
4. Style & Dialogue: Fokus pada DIALOG TIDAK LANGSUNG. DILARANG menggunakan dialog langsung (tanda petik ").
5. Character & Logic: Sertakan motivasi singkat tokoh. Batasi pengetahuan tokoh sesuai alur.
6. Content Safety: Wajib aman untuk semua umur. DILARANG unsur sensual/kekerasan detail.
`;

export const ChapterOutlineForm = {
    // ===================================================
    // 1. HELPER & DATA INTEGRITY (Penyimpanan per Arc)
    // ===================================================

    /**
     * Memastikan struktur penyimpanan `chapterOutlines` tersedia untuk arcId tertentu.
     */
    ensureArcChapterStore(arcId) {
        if (!this.data) return null;
        if (!Array.isArray(this.data.chapterOutlines)) {
            this.data.chapterOutlines = [];
        }

        let store = this.data.chapterOutlines.find(item => item.arcId === arcId);
        if (!store) {
            store = {
                arcId: arcId,
                chapters: []
            };
            this.data.chapterOutlines.push(store);
        }

        if (!Array.isArray(store.chapters)) {
            store.chapters = [];
        }

        return store;
    },

    /**
     * Validasi keberadaan Arc ID dalam sistem
     */
    isValidArcId(arcId) {
        if (!this.data || !Array.isArray(this.data.arcs)) return false;
        return this.data.arcs.some(a => a.id === arcId);
    },

    /**
     * Membersihkan data chapterOutlines dari Arc ID yang sudah tidak valid dalam sistem
     */
    cleanInvalidArcStores() {
        if (!this.data || !Array.isArray(this.data.chapterOutlines) || !Array.isArray(this.data.arcs)) return;
        const validArcIds = new Set(this.data.arcs.map(a => a.id));
        
        // Filter hanya store yang arcId-nya masih terdaftar
        const initialCount = this.data.chapterOutlines.length;
        this.data.chapterOutlines = this.data.chapterOutlines.filter(store => validArcIds.has(store.arcId));

        if (this.data.chapterOutlines.length !== initialCount && typeof this.saveData === 'function') {
            this.saveData();
        }
    },


    // ===================================================
    // 2. FITUR MANUAL (CRUD CHAPTER OUTLINE)
    // ===================================================

    /**
     * Mengambil daftar seluruh bab untuk Arc tertentu
     */
    getChapters(arcId) {
        // Otomatis bersihkan data yatim sebelum mengambil data
        ChapterOutlineForm.cleanInvalidArcStores.call(this);

        if (!ChapterOutlineForm.isValidArcId.call(this, arcId)) return [];
        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        return store ? store.chapters : [];
    },

    /**
     * Menambah Bab Baru Secara Manual
     */
    addChapterManual(arcId, title, content = '') {
        if (!ChapterOutlineForm.isValidArcId.call(this, arcId)) {
            return ChapterOutlineForm.showNotification("Arc ID tidak valid!", "error");
        }

        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        const offset = ChapterOutlineForm.getChapterOffset.call(this, arcId);
        const globalChapterNumber = offset + store.chapters.length + 1;

        const newChapter = {
            id: (typeof this.generateId === 'function') ? this.generateId('chap') : `chap_${Date.now()}`,
            title: title.trim() || `BAB ${globalChapterNumber}`,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        store.chapters.push(newChapter);
        
        if (typeof this.saveData === 'function') this.saveData();
        ChapterOutlineForm.showNotification("Bab baru berhasil ditambahkan!", "success");
        return newChapter;
    },

    /**
     * Mengubah Data Bab Manual
     */
    updateChapterManual(arcId, chapterId, newTitle, newContent) {
        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        if (!store) return false;

        const chapter = store.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            ChapterOutlineForm.showNotification("Bab tidak ditemukan!", "error");
            return false;
        }

        chapter.title = newTitle.trim() || chapter.title;
        chapter.content = newContent.trim();
        chapter.updatedAt = new Date().toISOString();

        if (typeof this.saveData === 'function') this.saveData();
        ChapterOutlineForm.showNotification("Bab berhasil diperbarui!", "success");
        return true;
    },

    /**
     * Menghapus Bab
     */
    deleteChapter(arcId, chapterId) {
        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        if (!store) return false;

        store.chapters = store.chapters.filter(c => c.id !== chapterId);
        if (typeof this.saveData === 'function') this.saveData();
        ChapterOutlineForm.showNotification("Bab berhasil dihapus.", "success");
        return true;
    },

    /**
     * Menghapus Semua Bab dalam Arc Tertentu
     */
    deleteAllChapters(arcId) {
        if (!ChapterOutlineForm.isValidArcId.call(this, arcId)) {
            ChapterOutlineForm.cleanInvalidArcStores.call(this);
            return false;
        }

        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        if (!store) return false;

        store.chapters = [];
        if (typeof this.saveData === 'function') this.saveData();
        ChapterOutlineForm.showNotification("Semua bab dalam Arc ini berhasil dihapus.", "success");
        return true;
    },

    // ===================================================
    // 3. FITUR AI (GENERATOR OUTLINE BAB)
    // ===================================================

    async generateChapterOutlineAi(arcId, options = {}) {
        // Pembersihan otomatis jika Arc ID ternyata tidak valid
        if (!ChapterOutlineForm.isValidArcId.call(this, arcId)) {
            ChapterOutlineForm.cleanInvalidArcStores.call(this);
            ChapterOutlineForm.showNotification("GAGAL: ID Arc tidak valid. Data terkait telah dibersihkan.", "error");
            return null;
        }

        const arc = this.data.arcs.find(a => a.id === arcId);
        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        const existingChapters = store.chapters;

        // 1. Kumpulkan seluruh bab dari semua Arc secara berurutan hingga Arc saat ini
        let allPreviousChapters = [];
        if (Array.isArray(this.data?.arcs)) {
            for (const a of this.data.arcs) {
                const aStore = this.data.chapterOutlines?.find(s => s.arcId === a.id);
                if (aStore && Array.isArray(aStore.chapters)) {
                    allPreviousChapters.push(...aStore.chapters);
                }
                if (a.id === arcId) break; // Berhenti di Arc aktif saat ini
            }
        }

        const limit = Math.max(0, options.previousChaptersCount || 2);
        const recentPreviousChapters = allPreviousChapters.slice(-limit).map(c => ({
            title: c.title,
            summary: c.content
        }));

        let aiContextPayload = { charactersInvolved: [], locationsInvolved: [], multiverseLore: [] };
        if (typeof ArcInfoFormContext !== 'undefined' && typeof ArcInfoFormContext.buildAiContextPayload === 'function') {
            ArcInfoFormContext.data = this.data; 
            aiContextPayload = ArcInfoFormContext.buildAiContextPayload(arcId);
        }

        let activeSubarcInfo = null;
        if (options.subarcId && Array.isArray(arc.subarcs)) {
            activeSubarcInfo = arc.subarcs.find(s => s.id === options.subarcId);
        }

        const offset = ChapterOutlineForm.getChapterOffset.call(this, arcId);
        const targetChapterNumber = offset + existingChapters.length + 1;

        // Menyusun Payload dengan Tambahan Lampiran File (Jika ada)
        const userPromptClean = options.userPrompt?.trim();
        const userPromptSection = userPromptClean 
            ? `\n\nPETUNJUK TAMBAHAN DARI USER:\n${userPromptClean}` 
            : '';

        const payload = {
            moduleName: "Tulis Chapter Outline",
            systemPrompt: SYSTEM_PROMPT_CHAPTER_OUTLINE,
            targetData: {
                arcTitle: arc.name,
                arcSynopsis: arc.synopsis || "Belum ada sinopsis global.",
                activeSubarc: activeSubarcInfo || "Gunakan urutan alur sub-arc yang relevan.",
                allSubarcsOutline: arc.subarcs || [],
                targetChapterNumber: targetChapterNumber,
                previousChaptersContext: recentPreviousChapters,
                attachedGlobalKnowledge: options.attachedKnowledge || "Tidak ada berkas pengetahuan tambahan.",
                ...aiContextPayload // ✅ userCustomPrompt bersih dari targetData
            },
            additional_instruction: {
                focus: `Rancang Outline Treatment untuk BAB ${targetChapterNumber}.\n` +
                    `PENTING: Perhatikan kontinuitas dari ${recentPreviousChapters.length} bab sebelumnya.\n` +
                    `FORMAT: Tiap awal scene menggunakan format "[tahap (orientasi/komplikasi/klimaks/resolusi/koda) - scene X - waktu(pagi/siang/sore/malam)]\\nTokoh Hadir: (masukkan tokoh hadir di scene)."` +
                    `${userPromptSection}`, // ✅ Instruksi user masuk ke hirarki utama
                tone: "Treatment teknis naratif, lugas, tanpa dialog langsung",
                length: "3 hingga 5 scene lengkap; tiap scene 1 hingga 2 paragraf; tiap paragraf 3 - 5 kalimat." // ✅ Sesuai spesifikasi baru
            }
        };

        try {
            if (typeof app !== 'undefined' && typeof app.requestEnchant === 'function') {
                const aiResultContent = await app.requestEnchant(payload);
                return {
                    suggestedTitle: `BAB ${targetChapterNumber}`,
                    content: aiResultContent
                };
            } else {
                throw new Error("Fungsi app.requestEnchant tidak ditemukan.");
            }
        } catch (error) {
            ChapterOutlineForm.showNotification("Gagal menghasilkan outline bab dari AI: " + error.message, "error");
            return null;
        }
    },

    // Helper Notifikasi Internal Modul
    showNotification(message, type = 'info') {
        if (typeof app !== 'undefined' && typeof app.showAlert === 'function') {
            app.showAlert(message, type);
            return;
        }
        console.log(`[${type.toUpperCase()}] ${message}`);
    },

    // Helper salin outline
    handleCopyChapter(chapterId) {
        const chapters = ChapterOutlineForm.getChapters.call(this, this.currentArcId);
        const chapter = chapters.find(c => c.id === chapterId);
        
        if (!chapter || !chapter.content) {
            ChapterOutlineForm.showNotification.call(this, "Tidak ada konten untuk disalin.", "error");
            return;
        }

        // Membersihkan karakter \r\n dan mengganti \n ganda/berbaris menjadi 1 \n
        const cleanedContent = chapter.content
            .replace(/\r\n/g, '\n')
            .replace(/\n+/g, '\n')
            .trim();

        navigator.clipboard.writeText(cleanedContent)
            .then(() => {
                ChapterOutlineForm.showNotification.call(this, `Konten ${chapter.title} berhasil disalin!`, "success");
            })
            .catch(err => {
                ChapterOutlineForm.showNotification.call(this, "Gagal menyalin teks: " + err.message, "error");
            });
    },

    /**
     * Menghitung total akumulasi BAB dari Arc-Arc sebelum arcId yang diberikan
     */
    getChapterOffset(arcId) {
        if (!this.data) return 0;
        if (!Array.isArray(this.data.arcs) || !Array.isArray(this.data.chapterOutlines)) return 0;

        // Ambil offset dasar dari this.data tanpa menimpa nilai secara paksa
        const baseOffset = Number.isInteger(this.data.chapterOffset) 
            ? Math.max(0, this.data.chapterOffset) 
            : 0;

        let offset = baseOffset;

        for (const arc of this.data.arcs) {
            if (arc.id === arcId) break;
            
            const store = this.data.chapterOutlines.find(s => s.arcId === arc.id);
            if (store && Array.isArray(store.chapters)) {
                offset += store.chapters.length;
            }
        }
        return offset;
    }
};