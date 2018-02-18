import {dispatch} from "d3";
import {Dispatch} from "d3-dispatch";
import Utils from "../../utils/utils";
import Log from "../../utils/log";

/**
 * Manage the events of the map.
 */
export default class Events {

    private dispatcher: Dispatch<any>;

    /**
     * Initialize the events.
     */
    constructor() {
        let events = Utils.fromObjectToArray(Event);

        this.dispatcher = dispatch(...events);
    }

    /**
     * Call all registered callbacks for specified map event.
     * @param {Event} event
     * @param parameters
     */
    public call(event: Event, ...parameters) {
        return this.dispatcher.call(event, ...parameters);
    }

    /**
     * Add a callback for specific map event.
     * @param {string} event
     * @param {Function} callback
     */
    public on = (event: string, callback: Function) => {
        if (typeof event !== "string") {
            Log.error("The event must be a string", "type");
        }

        if (!Event[event]) {
            Log.error("The event does not exist");
        }

        this.dispatcher.on(Event[event], <any>callback);
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
