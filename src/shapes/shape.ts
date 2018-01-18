import * as d3 from "d3";
import {Path} from "d3-path";
import Node from "../node/node";

export default class Shape {

    public node: Node;

    public dom: HTMLElement;

    public path: Path;

    constructor(node: Node, dom?: HTMLElement) {
        this.node = node;
        this.dom = dom;
        this.path = d3.path();
    }

    getNameDOMElement(): any {
        return this.dom.nextSibling.childNodes[0];
    }

}