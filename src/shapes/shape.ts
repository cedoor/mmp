import * as d3 from "d3";
import {Path} from "d3-path";
import Node from "../node/node";

export default class Shape {

    public node: Node;
    public path: Path;

    constructor(node: Node) {
        this.node = node;
        this.path = d3.path();
    }

}