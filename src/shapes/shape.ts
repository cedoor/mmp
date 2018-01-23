import * as d3 from "d3";
import Node from "../map/node";
import {Path} from "d3-path";

/**
 * Represents a generic shape in the map,
 * every shape has a node and a d3 path.
 */
export default class Shape {

    public node: Node;
    public path: Path;

    /**
     * Initialize the attributes.
     * @param {Node} node
     */
    constructor(node: Node) {
        this.node = node;
        this.path = d3.path();
    }

}