export const AIEnchanterForm = {
    getAIConfig() {
        const config = localStorage.getItem('ai_enchanter_config');
        const defaultConfig = {
            apiKey: '',
            model: 'gemini-3.1-flash-lite', // Menjadikan gemini-3.1-flash-lite sebagai default
            maxOutputTokens: 2048,           // Default Max Output Tokens
            downloadPromptOnly: false,      // Flag mode download prompt
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

    saveAIConfig(apiKey, model, outputRules, maxOutputTokens, downloadPromptOnly) {
        const config = { 
            apiKey, 
            model, 
            outputRules, 
            maxOutputTokens: Number(maxOutputTokens) || 2048,
            downloadPromptOnly: Boolean(downloadPromptOnly)
        };
        localStorage.setItem('ai_enchanter_config', JSON.stringify(config));
        this.addLog('Success', 'Config', 'Menyimpan Konfigurasi', 'Konfigurasi AI berhasil diperbarui.');
    },

}