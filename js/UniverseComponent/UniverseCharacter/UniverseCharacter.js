import { UniverseCharacterCategory } from "./UniverseCharacterCategory.js";
import { UniverseCharacterFormAi } from "./UniverseCharacterFormAi.js";
import { UniverseCharacterFormMain } from "./UniverseCharacterFormMain.js";
import { UniverseCharacterFormOuter } from "./UniverseCharacterFormOuter.js";
import { UniverseCharacterFormSub } from "./UniverseCharacterFormSub.js";
import { UniverseCharacterShow } from "./UniverseCharacterShow.js";

export const UniverseCharacterModule = {
    ...UniverseCharacterCategory,
    ...UniverseCharacterFormAi,
    ...UniverseCharacterFormMain,
    ...UniverseCharacterFormOuter,
    ...UniverseCharacterFormSub,
    ...UniverseCharacterShow
}