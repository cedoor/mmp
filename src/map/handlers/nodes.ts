import Node, {ExportNodeProperties, NodeProperties, UserNodeProperties} from "../models/node";
import Map from "../map";
import * as d3 from "d3";
import {Map as D3Map} from "d3-collection";
import {Event} from "./events";
import Log, {ErrorMessage} from "../../utils/log";
import Utils from "../../utils/utils";

/**
 * Manage the nodes of the map.
 */
export default class Nodes {

    private map: Map;

    private counter: number;
    private nodes: D3Map<Node>;
    private selectedNode: Node;

    /**
     * Get the associated map instance and initialize counter and nodes.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;

        this.counter = 0;
        this.nodes = d3.map();
    }

    /**
     * Add the root node to the map.
     */
    public addRootNode() {
        let properties: NodeProperties = Utils.mergeObjects(this.map.options.rootNode, {
            coordinates: {
                x: parseInt(this.map.dom.container.style("width")) / 2,
                y: parseInt(this.map.dom.container.style("height")) / 2
            },
            id: this.map.id + "_node_" + this.counter
        });

        let node: Node = new Node(properties);

        this.nodes.set(properties.id, node);

        this.counter++;

        this.map.draw.update();

        this.map.history.save();

        this.map.events.call(Event.nodeCreate, node.dom, node.id, node.getProperties());

        this.deselectNode();
    }

    /**
     * Add a node in the map.
     * @param {UserNodeProperties} userProperties
     */
    public addNode = (userProperties?: UserNodeProperties) => {
        let properties: NodeProperties = Utils.mergeObjects(this.map.options.node, userProperties);

        properties.id = this.map.id + "_node_" + this.counter;
        properties.parent = this.selectedNode;

        let node: Node = new Node(properties);

        if (userProperties && userProperties.coordinates) {
            node.coordinates = Utils.mergeObjects({
                x: this.calculateXposition(node),
                y: this.calculateYposition(node)
            }, userProperties.coordinates);
        } else {
            node.coordinates = {
                x: this.calculateXposition(node),
                y: this.calculateYposition(node)
            };
        }

        this.nodes.set(properties.id, node);

        this.counter++;

        this.map.draw.update();

        this.map.history.save();

        this.map.events.call(Event.nodeCreate, node.dom, node.id, node.getProperties());

        this.selectNode(node.id);
        Utils.focusWithCaretAtEnd(node.getDOMText());
    };

    /**
     * Select a node or return the current selected node.
     * @param {string} key
     * @returns {ExportNodeProperties}
     */
    public selectNode = (key?: string): ExportNodeProperties => {
        if (key) {
            if (this.nodes.has(key)) {
                let node = this.nodes.get(key),
                    background = node.getDOMBackground();

                if (!background.style.stroke) {
                    if (this.selectedNode) {
                        this.selectedNode.getDOMBackground().style.stroke = "";
                    }

                    let color = d3.color(background.style.fill).darker(.5);
                    background.style.stroke = color.toString();

                    Utils.removeAllRanges();

                    this.selectedNode = node;

                    this.map.events.call(Event.nodeSelect, node.dom, node.id, node.getProperties());
                }
            } else {
                Log.error(ErrorMessage.incorrectKey);
            }
        }

        return this.selectedNode.getProperties();
    };

    /**
     *
     */
    public deselectNode() {
        if (this.selectedNode) {
            this.selectedNode.getDOMBackground().style.stroke = "";
        }
        this.selectedNode = this.nodes.get(this.map.id + "_node_0");
    }

    /**
     * Update the properties of the selected node.
     * @param {string} property
     * @param {any} value
     * @param {boolean} visual
     */
    public updateNode = (property: string, value: any, visual?: boolean) => {
        let properties = {
                name: this.updateNodeName,
                locked: this.updateNodeLockedStatus,
                backgroundColor: this.updateNodeBackgroundColor,
                branchColor: this.updateNodeBranchColor,
                textColor: this.updateNodeTextColor,
                imageSrc: this.updateNodeImageSrc,
                imageSize: this.updateNodeImageSize,
                fontSize: this.updateNodeFontSize,
                italic: this.updateNodeItalicFont,
                bold: this.updateNodeBoldFont
            },
            func = properties[property];

        if (func !== undefined) {
            if (func(this.selectedNode, value, visual) !== false) {
                if (!visual) {
                    this.map.history.save();
                    this.map.events.call(Event.nodeUpdate, this.selectedNode.dom, this.selectedNode.id, this.selectedNode.getProperties(), property);
                }
            }
        } else {
            Log.error(ErrorMessage.incorrectUpdateProperty);
        }
    };

    /**
     * Remove the selected node.
     */
    public removeNode = () => {
        if (!this.isRoot(this.selectedNode)) {
            this.nodes.remove(this.selectedNode.id);

            this.getDescendants(this.selectedNode).forEach((node: Node) => {
                this.nodes.remove(node.id);
            });

            this.deselectNode();

            this.map.draw.clear();
            this.map.draw.update();

            this.map.history.save();

            this.map.events.call(Event.nodeRemove, null, this.selectedNode.id);
        } else {
            Log.error(ErrorMessage.rootNodeDeletion);
        }
    };

    /**
     *
     * @param {Node} node
     * @returns {Node[]}
     */
    public getChildren(node: Node): Node[] {
        return this.nodes.values().filter((n: Node) => {
            return n.parent && n.parent.id === node.id;
        });
    }

    /**
     * Return the orientation of a node in the map (true if left)
     * @return {boolean}
     */
    public getOrientation(node: Node): boolean {
        if (!this.isRoot(node)) {
            let root = this.nodes.get(this.map.id + "_node_0");
            return node.coordinates.x < root.coordinates.x;
        }
    }

    public isRoot(node: Node) {
        return node.id === this.map.id + "_node_0";
    }

    /**
     * Return the root node.
     * @returns {Node}
     */
    public getRoot(): Node {
        return this.nodes.get(this.map.id + "_node_0");
    }

    /**
     *
     * @returns {Node[]}
     */
    public getDescendants(node: Node): Node[] {
        let nodes = [];
        this.getChildren(node).forEach((node: Node) => {
            nodes.push(node);
            nodes = nodes.concat(this.getDescendants(node));
        });
        return nodes;
    }

    /**
     * Return the x coordinate of a node based on parent x coordinate
     * @returns {number}
     */
    public calculateXposition(node: Node): number {
        if (this.isRoot(node.parent)) {
            let root = this.nodes.get(this.map.id + "_node_0");
            return node.parent.coordinates.x + 200 * (this.getChildren(root).length % 2 === 0 ? -1 : 1);
        } else {
            return node.parent.coordinates.x + 200 * (this.getOrientation(node.parent) ? -1 : 1);
        }
    }

    /**
     * Return the y coordinate of a node based on parent y coordinate.
     * @return {number}
     */
    public calculateYposition(node: Node): number {
        let siblings = this.getChildren(node.parent);

        if (siblings.length > 0) {
            let min = siblings[0].coordinates.y;

            siblings.forEach((node: Node) => {
                if (node.coordinates.y > min) {
                    min = node.coordinates.y;
                }
            });

            return min + (this.isRoot(node.parent) ? 30 : 60);
        } else {
            return node.parent.coordinates.y - 120;
        }
    }

    /**
     *
     * @returns {Node[]}
     */
    public getNodes(): Node[] {
        return this.nodes.values();
    }

    /**
     *
     * @param {string} key
     * @returns {Node}
     */
    public getNode(key: string): Node {
        return this.nodes.get(key);
    }

    /**
     *
     * @param {string} key
     * @param {Node} node
     */
    public setNode(key: string, node: Node) {
        this.nodes.set(key, node);
    }

    /**
     *
     * @param {number} number
     */
    public setCounter(number: number) {
        this.counter = number;
    }

    /**
     *
     * @returns {Node}
     */
    public getSelectedNode(): Node {
        return this.selectedNode;
    }

    public clear() {
        this.nodes.clear();
    }

    /**
     * Update the node name with a new value.
     * @param {Node} node
     * @param value
     * @param {boolean} visual
     * @returns {boolean}
     */
    private updateNodeName = (node: Node, value: any, visual?: boolean) => {
        if (node.name != value || visual) {
            node.getDOMText().innerHTML = value;

            this.map.draw.updateNodeShapes(node);

            if (!visual) {
                node.name = value;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node background color with a new value.
     * @param {Node} node
     * @param value
     * @param {boolean} visual
     * @returns {boolean}
     */
    private updateNodeBackgroundColor = (node: Node, value: any, visual?: boolean) => {
        if (node.backgroundColor !== value || visual) {
            let background = node.getDOMBackground();

            background.style["fill"] = value;

            if (background.style["stroke"] !== "") {
                background.style["stroke"] = d3.color(value).darker(.5).toString();
            }

            if (!visual) {
                node.backgroundColor = value;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node text color with a new value.
     * @param {Node} node
     * @param value
     * @param {boolean} visual
     * @returns {boolean}
     */
    private updateNodeTextColor = (node: Node, value: any, visual?: boolean) => {
        if (node.textColor !== value || visual) {
            node.getDOMText().style["color"] = value;

            if (!visual) {
                node.textColor = value;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node branch color with a new value.
     * @param {Node} node
     * @param value
     * @param {boolean} visual
     * @returns {boolean}
     */
    private updateNodeBranchColor = (node: Node, value: any, visual?: boolean) => {
        if (!this.isRoot(node)) {
            if (node.branchColor !== value || visual) {
                let branch = document.getElementById(node.id + "_branch");

                branch.style["fill"] = branch.style["stroke"] = value;

                if (!visual) {
                    node.branchColor = value;
                }
            } else {
                return false;
            }
        } else {
            Log.error(ErrorMessage.rootNodeBranches);
        }
    };

    /**
     * Update the node font size with a new value.
     * @param {Node} node
     * @param value
     * @param {boolean} visual
     * @returns {boolean}
     */
    private updateNodeFontSize = (node: Node, value: any, visual?: boolean) => {
        if (node.fontSize != value || visual) {
            node.getDOMText().style["font-size"] = value + "px";

            this.map.draw.updateNodeShapes(node);

            if (node.image.src !== "") {
                let image = node.getDOMImage(),
                    y = -((<any>image).getBBox().height + node.dimensions.height / 2 + 5);
                image.setAttribute("y", y.toString());
            }

            if (!visual) {
                node.fontSize = value;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node image size with a new value.
     * @param {Node} node
     * @param value
     * @param {boolean} visual
     * @returns {boolean}
     */
    private updateNodeImageSize = (node: Node, value: any, visual?: boolean) => {
        if (node.image.src !== "") {
            if (node.image.size != value || visual) {
                let image = node.getDOMImage(),
                    box = (<any>image).getBBox(),
                    height = parseInt(value),
                    width = box.width * height / box.height,
                    y = -(height + node.dimensions.height / 2 + 5),
                    x = -width / 2;

                image.setAttribute("height", height.toString());
                image.setAttribute("width", width.toString());
                image.setAttribute("y", y.toString());
                image.setAttribute("x", x.toString());

                if (!visual) {
                    node.image.size = height;
                }
            } else {
                return false;
            }
        } else Log.error(ErrorMessage.nodeEmptyImage);
    };

    /**
     * Update the node image src with a new value.
     * @param {Node} node
     * @param value
     * @returns {boolean}
     */
    private updateNodeImageSrc = (node: Node, value: any) => {
        if (node.image.src !== value) {
            node.image.src = value;

            this.map.draw.setImage(node);
        } else {
            return false;
        }
    };

    /**
     * Update the node font style.
     * @param {Node} node
     * @returns {boolean}
     */
    private updateNodeItalicFont = (node: Node) => {
        node.getDOMText().style["font-style"] = Utils.fontStyle(node.italic = !node.italic);
    };

    /**
     * Update the node font wight.
     * @param {Node} node
     * @returns {boolean}
     */
    private updateNodeBoldFont = (node: Node) => {
        node.getDOMText().style["font-weight"] = Utils.fontWeight(node.bold = !node.bold);

        this.map.draw.updateNodeShapes(node);
    };

    /**
     * Update the node locked status.
     * @param {Node} node
     * @returns {boolean}
     */
    private updateNodeLockedStatus = (node: Node) => {
        if (!this.isRoot(node)) {
            node.locked = !node.locked;
        } else {
            Log.error(ErrorMessage.rootNodeLocking);
        }
    };

}