import {add, moveTo, remove, select, selectTo, update} from "./node/index"
import Events from "./other/events"

// mmp version
export {version} from "../package.json"

export let on = Events.on

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
export let node = {
    add,
    moveTo,
    remove,
    select,
    selectTo,
    update
}
