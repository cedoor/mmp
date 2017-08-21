import glob from "../global"
import Utils from "../other/utils"

/**
 * @name remove
 * @desc Remove the mind map and reset all global settings.
 */
export function remove() {
    if (glob.container !== undefined) {
        glob.container.select("svg").remove()
        let backup = Utils.cloneObject(glob.backup)
        Utils.clearObject(glob)
        Object.assign(glob, backup)
    }
}
