import Map from "../map";
import Node, {Coordinates, ExportNodeProperties} from "../models/node";
import Log from "../../utils/log";
import Utils from "../../utils/utils";

/**
 * Manage the drag events of the nodes.
 */
export default class CopyPaste {

    private map: Map;

    private copiedNodes: ExportNodeProperties[];

    /**
     * Get the associated map instance.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;
    }

    /**
     *
     * @param {string} id
     */
    public copy = (id: string) => {
        if (id && typeof id !== "string") {
            Log.error("The node id must be a string", "type");
        }

        let node: Node = id ? this.map.nodes.getNode(id) : this.map.nodes.getSelectedNode();

        if (node === undefined) {
            Log.error("There are no nodes with id \"" + id + "\"");
        }

        if (!node.isRoot()) {
            this.copiedNodes = [this.map.nodes.getNodeProperties(node, false)];

            this.map.nodes.getDescendants(node).forEach((node: Node) => {
                this.copiedNodes.push(this.map.nodes.getNodeProperties(node, false));
            });
        } else {
            Log.error("The root node can not be copied");
        }
    };

    /**
     *
     * @param {string} id
     */
    public cut = (id: string) => {
        if (id && typeof id !== "string") {
            Log.error("The node id must be a string", "type");
        }

        let node: Node = id ? this.map.nodes.getNode(id) : this.map.nodes.getSelectedNode();

        if (node === undefined) {
            Log.error("There are no nodes with id \"" + id + "\"");
        }

        if (!node.isRoot()) {
            this.copiedNodes = [this.map.nodes.getNodeProperties(node, false)];

            this.map.nodes.getDescendants(node).forEach((node: Node) => {
                this.copiedNodes.push(this.map.nodes.getNodeProperties(node, false));
            });
        } else {
            Log.error("The root node can not be cut");
        }
    };

    /**
     *
     * @param {string} id
     */
    public paste = (id: string) => {
        if (this.copiedNodes === undefined) {
            Log.error("There are not nodes in the mmp clipboard");
        }

        if (id && typeof id !== "string") {
            Log.error("The node id must be a string", "type");
        }

        let node: Node = id ? this.map.nodes.getNode(id) : this.map.nodes.getSelectedNode();

        if (node === undefined) {
            Log.error("There are no nodes with id \"" + id + "\"");
        }

        let addNodes = (nodeProperties: ExportNodeProperties, newParentNodeId: string) => {
            let coordinates: Coordinates;
            if (nodeProperties.id !== this.copiedNodes[0].id) {
                coordinates = {x: 0, y: 0};

                let newParent = this.map.nodes.getNode(newParentNodeId);
                let oldParent = (<any>this.copiedNodes).find((np) => {
                    return np.id === nodeProperties.parent;
                });

                let dx = oldParent.coordinates.x - nodeProperties.coordinates.x;
                let dy = oldParent.coordinates.y - nodeProperties.coordinates.y;

                let newParentOrientation = this.map.nodes.getOrientation(newParent);
                let oldParentOrientation = oldParent.coordinates.x < this.map.nodes.getRoot().coordinates.x;

                if (oldParentOrientation !== newParentOrientation) {
                    dx = -dx;
                }

                coordinates.x = newParent.coordinates.x - dx;
                coordinates.y = newParent.coordinates.y - dy;

                coordinates = this.map.nodes.fixCoordinates(coordinates, true);
            }

            let nodePropertiesCopy = Utils.cloneObject(nodeProperties);
            this.map.nodes.addNode({
                name: nodePropertiesCopy.name,
                coordinates: coordinates,
                image: nodePropertiesCopy.image,
                colors: nodePropertiesCopy.colors,
                font: nodePropertiesCopy.font,
                locked: nodePropertiesCopy.locked
            }, newParentNodeId);

            let children = this.copiedNodes.filter((np: ExportNodeProperties) => {
                return np.parent === nodeProperties.id;
            });

            // If there are children add them.
            if (children.length > 0) {
                newParentNodeId = this.map.id + "_node_" + (this.map.nodes.getCounter() - 1);
                children.forEach((np: ExportNodeProperties) => {
                    addNodes(np, newParentNodeId);
                });
            }
        };

        addNodes(this.copiedNodes[0], node.id);
    };

}