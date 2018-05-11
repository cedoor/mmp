import Map from "../map";
import Node, {Colors, Coordinates, ExportNodeProperties, Font, Image, NodeProperties} from "../models/node";
import {Event} from "./events";
import Log from "../../utils/log";
import Utils from "../../utils/utils";

/**
 * Manage map history, for each change save a snapshot.
 */
export default class History {

    private map: Map;

    private index: number;
    private snapshots: MapSnapshot[];

    /**
     * Get the associated map instance, initialize index and snapshots.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;

        this.index = -1;
        this.snapshots = [];
    }

    /**
     * Return last snapshot of the current map.
     * @return {MapSnapshot} [snapshot] - Last snapshot of the map.
     */
    public current = (): MapSnapshot => {
        return this.snapshots[this.index];
    };

    /**
     * Replace old map with a new one or create a new empty map.
     * @param {MapSnapshot} snapshot
     */
    public new = (snapshot?: MapSnapshot) => {
        if (snapshot === undefined) {
            let oldRootCoordinates = Utils.cloneObject(this.map.nodes.getRoot().coordinates);

            this.map.nodes.setCounter(0);

            this.map.nodes.clear();

            this.map.draw.clear();
            this.map.draw.update();

            this.map.nodes.addRootNode(oldRootCoordinates);

            this.map.zoom.center(null, 0);

            this.save();

            this.map.events.call(Event.create);
        } else if (this.checkSnapshotStructure(snapshot)) {
            this.redraw(snapshot);

            this.map.zoom.center("position", 0);

            this.save();

            this.map.events.call(Event.create);
        } else {
            Log.error("The snapshot is not correct");
        }
    };

    /**
     * Undo last changes.
     */
    public undo = () => {
        if (this.index > 0) {
            this.redraw(this.snapshots[--this.index]);
            this.map.events.call(Event.undo);
        }
    };

    /**
     * Redo one change which was undone.
     */
    public redo = () => {
        if (this.index < this.snapshots.length - 1) {
            this.redraw(this.snapshots[++this.index]);
            this.map.events.call(Event.redo);
        }
    };

    /**
     * Save the current snapshot of the mind map.
     */
    public save() {
        if (this.index < this.snapshots.length - 1) {
            this.snapshots.splice(this.index + 1);
        }

        this.snapshots.push(this.getSnapshot());
        this.index++;
    }

    /**
     * Return all history of map with all snapshots.
     * @returns {MapSnapshot[]}
     */
    public getHistory = (): ExportHistory => {
        return {
            snapshots: this.snapshots.slice(0),
            index: this.index
        };
    };

    /**
     * Redraw the map with a new snapshot.
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
                coordinates: Utils.cloneObject(property.coordinates) as Coordinates,
                image: Utils.cloneObject(property.image) as Image,
                colors: Utils.cloneObject(property.colors) as Colors,
                font: Utils.cloneObject(property.font) as Font,
                locked: property.locked
            };

            let node: Node = new Node(properties);
            this.map.nodes.setNode(node.id, node);
        });

        this.map.draw.clear();
        this.map.draw.update();

        this.map.nodes.selectRootNode();

        this.setCounter();
    }

    /**
     * Return a copy of all fundamental node properties.
     * @return {MapSnapshot} properties
     */
    private getSnapshot(): MapSnapshot {
        return this.map.nodes.getNodes().map((node: Node) => {
            return this.map.nodes.getNodeProperties(node, false);
        }).slice();
    }

    /**
     * Set the right counter value of the nodes.
     */
    private setCounter() {
        let id = this.map.nodes.getNodes().map((node: Node) => parseInt(node.id.split("_")[2]));
        this.map.nodes.setCounter(Math.max(...id) + 1);
    }

    /**
     * Sanitize an old map node id with a new.
     * @param {string} oldId
     * @returns {string} newId
     */
    private sanitizeNodeId(oldId: string) {
        if (typeof oldId === "string") {
            let oldIdSplitted = oldId.split("_");
            return this.map.id + "_" + oldIdSplitted[1] + "_" + oldIdSplitted[2];
        }
    }

    /**
     * Check the snapshot structure and return true if it is authentic.
     * @param {MapSnapshot} snapshot
     * @return {boolean} result
     */
    private checkSnapshotStructure(snapshot: MapSnapshot): boolean {
        if (!Array.isArray(snapshot)) {
            return false;
        }

        if (((<any>snapshot[0]).key && (<any>snapshot[0]).value)) {
            this.convertOldMmp(snapshot);
        }

        for (let node of snapshot) {
            if (!this.checkNodeProperties(node)) {
                return false;
            }
        }

        this.translateNodePositions(snapshot);

        return true;
    }

    /**
     * Check the snapshot node properties and return true if they are authentic.
     * @param {ExportNodeProperties} node
     * @return {boolean} result
     */
    private checkNodeProperties(node: ExportNodeProperties) {
        let conditions: boolean[] = [
            typeof node.id === "string",
            typeof node.parent === "string",
            typeof node.k === "number",
            typeof node.name === "string",
            typeof node.locked === "boolean",
            node.coordinates
            && typeof node.coordinates.x === "number"
            && typeof node.coordinates.y === "number",
            node.image
            && typeof node.image.size === "number"
            && typeof node.image.src === "string",
            node.colors
            && typeof node.colors.background === "string"
            && typeof node.colors.branch === "string"
            && typeof node.colors.name === "string",
            node.font
            && typeof node.font.size === "number"
            && typeof node.font.weight === "string"
            && typeof node.font.style === "string"
        ];

        return conditions.every(condition => condition);
    }

    /**
     * Convert the old mmp (version: 0.1.7) snapshot to new.
     * @param {Array} snapshot
     */
    private convertOldMmp(snapshot: Array<any>) {
        for (let node of snapshot) {
            let oldNode = Utils.cloneObject(node);
            Utils.clearObject(node);

            node.id = "map_node_" + oldNode.key.substr(4);
            node.parent = oldNode.value.parent ? "map_node_" + oldNode.value.parent.substr(4) : "";
            node.k = oldNode.value.k;
            node.name = oldNode.value.name;
            node.locked = oldNode.value.fixed;
            node.coordinates = {
                x: oldNode.value.x,
                y: oldNode.value.y
            };
            node.image = {
                size: parseInt(oldNode.value["image-size"]),
                src: oldNode.value["image-src"]
            };
            node.colors = {
                background: oldNode.value["background-color"],
                branch: oldNode.value["branch-color"] || "",
                name: oldNode.value["text-color"]
            };
            node.font = {
                size: parseInt(oldNode.value["font-size"]),
                weight: oldNode.value.bold ? "bold" : "normal",
                style: oldNode.value.italic ? "italic" : "normal"
            };
        }
    }

    /**
     * Adapt the coordinates to the old map.
     * @param {MapSnapshot} snapshot
     */
    private translateNodePositions(snapshot: MapSnapshot) {
        let oldRootNode = this.map.nodes.getRoot(),
            newRootNode = (<any>snapshot).find((node: ExportNodeProperties) => {
                return node.id.split("_")[2] === "0";
            }),
            dx = newRootNode.coordinates.x - oldRootNode.coordinates.x,
            dy = newRootNode.coordinates.y - oldRootNode.coordinates.y;

        for (let node of snapshot) {
            node.coordinates.x -= dx;
            node.coordinates.y -= dy;
        }
    }

}

export interface ExportHistory {
    snapshots: Array<MapSnapshot>,
    index: number
}

export interface MapSnapshot extends Array<ExportNodeProperties> {
}