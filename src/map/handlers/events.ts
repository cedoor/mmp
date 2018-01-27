import {Dispatch} from "d3-dispatch";
import {dispatch} from "d3";
import Utils from "../../utils/utils";
import Log, {ErrorMessage} from "../../utils/log";

/**
 * Manage the events of mmp
 */
export default class Events {

    private dispatcher: Dispatch<any>;

    /**
     * Initialize the events
     */
    constructor() {
        let events = Utils.fromObjectToArray(Event);
        this.dispatcher = dispatch(...events);
    }

    /**
     * Invoke each registered callback for the specified event ( d3 function ).
     * @param {Event} event
     * @param {Object} parameters
     */
    public call(event: Event, ...parameters) {
        return this.dispatcher.call(event, ...parameters);
    }

    /**
     * Adds, removes or gets the callback for the specified event ( d3 function ).
     * @param {string} event
     * @param {Function} callback
     */
    public on = (event: string, callback) => {
        if (Event[event]) {
            return this.dispatcher.on(Event[event], callback);
        } else {
            Log.error(ErrorMessage.incorrectEvent)
        }
    };

}

export enum Event {
    create = "mmp-create",
    center = "mmp-center",
    undo = "mmp-undo",
    redo = "mmp-redo",
    nodeSelect = "mmp-node-select",
    nodeUpdate = "mmp-node-update",
    nodeCreate = "mmp-node-create",
    nodeRemove = "mmp-node-remove"
}
