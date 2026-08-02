// Logika export skill

export const SkillExport = {
    exportSkills() {
        this.downloadJSON("data_skills.json", { skillTags: this.data.skillTags, skills: this.data.skills });
    }
}