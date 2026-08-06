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

    // ===================================================
    // 2. FITUR MANUAL (CRUD CHAPTER OUTLINE)
    // ===================================================

    /**
     * Mengambil daftar seluruh bab untuk Arc tertentu
     */
    getChapters(arcId) {
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
        const newChapter = {
            id: (typeof this.generateId === 'function') ? this.generateId('chap') : `chap_${Date.now()}`,
            title: title.trim() || `BAB ${store.chapters.length + 1}`,
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

    // ===================================================
    // 3. FITUR AI (GENERATOR OUTLINE BAB)
    // ===================================================

    async generateChapterOutlineAi(arcId, options = {}) {
        // 1. Filtering & Validasi ID Arc
        if (!ChapterOutlineForm.isValidArcId.call(this, arcId)) {
            ChapterOutlineForm.showNotification("GAGAL: ID Arc tidak ditemukan atau tidak valid.", "error");
            return null;
        }

        const arc = this.data.arcs.find(a => a.id === arcId);
        const store = ChapterOutlineForm.ensureArcChapterStore.call(this, arcId);
        const existingChapters = store.chapters;

        // 2. Ambil Bab Sebelumnya Sesuai Limit Opsi Pengguna
        const limit = Math.max(0, options.previousChaptersCount || 2);
        const recentPreviousChapters = existingChapters.slice(-limit).map(c => ({
            title: c.title,
            summary: c.content
        }));

        // 3. Ambil Konteks World-Building (Characters, Locations, Lore)
        let aiContextPayload = { charactersInvolved: [], locationsInvolved: [], multiverseLore: [] };

        if (typeof ArcInfoFormContext !== 'undefined' && typeof ArcInfoFormContext.buildAiContextPayload === 'function') {
            // Tempelkan referensi data utama ke ArcInfoFormContext agar tidak undefined
            ArcInfoFormContext.data = this.data; 
            // Panggil fungsi secara normal agar konteks `this` di dalam modul tetap merujuk ke ArcInfoFormContext
            aiContextPayload = ArcInfoFormContext.buildAiContextPayload(arcId);
        }

        // 4. Tentukan Sub-arc Aktif (Jika dispesifikasikan)
        let activeSubarcInfo = null;
        if (options.subarcId && Array.isArray(arc.subarcs)) {
            activeSubarcInfo = arc.subarcs.find(s => s.id === options.subarcId);
        }

        // 5. Susun Target Bab Berdasarkan Jumlah yang Ada
        const targetChapterNumber = existingChapters.length + 1;

        // 6. Konstruksi Payload AI
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
                userCustomPrompt: options.userPrompt?.trim() || "Tidak ada petunjuk tambahan. Kembangkan cerita secara logis.",
                ...aiContextPayload
            },
            additional_instruction: {
                focus: `Rancang Outline Treatment untuk BAB ${targetChapterNumber}.\n` +
                       `PENTING: Perhatikan kontinuitas dari ${recentPreviousChapters.length} bab sebelumnya.\n` +
                       `Pastikan pembagian scene (3-5 scene) memperhitungkan pacing orientasi, komplikasi, atau klimaks bab ini.`,
                tone: "Treatment teknis naratif, lugas, tanpa dialog langsung",
                length: "3 hingga 5 scene lengkap; tiap scene 1 hingga 2 paragraf; tiap paragraf 3 hingga 5 kalimat pendek"
            }
        };

        // 7. Eksekusi Request ke AI
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
    }
};