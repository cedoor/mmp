import Utils from "../utils";
import Map from "./map";
import Node, {ExportNodeProperties, NodeProperties, UserNodeProperties} from "../node/node";

export default class History {

    map: Map;

    index: number;
    snapshots: MapSnapshot[];

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
    data = (): MapSnapshot => {
        return this.snapshots[this.index];
    };

    /**
     * Replace old map with a new one or create a new empty map.
     * @param {MapSnapshot} snapshot
     */
    new = (snapshot?: MapSnapshot) => {
        if (snapshot) {
            if (this.check(snapshot)) {
                this.redraw(snapshot);
                this.setCounter();
                this.map.events.call("mmcreate");
                this.map.selectedNode.deselect();
                this.map.zoom.center();
                this.save();
            } else {
                Utils.error("The snapshot is incorrect");
            }
        } else {
            this.map.counter = 0;
            this.map.nodes.clear();
            this.map.draw.clear();
            this.map.draw.update();
            this.map.events.call("mmcreate");
            this.map.addRootNode();
            this.map.zoom.center();
            this.save();
        }
    };

    /**
     * @name undo
     * @desc Undo last changes.
     */
    undo = () => {
        if (this.index > 0) {
            this.redraw(this.snapshots[--this.index]);
            this.map.events.call("mmundo");
        }
    };

    /**
     * @name redo
     * @desc Redo one change which was undone.
     */
    redo = () => {
        if (this.index < this.snapshots.length - 1) {
            this.redraw(this.snapshots[++this.index]);
            this.map.events.call("mmundo");
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
     *
     * @param {MapSnapshot} snapshot
     */
    redraw(snapshot: MapSnapshot) {
        this.map.nodes.clear();

        snapshot.forEach((entry) => {
            let properties: NodeProperties = {
                id: this.sanitizeNodeId(entry.value.id),
                parent: this.map.nodes.get(this.sanitizeNodeId(entry.value.parent)),
                k: entry.value.k
            }, userProperties: UserNodeProperties = {
                name: entry.value.name,
                dimensions: entry.value.dimensions,
                coordinates: entry.value.coordinates,
                image: entry.value.image,
                backgroundColor: entry.value.backgroundColor,
                textColor: entry.value.textColor,
                branchColor: entry.value.branchColor,
                fontSize: entry.value.fontSize,
                italic: entry.value.italic,
                bold: entry.value.bold,
                locked: entry.value.locked
            };

            let node: Node = new Node(properties, userProperties, this.map);
            this.map.nodes.set(node.id, node);
        });

        this.map.draw.clear();
        this.map.draw.update();
    }

    /**
     * @name cloneNodes
     * @return {MapSnapshot} properties - Copy of all node properties.
     * @desc Return a copy of all fundamental node properties.
     */
    private getSnapshot(): MapSnapshot {
        return this.map.nodes.entries().map((entry) => {
            let properties = entry.value.getProperties();
            return {key: entry.key, value: properties};
        });
    }

    /**
     * @name setCounter
     * @desc Set the right value of global counter.
     */
    private setCounter() {
        let keys = this.map.nodes.keys().map(key => parseInt(key.split("_")[2]));
        this.map.counter = Math.max(...keys);
    }

    /**
     * @name check
     * @param {Object} snapshot - A snapshot of mind map.
     * @return {boolean} result
     * @desc Check the snapshot structure and return true if it is authentic.
     */
    private check(snapshot: MapSnapshot): boolean {
        return snapshot.constructor === Array &&
            snapshot[0].key.split("_")[2] === "0" &&
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
            if (typeof properties.key !== "string" ||
                properties.value.constructor !== Object)
            // TODO, to improve
                return false;
        }
        return true;
    }

}

export interface MapSnapshot extends Array<{ key: string, value: ExportNodeProperties }> {
}