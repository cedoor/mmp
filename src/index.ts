import {add, moveTo, remove, select, selectTo, update} from "./node";
import Events from "./other/events";
import * as pkg from "../package.json";

// mmp version
export let version = (<any>pkg).version;

export let on = Events.on;

// Mind map functions
export {
    reset as new,
    init, remove,
    image,
    center,
    data,
    undo, repeat,
    zoomIn, zoomOut
} from "./map/index";

// Node functions
export let node = {
    add,
    moveTo,
    remove,
    select,
    selectTo,
    update
};
