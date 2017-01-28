// version
export { version } from '../package.json'
export { on } from './events'

export {
    reset as new,
    init, remove,
    image,
    center,
    data,
    undo, repeat,
    zoomIn, zoomOut
} from './map/index'

// Node functions
import { add, remove, select, moveTo, selectTo, update } from './node/index'
export let node = { add, select, remove, moveTo, selectTo, update }
