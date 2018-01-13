import {dispatch} from "d3";

// All events of mmp
let dispatcher = dispatch(
    "mmcreate",
    "mmcenter",
    "mmundo",
    "mmrepeat",
    "nodeselect",
    "nodeupdate",
    "nodecreate",
    "noderemove"
);

export default class Events {

    /**
     * @name call
     * @param {Object} e - The name of the event.
     * @param {Object} [p] - Optional parameters.
     * @desc  Invoke each registered callback for the specified event ( d3 function ).
     */
    static call(e, ...p) {
        return dispatcher.call(e, ...p);
    }

    /**
     * @name on
     * @param {Object} e - The name of the event.
     * @param {Function} [cb] - Callback called on event.
     * @desc Adds, removes or gets the callback for the specified event ( d3 function ).
     */
    static on(e, cb) {
        return dispatcher.on(e, cb);
    }

}
