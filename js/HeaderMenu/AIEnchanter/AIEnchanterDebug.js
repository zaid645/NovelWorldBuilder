export const AIEnchanterDebug = {
    aiLogs: [],
    
    addLog(status, module, action, message) {
        const newLog = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString('id-ID'),
            status, // 'Success' atau 'Failed'
            module,
            action,
            message
        };
        this.aiLogs.unshift(newLog); // Log terbaru ditaruh paling atas
        this.refreshAILogsPanel();
    },

    clearLogs() {
        this.aiLogs = [];
        this.refreshAILogsPanel();
    },

    renderAILogsList() {
        if (this.aiLogs.length === 0) {
            return `<div class="text-center py-4 text-slate-500 italic">Belum ada transaksi log pada sesi ini.</div>`;
        }

        return this.aiLogs.map(log => {
            const statusColor = log.status === 'Success' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-900';
            const badgeText = log.status === 'Success' ? 'SUKSES' : 'GAGAL';

            return `
                <div class="py-2 flex flex-col gap-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] bg-slate-900 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-800">${log.timestamp}</span>
                            <span class="text-[10px] px-2 py-0.5 rounded font-bold border ${statusColor}">${badgeText}</span>
                            <span class="font-bold text-indigo-400">${log.module}</span>
                            <span class="text-slate-400">➔</span>
                            <span class="text-slate-300 font-medium">${log.action}</span>
                        </div>
                    </div>
                    <div class="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded mt-0.5 border border-slate-800/40">
                        ${log.message}
                    </div>
                </div>
            `;
        }).join('');
    },

    refreshAILogsPanel() {
        const container = document.getElementById('aiLogsContainer');
        if (container) {
            container.innerHTML = this.renderAILogsList();
        }
    },

    downloadPromptAsTxt(promptText, filename = 'ai_prompt.txt') {
        const blob = new Blob([promptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    handleSaveAIConfig(showToast = true) {
        const apiKey = document.getElementById('aiApiKey').value.trim();
        const model = document.getElementById('aiModel').value;
        const maxTokens = document.getElementById('aiMaxTokens').value;
        const downloadPromptOnly = document.getElementById('aiDownloadPromptOnly').checked;
        const systemRole = document.getElementById('aiSystemRole').value.trim();
        const includeModuleName = document.getElementById('aiIncludeModuleName').checked;
        const rulesText = document.getElementById('aiOutputRules').value;

        const outputRules = rulesText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        this.saveAIConfig(apiKey, model, outputRules, maxTokens, downloadPromptOnly, systemRole, includeModuleName);
        
        if (showToast) {
            alert("Konfigurasi AI berhasil disimpan!");
        }
    },

    toggleApiKeyVisibility() {
        const input = document.getElementById('aiApiKey');
        if (!input) return;
        
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    },

    async testAIEnchant() {
        const testInput = document.getElementById('testInputPrompt');
        const outputArea = document.getElementById('testOutputArea');
        const btn = document.getElementById('btnTestAI');

        if (!testInput || !testInput.value.trim()) {
            return alert("Ketikkan teks uji coba terlebih dahulu.");
        }

        const promptText = testInput.value.trim();
        outputArea.innerHTML = "Menghubungi AI... Mohon tunggu...";
        btn.disabled = true;
        btn.classList.add('opacity-50');

        const testPayload = {
            moduleName: "Sandbox-Test",
            targetData: {
                name: "Uji Sandbox",
                originalText: promptText
            },
            additional_instruction: {
                focus: "Kembangkan teks uji coba dengan memperindah pilihan diksi narasi",
                tone: "Melankolis dramatis",
                length: "1 paragraf pendek"
            }
        };

        try {
            const result = await this.requestEnchant(testPayload);
            outputArea.innerText = result;
        } catch (error) {
            outputArea.innerHTML = `<span class="text-rose-500 font-bold">Error: ${error.message}</span>`;
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-50');
        }
    }
}