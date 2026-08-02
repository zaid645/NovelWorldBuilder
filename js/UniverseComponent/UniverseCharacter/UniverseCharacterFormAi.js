// Logika layanan yang berhubungan dengan AI

export const UniverseCharacterFormAi = {
    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS TOKOH ---
    // ==========================================
    
    async generateCharAI(univId, safeCat, targetField) {
        const nameInput = document.getElementById(`newName_${safeCat}`).value.trim();
        const checkedWataks = Array.from(document.querySelectorAll(`.charWatakCheck_${safeCat}:checked`)).map(cb => cb.value);

        if (!nameInput) {
            return this.showAlert("GAGAL: 'Nama Tokoh' wajib diisi agar AI memiliki subjek yang jelas.", "error");
        }
        
        let targetEl, btnId, originalBtnText;
        let aiFocusRule = "";
        const aiLengthRule = "Hasilkan secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf). TANPA metafora, TANPA diksi puitis. Gunakan bahasa yang lugas dan to-the-point.";

        const currentApp = document.getElementById(`newApp_${safeCat}`).value.trim();
        const currentBg = document.getElementById(`newBg_${safeCat}`).value.trim();
        let crossContext = "";

        if (targetField === 'appearance') {
            targetEl = document.getElementById(`newApp_${safeCat}`);
            btnId = `btnAiApp_${safeCat}`;
            aiFocusRule = "Sebutkan wujud fisik karakter ini, mulai dari wajah, ras, bentuk tubuh, hingga pakaian dominan yang dikenakan secara faktual.";
            if (currentBg) crossContext = `\n[REFERENSI LATAR BELAKANG UNTUK PENYESUAIAN WUJUD/PAKAIAN]: ${currentBg}`;
        } else if (targetField === 'background') {
            targetEl = document.getElementById(`newBg_${safeCat}`);
            btnId = `btnAiBg_${safeCat}`;
            aiFocusRule = "Kembangkan latar belakang ringkas, masa lalu, atau motivasi tujuan karakter ini secara faktual.";
            if (currentApp) crossContext = `\n[REFERENSI PENAMPILAN UNTUK PENYESUAIAN CERITA/GELAR]: ${currentApp}`;
        }

        const draftText = targetEl.value.trim();
        const universe = app.data.universes.find(u => u.id === univId);
        let universeContext = "Semesta tidak ditentukan.";
        if (universe) {
            universeContext = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        }

        const payload = {
            moduleName: `Character-${targetField.toUpperCase()}`,
            targetData: {
                namaKarakter: nameInput,
                informasiSemesta: universeContext,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan)",
                drafReferensiPengguna: draftText || "(Kosong. Buat murni berdasarkan nama, watak, dan semesta.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, ringkas, lugas, dan teknis/deskriptif. Tidak berbunga-bunga.",
                length: aiLengthRule
            }
        };

        const btnEl = document.getElementById(btnId);
        if(btnEl) {
            btnEl.disabled = true;
            btnEl.classList.add('opacity-50', 'cursor-wait');
            originalBtnText = btnEl.innerHTML;
            btnEl.innerHTML = "✨ Memproses...";
        }

        try {
            const resultText = await app.requestEnchant(payload);
            targetEl.value = resultText;
            app.showAlert(`Berhasil men-generate AI untuk ${targetField}!`, "success");
        } catch (error) {
            app.showAlert("Gagal memanggil AI: " + error.message, "error");
        } finally {
            if(btnEl) {
                btnEl.disabled = false;
                btnEl.classList.remove('opacity-50', 'cursor-wait');
                btnEl.innerHTML = originalBtnText;
            }
        }
    },

    async generateCharDialogueAI(univId, category, charId) {
        const universe = this.data.universes.find(u => u.id === univId);
        const char = universe.characters[category].find(c => c.id === charId);
        
        if (!char) return;
        
        if (!char.personality || char.personality.length === 0) {
            return app.showAlert("GAGAL: Untuk membuat variasi dialog, karakter ini wajib memiliki minimal 1 Watak/Kepribadian (Edit tokoh untuk menambahkan).", "error");
        }

        const universeContext = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        const crossContext = `\nOUTPUT WAJIB berupa kalimat langsung dipisah Enter. DILARANG memberikan angka (1, 2, 3), bullet point, atau deskripsi narator. Hanya tulisan dialog saja.`;

        const payload = {
            moduleName: `Character-DIALOGUES`,
            targetData: {
                namaKarakter: char.name,
                informasiSemesta: universeContext,
                konteksSilang: crossContext,
                drafReferensiPengguna: "(Kosong. Buat murni berdasarkan nama, watak, dan semesta.)"
            },
            additional_instruction: {
                focus: `Buatkan 3 hingga 5 baris variasi kalimat kutipan dialog yang sangat mencerminkan sifatnya. Watak Karakter: ${char.personality.join(', ')}`,
                tone: "Faktual, ringkas, lugas, dan teknis/deskriptif. Tidak berbunga-bunga.",
                length: crossContext
            }
        };

        const btnId = `btnAiDlgCard_${char.id}`;
        const btnEl = document.getElementById(btnId);
        let originalBtnText = "✨ AI Dialog";
        if(btnEl) {
            btnEl.disabled = true;
            btnEl.classList.add('opacity-50', 'cursor-wait');
            originalBtnText = btnEl.innerHTML;
            btnEl.innerHTML = "✨ Memproses...";
        }

        try {
            const resultText = await app.requestEnchant(payload);
            const cleanedDialogues = resultText.split('\n')
                .map(line => line.replace(/^[\d\.\-\*\"\' ]+/, '').trim()) 
                .filter(line => line.length > 0)
                // TAMBAHKAN MAP INI: Memastikan hasil AI terbungkus petik dua
                .map(line => `"${line}"`);
            
            if (!char.dialogues) char.dialogues = [];
            char.dialogues.push(...cleanedDialogues);
            
            this.saveData(true);
            this.switchView(univId);
            app.showAlert("Berhasil menambahkan dialog AI ke catatan karakter!", "success");
        } catch (error) {
            app.showAlert("Gagal memanggil AI: " + error.message, "error");
        }
        // Tidak perlu blok finally untuk mereset tombol karena switchView akan menggambar ulang UI
    },
}