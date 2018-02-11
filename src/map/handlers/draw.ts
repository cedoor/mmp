import * as d3 from "d3";
import Map from "../map";
import Utils from "../../utils/utils";
import Node from "../models/node";
import {Path} from "d3-path";

/**
 * Draw the map and update it.
 */
export default class Draw {

    private map: Map;

    /**
     * Get the associated map instance.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;
    }

    /**
     * Create svg and main css map properties.
     */
    public create() {
        this.map.dom.container = d3.select("#" + this.map.id)
            .style("position", "relative");

        this.map.dom.svg = this.map.dom.container.append("svg")
            .style("position", "absolute")
            .style("width", "100%")
            .style("height", "100%")
            .style("top", 0)
            .style("left", 0);

        this.map.dom.svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on("click", () => {
                // Deselect the selected node when click on the map background
                this.map.nodes.deselectNode();
            });

        this.map.dom.g = this.map.dom.svg.append("g");
    }

    /**
     * Update the dom of the map with the (new) nodes.
     */
    public update() {
        let nodes = this.map.nodes.getNodes(),
            dom = {
                nodes: this.map.dom.g.selectAll("." + this.map.id + "_node").data(nodes),
                branches: this.map.dom.g.selectAll(".branch").data(nodes.slice(1))
            };

        let outer = dom.nodes.enter().append("g")
            .style("cursor", "pointer")
            .attr("class", this.map.id + "_node")
            .attr("id", function (node: Node) {
                node.dom = this;
                return node.id;
            })
            .attr("transform", (node: Node) => "translate(" + node.coordinates.x + "," + node.coordinates.y + ")")
            .on("dblclick", (node: Node) => {
                d3.event.stopPropagation();

                this.setNodeName(node);
            });

        if (this.map.options.drag === true) {
            outer.call(this.map.drag.getDragBehavior());
        }

        // Set text of the node
        outer.insert("foreignObject")
            .html((node: Node) => this.createNodeNameDOM(node))
            .each((node: Node) => {
                this.updateForeignObject(node.getNameDOM());
            });

        // Set background of the node
        outer.insert("path", "foreignObject")
            .style("fill", (node: Node) => node.backgroundColor)
            .style("stroke-width", 3)
            .attr("d", (node: Node) => this.drawNodeBackground(node));

        // Set image of the node
        outer.each((node: Node) => {
            this.setImage(node);
        });


        dom.branches.enter().insert("path", "g")
            .style("fill", (node: Node) => node.branchColor)
            .style("stroke", (node: Node) => node.branchColor)
            .attr("class", this.map.id + "_branch")
            .attr("id", (node: Node) => node.id + "_branch")
            .attr("d", (node: Node) => this.drawBranch(node));

        dom.nodes.exit().remove();
        dom.branches.exit().remove();
    }

    /**
     * Remove all nodes and branches of the map.
     */
    public clear() {
        d3.selectAll("." + this.map.id + "_node, ." + this.map.id + "_branch").remove();
    }

    /**
     * Draw the background shape of the node.
     * @param {Node} node
     * @returns {Path} path
     */
    public drawNodeBackground(node: Node): Path {
        let text = node.getNameDOM(),
            path = d3.path();

        node.dimensions.width = text.clientWidth + 50;
        node.dimensions.height = text.clientHeight + 35;

        let x = node.dimensions.width / 2,
            y = node.dimensions.height / 2,
            k = node.k;

        path.moveTo(-x, k / 3);
        path.bezierCurveTo(-x, -y + 10, -x + 10, -y, k, -y);
        path.bezierCurveTo(x - 10, -y, x, -y + 10, x, k / 3);
        path.bezierCurveTo(x, y - 10, x - 10, y, k, y);
        path.bezierCurveTo(-x + 10, y, -x, y - 10, -x, k / 3);
        path.closePath();

        return path;
    }

    /**
     * Draw the branch of the node.
     * @param {Node} node
     * @returns {Path} path
     */
    public drawBranch(node: Node): Path {
        let parent = node.parent,
            path = d3.path(),
            level = node.getLevel(),
            width = 22 - (level < 6 ? level : 6) * 3,
            mx = (parent.coordinates.x + node.coordinates.x) / 2,
            ory = parent.coordinates.y < node.coordinates.y + node.dimensions.height / 2 ? -1 : 1,
            orx = parent.coordinates.x > node.coordinates.x ? -1 : 1,
            inv = orx * ory;

        path.moveTo(parent.coordinates.x, parent.coordinates.y - width * .8);
        path.bezierCurveTo(
            mx - width * inv, parent.coordinates.y - width / 2,
            parent.coordinates.x - width / 2 * inv, node.coordinates.y + node.dimensions.height / 2 - width / 3,
            node.coordinates.x - node.dimensions.width / 3 * orx, node.coordinates.y + node.dimensions.height / 2 + 3
        );
        path.bezierCurveTo(
            parent.coordinates.x + width / 2 * inv, node.coordinates.y + node.dimensions.height / 2 + width / 3,
            mx + width * inv, parent.coordinates.y + width / 2,
            parent.coordinates.x, parent.coordinates.y + width * .8
        );
        path.closePath();

        return path;
    }

    /**
     * Update the node HTML elements.
     * @param {Node} node
     */
    public updateNodeShapes(node: Node) {
        let text = node.getNameDOM(),
            background = node.getBackgroundDOM();

        d3.select(background).attr("d", (node: Node) => <any>this.drawNodeBackground(node));
        d3.selectAll("." + this.map.id + "_branch").attr("d", (node: Node) => <any>this.drawBranch(node));

        this.updateForeignObject(text);
    }

    /**
     * Set main properties of node image and create it if it does not exist.
     * @param {Node} node
     */
    public setImage(node: Node) {
        let domImage = node.getImageDOM();

        if (!domImage) {
            domImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
            node.dom.appendChild(domImage);
        }

        if (node.image.src !== "") {
            let image = new Image();

            image.src = node.image.src;

            image.onload = function () {
                let h = node.image.size,
                    w = (<any>this).width * h / (<any>this).height,
                    y = -(h + node.dimensions.height / 2 + 5),
                    x = -w / 2;

                domImage.setAttribute("href", node.image.src);
                domImage.setAttribute("height", h.toString());
                domImage.setAttribute("width", w.toString());
                domImage.setAttribute("y", y.toString());
                domImage.setAttribute("x", x.toString());
            };

            image.onerror = function () {
                domImage.remove();
                node.image.src = "";
            };
        } else {
            domImage.remove();
        }
    }

    /**
     * Set the node text.
     * @param {Node} node
     */
    private setNodeName(node: Node) {
        let name = node.getNameDOM();

        Utils.focusWithCaretAtEnd(name);

        name.style.setProperty("cursor", "auto");

        name.ondblclick = name.onmousedown = (event) => {
            event.stopPropagation();
        };

        name.oninput = () => {
            this.updateNodeShapes(node);
        };

        name.onblur = () => {
            if (name.innerHTML !== node.name) {
                this.map.nodes.updateNode("name", name.innerHTML);
            }
            console.log("blur");

            name.style.setProperty("cursor", "pointer");
            name.ondblclick = name.onmousedown = null;
        };
    }

    /**
     * Update node foreign object dimensions.
     * @param {HTMLDivElement} text
     */
    private updateForeignObject(text: HTMLDivElement) {
        let foreignObject: SVGForeignObjectElement = <SVGForeignObjectElement>text.parentNode;

        foreignObject.setAttribute("x", (-text.clientWidth / 2).toString());
        foreignObject.setAttribute("y", (-text.clientHeight / 2).toString());
        foreignObject.setAttribute("width", text.clientWidth.toString());
        foreignObject.setAttribute("height", text.clientHeight.toString());
    }

    /**
     * Create a string with HTML of the node name div.
     * @param {Node} node
     * @returns {string} html
     */
    private createNodeNameDOM(node: Node) {
        let element = document.createElement("div");

        element.style.setProperty("font-size", node.fontSize.toString() + "px");
        element.style.setProperty("display", "inline-block");
        element.style.setProperty("white-space", "nowrap");
        element.style.setProperty("color", node.textColor);
        element.style.setProperty("font-style", Utils.fontStyle(node.italic));
        element.style.setProperty("font-weight", Utils.fontWeight(node.bold));
        element.style.setProperty("font-family", this.map.options.fontFamily);
        element.style.setProperty("text-align", "center");
        element.style.setProperty("padding", "2px");

        element.setAttribute("contenteditable", "true");
        element.setAttribute("spellcheck", "false");

        element.innerHTML = node.name;

        return element.outerHTML;
    }

}