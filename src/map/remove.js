import glob from '../global'
import { clearObject, cloneObject } from '../utils'

/**
 * @name remove
 * @desc Remove the mind map and reset all global settings.
*/
export function remove() {
    glob.container.select('svg').remove()
    let backup = cloneObject( glob.backup )
    clearObject( glob )
    Object.assign( glob, backup )
}
