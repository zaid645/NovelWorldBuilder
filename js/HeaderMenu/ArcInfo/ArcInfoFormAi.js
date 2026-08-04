import { ArcInfoFormContext } from './ArcInfoFormContext.js';

// Logika CRUD menggunakan AI
export const ArcInfoFormAi = {
    // =========================================
    // --- INTEGRASI PANGGILAN AI ENCHANTER ----
    // =========================================

    // A. Enchant Untuk Sinopsis Arc
    async enchantArcForm() {
        const titleEl = document.getElementById('newArcName');
        const synEl = document.getElementById('newArcSyn');
        const btn = document.getElementById('btnEnchantArc');

        if (!titleEl.value.trim()) {
            return this.showNotification("Isi 'Nama Arc' terlebih dahulu agar AI dapat memahami ide pokok narasi yang ingin dibuat.", "error");
        }

        const payload = {
            moduleName: "Arc-Synopsis",
            targetData: {
                arcTitle: titleEl.value.trim(),
                draftSynopsis: synEl.value.trim() || "Kosong (Buatkan dari awal berdasarkan judul Arc)"
            },
            additional_instruction: {
                focus: "Kembangkan ringkasan cerita (sinopsis) global untuk Arc (Lini Cerita) ini.",
                tone: "Epik, memancing rasa penasaran, menggunakan sudut pandang narator/penulis",
                length: "2 hingga 3 paragraf naratif"
            }
        };

        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Memproses AI...";

        try {
            const result = await app.requestEnchant(payload);
            synEl.value = result;
            this.showNotification("Sinopsis Arc berhasil dibuat oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal memanggil AI: " + error.message, "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    // B. Enchant Untuk Isi Narasi Sub-arc (Form Tambah Bawah)
    async enchantSubarcForm(arcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        
        // Validasi Ketersediaan Konteks Arc
        if (!arc || !arc.name) {
            return this.showNotification("GAGAL: Judul Arc harus sudah diisi dan 'disimpan' terlebih dahulu agar AI memahami konteks cerita utamanya.", "error");
        }

        // Ambil Target
        const targetCount = arc.targetSubarcCount || 10;
        
        // Ambil Nilai dari Form Sub-arc
        const subarcName = document.getElementById(`newSubarcName_${arcId}`).value.trim();
        const subarcDescEl = document.getElementById(`newSubarcDesc_${arcId}`);
        const subarcDesc = subarcDescEl.value.trim();
        const btn = document.getElementById(`btnEnchantSubarc_${arcId}`);

        // Menentukan urutan Sub-arc secara dinamis
        let currentIndex = (arc.subarcs ? arc.subarcs.length : 0) + 1;

        // Penyesuaian Instruksi Pacing
        let pacingFocus = `Sub-arc ini adalah urutan ke-${currentIndex} dari rencana total ${targetCount} sub-arc dalam Arc ini.`;
        if (currentIndex > targetCount) {
            pacingFocus = `PENTING: Sub-arc ini berada di urutan ke-${currentIndex}, MELEBIHI target awal ${targetCount} sub-arc! Rancang logika alur baru (ekstensi) berdasarkan kelanjutan sub-arc sebelumnya.`;
        }

        // --- PENGAMBILAN KONTEKS SECARA AMAN ---
        const selectedDetails = (typeof ArcInfoFormContext !== 'undefined' && ArcInfoFormContext.getSelectedContextDetails)
            ? ArcInfoFormContext.getSelectedContextDetails(arcId)
            : { characters: [], locations: [], universes: [] };

        // Konstruksi Payload Kompleks (Memberikan Full Context Semesta & Arc)
        const payload = {
            moduleName: "Sub-arc (Episode Arc)",
            targetData: {
                arcTitle: arc.name,
                arcSynopsis: arc.synopsis || "Belum ada sinopsis global.",
                subarcCurrentSequence: currentIndex,
                targetTotalSubarcs: targetCount,
                subarcTitle: subarcName || "Sub-arc Baru (Tanpa Judul)",
                draftDescription: subarcDesc || "Belum ada rincian. Buatkan ide masalah/kejadian spesifik dari awal berdasarkan urutan sub-arc ini.",
                historyPreviousSubarcs: arc.subarcs || [],
                charactersInvolved: selectedDetails.characters || [],
                locationsInvolved: selectedDetails.locations || [],
                multiverseLore: selectedDetails.universes || []
            },
            additional_instruction: {
                focus: `Jabarkan kerangka plot (outline) atau kejadian spesifik untuk sub-arc ini (contoh: munculnya konflik kecil, tokoh ditipu/tersesat, rintangan, atau penemuan penting). Ini adalah dokumen teknis untuk panduan penulis, BUKAN cerita pendek! Langsung tunjukkan apa masalah atau tindakan yang terjadi di sub-arc ini yang selaras dengan tujuan Arc utama. ${pacingFocus} PENTING: Gunakan informasi world-building, tokoh, dan tempat dari konteks terpilih.`,
                tone: "Teknis, ringkas, efektif, to-the-point pada konflik, TANPA bahasa puitis/berbunga-bunga layaknya novel",
                length: "Sangat singkat, 1 hingga 2 paragraf padat"
            }
        };

        // UI Loading State
        btn.disabled = true;
        btn.classList.add('opacity-50');
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Menulis... Mohon Tunggu...";
        
        try {
            const result = await app.requestEnchant(payload);
            subarcDescEl.value = result;
            this.showNotification("Kerangka Sub-arc berhasil diperluas/ditulis oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal menggunakan AI: " + error.message, "error");
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.innerHTML = originalText;
        }
    },

    // C. Enchant Untuk Isi Narasi Sub-arc (Form Edit Inline)
    async enchantSubarcFormInline(arcId, subarcId) {
        const arc = this.data.arcs.find(a => a.id === arcId);
        
        if (!arc || !arc.name) {
            return this.showNotification("GAGAL: Judul Arc harus sudah diisi dan disimpan agar AI memahami konteks cerita utamanya.", "error");
        }

        const targetCount = arc.targetSubarcCount || 10;
        
        const subarcName = document.getElementById(`editSubarcName_${arcId}_${subarcId}`).value.trim();
        const subarcDescEl = document.getElementById(`editSubarcDesc_${arcId}_${subarcId}`);
        const subarcDesc = subarcDescEl.value.trim();
        const btn = document.getElementById(`btnEnchantSubarc_inline_${arcId}_${subarcId}`);

        // Cari urutan berdasarkan letak indexnya
        const index = arc.subarcs.findIndex(s => s.id === subarcId);
        const currentIndex = index !== -1 ? index + 1 : 1;

        let pacingFocus = `Sub-arc ini adalah urutan ke-${currentIndex} dari rencana total ${targetCount} sub-arc dalam Arc ini.`;

        // --- PENGAMBILAN KONTEKS SECARA AMAN ---
        const selectedDetails = (typeof ArcInfoFormContext !== 'undefined' && ArcInfoFormContext.getSelectedContextDetails)
            ? ArcInfoFormContext.getSelectedContextDetails(arcId)
            : { characters: [], locations: [], universes: [] };

        const payload = {
            moduleName: "Sub-arc (Episode Arc)",
            targetData: {
                arcTitle: arc.name,
                arcSynopsis: arc.synopsis || "Belum ada sinopsis global.",
                subarcCurrentSequence: currentIndex,
                targetTotalSubarcs: targetCount,
                subarcTitle: subarcName || "Sub-arc",
                draftDescription: subarcDesc || "Kembangkan plot sub-arc spesifik di posisi ini.",
                historyPreviousSubarcs: arc.subarcs || [],
                charactersInvolved: selectedDetails.characters || [],
                locationsInvolved: selectedDetails.locations || [],
                multiverseLore: selectedDetails.universes || []
            },
            additional_instruction: {
                focus: `Sempurnakan kerangka alur plot untuk sub-arc ini selaras dengan posisi runtutan ke-${currentIndex}. Fokuskan pada kejadian penting, pergerakan karakter, rintangan, atau penemuan strategis. Ini adalah dokumentasi struktur plot (BUKAN fiksi pendek/prosa). ${pacingFocus}`,
                tone: "Teknis, taktis, detail konflik yang tegas, tanpa bunga bahasa novel",
                length: "Singkat dan padat, 1 hingga 2 paragraf deskriptif"
            }
        };

        btn.disabled = true;
        btn.classList.add('opacity-50');
        const originalText = btn.innerHTML;
        btn.innerHTML = "✨ Menulis...";
        
        try {
            const result = await app.requestEnchant(payload);
            subarcDescEl.value = result;
            this.showNotification("Kerangka Sub-arc berhasil disempurnakan oleh AI!", "success");
        } catch (error) {
            this.showNotification("Gagal memanggil AI: " + error.message, "error");
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
            btn.innerHTML = originalText;
        }
    },

    showNotification(message, type = 'info') {
        if (typeof app !== 'undefined') {
            if (typeof app.showAlert === 'function') {
                app.showAlert(message, type);
                return;
            }
            if (typeof app.showNotification === 'function' && app.showNotification !== this.showNotification) {
                app.showNotification('Notifikasi AI', message, type);
                return;
            }
        }
        alert(message);
    },
};