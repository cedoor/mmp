import {Dispatch} from "d3-dispatch";
import {dispatch} from "d3";

let events: string[] = [
    "mmcreate",
    "mmcenter",
    "mmundo",
    "mmrepeat",
    "nodeselect",
    "nodeupdate",
    "nodecreate",
    "noderemove"
];

export default class Events {

    private dispatcher: Dispatch<any>;

    constructor() {
        this.dispatcher = dispatch(...events);
    }

    /**
     * @name call
     * @param {Object} e - The name of the event.
     * @param {Object} [p] - Optional parameters.
     * @desc  Invoke each registered callback for the specified event ( d3 function ).
     */
    public call(e, ...p) {
        return this.dispatcher.call(e, ...p);
    }

    /**
     * @name on
     * @param {Object} e - The name of the event.
     * @param {Function} [cb] - Callback called on event.
     * @desc Adds, removes or gets the callback for the specified event ( d3 function ).
     */
    public on = (e, cb) => {
        return this.dispatcher.on(e, cb);
    };

}
