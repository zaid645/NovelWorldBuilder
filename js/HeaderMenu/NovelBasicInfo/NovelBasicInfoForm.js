// Logika CRUD

export const NovelBasicInfoForm = {

    saveStoryInfo() {
        const titleVal = document.getElementById('storyTitle').value;
        const synopsisVal = document.getElementById('storySynopsis').value;
        const worldVal = document.getElementById('storyWorld').value;

        this.data.storyInfo.title = titleVal;
        this.data.storyInfo.synopsis = synopsisVal;
        this.data.storyInfo.worldBuilding = worldVal;

        this.saveData(true); 
    },
    
    toggleMainCharacter(charId) {
        if (!this.data.storyInfo.mainCharacters) {
            this.data.storyInfo.mainCharacters = [];
        }
        
        const index = this.data.storyInfo.mainCharacters.indexOf(charId);
        if (index === -1) {
            this.data.storyInfo.mainCharacters.push(charId); // Centang (Tambah)
        } else {
            this.data.storyInfo.mainCharacters.splice(index, 1); // Hapus centang
        }
        this.saveData(true);
    }
}