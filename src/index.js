export {version} from "../package.json"
export {on} from "./events"

// Mind map functions
export {
    reset as new,
    init, remove,
    image,
    center,
    data,
    undo, repeat,
    zoomIn, zoomOut
} from "./map/index"

// Node functions
import {
    add,
    moveTo,
    remove,
    select,
    selectTo,
    update
} from "./node/index"


export let node = {add, moveTo, remove, select, selectTo, update}
