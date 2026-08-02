// Layanan AI monster

export const UniverseMonsterFormAi = {
    async generateMonsterAI(univId, safeCat, targetField) {
        const nameInput = document.getElementById(`newMonsterName_${safeCat}`).value.trim();
        if (!nameInput) {
            return this.showAlert("GAGAL: 'Nama Monster' wajib diisi agar AI memiliki subjek yang jelas.", "error");
        }
        
        let targetEl, btnId, originalBtnText;
        let aiFocusRule = "";
        const aiLengthRule = "Hasilkan secara SANGAT RINGKAS menggunakan kalimat efektif (maksimal 1 paragraf). TANPA metafora, TANPA diksi puitis. Gunakan bahasa yang lugas, mengerikan/khas monster, dan to-the-point.";

        const currentApp = document.getElementById(`newMonsterApp_${safeCat}`).value.trim();
        const currentBg = document.getElementById(`newMonsterBg_${safeCat}`).value.trim();
        let crossContext = "";

        if (targetField === 'appearance') {
            targetEl = document.getElementById(`newMonsterApp_${safeCat}`);
            btnId = `btnAiMonsterApp_${safeCat}`;
            aiFocusRule = "Sebutkan wujud fisik, anatomi, warna, ukuran, atau ciri khas mutasi dari monster ini secara faktual.";
            if (currentBg) crossContext = `\n[REFERENSI LATAR BELAKANG UNTUK PENYESUAIAN WUJUD]: ${currentBg}`;
        } else if (targetField === 'background') {
            targetEl = document.getElementById(`newMonsterBg_${safeCat}`);
            btnId = `btnAiMonsterBg_${safeCat}`;
            aiFocusRule = "Kembangkan latar belakang, asal-usul, habitat, atau insting/motivasi utama dari monster ini secara faktual.";
            if (currentApp) crossContext = `\n[REFERENSI PENAMPILAN UNTUK PENYESUAIAN ASAL-USUL]: ${currentApp}`;
        }

        const draftText = targetEl.value.trim();
        const universe = app.data.universes.find(u => u.id === univId);
        let universeContext = "Semesta tidak ditentukan.";
        if (universe) {
            universeContext = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        }

        const payload = {
            moduleName: `Monster-${targetField.toUpperCase()}`,
            targetData: {
                namaMonster: nameInput,
                informasiSemesta: universeContext,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan)",
                drafReferensiPengguna: draftText || "(Kosong. Buat murni berdasarkan nama, sifat, dan semesta.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, ringkas, brutal/teknis, dan deskriptif. Tidak berbunga-bunga.",
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
            app.showAlert(`Berhasil men-generate AI untuk ${targetField} monster!`, "success");
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

    async generateMonsterDialogueAI(univId, category, monsterId) {
        const universe = this.data.universes.find(u => u.id === univId);
        const monster = universe.monsters[category].find(m => m.id === monsterId);
        
        if (!monster) return;
        
        if (!monster.personality || monster.personality.length === 0) {
            return app.showAlert("GAGAL: Untuk membuat variasi dialog/suara, monster ini wajib memiliki minimal 1 Sifat/Watak (Edit monster untuk menambahkan).", "error");
        }

        const universeContext = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        const crossContext = `\nOUTPUT WAJIB berupa kalimat langsung dipisah Enter. DILARANG memberikan angka (1, 2, 3), bullet point, atau deskripsi narator. Hanya tulisan dialog/suara saja.`;

        const payload = {
            moduleName: `Monster-DIALOGUES`,
            targetData: {
                namaMonster: monster.name,
                informasiSemesta: universeContext,
                konteksSilang: crossContext,
                drafReferensiPengguna: "(Kosong. Buat murni berdasarkan nama, sifat, dan semesta.)"
            },
            additional_instruction: {
                focus: `Buatkan 3 hingga 5 baris variasi kalimat kutipan (atau deskripsi suara/raungan jika tidak bisa bicara) yang mencerminkan insting/sifatnya. Sifat Monster: ${monster.personality.join(', ')}`,
                tone: "Mengancam, liar, faktual, ringkas.",
                length: crossContext
            }
        };

        const btnId = `btnAiMonsterDlgCard_${monster.id}`;
        const btnEl = document.getElementById(btnId);
        let originalBtnText = "✨ AI Suara/Dialog";
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
                .map(line => `"${line}"`);
            
            if (!monster.dialogues) monster.dialogues = [];
            monster.dialogues.push(...cleanedDialogues);
            
            this.saveData(true);
            this.switchView(univId);
            app.showAlert("Berhasil menambahkan suara/dialog AI ke rekaman monster!", "success");
        } catch (error) {
            app.showAlert("Gagal memanggil AI: " + error.message, "error");
        }
    },
}