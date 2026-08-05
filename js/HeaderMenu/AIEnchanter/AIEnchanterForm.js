export const AIEnchanterForm = {
    getAIConfig() {
        const config = localStorage.getItem('ai_enchanter_config');
        const defaultConfig = {
            apiKey: '',
            model: 'gemini-3.1-flash-lite',
            maxOutputTokens: 2048,
            downloadPromptOnly: false,
            systemRole: 'Penulis Novel dengan gaya Light Novel', // Default Role
            includeModuleName: false,                          // Default: False (Sesuai Permintaan)
            outputRules: [
                "HANYA kembalikan teks hasil pengembangan langsung.",
                "JANGAN memberikan kata pengantar atau penutup seperti 'Berikut hasilnya:', 'Tentu, ini...', atau tanda kutip.",
                "Hindari format Markdown yang merusak estetika UI, gunakan paragraf biasa.",
                "Gunakan Bahasa Indonesia yang kaya, sinematik, mengalir, dan sesuai dengan tone yang diminta."
            ]
        };

        if (!config) return defaultConfig;

        const parsed = JSON.parse(config);
        return {
            ...defaultConfig,
            ...parsed
        };
    },

    saveAIConfig(apiKey, model, outputRules, maxOutputTokens, downloadPromptOnly, systemRole, includeModuleName) {
        const config = { 
            apiKey, 
            model, 
            outputRules, 
            maxOutputTokens: Number(maxOutputTokens) || 2048,
            downloadPromptOnly: Boolean(downloadPromptOnly),
            systemRole: systemRole || 'Asisten Novelis Pro',
            includeModuleName: Boolean(includeModuleName)
        };
        localStorage.setItem('ai_enchanter_config', JSON.stringify(config));
        this.addLog('Success', 'Config', 'Menyimpan Konfigurasi', 'Konfigurasi AI berhasil diperbarui.');
    }
};