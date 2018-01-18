import Utils from "../utils";
import Map from "./map";
import Zoom from "./zoom";
import Node, {ExportNodeProperties} from "../node/node";
import {Map as D3Map} from "d3-collection";
import Events from "./events";
import Draw from "./draw";

export default class History {

    map: Map;

    zoom: Zoom;
    events: Events;
    nodes: D3Map<Node>;
    draw: Draw;

    index: number;
    snapshots: MapSnapshot[];

    constructor(map: Map) {
        this.index = -1;
        this.snapshots = [];

        this.map = map;
        this.zoom = map.zoom;
        this.events = map.events;
        this.nodes = map.nodes;
        this.draw = map.draw;
    }

    /**
     * @name data
     * @return {MapSnapshot} [snapshot] - Last snapshot of the map.
     * @desc
     * Return last snapshot of the current map.
     */
    data = (): MapSnapshot => {
        return this.snapshots[this.index];
    };

    /**
     * @name new
     * @param {MapSnapshot} [snapshot] - A snapshot of the map.
     * @desc Replace old map with a new one or create a new empty map.
     */
    new = (snapshot?: MapSnapshot) => {
        if (snapshot) {
            if (this.check(snapshot)) {

                this.nodes.clear();
                snapshot.forEach((node) => {
                    this.nodes.set(node.key, Utils.cloneObject(node.value));
                });
                this.draw.clear();
                this.draw.update();
                this.setCounter();
                // deselect(); // TODO

                this.zoom.center();
                this.save();
            } else {
                Utils.error("The snapshot is incorrect");
            }
        } else {
            this.map.counter = 0;
            this.nodes.clear();
            this.draw.clear();
            this.draw.update();
            this.events.call("mmcreate");
            this.map.addRootNode();
            this.zoom.center();
            this.save();
        }
    };

    /**
     * @name undo
     * @desc Undo last changes.
     */
    undo = () => {
        if (this.index > 0) {
            this.new(this.snapshots[--this.index]);
            this.events.call("mmundo");
        }
    };

    /**
     * @name redo
     * @desc Redo one change which was undone.
     */
    redo = () => {
        if (this.index < this.snapshots.length - 1) {
            this.new(this.snapshots[++this.index]);
            this.events.call("mmundo");
        }
    };

    /**
     * @name save
     * @desc Save the current snapshot of the mind map.
     */
    save() {
        if (this.index < this.snapshots.length - 1) {
            this.snapshots.splice(this.index + 1);
        }
        this.snapshots.push(this.getSnapshot());
        this.index++;
    }

    /**
     * @name cloneNodes
     * @return {MapSnapshot} properties - Copy of all node properties.
     * @desc Return a copy of all fundamental node properties.
     */
    private getSnapshot(): MapSnapshot {
        return this.nodes.entries().map((entry) => {
            let properties = entry.value.getProperties();
            return {key: entry.key, value: properties};
        });
    }

    /**
     * @name setCounter
     * @desc Set the right value of global counter.
     */
    private setCounter() {
        let keys = this.nodes.keys().map(key => parseInt(key.split("_")[2]));
        this.map.counter = Math.max(...keys);
    }

    /**
     * @name check
     * @param {Object} snapshot - A snapshot of mind map.
     * @return {boolean} result
     * @desc Check the snapshot structure and return true if it is authentic.
     */
    private check(snapshot: MapSnapshot): boolean {
        let rootKey = this.map.id + "_node_0";

        return snapshot.constructor === Array &&
            snapshot[0].key === rootKey &&
            this.checkProperties(snapshot);
    }

    /**
     * @name checkNodes
     * @param {Object} snapshot - A snapshot of mind map.
     * @return {boolean} result
     * @desc Check the snapshot nodes and return true if they are authentic.
     */
    private checkProperties(snapshot: MapSnapshot) {
        for (let properties of snapshot) {
            if (typeof properties.key !== "string" ||
                properties.value.constructor !== Object)
            // ... to improve?
                return false;
        }
        return true;
    }

}

export interface MapSnapshot extends Array<{ key: string, value: ExportNodeProperties }> {
}