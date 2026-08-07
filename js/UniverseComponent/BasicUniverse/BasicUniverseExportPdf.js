// Metode ekspor PDF yang diintegrasikan ke dalam objek ekspor (BasicUniverseExport / app)
export const BasicUniverseExportPdf = {
    async exportUniversePdf(universesInput) {
        // 1. Ambil Markdown asli
        const rawMarkdown = this.generateUniverseMarkdown(universesInput);

        // 2. Transformasi khusus PDF: Ubah heading lokasi (###, ####, dst.) menjadi indented bullet list
        const pdfMarkdown = rawMarkdown.replace(/(## Daftar Lokasi[\s\S]*?)(?=\n---\n|\n## |$)/g, (locationSection) => {
            return locationSection.replace(/^(#{3,})\s+(.*)$/gm, (match, hashes, title) => {
                const depth = hashes.length - 3;
                const indent = '  '.repeat(depth);
                return `${indent}- **${title}**`;
            });
        });

        // 3. Parsing Markdown hasil transformasi ke HTML
        const htmlBody = typeof marked !== 'undefined' 
            ? marked.parse(pdfMarkdown) 
            : this.simpleMdToHtml(pdfMarkdown);

        // 4. Render ke wadah HTML sementara
        const container = document.createElement('div');
        // Kita gunakan kelas 'pdf-document-wrapper' sebagai scope isolasi
        container.className = 'pdf-document-wrapper';
        
        // CSS Estetik Modern (Mirip Tailwind UI)
        const styles = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                .pdf-document-wrapper {
                    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #334155;
                    background-color: #f8fafc;
                    padding: 40px;
                    line-height: 1.6;
                    font-size: 10.5pt;
                }

                /* ================= HERO HEADER ================= */
                .hero-header {
                    background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
                    color: white;
                    padding: 40px 30px;
                    border-radius: 16px;
                    margin-bottom: 40px;
                    box-shadow: 0 10px 25px -5px rgba(67, 56, 202, 0.4);
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                }
                .hero-header::after {
                    content: '';
                    position: absolute;
                    top: -50%; right: -20%;
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
                    border-radius: 50%;
                }
                .hero-label {
                    font-size: 9pt;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #a5b4fc;
                    margin-bottom: 8px;
                }
                .hero-header h1 {
                    font-size: 26pt;
                    font-weight: 800;
                    margin: 0 0 12px 0;
                    color: #ffffff;
                    letter-spacing: -0.03em;
                }
                .hero-date {
                    font-size: 9.5pt;
                    color: #c7d2fe;
                    font-weight: 500;
                }

                /* ================= SECTIONS & HEADINGS ================= */
                .section-title {
                    font-size: 15pt;
                    font-weight: 800;
                    color: #0f172a;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 12px;
                    margin-top: 48px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    break-after: avoid;
                }
                
                .category-title {
                    display: inline-block;
                    background-color: #e0e7ff;
                    color: #3730a3;
                    padding: 6px 16px;
                    border-radius: 999px;
                    font-size: 9.5pt;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 24px;
                    margin-bottom: 16px;
                    border: 1px solid #c7d2fe;
                    break-after: avoid;
                }

                /* ================= LORE CARDS (TOKOH/ITEM/SKILL) ================= */
                .lore-card {
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
                    margin-bottom: 20px;
                    overflow: hidden;
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                .lore-card-header {
                    background-color: #f1f5f9;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 14px 20px;
                }
                .lore-card-header h4 {
                    margin: 0;
                    font-size: 12pt;
                    font-weight: 700;
                    color: #1e293b;
                }
                .lore-card-body {
                    padding: 20px;
                }

                /* ================= TYPOGRAPHY & ELEMENTS IN CARD ================= */
                .lore-card-body p { margin-top: 0; margin-bottom: 12px; }
                .lore-card-body p:last-child { margin-bottom: 0; }
                
                .field-label {
                    display: block;
                    font-size: 8.5pt;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 16px;
                    margin-bottom: 4px;
                }

                /* Atribut / Badge (Ras, Gender, dll) */
                .attribute-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .attr-badge {
                    display: inline-flex;
                    align-items: center;
                    background-color: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 8.5pt;
                    overflow: hidden;
                }
                .attr-key {
                    background-color: #e2e8f0;
                    color: #475569;
                    font-weight: 700;
                    padding: 4px 8px;
                }
                .attr-val {
                    color: #0f172a;
                    font-weight: 600;
                    padding: 4px 10px;
                }

                /* List & Formatting */
                ul { list-style-type: none; padding-left: 6px; margin: 8px 0; }
                li { position: relative; padding-left: 20px; margin-bottom: 6px; }
                li::before {
                    content: '•';
                    position: absolute;
                    left: 0; top: 0;
                    color: #6366f1;
                    font-size: 14pt;
                    line-height: 1.2;
                }
                hr { display: none; } /* Disembunyikan karena sudah pakai kotak / cards */
                strong { color: #0f172a; font-weight: 700; }
            </style>
        `;

        // Buat DOM sementara untuk memanipulasi elemen satu per satu
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlBody;
        
        const enhancedNodes = [];
        let currentCard = null;
        let cardBody = null;

        // Iterasi semua elemen untuk dibungkus menjadi UI yang cantik
        Array.from(tempDiv.children).forEach(el => {
            const tagName = el.tagName.toUpperCase();

            // 1. HERO HEADER (Heading 1)
            if (tagName === 'H1') {
                const hero = document.createElement('div');
                hero.className = 'hero-header';
                
                const titleText = el.innerText.replace(/^1>|Semesta:\s*/g, ''); // Bersihkan jika ada artefak '1>'
                
                hero.innerHTML = `
                    <div class="hero-label">Dokumen Ekspor Semesta</div>
                    <h1>${titleText}</h1>
                    <div class="hero-date">Diekspor pada: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                `;
                enhancedNodes.push(hero);
                currentCard = null; // Tutup card aktif jika ada
            }
            
            // 2. SECTION TITLE (Heading 2)
            else if (tagName === 'H2') {
                el.className = 'section-title';
                // Tambahkan icon opsional menggunakan SVG sederhana
                el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> ${el.innerHTML}`;
                enhancedNodes.push(el);
                currentCard = null;
            }
            
            // 3. CATEGORY TITLE (Heading 3)
            else if (tagName === 'H3') {
                el.className = 'category-title';
                enhancedNodes.push(el);
                currentCard = null;
            }
            
            // 4. LORE CARD (Heading 4 bertindak sebagai Header Card)
            else if (tagName === 'H4') {
                currentCard = document.createElement('div');
                currentCard.className = 'lore-card';

                const header = document.createElement('div');
                header.className = 'lore-card-header';
                header.appendChild(el.cloneNode(true));

                cardBody = document.createElement('div');
                cardBody.className = 'lore-card-body';

                currentCard.appendChild(header);
                currentCard.appendChild(cardBody);
                enhancedNodes.push(currentCard);
            }
            
            // 5. Elemen HR (Memutus Card)
            else if (tagName === 'HR') {
                currentCard = null;
            }
            
            // 6. KONTEN (Paragraf, List, dll)
            else {
                // Jika elemen berada dalam naungan sebuah H4, masukkan ke dalam Body Card
                if (currentCard && cardBody) {
                    
                    // Modifikasi Badge (Mencari atribut yang dipisah garis vertikal '|')
                    if (tagName === 'P' && el.innerHTML.includes('|')) {
                        const parts = el.innerHTML.split('|').map(p => p.trim());
                        // Pastikan ini benar-benar baris atribut (memiliki titik dua)
                        if (parts.every(p => p.includes(':'))) {
                            const badgeContainer = document.createElement('div');
                            badgeContainer.className = 'attribute-badges';
                            
                            badgeContainer.innerHTML = parts.map(part => {
                                const splitIndex = part.indexOf(':');
                                const key = part.substring(0, splitIndex).trim();
                                const val = part.substring(splitIndex + 1).trim();
                                return `
                                    <div class="attr-badge">
                                        <span class="attr-key">${key}</span>
                                        <span class="attr-val">${val}</span>
                                    </div>
                                `;
                            }).join('');
                            cardBody.appendChild(badgeContainer);
                            return; // Lanjut ke iterasi berikutnya
                        }
                    }

                    // Modifikasi Field Labels (Seperti "Latar Belakang:", "Penampilan:")
                    if (tagName === 'P') {
                        const html = el.innerHTML;
                        const labelRegex = /^(Latar Belakang|Penampilan|Skill|Item|Pet \/ Familiar|Relasi|Catatan|Dialog Khas|Efek \/ Deskripsi|Deskripsi Ras|Deskripsi|Visual|Watak):/gm;
                        el.innerHTML = html.replace(labelRegex, '<span class="field-label">$1</span>');
                    }

                    cardBody.appendChild(el);
                } else {
                    // Konten lepas (seperti deksripsi Bumi di awal)
                    enhancedNodes.push(el);
                }
            }
        });

        // Gabungkan CSS dan node yang sudah di-enhancement
        container.innerHTML = styles;
        const contentWrapper = document.createElement('div');
        enhancedNodes.forEach(node => contentWrapper.appendChild(node));
        container.appendChild(contentWrapper);

        // 5. Ekspor menggunakan html2pdf.js atau Fallback Print Browser
        const filename = `lore_semesta_${new Date().toISOString().slice(0, 10)}.pdf`;

        if (typeof html2pdf !== 'undefined') {
            app.showAlert("Menyusun dokumen tingkat lanjut...", "info");
            
            const opt = {
                margin:       0, // Margin diset ke 0 karena kita pakai padding container di CSS untuk kontrol visual
                filename:     filename,
                image:        { type: 'jpeg', quality: 1 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                // Aturan pemisah halaman yang ketat agar elemen card tidak terpotong (sangat penting untuk PDF)
                pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } 
            };

            await html2pdf().set(opt).from(container).save();
            app.showAlert("Ekspor Dokumen Premium berhasil!", "success");
        } else {
            // Fallback native browser print jika plugin tidak tersedia
            const printWin = window.open('', '_blank');
            printWin.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${filename}</title>
                    <meta charset="utf-8">
                </head>
                <body style="margin:0; padding:0; background:#f8fafc;">
                    ${container.outerHTML}
                    <script>
                        window.onload = function() { 
                            setTimeout(function(){ window.print(); }, 500);
                        }
                    </script>
                </body>
                </html>
            `);
            printWin.document.close();
            printWin.focus();
        }
    },

    // Diperbarui agar lebih kebal bug, artefak ditangani di bagian manipulasi DOM di atas
    simpleMdToHtml(md) {
        return md
            .replace(/^# (.*$)/gim, '<h1>$1</h1>') 
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
            .replace(/<\/ul>\s*<ul>/g, '') // Penggabungan list
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
};