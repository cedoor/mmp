import Node, {Coordinates, ExportNodeProperties, NodeProperties, UserNodeProperties} from "../models/node";
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
        }) as NodeProperties;

        let node: Node = new Node(properties);

        this.nodes.set(properties.id, node);

        this.counter++;

        this.map.draw.update();

        this.map.events.call(Event.nodeCreate, node.dom, node.getProperties());

        this.deselectNode();
    }

    /**
     * Add a node in the map.
     * @param {UserNodeProperties} userProperties
     */
    public addNode = (userProperties?: UserNodeProperties) => {
        let properties: NodeProperties = Utils.mergeObjects(this.map.options.node, userProperties, true) as NodeProperties;

        properties.id = this.map.id + "_node_" + this.counter;
        properties.parent = this.selectedNode;

        let node: Node = new Node(properties);

        if (userProperties && userProperties.coordinates) {
            node.coordinates = Utils.mergeObjects({
                x: this.calculateXposition(node),
                y: this.calculateYposition(node)
            }, userProperties.coordinates, true) as Coordinates;
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

        this.map.events.call(Event.nodeCreate, node.dom, node.getProperties());
    };

    /**
     * Select a node or return the current selected node.
     * @param {string} id
     * @returns {ExportNodeProperties}
     */
    public selectNode = (id?: string): ExportNodeProperties => {
        if (id !== undefined) {
            if (typeof id !== "string") {
                Log.error("The parameter is not a string", "type");
            }

            if (!this.nodeSelectionTo(id)) {
                if (this.nodes.has(id)) {
                    let node = this.nodes.get(id),
                        background = node.getBackgroundDOM();

                    if (!background.style.stroke) {
                        if (this.selectedNode) {
                            this.selectedNode.getBackgroundDOM().style.stroke = "";
                        }

                        let color = d3.color(background.style.fill).darker(.5);
                        background.style.stroke = color.toString();

                        Utils.removeAllRanges();
                        this.selectedNode.getNameDOM().blur();

                        this.selectedNode = node;

                        this.map.events.call(Event.nodeSelect, node.dom, node.getProperties());
                    }
                } else {
                    Log.error("The node id or the direction is not correct");
                }
            }
        }

        return this.selectedNode.getProperties();
    };

    /**
     * Deselect the current selected node.
     */
    public deselectNode = () => {
        if (this.selectedNode) {
            this.selectedNode.getBackgroundDOM().style.stroke = "";
        }
        this.selectedNode = this.nodes.get(this.map.id + "_node_0");
    };

    /**
     * Update the properties of the selected node.
     * @param {string} property
     * @param value
     * @param {boolean} visual
     */
    public updateNode = (property: string, value: any, visual?: boolean) => {
        let properties = {
                name: this.updateNodeName,
                locked: this.updateNodeLockedStatus,
                coordinates: this.updateNodeCoordinates,
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
                    this.map.events.call(Event.nodeUpdate, this.selectedNode.dom, this.selectedNode.getProperties());
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

            this.map.events.call(Event.nodeRemove, null, this.selectedNode.getProperties());
        } else {
            Log.error(ErrorMessage.rootNodeDeletion);
        }
    };

    /**
     * Move the node selection in the direction passed as parameter.
     * @param {string} direction
     * @returns {boolean}
     */
    private nodeSelectionTo(direction: string): boolean {
        switch (direction) {
            case "up":
                this.moveSelectionOnLevel(true);
                return true;
            case "down":
                this.moveSelectionOnLevel(false);
                return true;
            case "left":
                this.moveSelectionOnBranch(true);
                return true;
            case "right":
                this.moveSelectionOnBranch(false);
                return true;
            default:
                return false;
        }
    };

    /**
     * Return the children of a node.
     * @param {Node} node
     * @returns {Node[]}
     */
    public getChildren(node: Node): Node[] {
        return this.nodes.values().filter((n: Node) => {
            return n.parent && n.parent.id === node.id;
        });
    }

    /**
     * Return the orientation of a node in the map (true if left).
     * @return {boolean}
     */
    public getOrientation(node: Node): boolean {
        if (!this.isRoot(node)) {
            let root = this.nodes.get(this.map.id + "_node_0");
            return node.coordinates.x < root.coordinates.x;
        }
    }

    /**
     * Return true if the node is the root or false.
     * @param {Node} node
     * @returns {boolean}
     */
    public isRoot(node: Node) {
        return node.id === this.map.id + "_node_0";
    }

    /**
     * Return the root node.
     * @returns {Node} rootNode
     */
    public getRoot(): Node {
        return this.nodes.get(this.map.id + "_node_0");
    }

    /**
     * Return all descendants of a node.
     * @returns {Node[]} nodes
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
     * Return the x coordinate of a node based on parent x coordinate.
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
     * Return an array of all nodes.
     * @returns {Node[]}
     */
    public getNodes(): Node[] {
        return this.nodes.values();
    }

    /**
     * Return the node with the id equal to key passed as parameter.
     * @param {string} key
     * @returns {Node}
     */
    public getNode(key: string): Node {
        return this.nodes.get(key);
    }

    /**
     * Set a node as a id-value copy.
     * @param {string} key
     * @param {Node} node
     */
    public setNode(key: string, node: Node) {
        this.nodes.set(key, node);
    }

    /**
     * Set the counter of the nodes.
     * @param {number} number
     */
    public setCounter(number: number) {
        this.counter = number;
    }

    /**
     * Return the current selected node.
     * @returns {Node}
     */
    public getSelectedNode(): Node {
        return this.selectedNode;
    }

    /**
     * Delete all nodes.
     */
    public clear() {
        this.nodes.clear();
    }

    /**
     * Return the lower node of a list of nodes.
     * @param {Node[]} nodes
     * @returns {Node} lowerNode
     */
    private getLowerNode(nodes: Node[] = this.nodes.values()): Node {
        let tmp = Number.MIN_VALUE, lowerNode;

        for (let node of nodes) {
            if (node.coordinates.y > tmp) {
                tmp = node.coordinates.y;
                lowerNode = node;
            }
        }

        return lowerNode;
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
            node.getNameDOM().innerHTML = value;

            this.map.draw.updateNodeShapes(node);

            if (!visual) {
                node.name = value;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node coordinates with a new value.
     * @param {Node} node
     * @param value
     * @returns {boolean}
     */
    private updateNodeCoordinates = (node: Node, value: any) => {
        let coordinates: Coordinates = Utils.mergeObjects(node.coordinates, value, true) as Coordinates;

        if (!(coordinates.x === node.coordinates.x && coordinates.y === node.coordinates.y)) {
            let oldOrientation = this.getOrientation(this.selectedNode),
                dx = node.coordinates.x - coordinates.x,
                dy = node.coordinates.y - coordinates.y;

            node.coordinates = Utils.cloneObject(coordinates) as Coordinates;

            node.dom.setAttribute("transform", "translate(" + [coordinates.x, coordinates.y] + ")");

            // TODO

            // If the node is locked move also descendants
            if (this.selectedNode.locked) {
                let root = this.selectedNode,
                    descendants = this.getDescendants(this.selectedNode),
                    newOrientation = this.getOrientation(this.selectedNode);

                for (let node of descendants) {
                    let x = node.coordinates.x += dx, y = node.coordinates.y += dy;

                    if (oldOrientation !== newOrientation) {
                        x = node.coordinates.x += (root.coordinates.x - node.coordinates.x) * 2;
                    }

                    node.dom.setAttribute("transform", "translate(" + [x, y] + ")");
                }
            }

            d3.selectAll("." + this.map.id + "_branch").attr("d", (node: Node) => {
                return <any>this.map.draw.drawBranch(node);
            });
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
            let background = node.getBackgroundDOM();

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
            node.getNameDOM().style["color"] = value;

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
            node.getNameDOM().style["font-size"] = value + "px";

            this.map.draw.updateNodeShapes(node);

            if (node.image.src !== "") {
                let image = node.getImageDOM(),
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
                let image = node.getImageDOM(),
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
        node.getNameDOM().style["font-style"] = Utils.fontStyle(node.italic = !node.italic);
    };

    /**
     * Update the node font wight.
     * @param {Node} node
     * @returns {boolean}
     */
    private updateNodeBoldFont = (node: Node) => {
        node.getNameDOM().style["font-weight"] = Utils.fontWeight(node.bold = !node.bold);

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

    /**
     * Move the node selection on the level of the current node (true: up).
     * @param {boolean} direction
     */
    private moveSelectionOnLevel(direction: boolean) {
        if (!this.isRoot(this.selectedNode)) {
            let siblings = this.getChildren(this.selectedNode.parent).filter((node: Node) => {
                return direction === node.coordinates.y < this.selectedNode.coordinates.y &&
                    node.id !== this.selectedNode.id;
            });

            if (this.isRoot(this.selectedNode.parent)) {
                siblings = siblings.filter((node: Node) => {
                    return this.getOrientation(node) === this.getOrientation(this.selectedNode);
                });
            }

            if (siblings.length > 0) {
                let closerNode: Node = siblings[0],
                    tmp = Math.abs(siblings[0].coordinates.y - this.selectedNode.coordinates.y);

                for (let node of siblings) {
                    let distance = Math.abs(node.coordinates.y - this.selectedNode.coordinates.y);

                    if (distance < tmp) {
                        tmp = distance;
                        closerNode = node;
                    }
                }

                this.selectNode(closerNode.id);
            }
        }
    }

    /**
     * Move the node selection in a child node or in the parent node (true: left)
     * @param {boolean} direction
     */
    private moveSelectionOnBranch(direction: boolean) {
        if ((this.getOrientation(this.selectedNode) === false && direction) ||
            (this.getOrientation(this.selectedNode) === true && !direction)) {
            this.selectNode(this.selectedNode.parent.id);
        } else {
            let children = this.getChildren(this.selectedNode);

            if (this.getOrientation(this.selectedNode) === undefined) {
                // The selected node is the root
                children = children.filter((node: Node) => {
                    return this.getOrientation(node) === direction;
                });
            }

            let lowerNode = this.getLowerNode(children);

            if (children.length > 0) {
                this.selectNode(lowerNode.id);
            }
        }
    }

}