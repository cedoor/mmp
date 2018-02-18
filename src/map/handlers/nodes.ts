import Node, {Coordinates, ExportNodeProperties, NodeProperties, UserNodeProperties} from "../models/node";
import Map from "../map";
import * as d3 from "d3";
import {Map as D3Map} from "d3-collection";
import {Event} from "./events";
import Log from "../../utils/log";
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
            id: this.map.id + "_node_" + this.counter,
            parent: null
        }) as NodeProperties;

        let node: Node = new Node(properties);

        this.nodes.set(properties.id, node);

        this.counter++;

        this.map.draw.update();

        this.map.events.call(Event.nodeCreate, node.dom, this.getNodeProperties(node));

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

        node.coordinates = {
            x: this.calculateXposition(node),
            y: this.calculateYposition(node)
        };

        if (userProperties && userProperties.coordinates) {
            let fixedCoordinates = this.fixCoordinates(userProperties.coordinates);

            node.coordinates = Utils.mergeObjects(node.coordinates, fixedCoordinates, true) as Coordinates;
        }

        this.nodes.set(properties.id, node);

        this.counter++;

        this.map.draw.update();

        this.map.history.save();

        this.map.events.call(Event.nodeCreate, node.dom, this.getNodeProperties(node));
    };

    /**
     * Select a node or return the current selected node.
     * @param {string} id
     * @returns {ExportNodeProperties}
     */
    public selectNode = (id?: string): ExportNodeProperties => {
        if (id !== undefined) {
            if (typeof id !== "string") {
                Log.error("The node id must be a string", "type");
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

                        this.map.events.call(Event.nodeSelect, node.dom, this.getNodeProperties(node));
                    }
                } else {
                    Log.error("The node id or the direction is not correct");
                }
            }
        }

        return this.getNodeProperties(this.selectedNode);
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
     * @param {boolean} graphic
     */
    public updateNode = (property: string, value: any, graphic: boolean = false) => {
        if (typeof property !== "string") {
            Log.error("The property must be a string", "type");
        }

        let updated: any;

        switch (property) {
            case "name":
                updated = this.updateNodeName(this.selectedNode, value, graphic);
                break;
            case "locked":
                updated = this.updateNodeLockedStatus(this.selectedNode, value);
                break;
            case "coordinates":
                updated = this.updateNodeCoordinates(this.selectedNode, value);
                break;
            case "imageSrc":
                updated = this.updateNodeImageSrc(this.selectedNode, value);
                break;
            case "imageSize":
                updated = this.updateNodeImageSize(this.selectedNode, value, graphic);
                break;
            case "backgroundColor":
                updated = this.updateNodeBackgroundColor(this.selectedNode, value, graphic);
                break;
            case "branchColor":
                updated = this.updateNodeBranchColor(this.selectedNode, value, graphic);
                break;
            case "fontWeight":
                updated = this.updateNodeFontWeight(this.selectedNode, value, graphic);
                break;
            case "fontStyle":
                updated = this.updateNodeFontStyle(this.selectedNode, value, graphic);
                break;
            case "fontSize":
                updated = this.updateNodeFontSize(this.selectedNode, value, graphic);
                break;
            case "nameColor":
                updated = this.updateNodeNameColor(this.selectedNode, value, graphic);
                break;
            default:
                Log.error("The property does not exist");
        }

        if (graphic === false && updated !== false) {
            this.map.history.save();
            this.map.events.call(Event.nodeUpdate, this.selectedNode.dom, this.getNodeProperties(this.selectedNode));
        }
    };

    /**
     * Remove the selected node.
     * @param {string} id
     */
    public removeNode = (id?: string) => {
        if (id && typeof id !== "string") {
            Log.error("The node id must be a string", "type");
        }

        let node: Node = id ? this.getNode(id) : this.selectedNode;

        if (node === undefined) {
            Log.error("There are no nodes with id \"" + id + "\"");
        }

        if (!this.isRoot(node)) {
            this.nodes.remove(node.id);

            this.getDescendants(node).forEach((node: Node) => {
                this.nodes.remove(node.id);
            });

            this.deselectNode();

            this.map.draw.clear();
            this.map.draw.update();

            this.map.history.save();

            this.map.events.call(Event.nodeRemove, null, this.getNodeProperties(node));
        } else {
            Log.error("The root node can not be deleted");
        }
    };

    /**
     * Return the export properties of the node.
     * @param {Node} node
     * @returns {ExportNodeProperties} properties
     */
    public getNodeProperties(node: Node): ExportNodeProperties {
        return {
            id: node.id,
            parent: node.parent ? node.parent.id : "",
            name: node.name,
            coordinates: this.fixCoordinates(node.coordinates, true),
            image: {
                src: node.image.src,
                size: node.image.size
            },
            colors: node.colors,
            font: node.font,
            locked: node.locked,
            k: node.k
        };
    }

    /**
     * Convert external coordinates to internal or otherwise.
     * @param {Coordinates} coordinates
     * @param {boolean} reverse
     * @returns {Coordinates}
     */
    private fixCoordinates(coordinates: Coordinates, reverse: boolean = false): Coordinates {
        let zoomCoordinates = d3.zoomTransform(this.map.dom.svg.node()),
            fixedCoordinates: Coordinates = {} as Coordinates;

        if (coordinates.x) {
            fixedCoordinates.x = coordinates.x - zoomCoordinates.x * (reverse ? -1 : 1);
        }

        if (coordinates.y) {
            fixedCoordinates.y = coordinates.y - zoomCoordinates.y * (reverse ? -1 : 1);
        }

        return fixedCoordinates;
    }

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
     * Return the node with the id equal to id passed as parameter.
     * @param {string} id
     * @returns {Node}
     */
    public getNode(id: string): Node {
        return this.nodes.get(id);
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
     * @param {string} name
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeName = (node: Node, name: string, graphic: boolean = false) => {
        if (name && typeof name !== "string") {
            Log.error("The name must be a string", "type");
        }

        if (node.name != name || graphic) {
            node.getNameDOM().innerHTML = name;

            this.map.draw.updateNodeShapes(node);

            if (graphic === false) {
                node.name = name;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node coordinates with a new value.
     * @param {Node} node
     * @param {Coordinates} coordinates
     * @returns {boolean}
     */
    private updateNodeCoordinates = (node: Node, coordinates: Coordinates) => {
        let fixedCoordinates = this.fixCoordinates(coordinates);

        coordinates = Utils.mergeObjects(node.coordinates, fixedCoordinates, true) as Coordinates;

        if (!(coordinates.x === node.coordinates.x && coordinates.y === node.coordinates.y)) {
            let oldOrientation = this.getOrientation(this.selectedNode),
                dx = node.coordinates.x - coordinates.x,
                dy = node.coordinates.y - coordinates.y;

            node.coordinates = Utils.cloneObject(coordinates) as Coordinates;

            node.dom.setAttribute("transform", "translate(" + [coordinates.x, coordinates.y] + ")");

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
     * @param {string} color
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeBackgroundColor = (node: Node, color: string, graphic: boolean = false) => {
        if (color && typeof color !== "string") {
            Log.error("The background color must be a string", "type");
        }

        if (node.colors.background !== color || graphic) {
            let background = node.getBackgroundDOM();

            background.style["fill"] = color;

            if (background.style["stroke"] !== "") {
                background.style["stroke"] = d3.color(color).darker(.5).toString();
            }

            if (graphic === false) {
                node.colors.background = color;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node text color with a new value.
     * @param {Node} node
     * @param {string} color
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeNameColor = (node: Node, color: string, graphic: boolean = false) => {
        if (color && typeof color !== "string") {
            Log.error("The text color must be a string", "type");
        }

        if (node.colors.name !== color || graphic) {
            node.getNameDOM().style["color"] = color;

            if (graphic === false) {
                node.colors.name = color;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node branch color with a new value.
     * @param {Node} node
     * @param {string} color
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeBranchColor = (node: Node, color: string, graphic: boolean = false) => {
        if (color && typeof color !== "string") {
            Log.error("The branch color must be a string", "type");
        }

        if (!this.isRoot(node)) {
            if (node.colors.name !== color || graphic) {
                let branch = document.getElementById(node.id + "_branch");

                branch.style["fill"] = branch.style["stroke"] = color;

                if (graphic === false) {
                    node.colors.branch = color;
                }
            } else {
                return false;
            }
        } else {
            Log.error("The root node has no branches");
        }
    };

    /**
     * Update the node font size with a new value.
     * @param {Node} node
     * @param {number} size
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeFontSize = (node: Node, size: number, graphic: boolean = false) => {
        if (size && typeof size !== "number") {
            Log.error("The font size must be a number", "type");
        }

        if (node.font.size != size || graphic) {
            node.getNameDOM().style["font-size"] = size + "px";

            this.map.draw.updateNodeShapes(node);

            if (node.image.src !== "") {
                let image = node.getImageDOM(),
                    y = -((<any>image).getBBox().height + node.dimensions.height / 2 + 5);
                image.setAttribute("y", y.toString());
            }

            if (graphic === false) {
                node.font.size = size;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node image size with a new value.
     * @param {Node} node
     * @param {number} size
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeImageSize = (node: Node, size: number, graphic: boolean = false) => {
        if (size && typeof size !== "number") {
            Log.error("The image size must be a number", "type");
        }

        if (node.image.src !== "") {
            if (node.image.size !== size || graphic) {
                let image = node.getImageDOM(),
                    box = (<any>image).getBBox(),
                    height = size,
                    width = box.width * height / box.height,
                    y = -(height + node.dimensions.height / 2 + 5),
                    x = -width / 2;

                image.setAttribute("height", height.toString());
                image.setAttribute("width", width.toString());
                image.setAttribute("y", y.toString());
                image.setAttribute("x", x.toString());

                if (graphic === false) {
                    node.image.size = height;
                }
            } else {
                return false;
            }
        } else Log.error("The node does not have an image");
    };

    /**
     * Update the node image src with a new value.
     * @param {Node} node
     * @param {string} src
     * @returns {boolean}
     */
    private updateNodeImageSrc = (node: Node, src: string) => {
        if (src && typeof src !== "string") {
            Log.error("The image path must be a string", "type");
        }

        if (node.image.src !== src) {
            node.image.src = src;

            this.map.draw.setImage(node);
        } else {
            return false;
        }
    };

    /**
     * Update the node font style.
     * @param {Node} node
     * @param {string} style
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeFontStyle = (node: Node, style: string, graphic: boolean = false) => {
        if (style && typeof style !== "string") {
            Log.error("The font style must be a string", "type");
        }

        if (node.font.style !== style) {
            node.getNameDOM().style["font-style"] = style;

            if (graphic === false) {
                node.font.style = style;
            }
        } else {
            return false;
        }
    };

    /**
     * Update the node font weight.
     * @param {Node} node
     * @param {string} weight
     * @param {boolean} graphic
     * @returns {boolean}
     */
    private updateNodeFontWeight = (node: Node, weight: string, graphic: boolean = false) => {
        if (weight && typeof weight !== "string") {
            Log.error("The font weight must be a string", "type");
        }

        if (node.font.weight !== weight) {
            node.getNameDOM().style["font-weight"] = weight;

            if (graphic === false) {
                node.font.weight = weight;
            }

            this.map.draw.updateNodeShapes(node);
        } else {
            return false;
        }
    };

    /**
     * Update the node locked status.
     * @param {Node} node
     * @param {boolean} flag
     * @returns {boolean}
     */
    private updateNodeLockedStatus = (node: Node, flag: boolean) => {
        if (flag && typeof flag !== "boolean") {
            Log.error("The node locked status must be a boolean", "type");
        }

        if (!this.isRoot(node)) {
            node.locked = flag || !node.locked;
        } else {
            Log.error("The root node can not be locked");
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