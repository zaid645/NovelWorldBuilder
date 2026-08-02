import { UniverseMonsterCategory } from "./UniverseMonsterCategory.js";
import { UniverseMonsterFormAi } from "./UniverseMonsterFormAi.js";
import { UniverseMonsterFormMain } from "./UniverseMonsterFormMain.js";
import { UniverseMonsterFormOuter } from "./UniverseMonsterFormOuter.js";
import { UniverseMonsterFormSub } from "./UniverseMonsterFormSub.js";
import { UniverseMonsterShow } from "./UniverseMonsterShow.js";

export const UniverseMonsterModule = {
    ...UniverseMonsterCategory,
    ...UniverseMonsterFormAi,
    ...UniverseMonsterFormMain,
    ...UniverseMonsterFormOuter,
    ...UniverseMonsterFormSub,
    ...UniverseMonsterShow
}