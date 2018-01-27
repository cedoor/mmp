import Map from "../map";
import Node, {ExportNodeProperties, NodeProperties} from "../models/node";
import {Event} from "./events";
import Log, {ErrorMessage} from "../../utils/log";

export default class History {

    private map: Map;

    private index: number;
    private snapshots: MapSnapshot[];

    constructor(map: Map) {
        this.map = map;

        this.index = -1;
        this.snapshots = [];
    }

    /**
     * @name data
     * @return {MapSnapshot} [snapshot] - Last snapshot of the map.
     * @desc
     * Return last snapshot of the current map.
     */
    public data = (): MapSnapshot => {
        return this.snapshots[this.index];
    };

    /**
     * Replace old map with a new one or create a new empty map.
     * @param {MapSnapshot} snapshot
     */
    public new = (snapshot?: MapSnapshot) => {
        if (snapshot) {
            if (this.check(snapshot)) {
                this.redraw(snapshot);
                this.setCounter();
                this.map.events.call(Event.create);
                this.map.nodes.deselect(this.map.nodes.getSelectedNode());
                this.map.zoom.center();
                this.save();
            } else {
                Log.error(ErrorMessage.incorrectSnapshot);
            }
        } else {
            this.map.nodes.setCounter(0);
            this.map.nodes.clear();
            this.map.draw.clear();
            this.map.draw.update();
            this.map.events.call(Event.create);
            this.map.nodes.addRoot();
            this.map.zoom.center();
            this.save();
        }
    };

    /**
     * @name undo
     * @desc Undo last changes.
     */
    public undo = () => {
        if (this.index > 0) {
            this.redraw(this.snapshots[--this.index]);
            this.map.events.call(Event.undo);
        }
    };

    /**
     * @name redo
     * @desc Redo one change which was undone.
     */
    public redo = () => {
        if (this.index < this.snapshots.length - 1) {
            this.redraw(this.snapshots[++this.index]);
            this.map.events.call(Event.redo);
        }
    };

    /**
     * @name save
     * @desc Save the current snapshot of the mind map.
     */
    public save() {
        if (this.index < this.snapshots.length - 1) {
            this.snapshots.splice(this.index + 1);
        }
        this.snapshots.push(this.getSnapshot());
        this.index++;
    }

    /**
     *
     * @param {MapSnapshot} snapshot
     */
    private redraw(snapshot: MapSnapshot) {
        this.map.nodes.clear();

        snapshot.forEach((property: ExportNodeProperties) => {
            let properties: NodeProperties = {
                id: this.sanitizeNodeId(property.id),
                parent: this.map.nodes.getNode(this.sanitizeNodeId(property.parent)),
                k: property.k,
                name: property.name,
                coordinates: property.coordinates,
                image: property.image,
                backgroundColor: property.backgroundColor,
                textColor: property.textColor,
                branchColor: property.branchColor,
                fontSize: property.fontSize,
                italic: property.italic,
                bold: property.bold,
                locked: property.locked
            };

            let node: Node = new Node(properties);
            this.map.nodes.setNode(node.id, node);
        });

        this.map.draw.clear();
        this.map.draw.update();
    }

    /**
     * Return a copy of all fundamental node properties.
     * @return {MapSnapshot} properties - Copy of all node properties.
     */
    private getSnapshot(): MapSnapshot {
        return this.map.nodes.getNodes().map((node: Node) => node.getProperties());
    }

    /**
     * @name setCounter
     * @desc Set the right value of global counter.
     */
    private setCounter() {
        let id = this.map.nodes.getNodes().map((node: Node) => parseInt(node.id.split("_")[2]));
        this.map.nodes.setCounter(Math.max(...id));
    }

    /**
     * @name check
     * @param {Object} snapshot - A snapshot of mind map.
     * @return {boolean} result
     * @desc Check the snapshot structure and return true if it is authentic.
     */
    private check(snapshot: MapSnapshot): boolean {
        return snapshot.constructor === Array &&
            snapshot[0].id.split("_")[2] === "0" &&
            this.checkProperties(snapshot);
    }

    /**
     * Sanitize an old map node id with a new.
     * @param {string} oldId
     * @returns {string}
     */
    private sanitizeNodeId(oldId: string) {
        if (typeof oldId === "string") {
            let oldIdSplitted = oldId.split("_");
            return this.map.id + "_" + oldIdSplitted[1] + "_" + oldIdSplitted[2];
        }
    }

    /**
     * @name checkNodes
     * @param {Object} snapshot - A snapshot of mind map.
     * @return {boolean} result
     * @desc Check the snapshot nodes and return true if they are authentic.
     */
    private checkProperties(snapshot: MapSnapshot) {
        for (let properties of snapshot) {
            if (typeof properties.id !== "string" ||
                properties.constructor !== Object)
            // TODO, to improve
                return false;
        }
        return true;
    }

}

export interface MapSnapshot extends Array<ExportNodeProperties> {
}