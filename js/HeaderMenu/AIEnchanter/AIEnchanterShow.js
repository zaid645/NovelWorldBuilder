export const AIEnchanterShow = {
    renderAIEnchanterView() {
        const config = this.getAIConfig();
        const models = [
            'gemini-3.6-flash',
            'gemini-3.5-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            'gemini-3-flash'
        ];

        return `
            <div class="flex flex-col gap-6">
                <!-- Panel Utama Pengaturan AI -->
                <div class="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-md">
                    <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
                            <span>✨</span> AI Novel Enchanter & Settings
                        </h3>
                        <span class="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full">
                            API-Driven Decoupled Module
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Kolom Kiri: Kredensial & Model & Role & Token -->
                        <div class="flex flex-col gap-3">
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 mb-1.5">Gemini API Key</label>
                                <div class="relative">
                                    <input type="password" id="aiApiKey" value="${config.apiKey}" oninput="app.handleSaveAIConfig(false)" placeholder="Masukkan apiKey Anda..." 
                                        class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 pr-10">
                                    <button onclick="app.toggleApiKeyVisibility()" class="absolute right-3 top-3 text-slate-500 hover:text-slate-300 focus:outline-none">
                                        <svg id="eyeIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Input Role AI (Data Tersembunyi Dijadikan Transparan) -->
                            <div>
                                <label class="block text-xs font-semibold text-slate-400 mb-1.5">Peran / Sistem Role AI</label>
                                <input type="text" id="aiSystemRole" value="${config.systemRole || 'Penulis Novel dengan gaya Light Novel'}" oninput="app.handleSaveAIConfig(false)" placeholder="Contoh: Penulis Novel dengan gaya Light Novel" 
                                    class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                            </div>

                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 mb-1.5">Pilih Model AI</label>
                                    <select id="aiModel" onchange="app.handleSaveAIConfig(false)" class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                                        ${models.map(m => `<option value="${m}" ${config.model === m ? 'selected' : ''}>${m}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 mb-1.5">Max Tokens</label>
                                    <input type="number" id="aiMaxTokens" value="${config.maxOutputTokens || 2048}" min="100" max="8192" step="100" oninput="app.handleSaveAIConfig(false)"
                                        class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-slate-400 mb-1.5">Temperatur (Kreativitas)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" id="aiTemperature" value="${config.temperature ?? 0.7}" min="0.0" max="2.0" step="0.1" 
                                            oninput="app.handleSaveAIConfig(false)"
                                            class="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                                    </div>
                                </div>
                            </div>

                            <!-- Opsi Sertakan Nama Modul (Default: False) -->
                            <div class="flex items-center gap-2 mt-1 bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                                <input type="checkbox" id="aiIncludeModuleName" ${config.includeModuleName ? 'checked' : ''} onchange="app.handleSaveAIConfig(false)"
                                    class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                                <label for="aiIncludeModuleName" class="text-xs text-slate-300 font-medium cursor-pointer select-none">
                                    Sertakan nama modul dalam prompt (Default: Nonaktif)
                                </label>
                            </div>

                            <div class="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                                <input type="checkbox" id="aiDownloadPromptOnly" ${config.downloadPromptOnly ? 'checked' : ''} onchange="app.handleSaveAIConfig(false)"
                                    class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                                <label for="aiDownloadPromptOnly" class="text-xs text-slate-300 font-medium cursor-pointer select-none">
                                    Unduh Prompt (.txt) saja alih-alih mengirim request ke API
                                </label>
                            </div>

                            <div class="mt-2">
                                <button onclick="app.handleSaveAIConfig(true)" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded text-sm transition">
                                    Simpan Pengaturan AI (Manual Save)
                                </button>
                            </div>
                        </div>

                        <!-- Kolom Kanan: Aturan Output Baku -->
                        <div class="flex flex-col">
                            <label class="block text-xs font-semibold text-slate-400 mb-1.5">Aturan Output AI Baku (Wajib)</label>
                            <textarea id="aiOutputRules" rows="10" oninput="app.handleSaveAIConfig(false)" class="w-full flex-1 bg-slate-900 border border-slate-700 rounded p-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500" placeholder="Satu baris untuk satu aturan...">${config.outputRules.join('\n')}</textarea>
                            <span class="text-[10px] text-slate-500 mt-1 italic">*Aturan ini disisipkan di setiap instruksi agar format hasil selalu konsisten. Perubahan disimpan secara otomatis.</span>
                        </div>
                    </div>
                </div>

                <!-- Panel Log Aktivitas Berjalan -->
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-md">
                    <div class="bg-slate-750 p-3 px-4 flex justify-between items-center border-b border-slate-700">
                        <div class="flex items-center gap-2">
                            <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <h3 class="font-bold text-slate-200 text-xs tracking-wide uppercase">AI Enchanter Logs (Sesi Aktif)</h3>
                        </div>
                        <button onclick="app.clearLogs()" class="text-[10px] text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 px-2 py-0.5 rounded transition">
                            Bersihkan Log
                        </button>
                    </div>
                    <div id="aiLogsContainer" class="p-4 max-h-[200px] overflow-y-auto divide-y divide-slate-700/50 text-xs">
                        ${app.renderAILogsList()}
                    </div>
                </div>
            </div>
        `;
    }
};