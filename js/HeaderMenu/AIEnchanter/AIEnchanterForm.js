export const AIEnchanterForm = {
    getAIConfig() {
        const config = localStorage.getItem('ai_enchanter_config');
        const defaultConfig = {
            apiKey: '',
            model: 'gemini-3.1-flash-lite',
            temperature: 0.7,
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
            ...parsed,
            temperature: typeof parsed.temperature !== 'undefined' ? Number(parsed.temperature) : 0.7
        };
    },

    saveAIConfig(apiKey, model, outputRules, maxOutputTokens, downloadPromptOnly, systemRole, includeModuleName, temperature) {
        const parsedTemp = parseFloat(temperature);
        const validTemp = (!isNaN(parsedTemp) && temperature !== '') 
            ? Math.min(Math.max(parsedTemp, 0.0), 2.0) 
            : 0.7;

        const config = { 
            apiKey, 
            model, 
            outputRules, 
            maxOutputTokens: Number(maxOutputTokens) || 2048,
            temperature: validTemp,
            downloadPromptOnly: Boolean(downloadPromptOnly),
            systemRole: systemRole || 'Asisten Novelis Pro',
            includeModuleName: Boolean(includeModuleName)
        };
        localStorage.setItem('ai_enchanter_config', JSON.stringify(config));
        this.addLog('Success', 'Config', 'Menyimpan Konfigurasi', 'Konfigurasi AI berhasil diperbarui.');
    }
};