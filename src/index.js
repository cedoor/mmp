// version
export { version } from '../package.json'
export { default as init } from './init'
export { on } from './events'

export {
    image,
    reset as new,
    center,
    data,
    undo, repeat,
    zoomIn, zoomOut
} from './map/index'

// Node functions
import { add, remove, select, moveTo, selectTo, update } from './node/index'
export let node = {
    add: add,
    select: select,
    remove: remove,
    moveTo: moveTo,
    selectTo: selectTo,
    update: update
}
