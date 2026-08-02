// Logika CRUD khusus untuk AI

export const UniverseLocationFormAi = {
    // ==========================================
    // --- INTEGRASI AI ENCHANTER KHUSUS LOKASI ---
    // ==========================================

    async generateLocationAI(univId, formId, isRoot, targetField) {
        const nameInput = document.getElementById(`newLocName_${formId}`).value.trim();
        if (!nameInput) {
            return this.showAlert("GAGAL: 'Nama Tempat' wajib diisi terlebih dahulu agar AI memiliki panduan subjek lokasi.", "error");
        }

        let targetEl, btnId, originalBtnText;
        let aiFocusRule = "";
        const aiLengthRule = "SANGAT RINGKAS, to the point, dan WAJIB HANYA 1 (satu) kalimat saja. TANPA metafora atau bahasa puitis berlebihan.";

        const currentDesc = document.getElementById(`newLocDesc_${formId}`).value.trim();
        const currentVis = document.getElementById(`newLocVis_${formId}`).value.trim();
        let crossContext = "";

        if (targetField === 'description') {
            targetEl = document.getElementById(`newLocDesc_${formId}`);
            btnId = `btnAiLocDesc_${formId}`;
            aiFocusRule = "Kembangkan deskripsi tempat ini, fokus HANYA pada sejarah, latar belakang, atau kegunaan (fungsi) tempat tersebut.";
            if (currentVis) crossContext = `\n[REFERENSI VISUAL]: ${currentVis}`;
        } else if (targetField === 'visuals') {
            targetEl = document.getElementById(`newLocVis_${formId}`);
            btnId = `btnAiLocVis_${formId}`;
            aiFocusRule = "Kembangkan visual tempat ini, fokus HANYA pada penggambaran fisik, arsitektur, estetika, lanskap, atau atmosfer sekitarnya.";
            if (currentDesc) crossContext = `\n[REFERENSI SEJARAH/KEGUNAAN]: ${currentDesc}`;
        }

        const universe = app.data.universes.find(u => u.id === univId);
        let contextStr = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\n`;
        
        if (!isRoot) {
            // formId adalah parentId untuk sub-lokasi
            const parentLoc = this.findLocationById(universe.locations, formId);
            if (parentLoc) {
                contextStr += `Lokasi Induk (Tempat bernaung): ${parentLoc.name}\nDeskripsi Induk: ${parentLoc.description || '-'}\n`;
            }
        }

        const payload = {
            moduleName: `Location-${targetField.toUpperCase()}`,
            targetData: {
                namaTempat: nameInput,
                informasiSemesta: contextStr,
                konteksSilang: crossContext || "(Tidak ada informasi tambahan)",
                drafReferensiPengguna: targetEl.value.trim() || "(Kosong. Buatkan murni berdasarkan Nama Tempat dan Konteks.)"
            },
            additional_instruction: {
                focus: aiFocusRule,
                tone: "Faktual, deskriptif, world-building dokumenter.",
                length: aiLengthRule
            }
        };

        const btnEl = document.getElementById(btnId);
        if (btnEl) {
            btnEl.disabled = true;
            btnEl.classList.add('opacity-50', 'cursor-wait');
            originalBtnText = btnEl.innerHTML;
            btnEl.innerHTML = "✨ Memproses...";
        }

        try {
            const resultText = await app.requestEnchant(payload);
            targetEl.value = resultText;
            app.showAlert(`Berhasil men-generate AI untuk ${targetField === 'description' ? 'Deskripsi' : 'Visual'}!`, "success");
        } catch (error) {
            this.showAlert("Gagal memanggil AI: " + error.message, "error");
        } finally {
            if (btnEl) {
                btnEl.disabled = false;
                btnEl.classList.remove('opacity-50', 'cursor-wait');
                btnEl.innerHTML = originalBtnText;
            }
        }
    },

    async autoGenerateChildLocation(univId, parentId) {
        const universe = app.data.universes.find(u => u.id === univId);
        const parentLoc = this.findLocationById(universe.locations, parentId);
        
        if (!parentLoc) return;

        const btnId = `btnAutoChild_${parentId}`;
        const btnEl = document.getElementById(btnId);
        const originalText = btnEl.innerHTML;
        
        btnEl.disabled = true;
        btnEl.classList.add('opacity-50', 'cursor-wait');
        btnEl.innerHTML = "✨ Generating...";

        const contextStr = `Nama Semesta: ${universe.name}\nDeskripsi Semesta: ${universe.description || '-'}\nLokasi Induk: ${parentLoc.name}\nDeskripsi Induk: ${parentLoc.description || '-'}`;

        const payload = {
            moduleName: "Location-AutoChild",
            targetData: {
                informasiSemesta: contextStr,
            },
            additional_instruction: {
                focus: "Buat HANYA 1 (satu) sub-lokasi / tempat spesifik baru yang logis berada di dalam 'Lokasi Induk' (contoh: jika induk 'Kota', buat 'Toko Senjata' atau 'Kuil'). Hasikan Nama, Deskripsi (fokus sejarah/kegunaan), dan Visual (fokus penampilan).",
                tone: "Faktual, deskriptif logis",
                length: "WAJIB KEMBALIKAN HANYA FORMAT INI TANPA TEKS LAIN:\nNama: [Nama Tempat]\nDeskripsi: [Tepat 1 kalimat ringkas to-the-point]\nVisual: [Tepat 1 kalimat ringkas to-the-point]"
            }
        };

        try {
            const result = await app.requestEnchant(payload);
            
            // Proses Parsing Format Output AI
            let name = "", desc = "", vis = "";
            
            // Regex parsing (lebih tangguh jika AI memberikan formatting seperti **Nama:**)
            const nameMatch = result.match(/Nama:\s*(.*)/i) || result.match(/\*\*Nama:\*\*\s*(.*)/i);
            const descMatch = result.match(/Deskripsi:\s*(.*)/i) || result.match(/\*\*Deskripsi:\*\*\s*(.*)/i);
            const visMatch = result.match(/Visual:\s*(.*)/i) || result.match(/\*\*Visual:\*\*\s*(.*)/i);
            
            if (nameMatch) name = nameMatch[1].trim().replace(/[*_]/g, '');
            if (descMatch) desc = descMatch[1].trim().replace(/[*_]/g, '');
            if (visMatch) vis = visMatch[1].trim().replace(/[*_]/g, '');

            if (!name) throw new Error("Format balasan AI tidak sesuai (Gagal mengekstrak nama tempat).");

            if (!parentLoc.children) parentLoc.children = [];
            parentLoc.children.push({
                id: this.generateId('l'),
                name: name,
                description: desc,
                visuals: vis,
                children: []
            });

            this.saveData(true);
            this.switchView(univId);
            
            // Otomatis membuka hierarki parent agar user bisa melihat hasilnya
            this.setPanelState(`children-${parentId}`, true);
            app.showAlert(`Sub-tempat "${name}" berhasil ditambahkan AI!`, "success");

        } catch (err) {
            this.showAlert("Gagal Auto-Child: " + err.message, "error");
        } finally {
            if (document.getElementById(btnId)) {
                const resetBtn = document.getElementById(btnId);
                resetBtn.disabled = false;
                resetBtn.classList.remove('opacity-50', 'cursor-wait');
                resetBtn.innerHTML = originalText;
            }
        }
    },
}