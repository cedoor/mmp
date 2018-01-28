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

        this.deselectNode(node);
    }

    /**
     * Add a node in the map.
     * @param {UserNodeProperties} userProperties
     */
    public addNode = (userProperties?: UserNodeProperties) => {
        let properties: NodeProperties = Utils.mergeObjects(
            Utils.mergeObjects(this.map.options.node, userProperties),
            {
                id: this.map.id + "_node_" + this.counter,
                parent: this.selectedNode
            });

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
     * @param {Node} node
     * @param {string} property
     * @param value
     */
    public updateNode = (node: Node = this.selectedNode, property: string, value: any) => {
        node[property] = value;
    };

    /**
     *
     * @param {Node} node
     */
    deselectNode(node: Node) {
        node.getDOMBackground().style.stroke = "";
        this.selectedNode = this.nodes.get(this.map.id + "_node_0");
    }

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

}