import { AIEnchanterCore } from "./AIEnchantCore.js";
import { AIEnchanterDebug } from "./AIEnchanterDebug.js";
import { AIEnchanterForm } from "./AIEnchanterForm.js";
import { AIEnchanterShow } from "./AIEnchanterShow.js";

export const AIEnchanterModule = {
    ...AIEnchanterDebug,
    ...AIEnchanterCore,
    ...AIEnchanterForm,
    ...AIEnchanterShow
}